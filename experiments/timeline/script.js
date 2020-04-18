// Timeline data set.
var startTime = 0;
var stopTime = 100000;
var timeStep = 1;

var timelineData = [];

for (var currentTime = startTime, index = 0; currentTime < stopTime;
     currentTime += timeStep * index, index += 1) {
  timelineData.push({
    name : "Entry_" + currentTime,
    start : currentTime,
    end : currentTime + (timeStep * index / 2)
  });
}

// Create main SVG container.
var margin = {left : 30, right : 30, top : 30, bottom : 30};
var width = 960 - margin.left - margin.right;
var height = 540 - margin.top - margin.bottom;
var svg = d3.select('#content')
              .append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom);

// Root-level group, for margin application.
var rootGroup = svg.append('g').attr('transform', 'translate(' + margin.left +
                                                      ',' + margin.top + ')');

// Create the navigation X-axis scale mapping.
// This maps the input time exntents to the width of the interior SVG container.
var navigationScaleX =
    d3.scaleLinear().domain([ startTime, stopTime ]).range([ 0, width ]);

var navigationAxisOffset = height * 19 / 20;
rootGroup.append('g')
    .attr('transform', 'translate(' + 0 + ',' + navigationAxisOffset + ')')
    .call(d3.axisTop(navigationScaleX));

// Create the primary focal X-axis.
// This is a placeholder for now.  The navigation brush will determine the
// actual scaling of the axis.
var timelineTickSize = height * 0.85;
rootGroup.append("g")
    .attr("class", "primaryAxis")
    .attr('transform', 'translate(' + 0 + ',' + (height * 17 / 20) + ')')
    .call(d3.axisTop(navigationScaleX).tickSize(timelineTickSize));

// Create navigation data rects.
rootGroup.selectAll("rect.navigationBar")
    .data(timelineData)
    .enter()
    .append("rect")
    .classed("navigationBar", true)
    .attr("transform",
          function(d) {
            return "translate(" + navigationScaleX(d.start) + "," +
                   (navigationAxisOffset - height / 12) + ")";
          })
    .attr("width", function(d) { return navigationScaleX(d.end - d.start); })
    .attr("height", function(d) { return height / 30; })
    .style("opacity", "50%")
    .style("fill", "steelblue");

// Height of the brush, in viewport space.
var brushHeight = height / 10;

// The step size which the min and max of the brush will be rounded to fit.  The
// transformed min and max will be a integral factor of the step size.
var brushStepSize = 1;

// Min size of the brush, in domain space.
var brushMinSize = (stopTime - startTime) / 20;

// Create the brush.
var brushGroup =
    rootGroup.append("g")
        .attr("class", "brush")
        .attr('transform', 'translate(' + 0 + ',' +
                               ((navigationAxisOffset - brushHeight) + 2.0) +
                               ')');
var brush = d3.brushX()
                .extent([ [ 0, 0 ], [ width, brushHeight ] ])
                .on("brush", onBrush)
                .on("end", onBrushEnd);
brushGroup.call(brush)

// Utility function to fit a dimension of the brush extent to the prescribed
// brushStepSize.
function fitBrushStepSize(value)
{
  return Math.round(value / brushStepSize) * brushStepSize;
}

function fitDomainBrushExtent(domainBrushExtent)
{
  // Transform to fit step size.
  domainBrushExtent[0] = fitBrushStepSize(domainBrushExtent[0]);
  domainBrushExtent[1] = fitBrushStepSize(domainBrushExtent[1]);

  // Brush extent be greater than min size.
  if (Math.abs(domainBrushExtent[1] - domainBrushExtent[0]) < brushMinSize) {
    domainBrushExtent[1] = domainBrushExtent[0] + brushMinSize;
  }

  return domainBrushExtent;
}

function updateDisplay(domainBrushExtent)
{
  // Compute brush region scale, for primary view framing.
  var brushScaleX = d3.scaleLinear()
                        .domain([ domainBrushExtent[0], domainBrushExtent[1] ])
                        .range([ 0, width ]);

  // Compute brush region scale, for primary view framing.
  var brushScaleWidth =
      d3.scaleLinear()
          .domain([ 0, domainBrushExtent[1] - domainBrushExtent[0] ])
          .range([ 0, width ]);

  // Update primary view.
  d3.select("g .primaryAxis")
      .call(d3.axisTop(brushScaleX).tickSize(timelineTickSize));

  // Find visible entries.
  var visibleEntries = timelineData.filter(function(d) {
    return d.start < domainBrushExtent[1] && d.end > domainBrushExtent[0];
  });

  var visibleRects = rootGroup.selectAll("rect.focalBar")
                         .data(visibleEntries, function(d) { return d.name; });

  visibleRects.attr("x", function(d) { return brushScaleX(d.start); })
      .attr("width", function(d) { return brushScaleWidth(d.end - d.start); });

  visibleRects.enter()
      .append("rect")
      .classed("focalBar", true)
      .style("opacity", "50%")
      .style("fill", "steelblue")
      .attr("x", function(d) { return brushScaleX(d.start); })
      .attr("y", function(d) { return (navigationAxisOffset - height * 0.66); })
      .attr("width", function(d) { return brushScaleWidth(d.end - d.start); })
      .attr("height", function(d) { return height / 3; });

  visibleRects.exit().remove();
}

// Callback at the end of a brush event.
function onBrush()
{
  if (!d3.event.sourceEvent) {
    return; // Only transition after input.
  }

  var domainBrushExtent =
      fitDomainBrushExtent(d3.event.selection.map(navigationScaleX.invert));
  updateDisplay(domainBrushExtent);
}

function onBrushEnd()
{
  if (!d3.event.sourceEvent) {
    return; // Only transition after input.
  }

  var domainBrushExtent =
      fitDomainBrushExtent(d3.event.selection.map(navigationScaleX.invert));
  d3.select(this).transition().call(d3.event.target.move,
                                    domainBrushExtent.map(navigationScaleX));
  updateDisplay(domainBrushExtent);
}

