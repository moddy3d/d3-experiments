var width = 960;
var height = 540;
var margin = {x: 30, y: 30};

var data = [
    {x: 0, y: 0},
    {x: 1, y: 1},
]

// Main SVG container.
var svg = d3.select("#content")
    .append("svg")
        .attr("width", width)
        .attr("height", height)

// Main transform.
var g = svg.append("g")
    .attr("transform", "translate(" + margin.x + "," + margin.y + ")");

// Create the Y-axis, scaled to the height of the SVG container
// Its domain is [0, max(data.y)].
var yScaleLinear = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return d.y; })])
    .range([height - margin.y * 2, 0]);

g.append("g")
    .attr("transform", "translate(" + 0 + "," + 0 + ")")
    .call(d3.axisLeft(yScaleLinear));
