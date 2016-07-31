/**
 * Created by oglop on 7/8/16.
 */
//center = 0,0
// line: y = kx + q
// r
// y = h/2, x = w/2 => w = 2x
// max height = r .. if next rect00 > r, or

var ctw = {};

ctw.textwrap = function () {

    var _resize = false;            // Should the text be resized in the container?
    var _wrap = false;              // Should the text be wrapped in the container?
    var _gElement;                  // Represents the text element that will have text wrapped in

    var _x;                         // The offset x-position
    var _y;                         // The offset y-position
    var _maxWidth;                     // The maximum width that should be afforded for text rendering
    var _maxHeight;                    // The maximum height that should be afforded for text rendering


    var _minCharsWidth = 3;
    var _fullTextWidth = NaN;
    var _maxLines = NaN;
    var _maxLineWidth = NaN;

    var _charHeight = NaN;


    /// Parse some basic sizing properties from the elements that we are dealing with
    /// @params {Object} vars - An object that contains all the settings that we've determined so far
    function parseContainerAttributes(vars) {
        var r, x, y, width, height;
        // console.log("parsing vars",vars.container);

        // container attributes
        if (vars.shape === "rect") {

            x = parseFloat(vars.container.attr("x")) || 0;
            y = parseFloat(vars.container.attr("y")) || 0;
            width = parseFloat(vars.container.attr("width") || vars.container.style("width"));
            height = parseFloat(vars.container.attr("height") || vars.container.style("height"));


        } else if (vars.shape === "circle") {
            x = parseFloat(vars.container.attr("cx")) || 0;
            y = parseFloat(vars.container.attr("cy")) || 0;
            r = parseFloat(vars.container.attr("r")) || 0;
            var d = r*2;
            width = d;
            height = d;
            vars.container.r = r;
            vars.container.d = d;

        }

        vars.container.x = _x || x;
        vars.container.y = _y || y;
        vars.container.maxHeight = _maxHeight || height;
        vars.container.maxWidth = _maxWidth || width;



    }

    function catText(text1,text2){
        var text;
        var t1LastChar= text1.charAt(text1.length-1);

        var connector = " ";
        if(t1LastChar === "" || t1LastChar === "-"){
            connector = "";
        }

        text = text1 + connector + text2;

        return text;

    }

    // computes width of word in svg text tag
    function getWordWidth(word, textLength, elementTextWidth){

        var wordWidth = (word.length * elementTextWidth) / textLength;
        return wordWidth
    }

    function processText(vars){
            // text attributes
        vars.fontSize = parseFloat(vars.textElement.attr("font-size") || vars.textElement.style("font-size"));

        vars.textElement.attr("dy",0);
        // vars.textAnchor =
        vars.textAnchor = vars.textElement.attr("text-anchor") || vars.textElement.style("text-anchor");
        vars.textBBox = vars.textElement.node().getBBox();
        vars.textY = vars.textBBox.y;
        vars.textElement.node().getBBox();
        vars.textWidth = vars.textBBox.width;

        vars.textHeight =vars.textBBox.height;
        vars.lineStep = (vars.fontSize * 1.1) / 2;

        // Split the text into words
        var wordBreak = /[^\s\-\/\;\:\&]+\-?\/?\;?\:?\&?/g;
        vars.text = vars.textElement.text();
        vars.words = vars.text.match(wordBreak);

        //console.log('firstWord',vars.words);
        vars.textMinWidth = getWordWidth(vars.words[0], vars.text.length, vars.textWidth);



        var ty = vars.textY;
        var line = 1;
        var r = vars.container.r;
        var wHalf;
        var dy = parseFloat(vars.textElement.attr("dy"));

        wHalf = Math.sqrt(Math.pow(r,2) - Math.pow(ty,2));
        var lineWidth = 2 * wHalf;
        // console.log(String.format(" line {1}, r{0}, ty {2}, wHalf {3}",r, line, ty, wHalf));
        // console.log(String.format(" sqrt({0}^2 - {1}^2) = {2}",r, ty, wHalf));
        var oddWidth = 2 * wHalf;
        var evenWidth = 0;

        // lineDict = { lineNumber: [lineWidth, totalLineWidth] }
        var lines = {};
        lines[line]= {"width":lineWidth, "dy":dy};
        // debug rectangle for line 1
        // vars.gElement.append("rect").attr("width",lineWidth).attr("height",vars.textHeight)
        //          .attr("fill","none").attr("stroke","blue").attr("id",line)
        //          .attr("transform",String.format("translate({0},{1})",-wHalf,ty));


        function computeNextLine(currentLine){
            line = currentLine +1;


            dy -= vars.lineStep; // compute 1 line up
            vars.textElement.attr("dy",dy); // move text 1 line up
            ty = parseFloat(vars.textElement.node().getBBox().y); // get top conrner position of next line


            wHalf = Math.sqrt(Math.pow(r,2) - Math.pow(ty,2)); // compute half width
            // console.log(String.format(" line {1}, r{0}, ty {2}, wHalf {3}",r, line, ty, wHalf));
            // console.log(String.format(" sqrt({0}^2 - {1}^2) = {2}",r, ty, wHalf));
            var lineWidth = 2*wHalf; // compute full width
            var totalLineWidth = 2 * lineWidth;

            lines[line] = {"width":lineWidth, "dy":dy};
            lines[-line] = {"width":lineWidth, "dy":-dy};
            // console.log(line,"width",lineWidth, "totalWidth",totalLineWidth, "posdy",Math.abs(dy), "negdy",dy);
            line%2==0 ? evenWidth += totalLineWidth||0 : oddWidth += totalLineWidth||0;

            // debug rectangles
            // vars.gElement.append("rect").attr("width",lineWidth).attr("height",vars.textHeight)
            //             .attr("fill","none").attr("stroke","blue").attr("id",line)
            //             .attr("transform",String.format("translate({0},{1})",-wHalf,ty));
            // vars.gElement.append("rect").attr("width",lineWidth).attr("height",vars.textHeight)
            //             .attr("fill","none").attr("stroke","red").attr("id",line)
            //             .attr("transform",String.format("translate({0},{1})",-wHalf,-ty-vars.textHeight));
        }

        // compute lines
        while ( Math.max(evenWidth,oddWidth) <= vars.textWidth && Math.abs(ty) < vars.container.r *0.8 && line < 8){
            computeNextLine(line);
            //console.log("while",line, lines[line].width,lines[line].negdy);
        }

        // remove previous text element
        vars.textElement.remove()
        //
        // find starting line and fit at least 1 word
        while(lines[line].width < vars.textMinWidth){
            //console.log("not long enough",line,lines[line].width, vars.textMinWidth)
            line--;
        }

        // verify if the word can fit to the text
        function canWordFit(word, lineWidth, lineTextWidth){
            var wordWidth = getWordWidth(word, vars.text.length, vars.textWidth);
            return (wordWidth + lineTextWidth) < lineWidth
        }

        // add ... at the end of word and adjust it
        function addEllipsis(word, spaceLeft, lineText){
            var tmpWord = word;
            var ellipsis = "\u2026"
            var wordWidth = getWordWidth(word, vars.text.length, vars.textWidth);
            var ellipsisW  = getWordWidth(ellipsis, vars.text.length, vars.textWidth);
            var cnt = word.length;

            while(((ellipsisW + wordWidth) > spaceLeft) && cnt){
                tmpWord = tmpWord.slice(0,cnt--);
                wordWidth = getWordWidth(tmpWord, vars.text.length, vars.textWidth);
            }
            return tmpWord+ellipsis;
        }

        // add new text element to group, TE contains part of line text
        function addTextElement(text, dy){
            vars.gElement.append("text").attr("dy",dy).text(text)
                .attr("text-anchor","middle").attr("dominant-baseline","central");
        }

        console.log("how many lines", line);
        console.log("lines", lines);
        var lastLine = -line;
        // lines to be used
        function isOdd(num) {return (Math.abs(num) % 2) == 1;}
        var odd_last_line = isOdd(line);
        console.log("odd_last_line", odd_last_line);
        var l2use = [];
        //console.log("----------------------------------------------------");
        for(var d_line in lines){
            var dl = parseInt(d_line);
            var lineOdd = isOdd(dl);
            //console.log(dl, isOdd(dl), lineOdd, odd_last_line,"==");
            if(lineOdd===odd_last_line){
                l2use.unshift(dl);
            }

        }
        //console.log("----------------------------------------------------");
        //console.log("l2u",l2use,);

        function compareNumbers(a, b) {
            return b - a;
        }
        var sorted = l2use.sort(compareNumbers);
        console.log(sorted);
        for(var fuckOffIndex in sorted){
            var drw_line = sorted[fuckOffIndex];
            console.log("drw", drw_line);
            var lineText = "";

            var cnt = 10;
            var currentLineWidth = lines[drw_line].width;
            var lineTextWidth = 0;



            while (cnt) {
                cnt--;
                var currentWord = vars.words.shift();
                // console.log("line", line, lines[line], currentWord, getWordWidth(currentWord, vars.text.length, vars.textWidth));
                if (canWordFit(currentWord, currentLineWidth, lineTextWidth)) {
                    lineText = catText(lineText, currentWord);
                    lineTextWidth = getWordWidth(lineText, vars.text.length, vars.textWidth);
                    // console.log(line, "fit", lineText, currentLineWidth, lineTextWidth);
                }
                else {
                    // last word at last line
                    if (drw_line === lastLine) {
                        var spaceLeft = currentLineWidth - lineTextWidth ;
                        // word + ellipsis
                        var we = addEllipsis(currentWord, spaceLeft, lineText);
                        // console.log(1,"we",we);
                        lineText = catText(lineText, we);
                        break;
                    }// end if
                    else {
                        vars.words.unshift(currentWord);
                        break;
                    }// end else

                }// end else
            }//end while

            console.log(drw_line,"text",lineText);
            addTextElement(lineText, lines[drw_line].dy);
        }
        console.log("line", line);



        
        // create text tags 



    }
    

    this.draw = function () {

        // If we have no container just return
        if (!_gElement) return this;
            // console.log("te",_gElement);
        // Go through each of the selected items within the container
        _gElement.each(function (d) {
            // Create an object for passing around variables
            var vars = {};
            vars.gElement = d3.select(this);
            if (vars.gElement.node().tagName.toLowerCase() != 'g') {
                console.warn("elements are not in group <g>");
                return this;
            }

            vars.textElement = vars.gElement.select("text");

            // Grab the container element and it's shape
            // console.log("vte",vars.textElement);

            // if element does not contain <text> element, return this ..whatever it is.
            if (vars.textElement.empty()) return this;
            var container = vars.textElement.node().previousElementSibling;

            vars.shape = container ? container.tagName.toLowerCase() :"";
            vars.container = d3.select(container);


            // Calculate some basic properties of the object we're dealing with
            parseContainerAttributes(vars);

            processText(vars);

            // Ensure the element has no text
            // vars.element.html("");

            // // Resize or scale as appropriate
            // if (_resize) {
            //     resize(vars);
            // } else {
            //     flow(vars);
            // }

            // Wrap the font if neccessary
            // if (vars.size[0] <= vars.innerHeight) {
            //
            // }
            //console.log("dims",_x, _y, _width, _height);

        });

        return this;
    };

    /// This required method tells d3plus which SVG text element to wrap text inside of. We
    /// support all of the D3 Selection Methods, including D3 elements.
    this.container = function (_) {

        if (!arguments.length) return _gElement;
        _gElement = _;
        return this;
    };

    // end of circleTextwrap function
    return this;
};



