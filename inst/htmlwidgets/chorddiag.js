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
    // console.log(chord.params)
    var matrix = params.matrix,
        options = params.options;
    // console.log(matrix);
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
console.log(typeof 0/0 == undefined);
console.log(isNaN( 0/0));

        console.log(reactor);
        console.log(grouptotals);
// console.log(firstfunindex);
// var last_selection = null
// console.log(typeof last_selection != "undefined");
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

        var groupTip = d3.tip()
                         .attr('class', 'd3-tip')
                         .style("font-size", 20 + "px")
                         .style("font-family", "sans-serif")
                         .direction('mt')
                         .offset([10, 10])
                         .html(function(d) {
                             var value = sigFigs(d.value, precision);
                             return tooltipNames[d.index] + " (total): " + value + tooltipUnit;
                         });


         var Matrixsum = matrix.map(function(y){
                             return y.reduce(function(a,b){
                                 return a+b;
                             });
                         });

         var Matrixtotal = (d3.sum(Matrixsum) / 2 );
         // console.log(Matrixtotal);

function checkforNaN(val){
  if(isNaN(val)){return 0}
  else {
    return val
  }
}
console.log(checkforNaN(0/0));
console.log(checkforNaN(5));
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
// console.log(groupColors);
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

    //  var tipSVG = d3.select("#tipDiv")
    //                         .append("svg")
    //                         .attr("width", 500)
    //                         .attr("height", 120);
    // // console.log(tipSVG);
    //                   tipSVG.append("text")
    //                       .text("newchordtip(d)")
    //                       .attr("x", 10)
    //                       .attr("y", 20)
    //                       .style('fill', 'white')
    //                       .style("font-size", "20px");



     if (showTooltips) {
        svg.call(chordTip)
           .call(groupTip)
           .call(div);
     }

    // var div = d3.tip()//svg.append("g")
    //     .attr("class", "d3-tip")
    //     .style("opacity", 1e-6);
  //
  // function mouseover() {
  //   div.style("opacity", 1);
  // }
  //
  // // where the tooltip previosly contained an image
  // function mousemove() {
  //   div
  //    .html("<h1>Bar Graph</h1><br> <svg class='chart'></svg>")
  //       .style("left", (d3.event.pageX - 34) + "px")
  //       .style("top", (d3.event.pageY - 12) + "px");
  // }
  //
  // function mouseout() {
  //   div.style("opacity", 1e-6);
  // }

// console.log(reactor);

  // var reactor = [[11,60,22,6,16,5,6,16,14],[46,55,81,17,24,29,37,24,13],[1,6,3,0,4,0,4,6,2],[0,1,2,0,18,0,0,1,0],[9,11,9,1,5,2,8,16,1],[4,6,2,0,4,2,4,3,1],[21,13,17,18,11,28,8,12,1],[1,8,4,1,3,0,3,6,2],[22,13,6,2,8,2,3,4,3],[16,13,10,3,13,2,13,7,4],[23,44,36,8,18,15,16,22,7],[8,9,8,5,1,4,3,0,1],[4,8,3,2,5,2,4,2,1],[5,7,8,1,2,5,2,3,0],[4,6,2,1,4,2,1,2,3],[86,229,116,18,149,49,43,96,22],[17,40,17,8,14,7,16,16,5],[23,39,14,7,34,3,13,25,5],[18,19,16,5,9,3,13,7,1],[110,222,159,34,115,48,68,73,35],[6,13,9,3,4,0,2,2,1],[6,40,13,5,27,2,17,5,3],[3,4,7,0,4,2,1,2,2],[3,3,2,2,5,5,2,13,1],[38,65,50,13,30,14,17,16,20],[18,29,20,2,20,12,14,19,5],[7,28,12,5,15,15,1,16,0],[1,5,3,1,2,4,1,8,0],[2,0,3,0,0,12,0,21,2],[43,62,38,14,34,34,22,29,5]]
  // ;

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

        // add tick labels
        ticks.append("text")
             .attr("x", 0)
             .attr("dy", ".35em")
             .style("font-size", ticklabelFontsize + "px")
             .style("font-family", "sans-serif")
             .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180)translate(-8)" : "translate(8)"; })
             .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : "start"; })
             .text(function(d) { return d.label; });

