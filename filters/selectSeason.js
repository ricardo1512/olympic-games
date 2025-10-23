function populateSelectSeason() {
    // Select the existing dropdown by ID
    var selectSeason = d3.select('#selectSeason');
  
    // Remove any existing options before adding new ones
    selectSeason.selectAll('option').remove();
  
    // Define the season options
    var seasons = ['Summer', 'Winter'];
    
    // Add the seasons as options in the dropdown
    selectSeason.selectAll('option.season-option')
        .data(seasons)
        .enter()
        .append('option')
        .attr('class', 'season-option')
        .attr('value', d => d) 
        .text(d => d)
        .style("color", "#4da6ff");
  
    // Update globalCountryCode when the selection changes
    selectSeason.on("change", function() {
        globalSeason = d3.select(this).property("value");
        clickedCountry = null;
        clickedYear = null;
        topSports1 = 1;
        topSports2 = 5;
        globalYears();
        populateSelectCountry();
        createChoroplethMap();
        createClevelandDotPlot();
        createLineChart();
        createScatterPlot();
    });
  }