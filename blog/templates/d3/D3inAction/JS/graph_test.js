/**
 * Created by jgazda on 16-Aug-16.
 * load json
 * play with json
 * zoom
 * force
 * drag
 */

String.format = function() {
    // The string containing the format items (e.g. "{0}")
    // will and always has to be the first argument.
    var theString = arguments[0];

    // start with the second argument (i = 1)
    for (var i = 1; i < arguments.length; i++) {
        // "gm" = RegEx options for Global search (more than one instance)
        // and for Multiline search
        var regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
        theString = theString.replace(regEx, arguments[i]);
    }

    return theString;
};

d3.json("../JSON/graph.json", function (error, graph){
    if(graph) main(graph);
});

var width = window.innerWidth;
var height = window.innerHeight;
// var radius = 50;
var min_zoom = 0.1;
var max_zoom = 12;
var zoom = d3.zoom().scaleExtent([min_zoom,max_zoom]);
var base_font_size = 16;

var svg_tag = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("border","thin solid blue");


var zoom_box = svg_tag.append("g").attr("id", "zoom_box");
var nodesGroup = zoom_box.append("g").attr("id", "nodesGroup");
var nodesAll = nodesGroup.selectAll(".node");
var linksGroup = zoom_box.append("g").attr("id", "linksGroup");
var linksAll = linksGroup.selectAll(".link");

// zoom is applied on zoom_box
zoom.on("zoom", zooming);
svg_tag.call(zoom);

function zooming() {
    var transform = d3.event.transform;
    zoom_box.attr("transform", transform)
	}


// var simulation = d3.forceSimulation()
//     // .force("link", d3.forceLink().id(function(d) { return d.id; }))
//     .force("charge", d3.forceManyBody())
//     .force("center", d3.forceCenter(width / 2, height / 2));


function dragged(){
    //console.log("dragged");
    var e = d3.event;
    console.log("event",e);
    var ths = d3.select(this);
    console.log(ths.node());
    var res = String.format("{0} {1} {2} {3}", e.x, e.y, e.dx, e.dy);


    var translate = String.format("translate({0}, {1})", e.x, e.y);
    //groups.attr("transform", translate);
    ths.attr("transform", translate);
}

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    console.log("drag start",d3.event);
  d.fx = d.x;
  d.fy = d.y;
}


function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

// drag is applied on the nodes
var drag = d3.drag();
// drag.on("drag", dragged);
// }
//
// function dragended() {
//   if (!d3.event.active) simulation.alphaTarget(0);
//   d3.event.subject.fx = null;
//   d3.event.subject.fy = null;
// }

function drawLink(d) {
  context.moveTo(d.source.x, d.source.y);
  context.lineTo(d.target.x, d.target.y);
}

function drawNode(d) {
  context.moveTo(d.x + 3, d.y);
  context.arc(d.x, d.y, 3, 0, 2 * Math.PI);
}


function main(graph) {
    console.log("graph loaded");


    var node = //zoom_box.selectAll("g.nodes")
        nodesGroup.selectAll("g.nodes")
        .data(graph.nodes)
        .enter()
        .append("g").attr("class", function (d) {
            return "node " + d.label
        });
    //node.;
    node.append("circle")
        .attr("id", function (d) { return "" + d.name; })
        .attr("r", 50);

    node.append("text")
        .attr("class","wrap")
        .attr("dy",0)
        .attr("dominant-baseline", "central")
        .style("font-size", base_font_size)
        // .attr("class","txt")
        .text(function (d) { return "" + d.name; });
    // node.call(drag.on("drag", dragged));

// .attr("dy",0).attr("class","wrap")
//             .style("font-size", base_font_size).attr("id","txt")
//             .attr("dominant-baseline", "central");



    // render relationships as lines
    var link = linksGroup.selectAll("g.link")
        .data(graph.links).enter()
        .append("g").attr("class", "link");
    link.append("line").attr("class", "link");
    //
  // simulation
  //     .nodes(graph.nodes)
  //     .on("tick", ticked);

  // simulation.force("link")
      // .links(graph.links);

    var nodesAll = nodesGroup.selectAll(".node");
    nodesAll.call(drag.on("drag", dragged));

    var simulation = d3.forceSimulation(nodesAll)
    .force("charge", d3.forceManyBody())
    // .force("link", d3.forceLink(links).distance(20).strength(1))
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .on("tick", ticked);

    function dragsubject() {
  return simulation.find(d3.event.x - width / 2, d3.event.y - height / 2);
    }

    // nodesAll.call(simulation.on("tick", ticked));

    function ticked() {

    // link.select("line")
        // .attr("x1", function (d) {
        //     // console.log("x1",d);
        //     return d.source.x; })
        // .attr("y1", function (d) { return d.source.y; })
        // .attr("x2", function (d) { return d.target.x; })
        // .attr("y2", function (d) { return d.target.y; });

      // link.select("line")
      //   .attr("x1", function(d) { return d.source.x; })
      //   .attr("y1", function(d) { return d.source.y; })
      //   .attr("x2", function(d) { return d.target.x; })
      //   .attr("y2", function(d) { return d.target.y; });

      // node
      //   .attr("cx", function(d) { return d.x; })
      //   .attr("cy", function(d) { return d.y; });

                // node.attr("x", function(d) { return d.x; })
        //           .attr("y", function(d) { return d.y; });

      node.attr("transform", function (d) {
          // if(d.name === "Neo4j"){
          //     console.log(d);
          // }

            return "translate(" + d.x + "," + d.y + ")";
        });
            // .attr("dy", function (d) {
            //     return d.y
            // });
    }


}