////////////////////////////////////////////////////////////////////////////////////#/
///////////////////////////////////////////////////////////////////////////////////

// TICKS 2.0
// console.log(chord.groups());
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
                       + "translate(" + (outerRadius + 30) + ", 0)";
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
     .style("font-size", ticklabelFontsize + "px")
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
    // console.log(chord.chords());

if(grouptotals != null){
  var Datasetnames = Object.getOwnPropertyNames(grouptotals);
  var FirstFunIndex = matrix[0].length - grouptotals.N.length;
  // console.log(Datasetnames);
  // console.log(FirstFunIndex);
}

// function getCol(matrix, col){
//        var column = [];
//        for(var i=0; i<matrix.length; i++){
//           column.push(matrix[i][col]);
//        }
//        return column;
//         };
// function getRow(matrix,rowid){
//   var row = [];
//        for(var i=0; i<matrix[0].length; i++){
//           row.push(matrix[i][col]);
//        }
//        return column;
//     }
// }
function getPercentage(d){
  var percentages = [];

  for(var i=2; i<Datasetnames.length; i++){
          percentages.push(checkforNaN(grouptotals[Datasetnames[i]][d.target.index - FirstFunIndex]));
    }
  return percentages
};
  var color = d3.scale.category20();
// console.log(grouptotals.NG.length);
// console.log(matrix[0].length);
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
              // console.log(chordindex);
              var chordselected = d;
              div.show(d);
              // console.log(d,i);
              // console.log(reactor[i]);
              // console.log(newchordtip(d));

if(reactor != null){

                var maxwidth = 0

                  var tipSVG = d3.select("#tipDiv")
                        .append("svg")
                        .attr("width", maxwidth)//d3.max([110 + sigFigs((d3.max(reactor[chordindex])/d3.max(getCol(grouptotals,chordselected.target.index - FirstFunIndex)))*100,2)*5]))//sigFigs(( reactor[i][0]/grouptotals[Datasetnames[1]][d.target.index - FirstFunIndex])*100,2)*5, 100 + sigFigs(( reactor[i][1]/grouptotals.Day1R2[d.target.index - FirstFunIndex])*100,2)*5]),300]))//d3.max(reactor[i]) * 5,300]))
                        .attr("height", 35 * (Datasetnames.length-1));


// console.log("d",d);
// console.log(Object.getOwnPropertyNames(grouptotals));
// console.log(grouptotals[Datasetnames[1]]);
// console.log(reactor );
// console.log(reactor[i]);
// console.log(grouptotals[Datasetnames[1]][d.target.index - FirstFunIndex]);
// console.log(grouptotals.Day1R1[d.target.index - FirstFunIndex]);
// console.log(grouptotals.Day1R2[d.target.index - FirstFunIndex]);
// console.log(reactor[i][0]);
// console.log(reactor[i][0]/grouptotals.Day1R1[d.target.index - FirstFunIndex]);
                  // tipSVG.append("text")
                  //     .text(newchordtip(d))
                  //     .attr("x", 10)
                  //     .attr("y", 20)
                  //     .style('fill', 'white')
                  //     .style("font-size", "20px");

                  // var bars = svg.selectAll(".bar")
                  //                   .data(data)
                  //                   .enter()
                  //                   .append("svg");

// console.log(getPercentage(d));
// console.log(d3.max(reactor[i]));
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
        // console.log(d,i);
        if(maxwidth < (sigFigs((checkforNaN(reactor[chordindex][i]/grouptotals[Datasetnames[i+1]][chordselected.target.index - FirstFunIndex]))*100,2)*3)){
          maxwidth = sigFigs((checkforNaN( reactor[chordindex][i]/grouptotals[Datasetnames[i+1]][chordselected.target.index - FirstFunIndex]))*100,2)*3
        }
        console.log("starts here");
        console.log(reactor[chordindex][i]);
        console.log(grouptotals[Datasetnames[i+1]]);
        console.log(chordselected.target.index - FirstFunIndex);
        console.log(grouptotals[Datasetnames[i+1]][chordselected.target.index - FirstFunIndex]);
        console.log(reactor[chordindex][i]/grouptotals[Datasetnames[i+1]][chordselected.target.index - FirstFunIndex]);

        return sigFigs(( checkforNaN(reactor[chordindex][i]/grouptotals[Datasetnames[i+1]][chordselected.target.index - FirstFunIndex]))*100,2)*3;//d;
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
            return maxTitleWidth + 30 + sigFigs((checkforNaN(reactor[chordindex][i]/grouptotals[Datasetnames[i+1]][chordselected.target.index - FirstFunIndex]))*100,2)*3;//110 - d
        })
        .attr("y", function(d,i){return 40 + i*15})//barWidth - barPadding)
        .attr("transform", function (d, i) {
             var translate = [0,barWidth * i];
             return "translate("+ translate +")";
        });




