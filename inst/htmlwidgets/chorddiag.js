HTMLWidgets.widget({

  name: 'chorddiag',
  type: 'output',

  initialize: function(el, width, height) {

    d3.select(el).append("svg")
                 .attr("width", width)
                 .attr("height", height);

    return d3.layout.chord();

  },

  resize: function(el, width, height, chord) {

    d3.select(el).select("svg")
                 .attr("width", width)
                 .attr("height", height);

    this.renderValue(el, chord.params, chord);

  },

  renderValue: function(el, params, chord) {

    // save params for reference from resize method
    chord.params = params;

    var matrix = params.matrix,
        options = params.options;

    // get width and height, calculate min for use in diagram size
    var width = el.offsetWidth,
        height = el.offsetHeight,
        d = Math.min(width, height);

    var type = options.type,
        margin = options.margin,
        showGroupnames = options.showGroupnames,
        groupNames = options.groupNames,
        groupColors = options.groupColors,
        groupThickness = options.groupThickness,
        groupPadding = options.groupPadding,
        groupnamePadding = options.groupnamePadding,
        groupnameFontsize = options.groupnameFontsize,
        groupedgeColor = options.groupedgeColor,
        chordedgeColor = options.chordedgeColor,
        categoryNames = options.categoryNames,
        categorynamePadding = options.categorynamePadding,
        categorynameFontsize = options.categorynameFontsize,
        showTicks = options.showTicks,
        tickInterval = options.tickInterval,
        ticklabelFontsize = options.ticklabelFontsize,
        fadeLevel = options.fadeLevel,
        showTooltips = options.showTooltips,
        showZeroTooltips = options.showZeroTooltips,
        tooltipNames = options.tooltipNames,
        tooltipFontsize = options.tooltipFontsize,
        tooltipUnit = options.tooltipUnit,
        tooltipGroupConnector = options.tooltipGroupConnector,
        precision = options.precision,
        clickAction = options.clickAction,
        clickGroupAction = options.clickGroupAction,
        reactor = options.reactor,
        grouptotals = options.grouptotals,
        firstfunindex = options.firstfunindex;

    d3.select(el).selectAll("div.d3-tip").remove();
    // $('div[class|="d3-tip"]').remove();
    const elements = document.getElementsByClassName("d3-tip");
    while (elements.length > 0) elements[0].remove();

    if (showTooltips) {
        var chordTip = d3.tip()
                         .attr('class', 'd3-tip')
                         .style("font-size", tooltipFontsize + "px")
                         .style("font-family", "sans-serif")
                         .direction('mt')
                         .offset([10, 10])
                         .html(function(d) {
                             // indexes
                             var i = d.source.index,
                                 j = d.target.index;
                             // values
                             var vij = sigFigs(matrix[i][j], precision),
                                 vji = sigFigs(matrix[j][i], precision);
                             var dir1 = tooltipNames[i] + tooltipGroupConnector + tooltipNames[j] + ": " + vij + tooltipUnit,
                                 dir2 = tooltipNames[j] + tooltipGroupConnector + tooltipNames[i] + ": " + vji + tooltipUnit;
                             if (type == "directional") {
                                 if (i == j) {
                                     return dir1;
                                 } else {
                                     if (showZeroTooltips) {
                                         return dir1 + "</br>" + dir2;
                                     } else {
                                         return dir1 + (vji > 0 ? "</br>" + dir2 : "");
                                     }
                                 }
                             } else if (type == "bipartite") {
                                 return dir2;
                             }
                         });

         var Matrixsum = matrix.map(function(y){
                             return y.reduce(function(a,b){
                                 return a+b;
                             });
                         });

         var Matrixtotal = (d3.sum(Matrixsum) / 2 );

         function checkforNaN(val){
            if(isNaN(val)){return 0}
            else {
              return val
            }
          }

        var groupTip = d3.tip()
                         .attr('class', 'd3-tip')
                         .style("font-size", 20 + "px")
                         .style("font-family", "sans-serif")
                         .direction('mt')
                         .offset([10, 10])
                         .html(function(d) {
                             var value = sigFigs(d.value, precision);
                             return tooltipNames[d.index] + " (total): " + value + tooltipUnit +" ("+sigFigs(value*100/Matrixtotal,2)+"%)";
                         });




         function newchordtip(d) {
             // indexes
             var i = d.source.index,
                 j = d.target.index;
             // values
             var vij = sigFigs(matrix[i][j], precision),
                 vji = sigFigs(matrix[j][i], precision);
             var dir1 = tooltipNames[i] + " \u25B6 " + tooltipNames[j] + ": " + vij + tooltipUnit,
                 dir2 = tooltipNames[i] + " \u25B6 " + tooltipNames[j] + ": " +  vij   + tooltipUnit;//sigFigs((vji /d3.sum(getCol(matrix,i)))*100,2) +  vij   + tooltipUnit;
             if (type == "directional") {
                 if (i == j) {
                     return dir1;
                 } else {
                     if (showZeroTooltips) {
                         return dir1 + "</br>" + dir2;
                     } else {
                         return dir1 + (vji > 0 ? "</br>" + dir2 : "");
                     }
                 }
             } else if (type == "bipartite") {
                 return dir2;
             }
         }


    }



    var svgContainer = d3.select(el).select("svg");
    svgContainer.selectAll("*").remove();

    // apply chord settings and data
    chord.padding(groupPadding)
         .sortSubgroups(d3.descending)
         .matrix(matrix);

    // calculate outer and inner radius for chord diagram
    var outerRadius = (d - 2 * margin) / 2,
        innerRadius = outerRadius * (1 - groupThickness);

    // create ordinal color fill scale from groupColors
    var fillScale = d3.scale.ordinal()
                            .domain(d3.range(matrix.length))
                            .range(groupColors);

    // calculate horizontal and vertical translation values
    var xTranslate = Math.max(width / 2, outerRadius + margin),
        yTranslate = Math.max(height / 2, outerRadius + margin);

    var svg = svgContainer.append("g");
    svg.attr("transform", "translate(" + xTranslate + "," + yTranslate + ")");


    // create groups
    var groups = svg.append("g").attr("class", "groups")
                    .selectAll("path")
                    .data(chord.groups)
                    .enter().append("path").attr("id", function(d, i) {
                           return "group-" + groupNames[i];
                    });


    d3.select("#tipDiv").remove()
    var div = d3.tip()
                     .attr('class', 'd3-tip')
                     .style("font-size", 20 + "px")
                     .style("font-family", "sans-serif")
                     .direction('mt')
                     .offset([10, 10])
                     .html(function(d){
                       return("<p1>" + newchordtip(d) + "</p1> <div id='tipDiv'></div>")});
                         // .style("left", (d3.event.pageX - 34) + "px")
                         // .style("top", (d3.event.pageY - 12) + "px");




     if (showTooltips) {
        svg.call(chordTip)
           .call(groupTip)
           .call(div);
     }


    // style groups and define mouse events
    groups.style("fill", function(d) { return fillScale(d.index); })
          .style("stroke", function(d) { return fillScale(d.index); })
          //.attr("d", d3.svg.arc().innerRadius(innerRadius+50).outerRadius(outerRadius+200))
          .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
          .on("mouseover",   function(d) {
              if (showTooltips)
                groupTip.show(d)
                return groupFade(d, fadeLevel);

          })
          .on("mouseout",
           function(d) {
              if (showTooltips)
                groupTip.hide(d)
                return groupFade(d, 1);
          })
          .on("click", clickGroup);

    if (groupedgeColor) {
        groups.style("stroke", groupedgeColor);
    } else {
        groups.style("stroke", function(d) { return fillScale(d.index); });
    }




    if (showTicks) {
        // create ticks for groups
        var ticks = svg.append("g").attr("class", "ticks")
                       .selectAll("g")
                       .data(chord.groups)
                       .enter().append("g") //.attr("class", "ticks")
                       .attr("id", function(d, i) {
                           return "ticks-" + groupNames[i];
                       })
                       .selectAll("g")
                       .data(groupTicks)
                       .enter().append("g").attr("class", "tick")
                       .attr("transform", function(d) {
                           return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                               + "translate(" + outerRadius + ", 0)";
                       });

        // add tick marks
        ticks.append("line")
             .attr("x1", 1)
             .attr("y1", 0)
             .attr("x2", 5)
             .attr("y2", 0)
             .style("stroke", "#000");

var maxTickLabelWidth = 0

        // add tick labels
        ticks.append("text")
             .attr("x", 0)
             .attr("dy", ".35em")
             .style("font-size", ticklabelFontsize + "px")
             .style("font-family", "sans-serif")
             .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180)translate(-8)" : "translate(8)"; })
             .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : "start"; })
             .text(function(d) {return d.label; })
             .attr("placeholder",function(d){
               if (this.getComputedTextLength() > maxTickLabelWidth) {
                 maxTickLabelWidth = this.getComputedTextLength()
               }
               });

////////////////////////////////////////////////////////////////////////////////////#/
///////////////////////////////////////////////////////////////////////////////////

// TICKS 2.0

var ticks2 = svg.append("g").attr("class", "ticks")
               .selectAll("g")
               .data(chord.groups)
               .enter().append("g") //.attr("class", "ticks")
               .attr("id", function(d, i) {
                   return "ticks-" + groupNames[i];
               })
               .selectAll("g")
               .data(groupTicks2)
               .enter().append("g").attr("class", "tick")
               .attr("transform", function(d) {
                   return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                       + "translate(" + (outerRadius + 14 +maxTickLabelWidth) + ", 0)";
               });

// add tick marks
ticks2.append("line")
     .attr("x1", 1)
     .attr("y1", 0)
     .attr("x2", 5)
     .attr("y2", 0)
     .style("stroke", "#000");

// add tick labels
ticks2.append("text")
     .attr("x", 0)
     .attr("dy", ".35em")
     .style("font-size", 10 + "px")
     .style("font-family", "sans-serif")
     .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180)translate(-8)" : "translate(8)"; })
     .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : "start"; })
     .text(function(d) { return d.label+"%"; });

