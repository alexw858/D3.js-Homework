// D3 Scatterplot

// var svgWidth = 960;
// var svgHeight = 500;

// using the same dimensions of iframeContainer
// var svgWidth = 720;
// var svgHeight = 550.5;

// Grab the width of the containing box
var svgWidth = parseInt(d3.select("#scatter").style("width"));
console.log("svgWidth=", svgWidth);
// Doesn't work, returns 0
// var svgHeight = parseInt(d3.select("#scatter").style("height"));
var svgHeight = svgWidth - svgWidth / 3.9;
console.log("svgHeight=",svgHeight);

var margin = {
    top: 20,
    right: 40,
    bottom: 85,
    left: 100
}

var width = svgWidth - margin.left - margin.right;
console.log("width = ", width);
var height = svgHeight - margin.top - margin.bottom;
console.log("height = ", height);

console.log(".attr('y', 0 - margin.left) = ", 0-margin.left);
console.log(".attr('x', 0 - (height/2)) = ", 0-(height/2));

var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var scatterGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// default chosen axes are assigned
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// updates scale upon click
function xScale(healthData, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) *0.8, 
    d3.max(healthData, d => d[chosenXAxis]) * 1.2])
    .range([0, width]);
return xLinearScale;
}
function yScale(healthData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8, 
    d3.max(healthData, d => d[chosenYAxis]) * 1.2])
    .range([0, height]);
return yLinearScale;
}

// update axis upon click
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}
function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}

function renderCirclesX(circlesGroup, newXScale, chosenXAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));
    return circlesGroup;
}
function renderCirclesY(circlesGroup, newYScale, chosenYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
}

// d3-tip.js
// Update the tooltip with the correct label for which clickable label is selected
// circlesGroup appends circles as the data points to the graph
    function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    // Look at chosenXAxis, assign label
    if (chosenXAxis === "poverty") {
        var xLabel = "Poverty:";
    }
    else if (chosenXAxis === "age") {
        var xLabel = "Age:"
    }
    else {
        var xLabel = "Income:";
    }

    // Look at chosenYAxis, assign label
    if (chosenYAxis === "obesity") {
        var yLabel = "Obesity:";
    }
    else if (chosenYAxis === "smokes") {
        var yLabel = "Smokes:"
    }
    else {
        var yLabel = "Lacks Healthcare:";
    }

    var toolTip = d3.tip()
    .attr("class", "tooltip")
    // .offset([80, -60])
    // Place the tooltip directly above the point moused over
    .offset([-10, 5])
    .html(function(d) {
        return (`${d.state}<br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
    });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
        .on("mouseout", function(data) {
            toolTip.hide(data);
        });

return circlesGroup;
}
   
// Retrieve data from CSV file
d3.csv("assets/data/data.csv", function(err, healthData) {
    if (err) throw err;

    healthData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        data.healthcare = +data.healthcare;
    });

    var xLinearScale = xScale(healthData, chosenXAxis);
    var yLinearScale = yScale(healthData, chosenYAxis);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var xAxis = scatterGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    
    // append y axis to graph
    var yAxis = scatterGroup.append("g")
        .call(leftAxis);

    // append initial circles
    var circlesGroup = scatterGroup.selectAll("circle")
        .data(healthData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 10)
        .attr("fill", "blue")
        .attr("opacity", ".3");

    // Positions the x-axis labels just below the center of the x-axis
    var xLabelsGroup = scatterGroup.append("g")
        .attr("transform", `translate(${width/2}, ${height + 20})`);

    // Adjusts the position of each clickable x-axis label and sets the text for each label
    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("active", true)
        .text("In Poverty (%)");

    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income")
    .classed("inactive", true)
    .text("Household Income (Median)");

    // Positions the clickable y-axis labels vertically and to the left of the y-axis
    var yLabelsGroup = scatterGroup.append("g")
        // assigning x and y attributes to yLabelsGroup isn't working, needed to assign to each label individually for it to work
        // .attr("y", 0 - margin.left)
        // .attr("x", 0 - (height/2))
        .attr("transform", "rotate(-90)")
        // .attr("dy", "1em");

    // Adjusts the position of each clickable y-axis label and sets the text for each label
    var obesityLabel = yLabelsGroup.append("text")
        // .attr("x", -200)
        .attr("x", 0 - (height/2))
        .attr("y", -70)
        .attr("value", "obesity")
        // The default selected y-label is obesity
        .classed("active", true)
        .text("Obese (%)");

    var smokesLabel = yLabelsGroup.append("text")
        // .attr("x", -200)
        .attr("x", 0 - (height/2))
        .attr("y", -50)
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokes (%)");

    var  healthcareLabel = yLabelsGroup.append("text")
        // .attr("x", -200)
        .attr("x", 0 - (height/2))
        .attr("y", -30)
        .attr("value", "healthcare")
        .classed("inactive", true)
        .text("Lacks Healthcare (%)");


    
    // Set what the initial ToolTip will display
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // Handle when an x label is selected
    xLabelsGroup.selectAll("text")
        .on("click", function() {
            var value = d3.select(this).attr("value");
            // if a new x-axis is selected, set chosenXAxis to what is now selected
            if (value !==chosenXAxis) {
                chosenXAxis = value;
                xLinearScale = xScale(healthData, chosenXAxis);
                xAxis = renderXAxis(xLinearScale, xAxis);
                circlesGroup = renderCirclesX(circlesGroup, xLinearScale, chosenXAxis);
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis ==="age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
    // Handle when a y label is selected
    yLabelsGroup.selectAll("text")
        .on("click", function() {
            var value = d3.select(this).attr("value");
            if (value !==chosenYAxis) {
                chosenYAxis = value;
                yLinearScale = yScale(healthData, chosenYAxis);
                yAxis = renderYAxis(yLinearScale, yAxis);
                circlesGroup = renderCirclesY(circlesGroup, yLinearScale, chosenYAxis);
                // circlesGroup = updateToolTipY(chosenYAxis, circlesGroup);
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                if (chosenYAxis === "obesity") {
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis ==="smokes") {
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
});