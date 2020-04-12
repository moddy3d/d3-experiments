// Produce data for the histogram.
function produceData(startValue, endValue, stepSize) {
  var data = [];
  for (var currentValue = startValue; currentValue <= endValue;
       currentValue += stepSize) {
    var absDiff = Math.abs(endValue / 2 - currentValue);
    var exponential = Math.pow(absDiff, 3);
    data.push({x : currentValue, y : exponential});
  }

  return data;
}

// Generated data set.
var startValue = 0.0;
var endValue = 10;
var stepSize = 0.1;
var data = produceData(startValue, endValue, stepSize);

// Create main SVG container.
var margin = {left : 30, right : 30, top : 30, bottom : 30};
var width = 960 - margin.left - margin.right;
var height = 540 - margin.top - margin.bottom;
var svg = d3.select('#content')
              .append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom);

// Top-level transfor, to apply the margin(s).
var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' +
                                              margin.top + ')');

// Create the Y-axis.
// The range is inversed, as the transform pivot is at the top of the axis
// line.
var scaleY = d3.scaleLinear()
                 .domain([
                   d3.min(data, function(d) { return d.y; }),
                   d3.max(data, function(d) { return d.y; })
                 ])
                 .range([ height, 0 ]);

g.append('g')
    .attr('transform', 'translate(' + 0 + ',' + 0 + ')')
    .call(d3.axisLeft(scaleY));

// Create the X-axis.
var scaleX = d3.scaleLinear()
                 .domain([
                   d3.min(data, function(d) { return d.x; }),
                   d3.max(data, function(d) { return d.x; })
                 ])
                 .range([ 0, width ]);

g.append('g')
    .attr('transform', 'translate(' + 0 + ',' + height + ')')
    .call(d3.axisBottom(scaleX));

// Draw the bars.
g.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", 1)
    .attr(
        "transform",
        function(
            d) { return "translate(" + scaleX(d.x) + "," + scaleY(d.y) + ")"; })
    .attr("width", function(d) { return scaleX(stepSize / 2) })
    .attr("height", function(d) { return height - scaleY(d.y); })
    .style("fill", "steelblue")

