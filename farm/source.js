/*
 * farm
 * source.js
 */

var width = 960,
    height = 540,
    size = 40,
    offset = {x: 325, y: 200},
    spacing = 75,
    QUORUM_LIMIT = 0.5;

// prepare

var nodes = [
    {x: 0, y: spacing / 2},
    {x: spacing, y: 0},
    {x: spacing, y: spacing},
    {x: spacing * 2, y: 0},
    {x: spacing * 2, y: spacing},
    {x: spacing * 3, y: spacing / 2},
    {x: spacing * 3, y: -spacing / 2},
    {x: spacing * 3, y: 3 * spacing / 2},
    {x: spacing * 4, y: spacing / 2},
    {x: spacing * 5, y: spacing / 2},
    {x: spacing * 5, y: -spacing / 2},
    {x: spacing * 5, y: 3 * spacing / 2},
    {x: spacing * 6, y: 0},
    {x: spacing * 6, y: spacing},
    {x: spacing * 7, y: spacing / 2},
];

nodes = nodes.map( function (node, i) {
    node.id = i;
    node.assigned = 0;
    node.completed = 0;
    node.quorum = {};
    node.connections = [];
    return node;
});

var connections = [];

function connect(a, b) {
    a.connections.push(b);
    b.connections.push(a);
    connections.push([a, b]);
}

connect(nodes[0], nodes[1]);
connect(nodes[0], nodes[2]); connect(nodes[1], nodes[2]);
connect(nodes[1], nodes[3]);
connect(nodes[2], nodes[4]); connect(nodes[3], nodes[4]);
connect(nodes[3], nodes[5]); connect(nodes[4], nodes[5]);
connect(nodes[3], nodes[6]);
connect(nodes[4], nodes[7]);
connect(nodes[5], nodes[8]);
connect(nodes[8], nodes[9]);
connect(nodes[9], nodes[10]);
connect(nodes[9], nodes[11]);
connect(nodes[9], nodes[12]); connect(nodes[10], nodes[12]);
connect(nodes[9], nodes[13]); connect(nodes[11], nodes[13]);
connect(nodes[12], nodes[14]); connect(nodes[13], nodes[14]);

// enter

var svg = d3.select("body > .container").insert("svg", "#description")
    .attr("width", width)
    .attr("height", height);

var line = d3.svg.line()
    .x( function (d) { return d.x })
    .y( function (d) { return d.y })
    .interpolate("step");

svg.selectAll(".connection")
    .data(connections)
    .enter()
    .append("path")
        .classed("connection", true)
        .attr("d", function (d) {
            var source = {x: d[0].x + offset.x, y: d[0].y + offset.y},
                target = {x: d[1].x + offset.x, y: d[1].y + offset.y};
            return line([source, target]);
        });

svg.selectAll(".node")
    .data(nodes)
    .enter()
    .append("g")
        .classed("node", true)
        .attr("id", function (d) { return "node-" + d.id })
        .attr("transform", function (d) {
            return "translate(" + (d.x + offset.x) + "," + (d.y + offset.y) + ")";
        });

svg.selectAll(".node")
    .append("rect")
        .classed("core", true)
        .attr("width", size)
        .attr("height", size)
        .attr("x", -size / 2)
        .attr("y", -size / 2)
        .attr("rx", size / 18)
        .attr("ry", size / 18);

svg.selectAll(".node")
    .append("rect")
        .classed("completed", true)
        .attr("width", size / 9)
        .attr("height", 0)
        .attr("x", size / 8)
        .attr("y", size / 2);
        
svg.selectAll(".node")
    .append("rect")
        .classed("assigned", true)
        .attr("width", size / 9)
        .attr("height", 0)
        .attr("x", -size / 4)
        .attr("y", size / 2);

// 400 units of work...

var unassigned = 300,
    assigned = 0,
    completed = 0;

svg.selectAll("#unassigned-work")
    .data([unassigned])
    .enter()
    .append("g")
        .attr("id", "unassigned-work")
        .attr("transform", function (d) { 
            return "translate(" + (offset.x - 225) + "," +
                (offset.y * 2 ) + ")";
        })
    .append("g")
        .attr("transform", function (d) { 
            return "scale(1,-1)";
        })
    .append("rect")
        .classed("unassigned", true)
        .attr("width", size / 9)
        .attr("height", function (d) { return d })

