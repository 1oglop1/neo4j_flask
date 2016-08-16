var gjson = '{"nodes":[' +
    '{"name":"Peter", "label":"Person", "id":1},' +
    '{ "name":"Michael", "label":"Person", "id":2},' +
    '{"name":"Neo4j","label":"Database","id":3},' +
    '{"name":"Super long text in this node is written", "label":"Database","id":4} ],' +

    '"links":[{"source":0, "target":1, "type":"KNOWS", "since":2010},' +
    '{"source":0, "target":2, "type":"FOUNDED"},' +
    '{"source":1, "target":2, "type":"WORKS_ON"}]}';


// d3.json("graph.json", function(error, graph){
//     if (error) return console.warn(error);
//     draw(graph);
// });
graph = JSON.parse(gjson);
draw(graph);

function draw(graph) {


    var w = window.innerWidth;
    var h = window.innerHeight;

    // setup zoom_box div
    var svg_tag = d3.select("#graph2").append("zoom_box")
        .attr("width", w).attr("height", h)
        //.attr("width", "100%").attr("height", "100%")
        .attr("pointer-events", "all");

    var initialScale = 1;

    var zoom = d3.behavior.zoom()
        .scaleExtent([0.5, 1.5])
        .scale(initialScale)
        .on("zoom", zoomed);


    //Set real width and height
    width = parseInt(w);
    height = parseInt(h);


    // force layout setup
    var force = d3.layout.force()
        .charge(-200).linkDistance(150).size([width, height]);

    force.nodes(graph.nodes).links(graph.links).start();


    ////////////////
    // d3.select("body").selectAll("div")
    //     .data(graph.nodes)
    //     .enter()
    //     .append("div")
    //     .attr("class", function(d) {return d.label})
    //     .html((function(d ) {return d.name;}));
    /////////////////////
    zoom_box = svg_tag.append("g")
        .attr("transform", "translate(" + [width / 5, 50] + ")")
        .attr("id", "outer_box");
    //.call(zoom);


    var rect = svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "yellow");
    //.style("pointer-events", "all");

    var container = svg.append("g").attr("id", "container");

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
        .append("g").attr("class", function (d) {
            return "node " + d.label
        })
        .call(force.drag);

    //node.;
    node.append("circle").attr("id", function (d) {
        return "" + d.name
    }).attr("r", 50);

    node.append("text")
        .style("text-anchor", "middle")
        .attr("class", "wrap")
        .text(function (d) {
            return "" + d.name
        })
    ;

    var text = node.select("text.wrap")[0];
    console.log("fv",text);
    for (var i = 0; i < text.length; i++) {
        d3plus.textwrap()
            .container(d3.select(text[i]))
            // .resize(true)
            .valign("middle")
            .draw();
    }

    // --------------------
    // HELP FUNCTIONS
    // --------------------
    function zoomed() {
        container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    // force feed algo ticks for coordinate computation
    force.on("tick", function () {
        link.select("line").attr("x1", function (d) {
            return d.source.x;
        })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });

        // node.attr("x", function(d) { return d.x; })
        //           .attr("y", function(d) { return d.y; });

        node.attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
            .attr("dy", function (d) {
                return d.y
            });
    });
}