/////////////////////////////////////////////////////////////////////
    }

    // create chords
    var chords = svg.append("g").attr("class", "chords")
                    .selectAll("path")
                    .data(chord.chords)
                    .enter().append("path").attr("id", function(d, i) {
                        return "chord-" + groupNames[d.source.index]
                               + "-" + groupNames[d.target.index];
                    })
                    .attr("d", d3.svg.chord().radius(innerRadius));


// If grouptotals is defined create variables for names of datasets and first index thats a function
if(grouptotals != null){
  var Datasetnames = Object.getOwnPropertyNames(grouptotals);
  var FirstFunIndex = matrix[0].length - grouptotals.N.length;

}


var short_names = {
 "Translation, ribosomal structure and biogenesis" : "Translation",
 "RNA processing and modification" : "RNA processing",
 "Transcription" : "Transcription",
 "Replication, recombination and repair" : "Replication",
 "Chromatin structure and dynamics" : "Chromatin",
 "Cell cycle control, cell division, chromosome partitioning" : "Cell Cycle",
 "Nuclear structure" :"Nuclear structure",
 "Defense mechanisms": "Defense",
 "Signal transduction mechanisms" : "Signal transduction",
 "Cell wall/membrane/envelope biogenesis" : "Cell wall",
 "Cell motility":"Cell motility",
 "Cytoskeleton":"Cytoskeleton",
"Extracellular structures" :"Extracellular",
 "Intracellular trafficking, secretion, and vesicular transport" : "Intracellular trafficking",
 "Posttranslational modification, protein turnover, chaperones": "Posttranslational modification",
 "Mobilome: prophages, transposons" : "Mobilome",
 "Energy production and conversion" : "Energy",
 "Carbohydrate transport and metabolism" : "Carbohydrate",
 "Amino acid transport and metabolism" : "Amino acid",
 "Nucleotide transport and metabolism": "Nucleotide",
 "Coenzyme transport and metabolism" : "Coenzyme",
"Lipid transport and metabolism" : "Lipid",
 "Inorganic ion transport and metabolism" : "Inorganic ion",
"Secondary metabolites biosynthesis, transport and catabolism" : "Secondary metabolism",
 "General function prediction only": "General function",
 "Function unknown": "Function unknown"}


