// Create main SVG container.
var margin = {left : 30, right : 30, top : 30, bottom : 30};
var width = 960 - margin.left - margin.right;
var height = 540 - margin.top - margin.bottom;
var svg = d3.select('#content')
              .append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom);

// Top-level transform, for applying the margin(s).
var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' +
                                              margin.top + ')');

// Data set.  This is a map because the keys are used to look up their
// respective colors.
var data = {
  a : 1,
  b : 2,
  c : 5,
  d : 10,
  e : 30,
};

// Color look-up table for the data.  Each key maps to a color.  If there are
// more keys than colors, then the key will wrap around the color array and use
// an existing color.
var colorLUT = d3.scaleOrdinal().domain(data).range(d3.schemeCategory10);

// Convert dictionary into array of entries (key value pairs).
var entries = d3.entries(data);

// Create proportionate slices based the value in each entry, relative to other
// values.
var pie = d3.pie().value(function(d) { return d.value; });
var slices = pie(entries);

// Translate the pie to the center of the SVG container
pieGroup = g.append('g').attr('transform', 'translate(' + width / 2 + ',' +
                                               height / 2 + ')');

// Create the pie, with filled paths.
// Each slice will be processed by the d3.arc() functional object.
pieGroup.selectAll('path')
    .data(slices)
    .enter()
    .append('path')
    .attr('d', d3.arc().innerRadius(0).outerRadius(height / 2))
    .attr('fill', function(d) { return (colorLUT(d.data.key)) })
    .style("stroke-width", "0px")
    .style("opacity", 0.7)

