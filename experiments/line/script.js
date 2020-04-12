var width = 960;
var height = 540;
var margin = {x : 30, y : 30};

var data = [
  {x : -1, y : -1},
  {x : 1, y : 1},
];

// Main SVG container.
var svg = d3.select('#content')
              .append('svg')
              .attr('width', width)
              .attr('height', height);

// Main transform.
var g = svg.append('g').attr('transform',
                             'translate(' + margin.x + ',' + margin.y + ')');

// Create the Y-axis.
var yScaleLinear = d3.scaleLinear()
                       .domain([
                         d3.min(data, function(d) { return d.y }),
                         d3.max(data, function(d) { return d.y; })
                       ])
                       .range([ height - margin.y * 2, 0 ]);

g.append('g')
    .attr('transform',
          'translate(' + (width - margin.x * 2) / 2 + ',' + 0 + ')')
    .call(d3.axisLeft(yScaleLinear));

// Create the X-axis.
var xScaleLinear = d3.scaleLinear()
                       .domain([
                         d3.min(data, function(d) { return d.x }),
                         d3.max(data, function(d) { return d.x; })
                       ])
                       .range([ 0, width - margin.x * 2 ]);

g.append('g')
    .attr('transform', 'translate(' + 0 + ',' + (height - margin.y * 2) + ')')
    .call(d3.axisBottom(xScaleLinear));