function getPercentage(d){
  var percentages = [];

  for(var i=2; i<Datasetnames.length; i++){
          percentages.push(checkforNaN(grouptotals[Datasetnames[i]][d.target.index - FirstFunIndex]));
    }
  return percentages
};
  var color = d3.scale.category20();

    // style chords and define mouse events
    chords.style("fill", function(d) { return fillScale(d.target.index); })
          .style("stroke", chordedgeColor)
          .style("fill-opacity", 0.67)
          .style("stroke-width", "0.5px")
          .style("opacity", 1)
          .on("mouseover", function(d,i) {
              // if (showTooltips) chordTip.show(d);
              // if (showTooltips)
              var chordindex = i;

              var chordselected = d;
              div.show(d);


// If reactor defined, create bar chart displaying percentages from each dataset
if(reactor != null){

                var maxwidth = 0

                  var tipSVG = d3.select("#tipDiv")
                        .append("svg")
                        .attr("width", maxwidth)//d3.max([110 + sigFigs((d3.max(reactor[chordindex])/d3.max(getCol(grouptotals,chordselected.target.index - FirstFunIndex)))*100,2)*5]))//sigFigs(( reactor[i][0]/grouptotals[Datasetnames[1]][d.target.index - FirstFunIndex])*100,2)*5, 100 + sigFigs(( reactor[i][1]/grouptotals.Day1R2[d.target.index - FirstFunIndex])*100,2)*5]),300]))//d3.max(reactor[i]) * 5,300]))
                        .attr("height", 35 * (Datasetnames.length-1));



var dataset = getPercentage(d);
var barPadding = 5;
var barWidth = 20;//(svgWidth / dataset.length);

var maxTitleWidth = 0
var barCharttext = tipSVG.selectAll("text.title")
    .data(dataset)
    .enter()
    .append("text")
    .text(function(d,i){return Datasetnames[i+1]})
    .attr('fill', 'white')
    .attr("x", function(d) {
        return 10//110 - d
    })
    .attr("y", function(d,i){return 40 + i*15})//barWidth - barPadding)
    .attr("transform", function (d, i) {
          if(maxTitleWidth < this.getComputedTextLength()){
            maxTitleWidth = this.getComputedTextLength();
          }
         var translate = [0,barWidth * i];
         return "translate("+ translate +")";
    });


var barChart = tipSVG.selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("x", function(d) {
        return maxTitleWidth + 20//100//110 - d
    })
    // .attr("width",)
    .attr("height",30)
    .attr("y", function(d,i){return 20 + i*15})//barWidth - barPadding)
    .attr("fill",function(d,i){return color(i)})
    // .transition()
    // .duration(1000)
    .attr("width", function(d,i) {
        if(maxwidth < (sigFigs((checkforNaN(reactor[chordindex][i]/grouptotals[Datasetnames[i+1]][chordselected.target.index - FirstFunIndex]))*100,2)*2)){
          maxwidth = sigFigs((checkforNaN( reactor[chordindex][i]/grouptotals[Datasetnames[i+1]][chordselected.target.index - FirstFunIndex]))*100,2)*2
        }
        // console.log(reactor);
        // console.log(grouptotals);
        // console.log("starts here");
        // console.log(reactor[chordindex][i]);
        // console.log(grouptotals[Datasetnames[i+1]]);
        // console.log(chordselected.target.index - FirstFunIndex);
        // console.log(grouptotals[Datasetnames[i+1]][chordselected.target.index - FirstFunIndex]);
        // console.log(reactor[chordindex][i]/grouptotals[Datasetnames[i+1]][chordselected.target.index - FirstFunIndex]);

        return sigFigs(( checkforNaN(reactor[chordindex][i]/grouptotals[Datasetnames[i+1]][chordselected.target.index - FirstFunIndex]))*100,2)*2;//d;
    })
    .attr("transform", function (d, i) {
         var translate = [0,barWidth * i];
         return "translate("+ translate +")";
    });

    var barChartvalues = tipSVG.selectAll("text.values")
        .data(dataset)
        .enter()
        .append("text")
        .text(function(d,i){//console.log(sigFigs(( reactor[chordindex][i]/grouptotals[Datasetnames[i+1]][chordselected.target.index - FirstFunIndex])*100,2) + "%");
          return sigFigs((checkforNaN(reactor[chordindex][i]/grouptotals[Datasetnames[i+1]][chordselected.target.index - FirstFunIndex]))*100,2) + "%";})
        .attr('fill', 'white')
        .attr("x", function(d,i) {
            return maxTitleWidth + 30 + sigFigs((checkforNaN(reactor[chordindex][i]/grouptotals[Datasetnames[i+1]][chordselected.target.index - FirstFunIndex]))*100,2)*2;//110 - d
        })
        .attr("y", function(d,i){return 40 + i*15})//barWidth - barPadding)
        .attr("transform", function (d, i) {
             var translate = [0,barWidth * i];
             return "translate("+ translate +")";
        });



tipSVG.attr("width", maxwidth+ maxTitleWidth + 80);
};


              return chordFade(d, fadeLevel);
          })
          .on("mouseout", function(d) {
              if (showTooltips) div.hide(d);
              return chordFade(d, 1);
          })
          .on("click", click);


          //////////////////////////// Text Wrap //////////////////////////// now unused

                  var x = d3.scale.ordinal()
                      .rangeRoundBands([0, 100], .1, .3);

            function wrap(text, width) {
                                text.each(function() {

                                  var text = d3.select(this),
                                      words = text.text().split(/\s+/).reverse(),
                                      word,
                                      line = [],
                                      lineNumber = 0,
                                      lineHeight = 1.1, // ems
                                      y = text.attr("y"),
                                      dy = parseFloat(text.attr("dy")),
                                      tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
                                  while (word = words.pop()) {
                                    line.push(word);
                                    tspan.text(line.join(" "));
                                    if (tspan.node().getComputedTextLength() > width) {
                                      line.pop();
                                      tspan.text(line.join(" ")).attr("dy",function(d){return(dy-((1+lineNumber)*.6) +"em")});
                                      line = [word];
                                      tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", (++lineNumber * lineHeight) - 0.4*lineNumber + dy + "em").text(word)//.attr("transform", function(d) {
                                          // return "rotate(" + (++lineNumber * 200 * 180 / Math.PI - 90) + ")";})
                                    }
                                  }
                                });
                              }

          ///////////////////////////////////////////////////////////////////////////

          ////////////////////////truncate text /////////////////////////////
          text_truncate = function(str, length, ending) {
                                      if (length == null) {
                                        length = 100;
                                      }
                                      if (ending == null) {
                                        ending = '...';
                                      }
                                      if (str.length > length) {
                                        return str.substring(0, length - ending.length) + ending;
                                      } else {
                                        return str;
                                      }
                                    };
          ////////////////////////////////////////////////////////////////////
    // create group labels
    if (showGroupnames) {
        var names = svg.append("g").attr("class", "names")
                       .selectAll("g")
                       .data(chord.groups)
                       .enter().append("g").attr("class", "name")
                       .on("mouseover", function(d) {
                           return groupFade(d, fadeLevel);
                       })
                       .on("mouseout", function(d) {
                           return groupFade(d, 1);
                       })
                       .selectAll("g")
                       .data(groupLabels)
                       .enter().append("g").attr("id", function(d,i) {
                           return "label-" + d.label;
                       })
                       .attr("class","name")
                       .attr("transform", function(d) {
                           return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                                + "translate(" + (outerRadius + 60 + d.padding) + ", 0)";
                       });

        names.append("text")
            .attr("x", 0)
            .attr("dy", ".35em")
            .style("font-size", groupnameFontsize + "px")
            .style("font-family", "sans-serif")
            .attr("transform", function(d) {
                return d.handside == "left" ? "rotate(180)" : null;
            })
            .style("text-anchor", function(d) { return d.handside == "left" ? "end" : "start"; })
            .text(function(d,i) {
               // return text_truncate(d.label,30)
               // return d.label;
               if (short_names.hasOwnProperty(d.label)){
               return(short_names[d.label])}
               else {
                 return(d.label)
               }
             }) //+ d3.sum(getCol(matrix,groupNames.findIndex(x => x==d.label))) ; })
            .attr("id", function(d) { return d.label; });
            // .attr("transform", function(d) {
            //     return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
            //          + "translate(" + (outerRadius + 60 + d.padding) + ", 0)";
            // });


        // svg.selectAll(".name text")
              // .call(wrap,x.rangeBand());
      // console.log(wrap("this is a very long sentence that i want to see what happens to it",20));
    }