tipSVG.attr("width", maxwidth+ maxTitleWidth + 80);
// console.log(sigFigs(( reactor[chordindex][i]/grouptotals[Datasetnames[1]][chordselected.target.index - FirstFunIndex])*100,2) + "%");


    // tipSVG.append("text")
    //         .text(function(d,i,j){return Datasetnames[i+1]})
    //         .attr("x", 10)
    //         .attr("y", function(d,i){return 10 + i*10})
    //         .attr('fill', 'white')
    //         .style('fill', 'white')
    //         .style("font-size", "14px")
    //         .attr("transform", function (d, i) {
    //              var translate = [0,barWidth * i];
    //              return "translate("+ translate +")";
    //         });

//                   tipSVG.append("rect")
//                       .attr("fill", "aqua")
//                       .attr("x", 100)
//                       .attr("y", 30)
//                       .attr("width", 0)
//                       .attr("height", 30)
//                       .transition()
//                       .duration(1000)
//                       .attr("width", sigFigs(( reactor[i][0]/grouptotals.Day1R1[d.target.index - FirstFunIndex])*100,2)*5);//reactor[i][0] * 4);
//
//                   tipSVG.append("rect")
//                       .attr("fill", "magenta")
//                       .attr("x", 100)
//                       .attr("y", 70)
//                       .attr("width", 0)
//                       .attr("height", 30)
//                       .transition()
//                       .duration(1000)
//                       .attr("width", sigFigs(( reactor[i][1]/grouptotals.Day1R2[d.target.index - FirstFunIndex])*100,2)*5);//reactor[i][1] * 4);
//
//                   // tipSVG.append("rect")
//                   //     .attr("fill", "green")
//                   //     .attr("y", 90)
//                   //     .attr("width", 0)
//                   //     .attr("height", 30)
//                   //     .transition()
//                   //     .duration(1000)
//                   //     .attr("width", reactor[d.index][3] * 6);
//
//                   tipSVG.append("text")
//                       .text("Grass")
//                       .attr("x", 10)
//                       .attr("y", 50)
//                       .style('fill', 'white')
//                       .style("font-size", "14px");
//
//
//                   tipSVG.append("text")
//                       .text("Leachate")
//                       .attr("x", 10)
//                       .attr("y", 90)
//                       .style('fill', 'white')
//                       .style("font-size", "14px");
//
//                   tipSVG.append("text")
//                       .text(sigFigs(( reactor[i][0]/grouptotals.Day1R1[d.target.index - FirstFunIndex])*100,2) + "%")
//                       .attr("x", 120)
//                       .attr("y", 50)
//                       .style('fill', 'white')
//                       .transition()
//                       .duration(1000)
//                       .attr("x", 106 + sigFigs(( reactor[i][0]/grouptotals.Day1R1[d.target.index - FirstFunIndex])*100,2)*5);//reactor[i][0] * 4);
//
//                 tipSVG.append("text")
//                     .text(sigFigs(( reactor[i][1]/grouptotals.Day1R2[d.target.index - FirstFunIndex])*100,2) + "%") //reactor[i][1])
//                     .attr("x", 120)
//                     .attr("y", 90)
//                     .style('fill', 'white')
//                     .transition()
//                     .duration(1000)
//                     .attr("x", 106 + sigFigs(( reactor[i][1]/grouptotals.Day1R2[d.target.index - FirstFunIndex])*100,2)*5);//reactor[i][1] * 4);
};
                //
                // tipSVG.append("text")
                //     .text(reactor[d.index][3])
                //     .attr("x", 10)
                //     .attr("y", 110)
                //     .transition()
                //     .duration(1000)
                //     .attr("x", 6 + reactor[d.index][3] * 6);

              // var barchart = d3.select("#tipDiv")
              //       .data(reactor[i])
              //       .enter()
              //       .append("rect")
              //       .attr("y",function(d,i){
              //         // console.log(d,i);
              //         return i*20 + 100
              //       })
              //       .attr("x",120)
              //       .attr("height",30)
              //       .attr("width", function(d,i){
              //         // console.log(d);
              //         d*5})
              //       .attr("fill", "white");

              return chordFade(d, fadeLevel);
          })
          .on("mouseout", function(d) {
              if (showTooltips) div.hide(d);
              return chordFade(d, 1);
          })
          .on("click", click);


    // function getCol(matrix, col){
    //        var column = [];
    //        for(var i=0; i<matrix.length; i++){
    //           column.push(matrix[i][col]);
    //        }
    //        return column;
    //         };
    //
    //         console.log(d3.sum(matrix));


