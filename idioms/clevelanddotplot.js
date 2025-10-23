function createClevelandDotPlot() {
  // Remove the existing chart before redrawing
  d3.select(".ClevelandDotPlot svg").remove();

  // Define the chart dimensions and margins
  var margin = { top: 35, right: 70, bottom: 79, left: 50 },
      width = document.querySelector('.ClevelandDotPlot').clientWidth - margin.left - margin.right,
      height = 410 - margin.top - margin.bottom;

  // Create the SVG element
  var svg = d3.select(".ClevelandDotPlot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      
    var filteredData;
    // Filter the data based on global variables for season, year range, and country code
    if (!allCountries) {
      filteredData = globalDataAll.filter(function (d) {
        return (
          d.Season === globalSeason &&
          d.Year >= globalYearStart &&
          d.Year <= globalYearEnd &&
          d.Country_code === globalCountryCode
        );
      });
    } else {
      // Filter data only by season and year range when all countries are selected
      filteredData = globalDataAll.filter(function (d) {
        return (
          d.Season === globalSeason &&
          d.Year >= globalYearStart &&
          d.Year <= globalYearEnd
        );
      });
    }

  // Select unique year editions based on the season
  var uniqueYearEditions = globalSeason === 'Summer' ? uniqueYearEditionsSummer : uniqueYearEditionsWinter;

  // Filter the years within the global start and end year range
  var genderYearEditions = uniqueYearEditions.filter(year => year >= globalYearStart && year <= globalYearEnd);

  // Group the data by year and gender
  var genderCounts = d3.group(filteredData, d => d.Year);

  // Map each year in genderYearEditions to plotData
  var plotData = genderYearEditions.map(year => {
    // Get the data values for the current year or an empty array if no data exists
    const values = genderCounts.get(year) || [];

    // Use a Set to count unique athlete IDs for both genders
    let maleIds = new Set();
    let femaleIds = new Set();

    // Count unique IDs by gender
    values.forEach(d => {
      if (d.Sex === "M") {
        maleIds.add(d.ID);
      } else if (d.Sex === "F") {
        femaleIds.add(d.ID);
      }
    });

    // Count the number of unique IDs
    let maleCount = maleIds.size;
    let femaleCount = femaleIds.size;
    let countryCode = values.length > 0 ? values[0].Country_code : null;

    // Ensure Male or Female has 0 if they have no data
    maleCount = maleCount || 0;
    femaleCount = femaleCount || 0;

    return {
      Year: year,
      Male: maleCount,
      Female: femaleCount,
      Country_code: countryCode
    };
  });

  // ----------------------------------------------------------------------------------------------------------------------------------------- Pyramid

  if (clevelandSwitch) {
    // Create the X scale (years)
    var x = d3.scaleLinear()
      .domain([globalYearStart*0.9995, globalYearEnd*1.0005])
      .range([0, width - 10]);

    // Add the X axis
    svg.append("g")
      .attr("transform", "translate(0," + height/2 + ")")
      .call(d3.axisBottom(x)
        .tickFormat(d3.format("d"))
        .tickSize(3))
      .selectAll("path, line")
      .style("font-size", "10px")
      .attr("stroke", "white");

    // Adjust font size of X-axis tick labels
    svg.selectAll(".tick text")
      .style("fill", "white")
      .style("font-size", "8px")
      .attr("text-anchor", "middle")
      .attr("dy", "155");

    // Create a linear Y scale based on the maximum value in the data
    var maxValue = d3.max(plotData, d => Math.max(d.Male, d.Female));

    // If the maximum value is zero, adjust it to prevent an empty chart
    if (maxValue === 0) {
      maxValue = 1;
    }

    // Create a Y scale for male data
    var yMale = d3.scaleLinear()
      .domain([0, maxValue])
      .range([height / 2, height]);

    // Create a Y scale for female data
    var yFemale = d3.scaleLinear()
      .domain([0, maxValue])
      .range([height / 2, 0]);

    // Add the male Y axis on the left
    svg.append("g")
      .attr("class", "y-axis-male")
      .call(d3.axisLeft(yMale)
        .ticks(5)
        .tickSize(3))
      .selectAll("path, line")
      .attr("stroke", "white");

    // Add the female Y axis on the left
    svg.append("g")
      .attr("class", "y-axis-female")
      .attr("transform", "translate(0, 0)")
      .call(d3.axisLeft(yFemale)
        .ticks(5)
        .tickSize(3))
      .selectAll("path, line")
      .attr("stroke", "white");

    // Style the text on both Y-axes
    svg.selectAll(".y-axis-male text, .y-axis-female text")
      .style("fill", "white")
      .style("font-size", "8px");

    // Add label to the Y-axis
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 10)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("fill", "white")
      .style("font-size", "10px")
      .text("Number of athletes");

    // Draw vertical lines connecting male and female data points for each year
    plotData.forEach(d => {
      // Draw line from each male data point to the central Y-axis (0)
      svg.append("line")
          .attr("x1", x(d.Year))
          .attr("y1", yMale(d.Male))
          .attr("x2", x(d.Year))
          .attr("y2", height / 2)
          .attr("stroke", "#595959")
          .attr("stroke-width", "1px");

      // Draw line from each female data point to the central Y-axis (0)
      svg.append("line")
          .attr("x1", x(d.Year))
          .attr("y1", yFemale(d.Female))
          .attr("x2", x(d.Year))
          .attr("y2", height / 2)
          .attr("stroke", "#595959")
          .attr("stroke-width", "1px");
    });

    // Draw circles for male and female data points with colors for each gender
    setCircles (plotData, svg, x, yMale, "#8000ff",  'M', tooltip);
    setCircles (plotData, svg, x, yFemale, "#ff33ff", 'F', tooltip);
      
  // ----------------------------------------------------------------------------------------------------------------------------------------- Grouped
  } else { 
    // Cria a escala X (anos)
    var x = d3.scaleLinear()
      .domain([globalYearStart*0.9995, globalYearEnd*1.0005])
      .range([0, width - 10]);

    // Adiciona o eixo X
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x)
        .tickFormat(d3.format("d"))
        .tickSize(3))
      .selectAll("path, line")
      .style("font-size", "10px")
      .attr("stroke", "white");

      // Ajusta o tamanho da fonte dos textos dos ticks do eixo X
    svg.selectAll(".tick text")
      .style("fill", "white")
      .style("font-size", "8px")
      .attr("text-anchor", "middle")
      .attr("dy", "7");

    // Cria a escala Y linear
    var maxValue = d3.max(plotData, d => Math.max(d.Male, d.Female));

    // Se o valor máximo for zero, ajusta para evitar que o gráfico fique vazio
    if (maxValue === 0) {
      maxValue = 1;
    }

    var y = d3.scaleLinear()
      .domain([0, maxValue])
      .range([height, 0]);    

    // Adiciona o eixo Y
    svg.append("g")
      .call(d3.axisLeft(y)
        .ticks(10)
        .tickSize(3))
      .selectAll("path, line")
      .attr("stroke", "white");

    // Estiliza os textos do eixo Y
    svg.selectAll("text")
      .style("fill", "white")
      .style("font-size", "8px");

    // Adiciona o rótulo ao eixo Y
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 10)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("fill", "white")
      .style("font-size", "10px")
      .text("Number of athletes");
  
    // Adiciona as linhas verticais entre os dados masculinos e femininos
    plotData.forEach(d => {
      svg.append("line")
          .attr("x1", x(d.Year))
          .attr("y1", y(d.Male))
          .attr("x2", x(d.Year))
          .attr("y2", y(d.Female))
          .attr("stroke", "#595959")
          .attr("stroke-width", "1px");
    });

    setCircles (plotData, svg, x, y, "#8000ff", 'M', tooltip);
    setCircles (plotData, svg, x, y, "#ff33ff", 'F', tooltip);
  }
  // -------------------------------------------------------------------------------------------------------------------------------------------------------
  
  // Title for the chart
  var defaultCountry = uniqueCountries.find(d => d.Country_code === globalCountryCode);
  svg.append("text")
    .attr("x", width / 2 + 10)
    .attr("y", -22)
    .attr("text-anchor", "middle")
    .style("fill", "white")
    .style("font-size", "13px")
    .text("Evolution of Gender Distribution among Athletes of ")
    .append("tspan")
    .style("fill", allCountries ? "white" : '#80ff80')
    .text(allCountries ? "All Countries" : defaultCountry.Country);

  // Add the legend
  var legend = svg.append("g").attr("class", "legend").attr("transform", "translate(" + (width + 23) + "," + -22 + ")");

  // Circle for male representation in the legend
  legend.append("circle").attr("cx", 0).attr("cy", 0).attr("r", 4).style("fill", "#8000ff");
  legend.append("text").attr("x", 10).attr("y", 3).text("Male").style("fill", "white").style("font-size", "9px");

  // Circle for female representation in the legend
  legend.append("circle").attr("cx", 0).attr("cy", 12).attr("r", 4).style("fill", "#ff33ff");
  legend.append("text").attr("x", 10).attr("y", 15).text("Female").style("fill", "white").style("font-size", "9px");

  // Create a button group for selecting a specific country
  var buttonCountry = svg.append("g")
    .attr("class", "button-group")
    .attr("cursor", "pointer");

  // Add a foreignObject to allow HTML content
  buttonCountry.append("foreignObject")
    .attr("x", width - 8)
    .attr("y", height - 60)
    .attr("width", 100)
    .attr("height", 60)
    .style("padding", "0")
    .append("xhtml:div")
    .style("text-align", "center")
    .style("color", !allCountries ? "#80ff80" : "gray")
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

  // Define click event for the country button
  buttonCountry.on("click", () => {
    allCountries = false;
    createClevelandDotPlot();
  });
  
  // Create a button group for selecting all countries
  var buttonAll = svg.append("g")
    .attr("class", "button-group")
    .attr("cursor", "pointer");

  // Add a foreignObject to allow HTML content
  buttonAll.append("foreignObject")
    .attr("x", width - 8)
    .attr("y", height - 20)
    .attr("width", 100)
    .attr("height", 40)
    .style("padding", "0")
    .append("xhtml:div")
    .style("text-align", "center")
    .style("color", allCountries ? "white" : "grey")
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

  // Define click event for the all countries button
  buttonAll.on("click", () => {
    if (clickedCountry) {
        clickedCountry = null;
        clickedYear = null;
        createChoroplethMap();
        createLineChart();
        createScatterPlot();
    }
    allCountries = true;
    createClevelandDotPlot();
  });

  // Create a button group for toggling between visualizations
  var buttonSwitch = svg.append("g")
    .attr("class", "button-group")
    .attr("cursor", "pointer");

  // Add a foreignObject to allow HTML content
  buttonSwitch.append("foreignObject")
    .attr("x", width - 8)
    .attr("y", height - 165)
    .attr("width", 100)
    .attr("height", 30)
    .append("xhtml:div")
    .style("padding", "2")
    .style("text-align", "center")
    .style("font-size", "10px")
    .html('<span style="color: ' + (!clevelandSwitch ? 'gray' : 'white') + '">Pyramid</span><br>' +
          '<span style="color: ' + (clevelandSwitch ? 'gray' : 'white') + '; margin-top: 5px; display: block;">Group</span>')
    .style("position", "relative")
    .style("z-index", 10)
    .on("mouseover", function() {
      d3.select(this)
        .style("transform", "scale(1.1)");
    })
    .on("mouseout", function() {
        d3.select(this)
          .style("transform", "scale(1)");
    });

  // Define click event for the switch button
  buttonSwitch.on("click", () => {
    clevelandSwitch = !clevelandSwitch;
    createClevelandDotPlot();
    });
}

