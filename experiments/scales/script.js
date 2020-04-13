// Domain data set [0, 1000] with step size of 10.
var domainData = [];
for (var i = 0; i < 1000; i += 10) {
  domainData.push(i);
}

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
var scaleLinear = d3.scaleLinear()
                      .domain([
                        d3.min(domainData, function(d) { return d; }),
                        d3.max(domainData, function(d) { return d; })
                      ])
                      .range([ height, 0 ]);

g.append('g')
    .attr('transform', 'translate(' + 0 + ',' + 0 + ')')
    .call(d3.axisLeft(scaleLinear));

// Create the X-axis.
var scaleX = d3.scaleLinear()
                 .domain([
                   d3.min(domainData, function(d) { return d; }),
                   d3.max(domainData, function(d) { return d; })
                 ])
                 .range([ 0, width ]);

g.append('g')
    .attr('transform', 'translate(' + 0 + ',' + height + ')')
    .call(d3.axisBottom(scaleX));

// Tool tip.
var tooltip = d3.select("body")
                  .append("div")
                  .classed("tooltip", true)
                  .style("z-index", "10")
                  .style("visibility", "hidden")
                  .text("e = ?");

// Auxiliary plot domainData set.
var plotData = {};
var exponentBegin = 0.05;
var exponentEnd = 50;
for (var exponent = exponentBegin; exponent < exponentEnd;
     exponent += exponent / 4) {
  var key = "exponent_" + String(exponent).replace(".", "_");
  plotData[key] = d3.scalePow()
                      .exponent(exponent)
                      .domain([
                        d3.min(domainData, function(d) { return d; }),
                        d3.max(domainData, function(d) { return d; })
                      ])
                      .range([ height, 0 ]);
}

// Color look-up table for the set of plotData.
var colorLUT =
    d3.scaleSequential()
        .domain([
          exponentBegin, exponentBegin + (exponentEnd - exponentBegin) / 4,
          exponentEnd
        ])
        .interpolator(d3.interpolateViridis);

// Function for adding a single plot of an exponential scale transformation over
// the domain domainData.
function addPlot(parentDatum, i) {

  // Opacities for the path, depending on mouse hover state.
  var pathOpacityNormal = 0.5;
  var pathOpacityHover = 0.8;

  // Add a path through the domain data plot.
  var path =
      d3.select(this)
          .append("path")
          .datum(domainData)
          .attr("fill", "none")
          .attr("stroke",
                function(d) { return colorLUT(parentDatum.value.exponent()) })
          .attr("stroke-width", 2.0)
          .attr("opacity", pathOpacityNormal)
          .attr('d', d3.line()
                         .x(function(d) { return scaleX(d); })
                         .y(function(d) { return parentDatum.value(d); }));

  // Per data point circle.
  d3.select(this)
      .selectAll("circle ." + parentDatum.key)
      .data(domainData)
      .enter()
      .append("circle")
      .attr('r', 2.0)
      .attr('cx', function(d) { return scaleX(d); })
      .attr('cy', function(d) { return parentDatum.value(d); })
      .style("fill",
             function(d) { return colorLUT(parentDatum.value.exponent()) });

  // Hovering over the data plot should high-light it.
  d3.select(this)
      .on("mouseover",
          function() {
            path.attr("opacity", pathOpacityHover);
            tooltip.text("e = " + String(parentDatum.value.exponent()));
            return tooltip.style("visibility", "visible");
          })
      .on("mousemove",
          function() {
            return tooltip.style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
          })
      .on("mouseout", function() {
        path.attr("opacity", pathOpacityNormal);
        return tooltip.style("visibility", "hidden");
      });
}

var plotGroup = g.append("g");
plotGroup.selectAll("g").data(d3.entries(plotData)).enter().append("g");
plotGroup.selectAll("g").each(addPlot);

