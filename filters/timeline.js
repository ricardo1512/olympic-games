function createTimeline() {
    const timelineDiv = d3.select("#timeline");
    
    // Define width and height of the SVG
    const margin = { top: 0, right: 0, bottom: 40, left: 0 },
          width = timelineDiv.node().clientWidth - margin.left - margin.right, 
          height = 30;

    const svg = timelineDiv.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    // X scale (years)
    const x = d3.scaleLinear()
        .domain([firstEdition - 3, lastEdition + 3])
        .range([0, width]);

    // X axis based on year scale
    const xAxis = d3.axisBottom(x)
        .ticks(uniqueYearEditions.length)
        .tickFormat(d3.format("d"));

    // Create context group in SVG for axis and brush
    const context = svg.append("g")
        .attr("class", "context")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Add brush (selection bar)
    const brush = d3.brushX()
        .extent([[0, 0], [width, height - 18]])
        .on("end", brushed);

    const brushGroup = context.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, [10, width - 10]);

    // Style brush bar
    brushGroup.select(".selection")
        .style("fill", "white");

    // Add X axis below the brush bar
    const xAxisGroup = context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", `translate(0, 15)`)
        .call(xAxis);

    // Customize ticks of the X axis
    xAxisGroup.selectAll(".tick line")
        .attr("y2", 2)
        .style("stroke", "white");

    xAxisGroup.selectAll(".tick")
        .filter((d, i) => i === 0 || i === uniqueYearEditions.length - 1)
        .select("line")
        .style("display", "none");

    xAxisGroup.selectAll("text")
        .style("fill", "white")
        .style("font-size", "8px")
        .attr("dy", "-0.03em");

    function brushed(event) {
        if (!event.selection) return;

        let s = event.selection;
        const brushWidth = s[1] - s[0];
        const minWidth = 20;

        // Se a largura do brush for menor que 20 pixels, ajusta a seleção
        if (brushWidth < minWidth) {
            // Ajusta as bordas da seleção
            const midPoint = (s[0] + s[1]) / 2 + 10;
            s = [
                Math.max(midPoint - minWidth / 2, 0),
                Math.min(midPoint + minWidth / 2, width)
            ];

            d3.select(".brush").call(brush.move, s);
        }

        const timeSelection = s.map(x.invert, x);
        
        // Obter o valor inicial e final da seleção
        timelineStart = timeSelection[0];
        timelineEnd = timeSelection[1];

        globalYears();

        topSports1 = 1;
        topSports2 = 5;
        clickedCountry = null;
        clickedYear = null;
        createClevelandDotPlot();
        createChoroplethMap();
        createLineChart();
        createScatterPlot();
    }  
}

function globalYears(){
    if (globalSeason === "Summer") {
        if (timelineStart <= 1896 && timelineEnd >= 2016) {
            globalYearStart = 1896;
            globalYearEnd = 2016;
        } else {
        
        globalYearStart = uniqueYearEditionsSummer.find(year => year >= timelineStart);
        globalYearEnd = uniqueYearEditionsSummer.filter(year => year <= timelineEnd).pop();
        }
        selectedEditionYear = globalYearEnd;
    } else if (globalSeason === "Winter") {
        if (timelineStart <= 1924 && timelineEnd >= 2014) {
            globalYearStart = 1924;
            globalYearEnd = 2014;
        } else {
        globalYearStart = uniqueYearEditionsWinter.find(year => year >= timelineStart);          
        globalYearEnd = uniqueYearEditionsWinter.filter(year => year <= timelineEnd).pop();
        }
        selectedEditionYear = globalYearEnd;
    }
};