function setCircles (plotData, svg, x, y, fill, gender, tooltip) {
  var genderPath = gender === 'M' ? ".male-circle" : ".female-circle";
  var genderPathOther = gender === 'M' ? ".female-circle" : ".male-circle";
  var circle = gender === 'M' ? "male-circle" : "female-circle";

  // Bind data to circles and create new circle elements
  svg.selectAll(genderPath)
    .data(plotData)
    .enter()
    .append("circle")
    .attr("class", circle)
    .attr("cx", d => {
      if ((clevelandSwitch && d.Female === 0 && d.Male === 0) || (!clevelandSwitch && d.Female === d.Male)) {
          return x(d.Year) + (gender === 'M' ? -2 : 2);
      } else {
          return x(d.Year);
      }
    })
    .attr("cy", d => y(gender === 'M' ? d.Male : d.Female))
    .attr("r", d => (clickedCountry !== null && d.Year === clickedYear && !allCountries) ? 6 : 3)
    .style("fill", fill)
    .style("stroke", d => (clickedCountry !== null && d.Year === clickedYear  && !allCountries) ? "red" : "none")
    .style("stroke-width", d => (clickedCountry !== null && d.Year === clickedYear  && !allCountries) ? 1.5 : 0)
    .on("click", function(event, d) {
      const currentCircle = d3.select(this);

      // Toggle the selection state of the circle
      const isSelected = currentCircle.classed("selected");
      currentCircle.classed("selected", !isSelected);
      
      // Reset all circles to their initial state
      svg.selectAll(genderPath)
        .attr("r", 3)
        .style("stroke", "gray")
        .style("stroke-width", 0);

      currentCircle.attr("r", 6);

      if (!allCountries) {
        // Check if the clicked circle is already selected
        if (clickedCountry === d.Country_code && clickedYear === d.Year) {
          // Reset the circles
          svg.selectAll(genderPathOther)
              .filter(f => f.Country_code === d.Country_code && f.Year === d.Year)
              .attr("r", 3)
              .style("stroke", "none")
              .style("stroke-width", 0);

          clickedCountry = null;
          clickedYear = null; // Resetar as variáveis globais
        } else {
          // Reset all other circles to their initial state
          svg.selectAll(genderPathOther)
              .attr("r", 3)
              .style("stroke", "none")
              .style("stroke-width", 0);

          // Update the clicked circle
          currentCircle
              .attr("r", 6)
              .style("stroke", "red")
              .style("stroke-width", 1.5);

          // Update the corresponding circle
          svg.selectAll(genderPathOther)
              .filter(f => f.Country_code === d.Country_code && f.Year === d.Year)
              .attr("r", 6)
              .style("stroke", "red")
              .style("stroke-width", 1.5);

          clickedCountry = d.Country_code || globalCountryCode;
          clickedYear = d.Year;
          selectedEditionYear = clickedYear;
          allCountriesLine = false;
        }
      }

      // Hide the tooltip before updating the charts
      tooltip.style("opacity", 0);

      // Delay to ensure the tooltip disappears before the update
      setTimeout(function() {
          allCountriesLine = null;
          topSports1 = 1;
          topSports2 = 5;
          createChoroplethMap();
          createLineChart();
          createScatterPlot(d.Year);
      }, 100);
    })
    .on("mouseover", function(event, d) {
      d3.select(this).transition().duration(100)
        .attr("r", 6)
        .style("stroke", (clickedCountry === d.Country_code && clickedYear === d.Year) ? "red" : "none")
        .style("stroke-width", (clickedCountry === d.Country_code && clickedYear === d.Year) ? 1.5 : 0);

      tooltip.transition().duration(100).style("opacity", .9)
      tooltip.html(`<strong>${d.Year}</strong><br>${gender === 'M' ? d.Male : d.Female}`)
        .style("left", (event.pageX - tooltip.node().offsetWidth / 2 - 10) + "px").style("top", (event.pageY - 50) + "px");
      })
    .on("mouseout", function(event, d) {
      d3.select(this).transition().duration(100)
        .attr("r", (clickedYear === d.Year) ? 6 : 3)
        .style("stroke", (clickedYear === d.Year) ? "red" : "none")
        .style("stroke-width", (clickedYear === d.Year) ? 1.5 : 0);

    tooltip.transition().duration(500).style("opacity", 0);
    });
}