// console.log(groupNames.findIndex(x => x=="Translation"));
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
            .text(function(d,i) { return d.label }) //+ d3.sum(getCol(matrix,groupNames.findIndex(x => x==d.label))) ; })
            .attr("id", function(d) { return d.label; });
    }

// console.log(reactor!=null);
//////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
dta = chord.groups();
// console.log(dta[0].startAngle);
// console.log(dta.length);

dta2 = chord.chords();
// console.log(dta2);



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
        .startAngle(function(d,i){//console.log(d);
          return sangles[i]})
        .endAngle(function(d,i){//console.log(d);
          return eangles[i]});

var arc4 = d3.svg.arc();



        // console.log(dataset);

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
          // console.log(dict);
          // console.log(d3.values(dict));

          gs.selectAll("path").data(function (d,i) {//console.log(d,i);
            return pie(d,i); })
                  // .attr("startAngle", chord.groups()[5].startAngle)
                  .enter().append("path")
                  .attr("fill", function (d, i,j) {//console.log(d,i,j);
                     return fillScale(i)})// color(i); })
                  .attr("stroke", "00000")
                  .style("stroke-width", "0.5px")
                  .attr("d", function (d, i, j) {
                    // console.log(d,i,j);
                      return arc4.innerRadius(outerRadius+30).outerRadius(outerRadius+35)(d);
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
      return d3.range(0, d.value, tickInterval).map(function(v, i) {
        return {
          angle: v * k + d.startAngle,
          label: i % 5 ? null : v
        };
      });
    }

    function groupTicks2(d) {
      // console.log(d);
      var k = (d.endAngle - d.startAngle); // 100;
      // return d3.range(0, 101, d.value < 5 ? 101 : (d.value <10 ? 100 : (d.value < 40 ? 50 : (d.value < 80 ? 20 : 10)))).map(function(v,i){
      return d3.range(0,101, k < 0.05 ? 101 : (k < 0.1 ? 100 : (k < 0.15 ? 50 : ( k < 0.4 ? 20 : 10)))).map(function(v,i){
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
      // console.log("FirstFunIndex" + FirstFunIndex);
      // console.log(d.index);
      var last_selection = d.index
        Shiny.setInputValue("groupSelection",tooltipNames[d.index], {priority: "event"} )
console.log(last_selection);
      }
        return eval(clickGroupAction)
    }

  }  // end renderValue function

});