//////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
dta = chord.groups();




var arcs = svg.selectAll("g.arc5")
    // .data(pie(dataset))
    // .enter()
    .append("svg:g")
    .attr("class", "arc5");

sangles = [];
eangles= [];
        var i;
        for (i = 0; i <dta.length; i++) {
        sangles[i]=dta[i].startAngle;
        eangles[i]=dta[i].endAngle;}



    var pie = d3.layout.pie()
        // .sortValues(function(a, b) { return a - b; });
        .startAngle(function(d,i){
          return sangles[i]})
        .endAngle(function(d,i){
          return eangles[i]});

var arc4 = d3.svg.arc();



function getCol(matrix, col){
       var column = [];
       for(var i=0; i<matrix.length; i++){
          column.push(matrix[i][col]);
       }
       return column;
    };

var dict = [];


for (var i = 0; i <chord.groups().length; i++) {
dict[i]=getCol(matrix,i)};




          var gs = svg.selectAll("ga").data(dict).enter().append("svg:g").attr("class","donuts");

          gs.selectAll("path").data(function (d,i) {
            return pie(d,i); })
                  // .attr("startAngle", chord.groups()[5].startAngle)
                  .enter().append("path")
                  .attr("fill", function (d, i,j) {
                     return fillScale(i)})// color(i); })
                  .attr("stroke", "00000")
                  .style("stroke-width", "0.5px")
                  .attr("d", function (d, i, j) {

                      return arc4.innerRadius(outerRadius+10+maxTickLabelWidth).outerRadius(outerRadius+15+maxTickLabelWidth)(d);
                  })
                  .on("mouseover",function(d,i,j){
                    return groupFade2(j,fadeLevel)
                  })
                  .on("mouseout",function(d,i,j){
                    return groupFade2(j,1)
                  })
                  .on("click",function(d,i,j){
                    return clickGroup2(j)
                  });

