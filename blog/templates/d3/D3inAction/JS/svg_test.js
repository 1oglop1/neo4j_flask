/**
 * Created by oglop on 03/07/16.
 */
var gjson = '{"nodes":[' +
    '{"name":"Peter", "label":"Person", "id":1},' +
    '{ "name":"Michael", "label":"Person", "id":2},' +
    '{"name":"Neo4j","label":"Database","id":3},' +
    '{"name":"Super long text in this node is written", "label":"Database","id":4} ],' +

    '"links":[{"source":0, "target":1, "type":"KNOWS", "since":2010},' +
    '{"source":0, "target":2, "type":"FOUNDED"},' +
    '{"source":1, "target":2, "type":"WORKS_ON"}]}';

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

var really_long_text = "This is really-long text, full - of ninjas, trees: with fancy words and unicorns and  it's lenght is";
really_long_text = "This is really text";
// really_long_text = "This is ab";
var long_text = "This is really text";
// console.log(really_long_text,really_long_text.length);

graph = JSON.parse(gjson);

var width = 1000;
var height = 1000;
var radius = 50;
var cx1 = 150, cy1=150;
var cx2=450, cy2=450;
var min_zoom = 0.1;
var max_zoom = 12;
var zoom = d3.zoom().scaleExtent([min_zoom,max_zoom]);
var base_font_size = 16;
var max_text_size = 24;


var svg_tag = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("border","thin solid blue");


var zoom_box = svg_tag.append("g").attr("id", "zoom_box");

var group_1 = zoom_box.append("g").attr("id", "group_1")
        // .attr("stroke","blue")
        // .attr("stroke-width",2)
        .attr("transform", String.format("translate({0}, {1})", cx1, cy1))
        .attr("class","node");
    ;

var group_2 = zoom_box.append("g").attr("id", "group_2")
    // .attr("stroke","blue")
    // .attr("stroke-width",2)
    .attr("transform", String.format("translate({0}, {1})", cx2, cy2))
    .attr("class","node")
    ;

var group_3 = zoom_box.append("g").attr("id", "group_3")
    // .attr("stroke","blue")
    // .attr("stroke-width",2)
    .attr("transform", String.format("translate({0}, {1})", 255, 255))
    .attr("class","node")
    ;



var circle_1 = group_1.append("circle").attr("r",radius).attr("id","circle1").attr("fill", "green");



var circle_2 = group_2.append("circle").attr("r",radius).attr("id","circle2").attr("fill", "yellow");

var txtg1 = group_1.append("text").attr("text-anchor","middle").text("Not very long text yellow fill")
            .attr("dy",0).attr("class","wrap map")
            .style("font-size", base_font_size).attr("id","txt")
            .attr("dominant-baseline", "central");

var txt = group_2.append("text").attr("text-anchor","middle").text(really_long_text)
            .attr("dy",0).attr("class","wrap")
            .style("font-size", base_font_size).attr("id","txt")
            .attr("dominant-baseline", "central");

var circle_3 = group_3.append("circle").attr("r",radius).attr("id","circle2").attr("fill", "red");

var txtg7 = group_3.append("text").attr("text-anchor","middle").text("Word1 Word2 WOrd3 Word4 Word5 Word6 Word7 Word8")
            .attr("dy",0).attr("class","wrap crap")
            .style("font-size", base_font_size).attr("id","txt7")
            .attr("dominant-baseline", "central");

tn = txt.node();
// tn2 = txt2.node();
// tn3 = txt3.node();

// <line x1="-50" x2="50" y1="-16" y2="-16" stroke="black" class="__web-inspector-hide-shortcut__"></line>

// var axh = group_2.append("line").attr("x1",-50).attr("x2",50).attr("y1",0).attr("y2",0).attr("stroke", "blue")
//     .attr("stroke-dasharray","0.5");

// var axv = group_2.append("line").attr("x1",0).attr("x2",0).attr("y1",-50).attr("y2",50).attr("stroke", "red")
//     .attr("stroke-dasharray","0.5");


console.log("svg js loaded");

var drag = d3.drag();

var groups = d3.selectAll(".node");
groups.call(drag.on("drag", dragged));
txt.call(drag.on("drag", dragged));

function dragged(){
    //console.log("dragged");
    var e = d3.event;

    var res = String.format("{0} {1} {2} {3}", e.x, e.y, e.dx, e.dy);

    var ths = d3.select(this);

    var translate = String.format("translate({0}, {1})", e.x, e.y);
    //groups.attr("transform", translate);
    ths.attr("transform", translate);

}

function zooming() {
    var transform = d3.event.transform;
    zoom_box.attr("transform", transform)
	}

zoom.on("zoom", zooming);
svg_tag.call(zoom);


// ctw.textwrap().container(group_2).draw();
ctw.textwrap().container(groups).draw();




// var text = node.select("text")[0];
// console.log("fv",text);
// for (var i = 0; i < text.length; i++) {
//     d3plus.textwrap()
//         .container(d3.select(text[i]))
//         // .resize(true)
//         .valign("middle")
//         .draw();
// }