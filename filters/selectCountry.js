// Function to populate the country selection dropdown
function populateSelectCountry() {
  // Select the existing dropdown by ID
  var selectCountry = d3.select('#selectCountry');

  // Remove any existing options before adding new ones
  selectCountry.selectAll('option').remove();

  // Sort countries alphabetically
  uniqueCountries.sort((a, b) => a.Country.localeCompare(b.Country));

  // Add a default option
  var defaultCountry = uniqueCountries.find(d => d.Country_code === globalCountryCode);

  // Add default option to dropdown
  selectCountry.append('option')
    .style("color", "#80ff80")
    .attr('value', globalCountryCode)
    .text(defaultCountry ? defaultCountry.Country : 'Select a Country');

  // Add unique countries to the dropdown
  selectCountry.selectAll('option.country-option')
    .data(uniqueCountries)
    .enter()
    .append('option')
    .attr('class', 'country-option')
    .attr('value', d => d.Country_code)
    .text(d => d.Country)
    .style("color", "#80ff80");
  
  // Update charts and global variables on country selection change
  selectCountry.on("change", function() {
    allCountries = false;
    allCountriesLine = false;
    clickedCountry = null;
    clickedYear = null;
    globalCountryCode = d3.select(this).property("value");
    topSports1 = 1;
    topSports2 = 5;
    createChoroplethMap();
    createClevelandDotPlot();
    createLineChart();
    createScatterPlot();
  });
}