svg.select("#unassigned-work")
    .append("g")
        .attr("transform", "translate(0 40)rotate(-45 0 0)")
    .append("text")
        .classed("label", true)
        .text("Unassigned");
        
svg.selectAll("#assigned-work")
    .data([assigned])
    .enter()
    .append("g")
        .attr("id", "assigned-work")
        .attr("transform", function (d) { 
            return "translate(" + (offset.x - 175) + "," +
                (offset.y * 2 ) + ")";
        })
    .append("g")
        .attr("transform", function (d) { 
            return "scale(1,-1)";
        })
    .append("rect")
        .classed("assigned", true)
        .attr("width", size / 9)
        .attr("height", function (d) { return d })

svg.select("#assigned-work")
    .append("g")
        .attr("transform", "translate(0 40)rotate(-45 0 0)")
    .append("text")
        .classed("label", true)
        .text("Assigned");
        
svg.selectAll("#completed-work")
    .data([completed])
    .enter()
    .append("g")
        .attr("id", "completed-work")
        .attr("transform", function (d) { 
            return "translate(" + (offset.x - 125) + "," +
                (offset.y * 2 ) + ")";
        })
    .append("g")
        .attr("transform", function (d) { 
            return "scale(1,-1)";
        })
    .append("rect")
        .classed("completed", true)
        .attr("width", size / 9)
        .attr("height", function (d) { return d })

svg.select("#completed-work")
    .append("g")
        .attr("transform", "translate(0 40)rotate(-45 0 0)")
    .append("text")
        .classed("label", true)
        .text("Completed");

// Schedule assignment to the leftmost node
var assignment = setInterval(assign, 50);

// gossip

nodes.forEach( function (node) {
    setInterval(function () { gossip(node); }, Math.floor(Math.random() * (200 - 190)) + 190);
}); 

function gossip(node) {

    // Broadcast
    node.quorum[node.id] = {id: node.id, assigned: node.assigned, reference: node};

    // Discover
    node.connections.forEach( function (neighbor) {
        for (var k in neighbor.quorum) {
            var value = neighbor.quorum[k];
            if (value.id !== node.id) 
                node.quorum[value.id] = {id: value.id, assigned: value.assigned, reference: value.reference};
        }
    });

    // Distribution
    var quorumCount = Object.keys(node.quorum).length;
    if (quorumCount > nodes.length * QUORUM_LIMIT) {
        for (var k in node.quorum) {
            if (node.assigned > node.quorum[k].assigned) {
                if (node.assigned > 0) {
                    node.assigned -= 1;
                    node.quorum[k].reference.assigned += 1; 
                }
            }
        }
    }
}

// compute

nodes.forEach( function (node) {
    setInterval(function () { compute(node); }, 800);
}); 

function compute(node) {
    if (node.assigned > 0) {
        node.assigned -= 1;
        node.completed += 1;
        assigned -= 1;
        completed += 1;
        svg.select("#node-" + node.id + " rect.core")
            .style("stroke", "rgba(0, 255, 0, 1.0)")
            .transition()
            .duration(50)
            .style("stroke", "rgba(50, 50, 50, 1.0)")
    }
};

// update

var rendering = setInterval(render, 50);

function render() {
    var update = svg.selectAll(".node")
        .data(nodes);

    update.selectAll(".node .completed")
        .attr("y", function (d) { return size / 2 - d.completed * 1; })
        .attr("height", function (d) { return d.completed * 1; });
        
    update.selectAll(".node .assigned")
        .attr("y", function (d) { return size / 2 - d.assigned * 1; })
        .attr("height", function (d) { return d.assigned * 1; });

    svg.selectAll("#unassigned-work")
        .data([unassigned])
        .select("rect")
            .attr("height", function (d) { return d; })
            
    svg.selectAll("#assigned-work")
        .data([assigned])
        .select("rect")
            .attr("height", function (d) { return d; })
            
    svg.selectAll("#completed-work")
        .data([completed])
        .select("rect")
            .attr("height", function (d) { return d; })
};

function assign() {
    if (unassigned === 0) {
        clearInterval(assignment);
    }
    unassigned -= 1;
    assigned += 1;
    nodes[0].assigned += 1;
    svg.select("#node-0 rect.core")
        .style("stroke", "rgba(0, 125, 255, 1.0)");
};

