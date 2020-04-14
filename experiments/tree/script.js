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
      'value' : 300,
      "children" : [ {'name' : 'Area', 'value' : 100} ],

    },
    {
      'name' : 'Cameras',
      'value' : 200,
      "children" : [ {'name' : 'Main', 'value' : 100} ],
    }
  ]
};

// Transform our worldData into a hierarchy structure.
var root = d3.hierarchy(worldData);

// Create the tree layout.
var treeLayout = d3.tree().size([ width, height ]).separation(function(a, b) {
  // Even separation between direct parent <-> child, and siblings.
  return 1;
});

// Apply the layout onto the hierarchy.
// Co-ordinate values are introduced onto each node, for presentation.
treeLayout(root);

// Draw the links or relationships as lines.
g.selectAll('line .link')
    .data(root.links())
    .enter()
    .append('line')
    .classed('link', true)
    .attr("stroke", "steelblue")
    .attr('x1', function(d) { return d.source.x; })
    .attr('y1', function(d) { return d.source.y; })
    .attr('x2', function(d) { return d.target.x; })
    .attr('y2', function(d) { return d.target.y; });

// Append a group for each node.
g.selectAll('g.node')
    .data(root.descendants())
    .enter()
    .append('g')
    .classed('node', true)
    .attr('transform',
          function(d) { return 'translate(' + d.x + ',' + d.y + ')' });

// Append a rect for each node, serving as the background filling.
g.selectAll('g.node').each(function(parentDatum, i) {
  d3.select(this)
      .append('rect')
      .attr("fill", "white")
      .attr("stroke", "#CCCCCC")
      .attr("stroke-width", "1px")
      .attr("rx", "1px")
      .attr('width', parentDatum.data.name.length * 12)
      .attr('height', "30")
      .attr('transform', function() {
        return `translate(-${this.getAttribute('width') / 2}` +
               `, -${this.getAttribute('height') / 2})`;
      });
});

// Append a text for each node, with the data name.
g.selectAll('g.node').each(function(parentDatum, i) {
  d3.select(this)
      .append('text')
      .attr('text-anchor', "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#000022")
      .attr("font-family", "monospace")
      .text(parentDatum.data.name);
});
