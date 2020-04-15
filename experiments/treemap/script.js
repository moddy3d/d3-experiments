// Create main SVG container.
var margin = {left : 30, right : 30, top : 30, bottom : 30};
var width = 960 - margin.left - margin.right;
var height = 540 - margin.top - margin.bottom;
var svg = d3.select('#content')
              .append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom);

// Top-level transform, to apply the margin(s).
var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' +
                                              margin.top + ')');

// Data-set.
var worldData = {
  'name' : 'World',
  'children' : [
    {
      'name' : 'Layout',
      'children' : [
        {
          'name' : 'Building',
          'children' : [
            {'name' : 'Sphere', 'value' : 100},
            {'name' : 'Cylinder', 'value' : 300},
            {'name' : 'Box', 'value' : 200}
          ]
        },
        {'name' : 'Pavement', 'value' : 600},
        {'name' : 'Background', 'value' : 800}
      ]
    },
    {
      'name' : 'Lights',
      "children" : [ {'name' : 'Area', 'value' : 100} ],

    },
    {
      'name' : 'Cameras',
      "children" : [ {'name' : 'Main', 'value' : 100} ],
    }
  ]
};

// Transform our worldData into a hierarchy structure.
var root = d3.hierarchy(worldData);

// Create the tree layout.
var treemapLayout =
    d3.treemap().size([ width, height ]).padding(5).paddingTop(20);

// Compute the sum of every node, based on the sum of its childrens' values.
root.sum(function(d) { return d.value; });

// Apply the layout onto the hierarchy.
// Co-ordinate values are introduced onto each node, for presentation.
treemapLayout(root);

var nodes = g.selectAll('g')
                .data(root.descendants())
                .enter()
                .append('g')
                .attr('transform', function(d) {
                  return 'translate(' + [ d.x0, d.y0 ] + ')'
                });

nodes.append('rect')
    .attr('opacity', "0.2")
    .attr('stroke', "#555")
    .attr('width', function(d) { return d.x1 - d.x0; })
    .attr('height', function(d) { return d.y1 - d.y0; });

nodes.append('text')
    .attr('dx', 4)
    .attr('dy', 14)
    .text(function(d) { return d.data.name; })
    .attr("font-family", "monospace");