//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
    if (categoryNames) {
        var categories = svg.append("g").attr("class", "categories")
                            .selectAll("g")
                            .data(categoryNames)
                            .enter().append("g").attr("class", "category")
                            .selectAll("g")
                            .data(categoryLabels)
                            .enter().append("g")
                            .style("fill", "black")
                            .attr("id", function(d) {
                                return "label-" + d.label;
                            })
                            .attr("transform", function(d) {
                                return "rotate(" + (d.angle * 180 / Math.PI) + ")"
                                    + "translate(" + (outerRadius + categorynamePadding) + ", 0)";
                            });

        categories.append("text")
                  .attr("x", 0)
                  .attr("dy", ".35em")
                  .style("font-size", categorynameFontsize + "px")
                  .style("font-family", "sans-serif")
                  .style("font-weight", "bold")
                  .attr("transform", function(d, i) { return i ? "rotate(270)" : "rotate(90)"; })
                  .style("text-anchor", "middle")
                  .text(function(d) { return d.label; })
                  .attr("id", function(d) { return d.label; });
    }

    function categoryLabels(d, i) {
        return [{
          angle: i * Math.PI,
          label: d
        }];
    }

    // returns an array of tick angles and labels, given a group
    function groupTicks(d) {
      var k = (d.endAngle - d.startAngle) / d.value;
      return d3.range(0, d.value+1, tickInterval).map(function(v, i) {
        return {
          angle: v * k + d.startAngle,
          label: i % 5 ? null : v//tickInterval == 1 ? (i % 2 ? null : v) : (i % 5 ? null : v)
        };
      });
    }

    function groupTicks2(d) {

      var k = (d.endAngle - d.startAngle); // 100;
      // return d3.range(0, 101, d.value < 5 ? 101 : (d.value <10 ? 100 : (d.value < 40 ? 50 : (d.value < 80 ? 20 : 10)))).map(function(v,i){
      return d3.range(0,101, k < 0.05 ? 101 : (k < 0.1 ? 100 : (k < 0.25 ? 50 : ( k < 0.5 ? 20 : 10)))).map(function(v,i){
        return {
          angle: v * k/100 + d.startAngle,
          label:  Math.round(v)
        };
      });
    }

    function groupLabels(d) {
      var a = (d.startAngle + d.endAngle) / 2;
      return [{
          angle: a,
          handside: (a < Math.PI) ? "right" : "left",
          label: groupNames[d.index],
          padding: groupnamePadding[d.index]
        }];
    }

    // returns an event handler for fading all chords not belonging to a
    // specific group
    function groupFade(g, opacity) {
        svg.selectAll(".chords path")
            .filter(function(d) { return d.source.index != g.index
                                      && d.target.index != g.index; })
            .transition()
            .style("opacity", opacity);
    }
    function groupFade2(i, opacity) {
        svg.selectAll(".chords path")
            .filter(function(d) { return d.source.index != i
                                      && d.target.index != i; })
            .transition()
            .style("opacity", opacity);
    }
    // returns an event handler for fading all chords except for the one
    // given
    function chordFade(g, opacity) {
        svg.selectAll(".chords path")
            .filter(function(d) { return d.source.index != g.source.index
                                      || d.target.index != g.target.index;
            })
            .transition()
            .style("opacity", opacity);
    }

    // round to significant figures / digits
    function sigFigs(n, sig) {
        if (n == 0) { return n}
        if (sig == "null") { sig = 7; }
        var mult = Math.pow(10, sig - Math.floor(Math.log(n) / Math.LN10) - 1);
        return Math.round(n * mult) / mult;
    }

    function click(d) {

      return eval(clickAction);
    }

    function clickGroup(d) {
      if (d.index >= firstfunindex && firstfunindex!= null) {
        Shiny.setInputValue("groupSelection",tooltipNames[d.index], {priority: "event"} )
      }
      if (d.index < firstfunindex && firstfunindex!= null) {
        Shiny.setInputValue("grouptaxaSelection",tooltipNames[d.index], {priority: "event"} )
      }
        return eval(clickGroupAction)
    }

    function clickGroup2(i) {
      if (i >= firstfunindex && firstfunindex!= null) {
        Shiny.setInputValue("groupSelection",tooltipNames[i], {priority: "event"} )
      }
      if (i < firstfunindex && firstfunindex!= null) {
        Shiny.setInputValue("grouptaxaSelection",tooltipNames[i], {priority: "event"} )
      }
        return eval(clickGroupAction)
    }

  }  // end renderValue function

});
