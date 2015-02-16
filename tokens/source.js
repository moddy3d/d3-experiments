/* 
 * tokens
 * source.js 
 */

var width = 960,
    height = 540,
    duration = 1000,
    size = {width: 50, height: 30}
    minSize = {width: 80, height: 30}
    spacing = {x: 80, y: 80},
    focus = [width/2, height/3];

// Zoom

var zoom = d3.behavior.zoom()
    .scaleExtent([0.5, 2])
    .translate(focus)
    .on("zoom", zooming);

// Context

var svg = d3.select("body > .container").insert("svg", "#description")
    .attr("width", width)
    .attr("height", height);

var topGroup = svg.append("g")
    .call(zoom);

var contact = topGroup.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .style("fill", "none")
    .style("pointer-events", "all");

var context = topGroup.append("g");

context.attr("transform", "translate(" + focus[0] + "," + focus[1] + ")scale(1,1)");

// Prepare Data

var source = "<strong>A **Search Engine** is -SofTwArE- USED to search INFORMATION...</strong>";
var transforms = [
    {
        title: "HTML Strip Character Filter",
        classes: "character-filter",
        transform: function (input) {
            return [input.replace(/(<[^>]+>)/g, '')];
        }
    },
    {
        title: "Symbol Strip Character Filter",
        classes: "character-filter",
        transform: function (input) {
            return [input.replace(/([^a-zA-Z0-9])/g, ' ')];
        }
    },
    {
        title: "Whitespace Tokenizer",
        classes: "tokenizer",
        transform: function (input) {
            return input.replace(/([\ ]+)/g, ' ').split(" ")
        }
    },
    {
        title: "Lowercase Token Filter",
        classes: "token-filter",
        transform: function (input) {
            return [input.toLowerCase()]
        }
    },
];

var tree = d3.layout.tree()
    .nodeSize([spacing.x, spacing.y]);

var diagonal = d3.svg.diagonal();

var data = d3.map();
var root = {};
var nodes = tree(root);

var node = context.selectAll(".node");
var link = context.selectAll(".link");

function randomString() {
    return " " + Math.floor(Math.random() * 10000000);
}

root.title = source;
root.type = 'data';
root.key = randomString();
root.parent = root;
root.px = root.x;
root.py = root.y;

recurseTransforms(root, 0);

function recurseTransforms(token, depth) {
    var sourceTransform = transforms[depth];

    if (sourceTransform === undefined)
        return;
    
    var transform = {
        title: sourceTransform.title,
        transform: sourceTransform.transform,
        classes: sourceTransform.classes,
        key: randomString()
    };
    token.children = [transform];
    nodes.push(transform);
    updateTree();
    
    setTimeout( function () {
        var outTokens = transform.transform(token.title).map(function (title) {
            return {
                title: title,
                type: 'data',
                key: randomString()
            }
        });

        transform.children = [];

        outTokens.forEach(function (outToken) {
            if (outToken.title === '')
                return
            transform.children.push(outToken);
            nodes.push(outToken);
            updateTree(); 
            setTimeout( function () {
                recurseTransforms(outToken, depth + 1)
            }, duration);
        });
    }, duration);
};

function updateTree() {
    node = node.data(tree.nodes(root), function (d) { return d.key });
    link = link.data(tree.links(nodes), function (d) { return d.source.key + "-" + d.target.key });

    var group = node.enter().append("g")
        .attr("class", function (d) { return "node " + d.classes })
        .attr("transform", function(d) {
            return "translate(" + d.parent.px + "," + d.parent.py + ")scale(1)";
        });

    group.append("rect")
        .attr("width", function (d) {
            var width = d.title.length * 6.5;
            if (width < minSize.width)
                width = minSize.width
            return width
        })
        .attr("height", size.height)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("x", function (d) {
            var width = d.title.length * 6.5;
            if (width < minSize.width)
                width = minSize.width
            return -width / 2;
        });

    group.append("text")
        .attr("text-anchor", "middle")
        .text(function (d) { return d.title })
        .attr("y", function (d) { 
            return (size.height / 2) + 3;
        });

    link.enter().insert("path", ".node")
        .attr("class", "link")
        .attr("d", function(d) {
            var o = {x: d.source.px, y: d.source.py + size.height};
            return diagonal({source: o, target: o});
        });

    var transition = context.transition()
        .duration(duration);

    transition.selectAll(".link")
        .attr("d", function(d) {
            var o = {x: d.source.px, y: d.source.py + size.height};
            return diagonal({source: o, target: d.target});
        });

    transition.selectAll(".node")
        .attr("transform", function(d) {
            d.px = d.x;
            d.py = d.y;
            return "translate(" + d.px + "," + d.py + ")scale(1)";
        });
};

// Callbacks

function zooming() {
    context.attr("transform", "translate(" + d3.event.translate + "),scale(" + d3.event.scale + ")");    
};
