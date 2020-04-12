// SVG Dimensions.
var margin = {left : 30, right : 30, top : 30, bottom : 30};
var width = 960 - margin.left - margin.right;
var height = 540 - margin.top - margin.bottom;

// Data set.
var data = [
  {x : -1, y : -1},
  {x : 1, y : 1},
];

// Create main SVG container.
var svg = d3.select('#content')
              .append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom);

// Top-level transfor, to apply the margin(s).
var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' +
                                              margin.top + ')');

// Create the Y-axis.
var yScaleLinear = d3.scaleLinear()
                       .domain([
                         d3.min(data, function(d) { return d.y; }),
                         d3.max(data, function(d) { return d.y; })
                       ])
                       .range([ height, 0 ]);

g.append('g')
    .attr('transform', 'translate(' + (width) / 2 + ',' + 0 + ')')
    .call(d3.axisLeft(yScaleLinear));

// Create the X-axis.
var xScaleLinear = d3.scaleLinear()
                       .domain([
                         d3.min(data, function(d) { return d.x; }),
                         d3.max(data, function(d) { return d.x; })
                       ])
                       .range([ 0, width ]);

g.append('g')
    .attr('transform', 'translate(' + 0 + ',' + height / 2 + ')')
    .call(d3.axisBottom(xScaleLinear));

// Draw the line
g.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
                   .x(function(d) { return xScaleLinear(d.x); })
                   .y(function(d) { return yScaleLinear(d.y); }));
