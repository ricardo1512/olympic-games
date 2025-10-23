function createScatterPlot(displayYear=globalYearEnd) {
    // Remove any existing SVG element in the ScatterPlot container
    d3.select(".ScatterPlot svg").remove();

    // Define margins and dimensions for the scatter plot
    var margin = { top: 30, right: 70, bottom: 18, left: 50 },
        width = document.querySelector('.ScatterPlot').clientWidth - margin.left - margin.right,
        height = 350 - margin.top - margin.bottom;

    // Create linear scales for the X and Y axes
    var xScale = d3.scaleLinear().range([0, width]);
    var yScale = d3.scaleLinear().range([height, 0]);

    // Create axes for the scatter plot with formatting
    var xAxis = d3.axisBottom(xScale).ticks(11).tickFormat(d3.format(".1f"));
    var yAxis = d3.axisLeft(yScale).ticks(7).tickFormat(d3.format(".1f"));

    // Set the tick size for both axes
    xAxis.tickSize(3);
    yAxis.tickSize(3);

    // Append SVG element and group for the scatter plot
    var svg = d3.select('.ScatterPlot').append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Create and configure the X axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width + 65)
        .attr("y", -2)
        .style("text-anchor", "end")
        .style("font-size", "8px")
        .text("GDP*")
        .on("mouseover", function(event) {
            d3.select(this)
                .transition().duration(100);
    
            tooltip.transition()
                .duration(200)
                .style("opacity", 1);
            tooltip.html("To facilitate observation,<br>" +
                "GDP Per Capita have been normalized.")
                .style("left", (event.pageX - 155) + "px")
                .style("top", (event.pageY + 20) + "px");
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX - 200) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function() {
            d3.select(this)
                .transition().duration(200);

            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        })
        .append("tspan")
        .attr("x", width + 65)
        .attr("dy", "1.2em")
        .text("Per Capita");


    // Create and configure the Y axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 30 - (height / 2))
        .style("text-anchor", "end")
        .text("Country Performance* ")
        .on("mouseover", function(event) {
            d3.select(this)
                .transition().duration(100);
    
            tooltip.transition()
                .duration(200)
                .style("opacity", 1);
            tooltip.html("To facilitate observation,<br>" +
                "Country Performance have been normalized.")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
        })
        .on("mouseout", function() {
            d3.select(this)
                .transition().duration(100);

            tooltip.transition()
                .duration(100)
                .style("opacity", 0);
        });

    // Add an explanatory text for the formula of medal score
    svg.append("text")
        .attr("class", "formula")
        .attr("x", 35)
        .attr("y", -80)
        .style("font-size", "8px")
        .text("[formula]")
        .style("fill", "white")
        .attr("transform", "rotate(-90, 100, 50)")
        .on("mouseover", function(event) {
            d3.select(this)
                .transition().duration(100);

            tooltip.transition()
                .duration(200)
                .style("opacity", 1);
            tooltip.html("The Medal Score is obtained by the weighted sum of each medal,<br>" +
                "with gold medals worth 5 points,<br>" +
                "silver medals worth 3 points,<br>" +
                "and bronze medals worth 1 point.<br>" +
                "This sum is then divided by the number of athletes in the national delegation.")
                .style("left", (event.pageX - 200) + "px")
                .style("top", (event.pageY - 100) + "px");
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 20) + "px")
                .style("top", (event.pageY - 60) + "px");
        })
        .on("mouseout", function() {
            d3.select(this)
                .transition().duration(200);

            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        });

    // Style ticks and axis lines
    svg.selectAll(".tick text")
        .attr("dy", "6")
        .style("fill", "white")
        .style("font-size", "8px");

    d3.selectAll('.x.axis line, .y.axis line')
        .style('stroke', 'white');

    d3.selectAll('.x.axis path, .y.axis path')
        .style('stroke', 'white');

    d3.selectAll('.x.axis text, .y.axis text')
        .style('fill', 'white');

    // Determine unique year editions based on the global season
    var uniqueYearEditions = globalSeason === 'Summer' ? uniqueYearEditionsSummer : uniqueYearEditionsWinter;

    // Filter years that fall between globalYearStart and globalYearEnd
    const filteredYears = uniqueYearEditions.filter(year => year >= globalYearStart && year <= globalYearEnd);

    // Update the scatter plot with the specified display year
    updateScatter(displayYear);

    function updateScatter(year) {
        // Remove previous elements to avoid overlaps
        svg.selectAll("text.title").remove();
        svg.selectAll("text.year").remove();
        svg.selectAll(".regression-line").remove();
        svg.selectAll(".regression-label").remove();
        
        // Append the chart title
        svg.append("text")
            .attr("class", "title")
            .attr("x", width / 2 + 10)
            .attr("y", -18)
            .attr("text-anchor", "middle")
            .style("fill", "white")
            .style("font-size", "13px")
            .text("Correlation between GDP Per Capita and Country Performance");

        // Append the current year as a text element
        svg.append("text")
            .attr("class", "year")
            .attr("x", width / 2 + 15)
            .attr("y", 180)
            .attr("text-anchor", "middle")
            .style("fill", '#1f1f2e')
            .style("font-size", "100px")
            .text(year)
            .attr("opacity", scatterYearOpacity ? 0 : 1)
            .transition()
            .duration(1000)
            .attr("opacity", 1);

        scatterYearOpacity = false;

        // Filter data for the selected year
        filteredDataScatterYearSeason = filteredDataScatter.filter(function(d) {
            return d.Year == year && d.Season == globalSeason;
        });

        filteredDataGdp_percapita = gdp_percapita.filter(function(d) {
            return d.Year == year;
        });

        // Create a new array for combined data based on unique country codes
        const seenCountryCodes = new Set();
        const GDP_Performance = filteredDataGdp_percapita
            .filter(gdpData => {
                 // Ensure the country code is unique
                if (!seenCountryCodes.has(gdpData.Country_code)) {
                    seenCountryCodes.add(gdpData.Country_code);
                    return true;
                }
                return false;
            })
            .map(gdpData => {
                // Match corresponding country data in the scatter plot data
                const match = filteredDataScatterYearSeason.find(
                    scatterData => scatterData.Country === gdpData.Country
                );

                // Merge data or set Country_performance = 0 if no match is found
                return {
                    Country: gdpData.Country,
                    Continent: gdpData.Continent,
                    Country_code: gdpData.Country_code,
                    Gdp_percapita: gdpData.Gdp_percapita,
                    Year: gdpData.Year,
                    Country_performance: match ? match.Country_performance : 0
                };
            });


        // Set the domain for the x-axis based on Gdp_percapita
        xScale.domain([0, d3.max(GDP_Performance, function(d) { return d.Gdp_percapita; })]);
        
        // Set the domain for the y-axis based on Country_performance
        yScale.domain([0, d3.max(GDP_Performance, function(d) { return d.Country_performance; })]);

        // Color definitions for each continent
        var africa = "#994d00";
        var america = "#cc0066";
        var asia = "#e6e600";
        var europe = "#00b300";
        var oceania = "#1a8cff";
        
        // Definitions of colors and continents
        var continents = [
            { continent: "Africa", color: africa},
            { continent: "America", color: america},
            { continent: "Asia", color: asia},
            { continent: "Europe", color: europe},
            { continent: "Oceania", color: oceania}
        ];

        // Add a group for the legend
        var legendGroup = svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(" + (width + 50) + ", -20)");

        // Create legend circles here
        var continentIndicators = legendGroup.selectAll(".continent-item")
            .data(continents)
            .enter().append("g")
            .attr("class", "continent-item")
            .attr("transform", function(d, i) {
                return "translate(0," + (i * 16) + ")";
            });

        // Add circles with a new class
        continentIndicators.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 3)
            .attr("class", "continent-circle")
            .style("fill", function(d) { return d.color; });

        // Add text below the circles
        continentIndicators.append("text")
            .attr("x", 0)
            .attr("y", 8)
            .attr("dy", ".3em")
            .style("text-anchor", "middle")
            .style("fill", function(d) { return d.color; })
            .style("font-size", "9px")
            .text(function(d) { return d.continent; });

        // Update the circles in the main chart
        var circles = svg.selectAll("circle.data-point").data(GDP_Performance, d => d.Country_code);
        
        // Add new circles for data points
        var newCircles = circles.enter()
            .append("circle")
            .attr("class", "data-point")
            .attr("cx", function(d) { return xScale(d.Gdp_percapita);})
            .attr("cy", function(d) { return yScale(d.Country_performance); })
            .attr("r", d => ((d.Country_code === clickedCountry && d.Year === clickedYear) || d.Country_code === globalCountryCode )? 7 : 3)
            .style("fill", function(d) {
                if (d.Continent === "Europe") return europe;
                else if (d.Continent === "Asia") return asia;
                else if (d.Continent === "America") return america;
                else if (d.Continent === "Oceania") return oceania;
                else if (d.Continent === "Africa") return africa; 
            })
            .style("stroke", d => (d.Country_code === clickedCountry && d.Year === clickedYear) ? "red" : 
                (d.Country_code === globalCountryCode) ? "#80ff80" : "gray")
            .style("stroke-width", d => ((d.Country_code === clickedCountry && d.Year === clickedYear) || d.Country_code === globalCountryCode) ? 1.5 : 0)
            .on("click", function(event, d) {
                if (!isPlaying) {
                    currentCountry = d.Country_code;
    
                    if (clickedCountry === currentCountry) {
                        // Reset all circles if the clicked country is already selected
                        svg.selectAll("circle.data-point")
                            .filter(f => d.Country_code === clickedCountry  && d.Year === clickedYear)
                            .transition().duration(100)
                            .attr("r", 3)
                            .style("stroke", "none")
                            .style("stroke-width", 0);

                        clickedCountry = null;
                        clickedYear = null;

                    } else {
                        globalCountryCode = currentCountry;
                        clickedCountry = currentCountry;
                        clickedYear = d.Year;
                        populateSelectCountry();

                        if (clickedYear !== selectedEditionYear) {
                            selectedEditionYear = clickedYear;
                            createChoroplethMap();
                        } else {
                            d3.select(".ChoroplethMap svg").selectAll("path")
                                .attr("stroke", function(d) {
                                    return d.properties.ISO_A3 === clickedCountry ? 'red': 
                                           d.properties.ISO_A3 === hostCountryCode ? "#33c2e6" : 
                                           d.properties.ISO_A3 === globalCountryCode ? "#80ff80" : "white";
                                })
                                .attr("stroke-width", function(d) {
                                    return d.properties.ISO_A3 === hostCountryCode ? 1 : 
                                           d.properties.ISO_A3 === globalCountryCode ? 1 : 0.2;
                                });
                        }
                        
                        // Reset all circles and update the clicked circle in a single selection
                        svg.selectAll("circle.data-point")
                            .transition().duration(100)
                            .attr("r", function(d) {
                                return (d.Country_code === clickedCountry  && d.Year === clickedYear) ? 7 : 3;
                            })
                            .style("stroke", function(d) {
                                return (d.Country_code === clickedCountry && d.Year === clickedYear) ? "red" : "none";
                            })
                            .style("stroke-width", function(d) {
                                return (d.Country_code === clickedCountry && d.Year === clickedYear) ? 1.5 : 0;
                            });
                        
                    }

                    setTimeout(function() {
                        selectedEditionYear = d.Year;
                        topSports1 = 1;
                        topSports2 = 5;
                        allCountries = null;
                        allCountriesLine = null;
                        createClevelandDotPlot();
                        createLineChart();
                        createScatterPlot(d.Year);
                    }, 100); 
                } 
            })
            .on("mouseover", function(event, d) {
                d3.select(this).transition().duration(100)
                    .attr("r", 7)
                    .style("stroke", d => (d.Country_code === clickedCountry && d.Year === clickedYear) ? "red" : 
                        (d.Country_code === globalCountryCode) ? "#80ff80" : "gray")
                    .style("stroke-width", d => ((d.Country_code === clickedCountry && d.Year === clickedYear) || d.Country_code === globalCountryCode) ? 1.5 : 0)
            
                tooltip.transition()
                    .duration(100)
                    .style("opacity", 1);
                tooltip.html("<strong>" + d.Country + "</strong><br>Performance: " + 
                    d.Country_performance.toFixed(2) + "<br>GDP Per Capita: " + d.Gdp_percapita.toFixed(0))
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 60) + "px");
            })
            .on("mouseout", function(event, d) {
                d3.select(this).transition().duration(100)
                    .attr("r", d => ((d.Country_code === clickedCountry && d.Year === clickedYear) || d.Country_code === globalCountryCode )? 7 : 3) // Verifica se o círculo é o clicado
                    .style("stroke", d => (d.Country_code === clickedCountry && d.Year === clickedYear) ? "red" :
                        (d.Country_code === globalCountryCode) ? "#80ff80" : "gray")
                    .style("stroke-width", d => ((d.Country_code === clickedCountry && d.Year === clickedYear) || d.Country_code === globalCountryCode) ? 1.5 : 0)
            
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
            
        // Transition the existing circles
        circles.transition().duration(1000)
            .attr("cx", function(d) { return xScale(d.Gdp_percapita); })
            .attr("cy", function(d) { return yScale(d.Country_performance); })
            .style("fill", function(d) {
                if (d.Continent === "Europe") return europe;
                else if (d.Continent === "Asia") return asia;
                else if (d.Continent === "America") return america;
                else if (d.Continent === "Oceania") return oceania;
                else if (d.Continent === "Africa") return africa; 
            });

        // Remove circles that are no longer associated with the data
        circles.exit().remove();

        // Move circles in front of the year text
        svg.selectAll("circle.data-point").raise()

        // Function to calculate the linear regression line
        function linearRegression(data) {
            var sumX = d3.sum(data, d => d.Gdp_percapita);
            var sumY = d3.sum(data, d => d.Country_performance);
            var sumXY = d3.sum(data, d => d.Gdp_percapita * d.Country_performance);
            var sumX2 = d3.sum(data, d => d.Gdp_percapita * d.Gdp_percapita);
            var n = data.length;
            var slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
            var intercept = (sumY - slope * sumX) / n;
    
            return { slope: slope, intercept: intercept };
        }
    
        // Calculate the regression line equation
        var regression = linearRegression(GDP_Performance);

        // Define the starting and ending points of the regression line
        var xMin = 0;
        var xMax = d3.max(GDP_Performance, d => d.Gdp_percapita);

        // Calculate the regression line, ensuring it doesn't go below the x-axis
        var yMin = Math.max(0, regression.slope * xMin + regression.intercept);
        var yMax = Math.max(0, regression.slope * xMax + regression.intercept);

        // Add the regression line to the chart
        svg.append("line")
            .attr("class", "regression-line")
            .attr("x1", xScale(xMin))
            .attr("y1", yScale(yMin))
            .attr("x2", xScale(xMax))
            .attr("y2", yScale(yMax))
            .attr("stroke", "#adad85")
            .attr("stroke-width", 0.4);

        // Add the regression label
        svg.append("text")
            .attr("class", "regression-label")
            .attr("x", xScale(xMax) + 5)
            .attr("y", yScale(yMax))
            .attr("dy", "-0.5em")
            .style("fill", "#808000")
            .style("font-size", "10px")
            .text(`slope`)
            .append("tspan")
            .attr("x", xScale(xMax) + 5)
            .attr("dy", "1.2em")    
            .style("font-size", "9px")
            .text(`${regression.slope.toFixed(4)}`);       
    }
    
    // Variables to control animation
    var index = 0;
    var isPlaying = false;
    var interval = null;

    // Function to animate the scatter plot
    function animateScatterPlot() {
        if (clickedCountry || clickedYear) {
            clickedCountry = null;
            clickedYear = null;
            createChoroplethMap();
            createClevelandDotPlot();
            createLineChart();
        }

        // Update circle attributes based on selected country
        svg.selectAll("circle.data-point")
            .attr('r', d => (d.Country_code === globalCountryCode )? 7 : 3)
            .style("stroke", d => (d.Country_code === globalCountryCode) ? "#80ff80" : "gray")
            .style("stroke-width", d => (d.Country_code === globalCountryCode) ? 1.5 : 0);

        // If playing, pause the animation
        if (isPlaying) {
            clearInterval(interval);
            interval = null;
            isPlaying = false;
            d3.select("#motionButton")
                .style("color", !isPlaying ? "green" : "red");
        
        } else {
            // If not playing, start the animation
            isPlaying = true;
            
            d3.select("#motionButton")
                .style("color", !isPlaying ? "green" : "red");

            // Start the interval for the animation
            interval = setInterval(function() {
                if (index < filteredYears.length - 1) {
                    updateScatter(filteredYears[index]);
                    index++;
                } else {
                    // When animation ends, reset the index
                    clearInterval(interval);
                    interval = null;
                    index = 0;
                    createScatterPlot();
                    isPlaying = false;
                    d3.select("#motionButton")
                        .style("color", !isPlaying ? "green" : "red");
                }
            }, 1500);
        }
    }

    // Function to step back in animation
    function stepBack() {
        isPlaying = false;

        if (clickedCountry || clickedYear) {
            clickedCountry = null;
            clickedYear = null;
            createChoroplethMap();
            createClevelandDotPlot();
            createLineChart();
            }
        
        if (index > 0) {
            index--;
            update(filteredYears[index]);
        }
    }

    // Add control button for animation
    d3.select('.ScatterPlot').append("button")
        .attr("id", "motionButton")
        .text("PLAY")
        .style("position", "absolute")
        .style("top", (height - 140) + "px")
        .style("left", (width + 83) + "px")
        .style("background-color", "black")
        .style("border", "none")
        .style("padding", "2px 2px")
        .style("cursor", "pointer")
        .style("font-size", "12px")
        .style("color", "red")
        .on("click", function() {
            d3.select(this)
                .style("color", !isPlaying ? "green" : "red");
            animateScatterPlot();
        })
        .on("mouseover", function() {
            d3.select(this)
                .style("transform", "scale(1.1)");
        })
        .on("mouseout", function() {
            d3.select(this)
                .style("transform", "scale(1)");
        });

    // Add Back button for stepping back
    d3.select('.ScatterPlot').append("button")
        .attr("id", "resetButton")
        .text("Back")
        .style("position", "absolute")
        .style("top", (height - 110) + "px")
        .style("left", (width + 83) + "px")
        .style("background-color", "black")
        .style("color", "gray")
        .style("border", "none")
        .style("padding", "2px 2px")
        .style("cursor", "pointer")
        .style("font-size", "12px")
        .on("click", stepBack)
        .on("mouseover", function() {
            d3.select(this)
                .style("transform", "scale(1.1)");
        })
        .on("mouseout", function() {
            d3.select(this)
                .style("transform", "scale(1)");
        });

    // Add Reset button
    d3.select('.ScatterPlot').append("button")
        .attr("id", "resetButton")
        .text("Reset")
        .style("position", "absolute")
        .style("top", (height - 80) + "px")
        .style("left", (width + 82) + "px")
        .style("background-color", "black")
        .style("color", "gray")
        .style("border", "none")
        .style("padding", "2px 2px")
        .style("cursor", "pointer")
        .style("font-size", "12px")
        .on("click", function() {
            createScatterPlot();
        })
        .on("mouseover", function() {
            d3.select(this)
                .style("transform", "scale(1.1)");
        })
        .on("mouseout", function() {
            d3.select(this)
                .style("transform", "scale(1)");
        });
}