var width = 960;
var height = 540;
var margin = {x: 30, y: 30};

var svg = d3.select("#content")
    .append("svg")
        .attr("width", width + margin.x * 2)
        .attr("height", height + margin.y * 2)
    .append("g")
        .attr("transform",
            "translate(" + margin.x + "," + margin.y + ")");

