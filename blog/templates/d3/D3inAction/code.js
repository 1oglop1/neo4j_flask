/**
 * Created by oglop on 6/27/16.
 */

d3.json("graph.json", function(error, graph){
    if (error) return console.warn(error);
    draw(graph);
});

// d3.json("tweets.json",function(error, data) {console.log(error, data)});
function draw(graph){
    console.log(graph);
    console.log(graph.links);

    // setup svg div
    var svg_tag = d3.select("#graph").append("svg")
          .attr("width", "800px").attr("height", "600px")
          //.attr("width", "100%").attr("height", "100%")
          .attr("pointer-events", "all");

    var initialScale = 0.8;

    var zoom = d3.behavior.zoom()
        .scaleExtent([0.5, 1.5])
        .scale(initialScale)
        .on("zoom", zoomed);




    //Set real width and height
    width = parseInt(svg_tag.style("width"));
    height = parseInt(svg_tag.style("height"));
    console.log("wh",width, height);

    // force layout setup
    var force = d3.layout.force()
          .charge(-200).linkDistance(30).size([width, height]);

    force.nodes(graph.nodes).links(graph.links).start();

    

    ////////////////
    // d3.select("body").selectAll("div")
    //     .data(graph.nodes)
    //     .enter()
    //     .append("div")
    //     .attr("class", function(d) {return d.label})
    //     .html((function(d ) {return d.name;}));
    /////////////////////
    svg = svg_tag.append("g")
        .attr("transform", "translate(" + [width / 5, 50] + ")")
        .attr("id","outer_box")
        //.call(zoom);

    var rect = svg.append("rect")
                .attr("width", width)
                .attr("height", height)
                .style("fill", "yellow")
                .style("pointer-events", "all");

    var container = svg.append("g").attr("id","container");

    // render relationships as lines
    var link = container.selectAll("g.link")
          .data(graph.links).enter()
          .append("g").attr("class", "link")

          .call(force.drag);
    link.append("line").attr("class", "link");
    //nodes
    var node = container.selectAll("g.node")
        .data(graph.nodes)
        .enter()
        .append("g").attr("class", function (d) { return "node "+d.label })
        .call(force.drag);

    //node.;
    node.append("circle").attr("id", function (d) { return ""+d.name }).attr("r", 10);
    node.append("text")
         .attr("dx", 0)
         .attr("dy", 0)
        .append("tspan")
        .text(function (d){return ""+d.name});


    // --------------------
    // HELP FUNCTIONS
    // --------------------
    function zoomed() {
        container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    // force feed algo ticks for coordinate computation
    force.on("tick", function() {
          link.select("line").attr("x1", function(d) { return d.source.x; })
                  .attr("y1", function(d) { return d.source.y; })
                  .attr("x2", function(d) { return d.target.x; })
                  .attr("y2", function(d) { return d.target.y; });

        // node.attr("x", function(d) { return d.x; })
        //           .attr("y", function(d) { return d.y; });

        node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

          
      });
}
