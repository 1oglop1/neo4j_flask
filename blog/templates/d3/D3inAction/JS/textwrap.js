/**
 * Created by oglop on 7/8/16.
 */
// usage:
// 1) create svg group - containing the <text class="wrap"> and <circle> which text should be wrapped.
// 2) <circle>, must be in class "wrap", or no wrap is applied.
console.log("textwrap loaded");


function spacer(){
    console.log("-------------------------");
}

var ctw = {};

ctw.textwrap = function () {

    var _gElement;

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

        vars.container.x =  x;
        vars.container.y =  y;
        vars.container.maxHeight =  height;
        vars.container.maxWidth =  width;
    }

    // put two strings together
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

    // returns BBox
    function textBBDim(text, vars){
        var wordElement = _gElement.append("text").text(text);
        var wordBBox = wordElement.node().getBBox();
        wordElement.remove();
        return wordBBox
    }

    function parseTextAttributes(vars){
        vars.fontSize = null; // font size of base text
        vars.textAnchor = null; // anchor of base text
        vars.textBBox = null; // BBox of base text
        vars.textY = null; // BB y position of base text
        vars.wordsWidht = []; // array containing BB width of each word
        vars.textMinWidth = 3; //minimum text width



        vars.fontSize = parseFloat(vars.textBaseElement.attr("font-size") || vars.textBaseElement.style("font-size"));

        vars.textBaseElement.attr("dy",0);
        // vars.textAnchor =
        vars.textAnchor = vars.textBaseElement.attr("text-anchor") || vars.textBaseElement.style("text-anchor");
        vars.textBBox = vars.textBaseElement.node().getBBox();
        vars.textY = vars.textBBox.y;
        vars.textBaseElement.node().getBBox();
        vars.textInputWidth = vars.textBBox.width;

        vars.textHeight =vars.textBBox.height;
        vars.lineStep = (vars.fontSize * 1.1) / 2;

        // Split the text into words
        var wordBreak = /[^\s\-\/\;\:\&]+\-?\/?\;?\:?\&?/g;
        vars.text = vars.textBaseElement.text();
        vars.words = vars.text.match(wordBreak);

        for(var widx =0; widx < vars.words.length; widx++){
            vars.wordsWidht.unshift(textBBDim(vars.words[widx]).width);
        }
        vars.wordsWidht.reverse();
        //console.log('firstWord',vars.words);
        vars.textMinWidth = vars.wordsWidht[0];
    }


    function compareNumbers(a, b) {
            return b - a;
        }

    // add ... at the end of word and adjust it
    function addEllipsis(word, spaceLeft, lineText){
        return "#TO IMPLEMENT";
        //
        // var tmpWord = word;
        // var ellipsis = "\u2026";
        // var wordWidth = getWordWidth(word, vars.text.length, vars.textInputWidth);
        // var ellipsisW  = getWordWidth(ellipsis, vars.text.length, vars.textInputWidth);
        // var cnt = word.length;
        //
        // while(((ellipsisW + wordWidth) > spaceLeft) && cnt){
        //     tmpWord = tmpWord.slice(0,cnt--);
        //     wordWidth = getWordWidth(tmpWord, vars.text.length, vars.textInputWidth);
        // }
        // return tmpWord+ellipsis;
    }

    // verify if the word can fit to the text
    function canWordFit(wordWidth, remainingLineWidth){
        // console.log("canWordFit ", remainingLineWidth,wordWidth, remainingLineWidth - wordWidth);
        return remainingLineWidth - wordWidth > 0;
    }

    function processText(vars){

        parseTextAttributes(vars);

        var textYpos = vars.textY;
        var line = 1;
        var r = vars.container.r;
        var wHalf;
        var dy = parseFloat(vars.textBaseElement.attr("dy"));

        wHalf = Math.sqrt(Math.pow(r,2) - Math.pow(textYpos,2));
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
            vars.textBaseElement.attr("dy",dy); // move text 1 line up
            textYpos = parseFloat(vars.textBaseElement.node().getBBox().y); // get top corner position of next line

            wHalf = Math.sqrt(Math.pow(r,2) - Math.pow(textYpos,2)); // compute half width
            // console.log(String.format(" line {1}, r{0}, ty {2}, wHalf {3}",r, line, ty, wHalf));
            // console.log(String.format(" sqrt({0}^2 - {1}^2) = {2}",r, ty, wHalf));
            var lineWidth = 2*wHalf; // compute full width
            var totalLineWidth = 2 * lineWidth;

            lines[line] = {"width":lineWidth, "dy":dy};
            lines[-line] = {"width":lineWidth, "dy":-dy};
            // console.log(line,"width",lineWidth, "totalWidth",totalLineWidth, "posdy",Math.abs(dy), "negdy",dy);
            // calculate even and odd width (one at time)
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
        while ( Math.max(evenWidth,oddWidth) <= vars.textInputWidth && Math.abs(textYpos) < vars.container.r *0.8 && line < 8){
            computeNextLine(line);
            //console.log("while",line, lines[line].width,lines[line].negdy);
        }

        // remove base text element
        vars.textBaseElement.remove();
        //
        // find starting line and fit at least 1 word
        while(lines[line].width < vars.textMinWidth){
            //console.log("not long enough",line,lines[line].width, vars.textMinWidth)
            line--;
        }

        // add new text element to group, TE contains part of line text
        function addTextElement(text, dy){
            var baseClasses = vars.textBaseElement.classed("wrap", false).classed("wrapped", true).attr("class");

            console.log("classes", baseClasses);

            vars.gElement.append("text").attr("dy",dy).text(text)
                .attr("text-anchor","middle").attr("dominant-baseline","central")
                .classed(baseClasses,true);
        }

        // console.log("how many lines", line);
        // console.log("lines", lines);
        var lastLine = -line;
        // lines to be used
        function isOdd(num) {return (Math.abs(num) % 2) == 1;}
        var odd_last_line = isOdd(line);
        var l2use = [];
        //console.log("----------------------------------------------------");
        // compute which lines will be used
        for(var d_line in lines){
            var dl = parseInt(d_line);
            var lineOdd = isOdd(dl);
            //console.log(dl, isOdd(dl), lineOdd, odd_last_line,"==");
            if(lineOdd===odd_last_line){
                l2use.unshift(dl);
            }
        }
        //console.log("----------------------------------------------------");

        l2use = l2use.sort(compareNumbers);
        // console.log("--------------------------------");
        // console.log("used lines should be",l2use);
        // console.log(vars.words);
        for (var idx = 0; idx < l2use.length; idx++){
            var lineNumber = l2use[idx];
            var currentLine = lines[lineNumber];
            var currentWordWidth, currentWord, tmpWordWidth, tmpTextToInsert, nextWordFit;
            // console.log(lineNumber, currentLine.width);
            var remaining_space = currentLine.width;
            var cnt = 0;


            var textToInsert = "";
            // console.log("word withs", vars.wordsWidht);
            nextWordFit = true;
            // console.log("----start of while----");
            while (nextWordFit && remaining_space>0){
                // console.log("-----while round",cnt,"---line--",lineNumber); cnt++;
               // nextWord = vars.words.shift();
                currentWord = vars.words.shift();
                currentWordWidth = textBBDim(currentWord, vars).width;

                // spacer();
                tmpTextToInsert = catText(textToInsert, currentWord);
                tmpWordWidth = textBBDim(tmpTextToInsert, vars).width;

                // console.log("txt|",textToInsert,"|cww", tmpWordWidth, currentLine.width, lineNumber);
                // console.log("rem space", remaining_space);
                //tmpTextElement.remove();
                //currentWord = vars.words.shift();
                nextWordFit = canWordFit(tmpWordWidth, currentLine.width);
                if(!nextWordFit){
                    vars.words.unshift(currentWord);
                }
                else{
                    textToInsert = tmpTextToInsert;
                    remaining_space = remaining_space - tmpWordWidth;
                }
                // console.log("cur word", currentWord, currentWordWidth,"<ww, r>", remaining_space, textToInsert, "lineLen", currentLine.width);
            }

            addTextElement(textToInsert, lines[lineNumber].dy);
        }

    }

    this.draw = function () {

        // If we have no container just return
        if (!_gElement) return this;
            // console.log("te",_gElement);
        // Go through each of the selected items within the container
        _gElement.each(function (d) {
            // Create an object for passing around variables
            var vars = {};
            vars.gElement = null; // circle group element
            vars.textBaseElement = null; //base text element
            vars.shape = null; // shape name circle/rectangle
            vars.container = null; // not known for sure

            vars.gElement = d3.select(this);
            if (vars.gElement.node().tagName.toLowerCase() != 'g') {
                console.warn("elements are not in group <g>");
                return this;
            }
            vars.textBaseElement = vars.gElement.select("text.wrap");

            // Grab the container element and it's shape
            // console.log("vte",vars.textBaseElement);
            // if element does not contain <text> element, return this ..whatever it is.
            if (vars.textBaseElement.empty()) return this;
            var container = vars.textBaseElement.node().previousElementSibling;

            vars.shape = container ? container.tagName.toLowerCase() :"";
            vars.container = d3.select(container);
            // Calculate some basic properties of the object we're dealing with
            parseContainerAttributes(vars);
            processText(vars);
        });
        return this;
    };

    /// This required method tells d3plus which SVG text element to wrap text inside of.
    this.container = function (_) {

        if (!arguments.length) return _gElement;
        _gElement = _;
        return this;
    };

    // end of circleTextwrap function
    return this;
};
