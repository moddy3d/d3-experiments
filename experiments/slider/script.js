// Domain data set [0, 1000] with step size of 10.
var domainData = [];
for (var i = 0; i < 20; i += 10) {
  domainData.push(i);
}

// Create main SVG container.
var margin = {left : 30, right : 30, top : 30, bottom : 30};
var width = 960 - margin.left - margin.right;
var height = 240 - margin.top - margin.bottom;
var svg = d3.select('#content')
              .append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom);

// Top-level transfor, to apply the margin(s).
var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' +
                                              margin.top + ')');

// Create the X-axis.
var scaleX = d3.scaleLinear()
                 .domain([
                   d3.min(domainData, function(d) { return d; }),
                   d3.max(domainData, function(d) { return d; })
                 ])
                 .range([ 0, width ]);

g.append('g')
    .attr('transform', 'translate(' + 0 + ',' + height / 2 + ')')
    .call(d3.axisBottom(scaleX));

// Height of the brush, in viewport space.
var brushHeight = height / 3;

// The step size which the min and max of the brush will be rounded to fit.  The
// transformed min and max will be a integral factor of the step size.
var brushStepSize = 0.5;

// Min size of the brush, in domain space.
var brushMinSize = 2.0;

// Create the brush.
g.append("g")
    .attr("class", "brush")
    .attr('transform',
          'translate(' + 0 + ',' + (height / 2 - brushHeight) + ')')
    .call(d3.brushX()
              .extent([ [ 0, 0 ], [ width, brushHeight ] ])
              .on("end", onBrushEnd));

function fitBrushStepSize(value) {
  return Math.round(value / brushStepSize) * brushStepSize;
}

// Callback at the end of a brush event.
function onBrushEnd() {
  if (!d3.event.sourceEvent) {
    return; // Only transition after input.
  }

  if (!d3.event.selection) {
    return; // Ignore empty selections.
  }

  // Map pixel coordinates -> domain space.
  var domainBrushExtent = d3.event.selection.map(scaleX.invert);

  // Transform to fit step size.
  domainBrushExtent[0] = fitBrushStepSize(domainBrushExtent[0]);
  domainBrushExtent[1] = fitBrushStepSize(domainBrushExtent[1]);

  if (Math.abs(domainBrushExtent[1] - domainBrushExtent[0]) < brushMinSize) {
    domainBrushExtent[1] = domainBrushExtent[0] + brushMinSize;
  }

  d3.select(this).transition().call(d3.event.target.move,
                                    domainBrushExtent.map(scaleX));
}

