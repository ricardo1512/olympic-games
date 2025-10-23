function createLineChart() {
    // Remove the existing chart
    d3.select(".LineChartsvg").remove();

    // Define margins for the chart
    var margin = { top: 35, right: 100, bottom: -133, left: 50 },
        width = document.querySelector('.LineChart').clientWidth - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;

    // Determine sports based on the current season
    var seasonSports = globalSeason === 'Summer' ? uniqueSportsSummer : uniqueSportsWinter;
    var uniqueYearEditions = globalSeason === 'Summer' ? uniqueYearEditionsSummer : uniqueYearEditionsWinter;

    // Filter data based on selections
    var filteredData;
    if (!allCountriesLine) {
        filteredData = globalDataAll.filter(function (d) {
            return (
                d.Season === globalSeason &&
                d.Year >= globalYearStart &&
                d.Year <= globalYearEnd &&
                d.Country_code === globalCountryCode
            );
        });
    } else {
        filteredData = globalDataAll.filter(function (d) {
            return (
                d.Season === globalSeason &&
                d.Year >= globalYearStart &&
                d.Year <= globalYearEnd
            );
        });
    }

    // Calculate the frequency of events for each sport
    const frequencyMap = d3.rollup(filteredData,
        v => v.length,
        d => d.Sport
    );

    // Convert the frequencyMap to an array of [sport, count]
    const frequencyArray = Array.from(frequencyMap.entries());

    // Sort the array by frequency (count) in descending order
    frequencyArray.sort((a, b) => b[1] - a[1]);

    // Reconvert to a Map after sorting
    const sortedFrequencyMap = new Map(frequencyArray);

    // List of sports without sorting
    const sportsList = Array.from(sortedFrequencyMap.entries())
        .slice(topSports1 - 1, topSports2)
        .map(d => d[0]); 

    // Filter the data again to include only the sports in sportsList
    filteredData = filteredData.filter(d => sportsList.includes(d.Sport));

    // Sort the filtered data by year
    filteredData.sort((a, b) => a.Year - b.Year);

    // Group data by year and sport, counting the frequency
    const frequencyData = d3.rollup(filteredData,
        v => v.length,
        d => d.Year,
        d => d.Sport
    );

    // Create data for the line chart
    const lineData = [];

    // Fill line data with actual counts or 0 if there are no events
    for (const year of uniqueYearEditions) {
        if (year >= globalYearStart && year <= globalYearEnd) {
            for (const sport of seasonSports) {
                const count = frequencyData.get(year)?.get(sport) || 0;
                // Only add if there is a count greater than zero or if the sport is part of sportsList
                if (count > 0 || sportsList.includes(sport)) {
                    lineData.push({ year, sport, count });
                }
            }
        }
    }

    // Create the SVG element for the line chart
    const svg = d3.select('.LineChart')
        .append('svg')
        .attr('class', 'LineChartsvg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create a linear scale for the x-axis based on the year range
    const x = d3.scaleLinear()
        .domain([globalYearStart*0.9995, globalYearEnd*1.0005])
        .range([0, width + 15]);

    // Append the x-axis to the SVG
    svg.append('g')
        .attr("class", "axis x-axis")
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x)
            .tickFormat(d3.format("d"))
            .tickSize(3))
        .selectAll("path, line")
        .style("font-size", "10px")
        .attr("stroke", "white");

    // Style the tick labels on the x-axis
    svg.selectAll(".tick text")
        .style("fill", "white")
        .style("font-size", "8px")
        .attr("text-anchor", "middle")
        .attr("dy", "6");

    // Create a linear scale for the y-axis
    var maxValue = d3.max(lineData, d => d.count);

    // If the maximum value is zero, adjust it to avoid an empty chart
    if (maxValue === 0) {
        maxValue = 1;
    }

    // Create a linear scale for the y-axis
    const y = d3.scaleLinear()
        .domain([0, maxValue])
        .range([height, 0]);

    // Append the y-axis to the SVG
    svg.append("g")
        .attr("class", "axis y-axis")
        .call(d3.axisLeft(y)
            .ticks(8)
            .tickSize(3))
        .selectAll("path, line")
        .attr("stroke", "white");

    // Style the tick labels on the y-axis
    svg.selectAll("text")
        .style("fill", "white")
        .style("font-size", "8px");

    // Add a label for the y-axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 10)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "10px")
        .text("Number of sports events");

    // Create a line generator for the line chart
    const lineGenerator = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.count));

    // Draw paths for each sport in the line chart
    const paths = seasonSports.map(sport => {
        const sportData = lineData.filter(d => d.sport === sport);
        return svg.append('path')
            .datum(sportData)
            .attr('fill', 'none')
            .attr('stroke', '#47476b')
            .attr('stroke-width', 0.6)
            .attr('d', lineGenerator);
    });

    // Add circles to represent data points
    seasonSports.forEach(sport => {
        const sportData = lineData.filter(d => d.sport === sport);
        svg.selectAll('.circle-' + sport)
            .data(sportData)
            .enter()
            .append('circle')
            .attr('class', 'circle-' + sport)
            .attr('cx', d => x(d.year))
            .attr('cy', d => y(d.count))
            .attr('r', d => (clickedCountry !== null && d.year === clickedYear && !allCountries && !allCountriesLine) ? 6 : 3)
            .attr('fill', '#47476b')
            .style("stroke", "red")
            .style("stroke-width", d => (clickedCountry !== null && d.year === clickedYear && !allCountries && !allCountriesLine) ? 1.5 : 0);
    });

    // Add the chart title
    var defaultCountry = uniqueCountries.find(d => d.Country_code === globalCountryCode);
    svg.append("text")
        .attr("x", width / 2 + 10)
        .attr("y", -22)
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-size", "13px")
        .text(allCountriesLine ? "Evolution of Sports Participation in " : "Evolution of Sports Participation by ")
        .append("tspan")
        .style("fill", allCountriesLine ? "white": '#80ff80')
        .text(allCountriesLine ? "All Countries" : defaultCountry.Country);


    // Add button for country selection
    var buttonCountry = svg.append("g")
    .attr("class", "button-group")
    .attr("cursor", "pointer");

    // Add a foreignObject to allow HTML content
    buttonCountry.append("foreignObject")
        .attr("x", width + 28)
        .attr("y", height - 65)
        .attr("width", 95)
        .attr("height", 100)
        .append("xhtml:div")
        .style("text-align", "center")
        .style("color", !allCountriesLine ? "#80ff80" : "gray")
        .style("font-size", "10px")
        .html("Selected<br>Country")
            .on("mouseover", function() {
                d3.select(this)
                    .style("transform", "scale(1.1)");
            })
            .on("mouseout", function() {
                d3.select(this)
                    .style("transform", "scale(1)");
    });

        // Define the click event on the button group
        buttonCountry.on("click", () => {
        allCountriesLine = false;
        createLineChart();
    });

    // Create a button group for the "All Countries" option
    var buttonAll = svg.append("g")
        .attr("class", "button-group")
        .attr("cursor", "pointer");

    // Add a foreignObject to allow HTML content for the "All Countries" button
    buttonAll.append("foreignObject")
        .attr("x", width + 25)
        .attr("y", height - 25)
        .attr("width", 100)
        .attr("height", 40)
        .append("xhtml:div")
        .style("text-align", "center")
        .style("color", allCountriesLine ? "white" : "grey")
        .style("font-size", "10px")
        .html("All<br>Countries")
        .on("mouseover", function() {
            d3.select(this)
                .style("transform", "scale(1.1)");
        })
        .on("mouseout", function() {
            d3.select(this)
                .style("transform", "scale(1)");
        });

    // Define the click event on the button group
    buttonAll.on("click", () => {
        if (clickedCountry) {
            clickedCountry = null;
            clickedYear = null;
            createChoroplethMap();
            createClevelandDotPlot();
            createScatterPlot();
        }
        allCountriesLine = true;
        createLineChart();
    });

    // Title of the dropdowns
    var dropdownstitel = svg.append("g")
        .attr("transform", `translate(10, 10)`);

    // Append text for "Sports" and "Ranking"
    dropdownstitel.append("text")
        .attr("y", -30)
        .style("font-size", "12px")
        .style("fill", "gray")
        .append("tspan")
        .text("Sports")
        .attr("x", width + 45)
        .attr("dy", "0em")
        .append("tspan")
        .style("font-size", "12px")    
        .text("Ranking")
        .attr("x", width + 40)
        .attr("dy", "1.2em")
        .append("tspan")
        .style("font-size", "10px")
        .text("to")
        .attr("x",  width + 55)
        .attr("dy", "4.6em"); 

    // Dropdown for selecting Top Sports
    const dropdown1 = d3.select('.LineChart')
        .append('select')
        .attr('id', 'topSports')
        .style('color', 'gray')
        .style("font-size", "12px")
        .style("background-color", "black")
        .style("border", "none")
        .style('position', 'absolute')
        .style('bottom', (height - 8) + "px")
        .style('left', (width + 105) + "px")
        .style('margin-bottom', '0px');

    // Create the second dropdown
    const dropdown2 = d3.select('.LineChart')
        .append('select')
        .attr('id', 'topSportsGreaterEqual')
        .style('color', 'gray')
        .style("font-size", "12px")
        .style("background-color", "black")
        .style("border", "none")
        .style('position', 'absolute')
        .style('bottom', (height - 48) + "px")
        .style('left', (width + 105) + "px")
        .style('margin-bottom', '0px');

    // Clear dropdown options if frequencyMap.size is 0
    if (frequencyMap.size === 0) {
        // Add a blank option
        dropdown1.append('option').attr('value', "").text("00");
        dropdown2.append('option').attr('value', "").text("00");
    }
    else if (frequencyMap.size > 0) {
        // Add options to the first dropdown based on frequency
        for (let i = 1; i <= frequencyMap.size; i++) {
            dropdown1.append('option')
                .attr('value', i)
                .text(i.toString().padStart(2, '0'));
        }

        // Function to update options in the second dropdown
        function updateDropdown2Options() {
            // Add options to the second dropdown based on the current value of dropdown1
            for (let i = topSports1; i <= frequencyMap.size; i++) {
                dropdown2.append('option')
                    .attr('value', i)
                    .text(i.toString().padStart(2, '0'));
            }
        }

        // Add options to the second dropdown initially
        updateDropdown2Options();

        // Set default value for the first dropdown
        dropdown1.property('value', frequencyMap.size > 0 ? topSports1 : 0);

        // Set default value for the second dropdown
        dropdown2.property('value', frequencyMap.size >= topSports2 ? topSports2 : frequencyMap.size);

        // Update the chart based on the selection from dropdown1
        dropdown1.on('change', function () {
            topSports1 = +this.value;
            topSports2 = topSports1 > topSports2 ? topSports1: topSports2;
            updateDropdown2Options();
            clickedCountry = null;
            clickedYear = null;
            createChoroplethMap();
            createClevelandDotPlot();
            createLineChart();
            createScatterPlot();
        });

        // Update the chart based on the selection from dropdown2
        dropdown2.on('change', function () {
            topSports2 = +this.value;
            clickedCountry = null;
            clickedYear = null;
            createChoroplethMap();
            createClevelandDotPlot();
            createLineChart();
            createScatterPlot();
        });
    }

    const customColors = [
        "#4dd2ff", // Blue
        "#ffdb4d", // Orange
        "#4dff4d", // Green
        "#ff8566", // Red
        "#d9b3ff", // Purple
        "#d9b38c", // Brown
        "#ffccff", // Pink
        "#80ffd4", // Lime Green
        "#ff99cc", // Cyan
        "#99bbff"  // Navy
    ];

    // Color scale for the chart
    const colorScale = d3.scaleOrdinal(customColors);

    // Add brush to the bottom of the chart
    const brush = d3.brush()
        .extent([[0, -5], [width + 15, height]])
        .on("brush", brushed)
        .on("end", brushended);

    // Add the brush group to the SVG
    const brushGroup = svg.append("g")
        .attr("class", "brush")
        .call(brush);

    // Style the brush selection
    brushGroup.selectAll(".selection")
        .attr("fill", "black")
        .attr("stroke", "gray");

    // Function called while the brush is being dragged
    function brushed(event) {
        const selection = d3.brushSelection(this);
    
        svg.selectAll('.sport-label').remove();

        // Restore the original color of all lines and circles
        svg.selectAll('path').attr('stroke', '#47476b');
        svg.selectAll('circle')
            .attr('r', 3)
            .attr('fill', '#47476b')
            .style("stroke-width", 0);

        // Restore the color of axes after the brush
        d3.selectAll('.axis path, .axis line')
            .attr("stroke", "white");

        // Object to store occupied positions
        const occupiedPositions = {};

        if (selection) {
            const [[x0, y0], [x1, y1]] = selection;
    
            // Check each line
            paths.forEach((path, i) => {
                const sportData = lineData.filter(d => d.sport === seasonSports[i]);
    
                // Check if any part of the line is within the brush area
                const isSelected = sportData.some(d => {
                    const cx = x(d.year);
                    const cy = y(d.count);
                    return (cx >= x0 && cx <= x1) && (cy >= y0 && cy <= y1);
                });
    
                // If any part of the line is selected, color the entire line and circles
                if (isSelected) {
                    path.attr('stroke', colorScale(i % 10));
    
                    // Change the color of all circles associated with the selected line
                    svg.selectAll('circle')
                        .filter(d => d.sport === seasonSports[i])
                        .attr('fill', colorScale(i % 10));


                    // Get the last visible point of the line to position the label
                    const lastPoint = sportData[sportData.length - 1];
                    const xPos = x(lastPoint.year);
                    let yPos = y(lastPoint.count);
                    const labelHeight = 9;
                    let adjustment = 0;

                    // Check if the y position is already occupied
                    while (occupiedPositions[`${xPos},${yPos - adjustment}`]) {
                        adjustment += labelHeight;
                    }

                    // Mark the new position as occupied
                    occupiedPositions[`${xPos},${yPos - adjustment}`] = true;

                    // Add the label as text to the SVG
                    svg.append('text')
                        .attr('class', 'sport-label')
                        .attr('x', xPos)
                        .attr('y', yPos - adjustment - 8)
                        .attr('fill', colorScale(i % 10))
                        .attr('font-size', '8px')
                        .text(seasonSports[i]);

                } else {
                    path.attr('stroke', '#47476b');
    
                    // Change the color of all circles associated with the selected line
                    svg.selectAll('circle')
                        .filter(d => d.sport === seasonSports[i])
                        .attr('fill', '#47476b');
                }
            });   
        } 
    }

    function brushended(event) {
        const selection = d3.brushSelection(this);
        
        // Remove existing sport labels
        svg.selectAll('.sport-label').remove();

        clickedCountry = null;
        clickedYear = null;
        createChoroplethMap();
        createClevelandDotPlot();
        createScatterPlot();

        // Restore the original color of all circles and lines
        svg.selectAll('path').attr('stroke', '#47476b');
        svg.selectAll('circle')
            .attr('r', 3)
            .attr('fill', '#47476b')
            .style("stroke-width", 0);

        // Restore the color of the axes after the brush
        d3.selectAll('.axis path, .axis line')
            .attr("stroke", "white");

        // Object to store occupied positions for label placement
        const occupiedPositions = {};
        let isFirstLineBrushed = true;

        if (selection) {
            const [[x0, y0], [x1, y1]] = selection;

            // Check each line (path)
            paths.forEach((path, i) => {
                const sportData = lineData.filter(d => d.sport === seasonSports[i]);
    
                // Create a new sorted variable by 'count' without altering the original sportData
                const sortedSportData = [...sportData].sort((a, b) => b.count - a.count);

                // Check if any points from the sorted variable are within the selection
                const isSelected = sortedSportData.some(d => {
                    const cx = x(d.year);
                    const cy = y(d.count);
                    return (cx >= x0 && cx <= x1) && (cy >= y0 && cy <= y1);
                });

                // If any part of the line is selected, change the entire line and circles' colors
                if (isSelected) {
                    path.attr('stroke', colorScale(i % 10)); // Muda a cor da linha 

                    // Change the color of all circles associated with the selected line
                    svg.selectAll('circle')
                        .filter(d => d.sport === seasonSports[i])
                        .attr('fill', colorScale(i % 10));

                    if (isFirstLineBrushed && !allCountriesLine) {
                        // Variable to store the highlighted circle
                        let highlightedCircle = null;
                        
                        // Find the circle with the earliest year within the brush selection
                        const circlesInSelection = svg.selectAll('circle')
                            .filter(d => d.sport === seasonSports[i])
                            .filter((d) => {
                                const cx = x(d.year);
                                const cy = y(d.count);
                                return (cx >= x0 && cx <= x1) && (cy >= y0 && cy <= y1);
                            })
                            .data();

                        // Find the earliest year among the selected circles
                        const earliestCircle = d3.min(circlesInSelection, d => d.year);

                        // Highlight the circle with the earliest year if found
                        svg.selectAll('circle')
                            .filter(d => d.sport === seasonSports[i] && d.year === earliestCircle)
                            .each(function(d) {
                                highlightedCircle = d3.select(this);
                                clickedCountry = globalCountryCode;
                                clickedYear = d.year;
                                selectedEditionYear = clickedYear;

                                // Highlight the circle
                                highlightedCircle
                                    .style('stroke', 'red')
                                    .style('stroke-width', 2)    
                                    .attr('r', 6);
                            });

                        
                        if (highlightedCircle) {
                            // Highlight all circles with the clicked year
                            svg.selectAll('circle')
                                .filter(d => d.year === clickedYear)
                                .style('stroke', 'red')
                                .style('stroke-width', 2)
                                .attr('r', 6);
                                    
                            isFirstLineBrushed = false;
                            // Update related charts
                            createChoroplethMap();
                            createClevelandDotPlot();
                            createScatterPlot(clickedYear);
                        }
                    }

                    // Get the last visible point of the line to position the label
                    const lastPoint = sportData[sportData.length - 1];
                    const xPos = x(lastPoint.year);
                    let yPos = y(lastPoint.count);
                    const labelHeight = 9;
                    let adjustment = 0;

                    // Check if the y position is already occupied
                    while (occupiedPositions[`${xPos},${yPos - adjustment}`]) {
                        adjustment += labelHeight;
                    }

                    // Mark the new position as occupieda
                    occupiedPositions[`${xPos},${yPos - adjustment}`] = true;

                    // Add the label as text to the SVG
                    svg.append('text')
                        .attr('class', 'sport-label')
                        .attr('x', xPos)
                        .attr('y', yPos - adjustment - 8)
                        .attr('fill', colorScale(i % 10))
                        .attr('font-size', '8px')
                        .text(seasonSports[i]);

                } else {
                    path.attr('stroke', '#47476b');
    
                    // Change the color of all circles associated with the unselected line
                    svg.selectAll('circle')
                        .filter(d => d.sport === seasonSports[i])
                        .attr('fill', '#47476b');
                }
            });
        }
    }
}  