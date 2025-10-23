// Global data (including medalists and non-medalists)
var globalDataAll;
// Global data (only medalists)
var globalData;
// Global GeoJSON data
var geoData;

// Other global variables
var gdp_percapita = [];
var filteredDataScatter;
var uniqueCountries = [];
var allEditions;
var uniqueYearEditions;
var uniqueYearEditionsSummer;
var uniqueYearEditionsWinter;
var firstEdition = 1896;
var lastEdition = 2016
let globalCountryCode = "PRT";
var hostCountryCode = "Brazil";
let globalSeason = "Summer";
let timelineStart;
let timelineEnd;
let globalYearStart = 1896;
let globalYearEnd = 2016;
let clevelandSwitch = true;
let selectedEditionYear = 2016;
let uniqueSportsSummer = [];
let uniqueSportsWinter = [];
let topSports1 = 1;
let topSports2 = 5;
let allCountries = false;
let allCountriesLine = false;
let clickedCountry = null;
let clickedYear = null;
let scatterYearOpacity = false;

// Function to load the main dataset
function loadDataset() {
  return d3.json("data/dataset.json").then(data => {
    globalDataAll = data;
    globalData = data.filter(d => d.Medal > 0);
  });
}

// Function to load GeoJSON data
function loadGeoData() {
  return d3.json("data/countries.geojson").then(data => {
    geoData = data;
  });
}

// Function to load GDP per capita data
function loadGDPPercapita() {
  d3.csv("data/gdp_percapita_1896-2016.csv").then(function(data) {
    const validContinents = ["Africa", "America", "Asia", "Europe", "Oceania"];

    data.forEach(function(d) {
      let country = d.Country;
      let code = d.Country_code;
      let continent = d.Continent;

      if (validContinents.includes(continent)) {
        for (let year in d) {
          // Check if the year is not the "Country" column and the GDP value is valid
          if (year !== "Country") {
            let gdpValue = d[year];

            // Check if the value is a number and not NaN or empty
            if (gdpValue !== "" && !isNaN(+gdpValue)) {
              // Add each value to the gdp_percapita array
              gdp_percapita.push({
                Continent: continent,
                Country_code: code,
                Country: country,
                Year: +year,
                Gdp_percapita: +gdpValue
              });
            }
          }
        }
      }
    });
  }).catch(function(error) {
      console.error('Erro ao carregar o arquivo CSV:', error);
  });
}

// Function to create a list of unique countries
function createUniqueCountries() {
  const seen = new Set();

  globalDataAll.forEach(row => {
    const key = `${row.Country}-${row.Country_code}`;
    if (!seen.has(key) && row.Country !== "Unknown" && row.Country !== "Individual Olympic Athletes") {
      seen.add(key);
      uniqueCountries.push({
        Country: row.Country,
        Country_code: row.Country_code
      });
    }
  });
}

// Function to create all editions
function createAllEditions() {
  // Group summer and winter editions
  allEditions = [
      [["Summer"], new Set()],
      [["Winter"], new Set()]
  ];

  // Filter and fill the editions
  globalData.forEach(d => {
      if (d.Season === "Summer") {
          allEditions[0][1].add(d.Edition);
      } else if (d.Season === "Winter") {
          allEditions[1][1].add(d.Edition);
      }
  });

  // Convert Sets back to arrays and sort in descending order
  allEditions[0][1] = Array.from(allEditions[0][1]).sort((a, b) => b.localeCompare(a));
  allEditions[1][1] = Array.from(allEditions[1][1]).sort((a, b) => b.localeCompare(a));
}

// Function to create unique year editions
function createUniqueYearEditions() {
  // Get unique years from allEditions
  uniqueYearEditions = [...new Set(
    allEditions.flatMap(item => item[1])
      .map(ed => parseInt(ed.split(" ")[0], 10))
  )].sort((a, b) => a - b); 
  
  // Get unique years for summer events
  uniqueYearEditionsSummer = [...new Set(
    allEditions[0][1] 
      .map(ed => parseInt(ed.split(" ")[0], 10))
  )].sort((a, b) => a - b); 
  
  // Get unique years for winter events
  uniqueYearEditionsWinter = [...new Set(
    allEditions[1][1]
        .map(ed => parseInt(ed.split(" ")[0], 10))
  )].sort((a, b) => a - b);
  }

// Function to extract all sports by season
function extractSports() {
  // Extract unique sports for summer
  uniqueSportsSummer = [...new Set(globalData
    .filter(item => item.Season === 'Summer')
    .map(item => item.Sport))]; 

  // Extract unique sports for winter
  uniqueSportsWinter = [...new Set(globalData
    .filter(item => item.Season === 'Winter')
    .map(item => item.Sport))];

  // Sort the sports alphabetically
  uniqueSportsSummer.sort((a, b) => a.localeCompare(b));
  uniqueSportsWinter.sort((a, b) => a.localeCompare(b));
}

// Function to load data for the ScatterPlot
function createScatterData() {
  // Filter and organize data
  filteredDataScatter = Array.from(
    new Map(globalDataAll
      .map(function(d) {
        // Create a unique key for each combination of Country_code and Year
        return [[d.Country_code, d.Year].join('|'), {
          Season: d.Season,
          Country_code: d.Country_code,
          Country_performance: d.Country_performance,
          Year: d.Year,
          Continent: d.Continent,
          Country: d.Country,
          Season: d.Season
        }];
      })
    ).values() // Get unique values
  );
}

// Create a tooltip for displaying information
var tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)
  .style("position", "absolute")
  .style("background-color", "#d0d0d0")
  .style("border", "1px solid black")
  .style("border-radius", "3px")
  .style("padding", "5px")
  .style("font-size", "10px")
  .style("text-align", "center");

// Initialization function for the dashboard
function init() {
  // Load data
  Promise.all([
    // Load the main dataset
    loadDataset(),
    // Load GeoJSON data
    loadGeoData(), 
    // Load GDP data
    loadGDPPercapita()
  ]).then(function () {
    // Variable creation
    createUniqueCountries();
    createAllEditions();
    createUniqueYearEditions();
    extractSports();
    createScatterData();
    // Filters
    populateSelectCountry()
    populateSelectSeason()
    createTimeline()
    // Idioms
    createChoroplethMap();
    createLineChart();
    createClevelandDotPlot();
    createScatterPlot();
  });
}