function createChoroplethMap() {
    // Remove any existing SVG from the Choropleth Map container
    d3.select(".ChoroplethMap svg").remove();
    
    // Filter the data for the corresponding year
    const filteredData = globalData.filter(d => d.Year === parseInt(selectedEditionYear) && d.Season === globalSeason);

    // Define margins for the chart
    var margin = { top: -140, right: 100, bottom: 5, left: -50 },
        width = document.querySelector('.ChoroplethMap').clientWidth - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;

    // Create the SVG container
    var svg = d3.select(".ChoroplethMap")
        .append("svg")
        .attr("width", width)
        .attr("height", height + margin.bottom);

    // Define the map projection
    var projection = d3.geoMercator()
        .scale(100)
        .center([0, 20])
        .translate([width / 2 - 10, height / 2]);

    // Define the path generator
    var path = d3.geoPath().projection(projection);

    // Create a group for the map
    var mapGroup = svg.append("g");

    // Encontrar o valor máximo de 'Country_performance'
    var maxPerformance = d3.max(filteredData, d => d.Country_performance);

    // Define color scale in shades of gold
    var colorScale = d3.scaleThreshold()
        .domain(d3.range(0, maxPerformance, maxPerformance / 6))
        .range(["#fdf5e6", "#f5d88f", "#f0c13d", "#d8a526", "#b58912", "#8f6f00", "#705400"]);

    // Create a map of medals by country
    var medalMap = new Map();
    filteredData.forEach(function(d) {
        medalMap.set(d.Country_code, d.Country_performance);
    });

    // Identify the host country
    hostCountryCode = filteredData[0].Host_country_code;

    // Draw the map
    mapGroup.selectAll("path")
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", function(d) {
            var medalCount = medalMap.get(d.properties.ISO_A3) || 0;
            return colorScale(medalCount);
        })
        .attr("stroke", function(d) {
            return d.properties.ISO_A3 === clickedCountry ? 'red': 
                   d.properties.ISO_A3 === hostCountryCode ? "#33c2e6" : 
                   d.properties.ISO_A3 === globalCountryCode ? "#80ff80" : "white";
        })
        .attr("stroke-width", function(d) {
            return d.properties.ISO_A3 === hostCountryCode ? 1 : 
                   d.properties.ISO_A3 === globalCountryCode ? 1 : 0.2;
        })
        .on("click", function(event, d) {
            currentCountry = d.properties.ISO_A3;

            // If the clicked country is the same as the previous one
            if (clickedCountry === currentCountry) {
                // Remove the red border if the same country is clicked again
                d3.select(this)
                    .attr("stroke", "white")
                    .attr("stroke-width", 0.2);
                
                clickedCountry = null;
                clickedYear = null;
            } else {
                globalCountryCode = currentCountry;
                clickedYear = selectedEditionYear;
                // Reset the border of all countries
                mapGroup.selectAll("path")
                    .attr("stroke", function(d) {
                        return d.properties.ISO_A3 === hostCountryCode ? "#33c2e6" : 
                               d.properties.ISO_A3 === globalCountryCode ? "#b3ffb3" : "white";
                    })
                    .attr("stroke-width", function(d) {
                        return d.properties.ISO_A3 === hostCountryCode ? 1 : 
                               d.properties.ISO_A3 === globalCountryCode ? 1.5 : 0.2;
                    });

                // Add a red border to the clicked country
                d3.select(this)
                    .attr("stroke", "red")
                    .attr("stroke-width", 1);

                // Update the clicked country code
                clickedCountry = currentCountry;
            }
            
            allCountries = null;
            allCountriesLine = null;
            topSports1 = 1;
            topSports2 = 5;
            scatterYearOpacity = true;
            populateSelectCountry();
            createClevelandDotPlot();
            createLineChart();
            d3.select(".ScatterPlot svg").selectAll("circle.data-point")
                .attr("r", d => (d.Country_code === clickedCountry) ? 7 : 3)
                .style("stroke", d => (d.Country_code === clickedCountry) ? "red" : "gray")
                .style("stroke-width", d => (d.Country_code === clickedCountry) ? 1.5 : 0);

        })
        .on("mouseover", function(event, d) {
            if (clickedCountry !== d.properties.ISO_A3) {
                d3.select(this)
                    .attr("stroke-width", function(d) {
                        return d.properties.ISO_A3 === hostCountryCode ? 1 : 
                            d.properties.ISO_A3 === globalCountryCode ? 1.5 : 1.2;
                    })
                    .attr("stroke", function(d) {
                        return d.properties.ISO_A3 === hostCountryCode ? "#16f4f8" : 
                            d.properties.ISO_A3 === globalCountryCode ? "#b3ffb3" : "white";  
                    });
                var medalCount = medalMap.get(d.properties.ISO_A3) || 0;
                tooltip.transition().duration(500).style("opacity", 1);
                tooltip.html(`<strong>${d.properties.ADMIN}</strong><br>${medalCount.toFixed(3)}`)
                    .style("left", (event.pageX - 30) + "px")
                    .style("top", (event.pageY - 50) + "px");
            }})
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX - 30) + "px")
                .style("top", (event.pageY - 50) + "px");
        })
        .on("mouseout", function(event, d) {
            if (clickedCountry !== d.properties.ISO_A3) {
                d3.select(this)
                    .attr("stroke", function(d) {
                        return d.properties.ISO_A3 === hostCountryCode ? "#33c2e6" : 
                               d.properties.ISO_A3 === globalCountryCode ? "#80ff80" : "white";
                    })
                    .attr("stroke-width", function(d) {
                        return d.properties.ISO_A3 === hostCountryCode ? 1 : 
                               d.properties.ISO_A3 === globalCountryCode ? 1 : 0.2;
                    });
            }
            tooltip.transition().duration(100).style("opacity", 0);
        });

    // Add title to the map
    svg.append("text")
        .attr("x", width / 2 + 10)
        .attr("y", height + margin.bottom + 5)
        .attr("text-anchor", "middle")
        .style("font-size", "13px")
        .style("fill", "white")
        .text("Country Performance in Medal Score");

    // Create legend
    var legend = svg.append("g")
        .attr("transform", `translate(10, 10)`);

    var legendWidth = 15,
        legendHeight = 15;

    // Define the horizontal position of the legend
    var legendXPosition = width - 60;

    colorScale.domain().forEach((d, i) => {
        legend.append("rect")
            .attr("x", legendXPosition + 40)
            .attr("y", i * legendHeight + 30)
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", colorScale(d));

        var startValue = d.toFixed(1);
        var endValue = (i < colorScale.domain().length - 1) ? (d + (maxPerformance / 6)).toFixed(1) : maxPerformance.toFixed(1);
        legend.append("text")
            .attr("x", legendXPosition + 60)
            .attr("y", (i * legendHeight) + legendHeight / 2 + 32)
            .text(`${startValue} - ${endValue}`)
            .style("font-size", "8px")
            .style("fill", "white")
            .attr("text-anchor", "start");
        });


        // Append the title of the legend
        legend.append("text")
            .attr("x", legendXPosition + 40)
            .attr("y", 5)
            .style("font-size", "10px")
            .style("fill", "white")
            .text("Medal Score");

        // Append the formula text below the title with a tooltip on hover
        legend.append("text")
            .attr("x", legendXPosition + 50)
            .attr("y", 20)
            .style("font-size", "9px")
            .style("fill", "white")
            .text("[formula]")
                .on("mouseover", function(event) {
                    d3.select(this)
                        .transition().duration(100);
            
                    // Display tooltip with an explanation of the Medal Score formula
                    tooltip.transition().duration(200).style("opacity", 1);
                    tooltip.html("The Medal Score is obtained by the weighted sum of each medal,<br>" +
                        "with gold medals worth 5 points,<br>" +
                        "silver medals worth 3 points,<br>" +
                        "and bronze medals worth 1 point.<br>" +
                        "This sum is then divided by the number of athletes in the national delegation.")
                        .style("left", (event.pageX - 345) + "px")
                        .style("top", (event.pageY + 6) + "px");
                })
                .on("mouseout", function() {
                    d3.select(this)
                        .transition().duration(200);
                    
                    tooltip.transition().duration(500).style("opacity", 0);
                });



        // Create zoom and pan behavior for the map
        var zoom = d3.zoom()
            .scaleExtent([1, 4])
            .on("zoom", function(event) {
                mapGroup.attr("transform", event.transform);
            });

        svg.call(zoom);
    
        // Add a button to reset the map position (re-center)
        var button = svg.append("g")
            .attr("class", "button-group")
            .attr("cursor", "pointer");

        button.append("text")
            .attr("x", width - 5)
            .attr("y", height + 9)
            .style("fill", "gray")
            .style("font-size", "11px")
            .text("Re-centre");
        
        // Define the click event on the button to reset zoom and pan
        button.on("click", () => {
            svg.transition()
                .duration(100)
                .call(zoom.transform, d3.zoomIdentity); 
        });

        // Filter data to find the host country
        const host = filteredData
            .map(d => d.Host_country)
            .filter((value, index, self) => self.indexOf(value) === index)

        // Create a set of unique editions in descending order
        const uniqueEditions = [selectedEditionYear + " " + host].concat([
            ...allEditions
                .filter(edition => edition[0][0] === globalSeason)
                .flatMap(edition => edition[1])
        ]);

        // Add a Select Edition dropdown button on the map
        var selectEdition = svg.append("foreignObject")
            .attr("x", 0)
            .attr("y", height - 7)
            .attr("width", width)
            .attr("height", 50);

        // Add dropdown for selecting the edition year and season
        var editionSelect = selectEdition.append("xhtml:select")
            .attr("class", "edition-select")
            .style('color', '#33c2e6')
            .style("font-size", "12px")
            .style("background-color", "black")
            .style("border", "none");

        // Populate dropdown with options
        editionSelect.selectAll("option")
            .data(uniqueEditions)
            .enter()
            .append("option")
            .attr("value", d => d)
            .text(d => d);

        // Add "change" event to the dropdown to update visualizations based on selected edition
        editionSelect.on("change", function() {
            const selectedEdition = d3.select(this).property("value");
            selectedEditionYear = parseInt(selectedEdition.split(" ")[0]);
            clickedCountry = null;
            clickedYear = null;
            topSports1 = 1;
            topSports2 = 5;
            populateSelectCountry();
            createChoroplethMap();
            createClevelandDotPlot();
            createScatterPlot();
    });
}