// D3 Scatterplot Assignment

// Students:
// =========
// Follow your written instructions and create a scatter plot with D3.js.
var svgWidth = 960;
var svgHeight = 500;

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

function updateToolTipX(chosenXAxis, circlesGroup) {
    if (chosenXAxis === "poverty") {
        var xLabel = "Poverty:";
    }
    else if (chosenXAxis === "age") {
        var xLabel = "Age:"
    }
    else {
        var xLabel = "Income:";
    }

    var toolTipX = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
        return (`${d.state}<br>${xLabel} ${d[chosenXAxis]}`);
    });

    circlesGroup.call(toolTipX);

    circlesGroup.on("mouseover", function(data) {
        toolTipX.show(data);
    })
        .on("mouseout", function(data) {
            toolTipX.hide(data);
        });

return circlesGroup;
}

function updateToolTipY(chosenYAxis, circlesGroup) {
    if (chosenYAxis === "obesity") {
        var yLabel = "Obesity:";
    }
    else if (chosenYAxis === "smokes") {
        var yLabel = "Smokes:"
    }
    else {
        var yLabel = "Lacks Healthcare:";
    }

    var toolTipY = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
        return (`${d.state}<br>${yLabel} ${d[chosenYAxis]}`);
    });

    circlesGroup.call(toolTipY);

    circlesGroup.on("mouseover", function(data) {
        toolTipY.show(data);
    })
        .on("mouseout", function(data) {
            toolTipY.hide(data);
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

    var xLabelsGroup = scatterGroup.append("g")
        .attr("transform", `translate(${width/2}, ${height + 20})`);

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

    var yLabelsGroup = scatterGroup.append("g")
        // assigning x and y attributes to yLabelsGroup isn't working, needed to assign to each label individually for it to work
        // .attr("y", 0 - margin.left)
        // .attr("x", 0 - (height/2))
        .attr("transform", "rotate(-90)")
        // .attr("dy", "1em");

    var obesityLabel = yLabelsGroup.append("text")
        // .attr("x", -200)
        .attr("x", 0 - (height/2))
        .attr("y", -70)
        .attr("value", "obesity")
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
    var circlesGroup = updateToolTipX(chosenXAxis, circlesGroup);
    // var circlesGroup = updateToolTipY(chosenYAxis, circlesGroup);

    xLabelsGroup.selectAll("text")
        .on("click", function() {
            var value = d3.select(this).attr("value");
            if (value !==chosenXAxis) {
                chosenXAxis = value;
                xLinearScale = xScale(healthData, chosenXAxis);
                xAxis = renderXAxis(xLinearScale, xAxis);
                circlesGroup = renderCirclesX(circlesGroup, xLinearScale, chosenXAxis);
                circlesGroup = updateToolTipX(chosenXAxis, circlesGroup);

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
    yLabelsGroup.selectAll("text")
        .on("click", function() {
            var value = d3.select(this).attr("value");
            if (value !==chosenYAxis) {
                chosenYAxis = value;
                yLinearScale = yScale(healthData, chosenYAxis);
                yAxis = renderYAxis(yLinearScale, yAxis);
                circlesGroup = renderCirclesY(circlesGroup, yLinearScale, chosenYAxis);
                circlesGroup = updateToolTipY(chosenYAxis, circlesGroup);

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