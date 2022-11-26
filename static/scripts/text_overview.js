function topicLineGraph(id, data){

    console.log(data)

    var card_body = document.getElementById(id);

    d3.select(card_body)
            .selectAll("*")
            .remove();
    
    var width = 300,
        height = 610,
        margin = 30;

    data.forEach(function(d) {
        d.values.forEach(function(d) {
            d.line = +d.line;
            d.frequency = +d.frequency;
        });
    });


    // Define scale
    var x = d3.scaleLinear()
        .domain(d3.extent(data[0].values, function(d) {
            return d.line;
        }))
        .range([0, height - margin]);

    var y = d3.scaleLinear()
        // .domain([0, 241])
        .domain([0.1,0])
        .range([width - margin, 0]);


    //Create SVG for chart
    var svg = d3.select(card_body)
        .append("svg")
        .attr("width", width + margin)
        .attr("height", height + margin)
        .append("g")
        .attr("transform", "translate(" + margin + "," + margin + ")");

    // Draw Axis
    var xAxis = d3.axisLeft(x);
    var yAxis = d3.axisTop(y);


    //Define lines
    var line = d3.line()
        .y(function(d) {
            return x(d.line);
        })
        .x(function(d) {
            return y(d.frequency);
        })

    // Line attributes
    var lines = svg.append("g")
        .attr("class", "lines")
        .selectAll(".line-all")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "line-all")
        .append("path")
        .attr("class", d => d.id + " line tpcbutton")
        .attr("d", function(d) {
            return line(d.values);
        })
        .style("stroke", function(d) {
            return '#212121'
        })
        .style("fill", "none")
        .style("stroke-width", "3")
        .style("opacity", "0.3")
        .on("click", function(d) {
            var className = $(this).attr('class')
            var classes = className.split(" ")
            var ix = classes.indexOf("selected")
            if (ix == -1) {
                $(this).addClass("selected")
                d3.select(this)
                    .style("stroke", function(d) {
                        return d.color
                    })
                classes.push("selected")
                $(this).attr("class", classes.join(" "))
            } else {
                d3.select(this)
                    .style("stroke", function(d) {
                        return "#777777"
                    })
                classes.pop(ix)
                $(this).attr("class", classes.join(" "))
            }
        })
        .on("mouseover", function(d) {
            d3.selectAll(".line")
                .style("opacity", "0.15");
            d3.select(this)
                .style("stroke-width", "3")
                .style("opacity", "0.8")
                .style("cursor", "pointer");
            svg.append("text")
                .attr("x", (width - margin) / 3)
                .attr("y", 0)
                .attr("class", "title")
                .style("fill", "#212121")
                .style("font-size", "15px")
                .text(d.name)
                .attr("text-anchor", "middle");
        })
        .on("mouseout", function(d) {
            d3.selectAll(".line")
                .style("opacity", "0.3");
            d3.select(this)
                .style("stroke-width", "3")
                .style("cursor", "none");
            svg.select(".title")
                .remove();
        });



}

function textViewInit(dname) {
    $("h5#doc-title").text(dname);
    var topic_colors;

    $.ajax({
        url: "/get_colors",
        type: "get",
        async: false,
        data: {},
        success: function (response) {
            topic_colors = response.colors;
        },
        error: function (xhr) {
            //Do Something to handle error
        }
    });
    console.log(topic_colors)
    var topic_x_word;

    $.ajax({
        url: "/get_topic_words_json",
        type: "get",
        async: false,
        data: {},
        success: function (response) {
            topic_x_word = response["topic_words_json"];
        },
        error: function (xhr) {
            //Do Something to handle error
        }
    });
    console.log(topic_x_word)
    var docid = 0 //TODO: Get from corpus view or the main page
    //var docid = window.localStorage.getItem("docid");
    console.log(docid)

    $.ajax({
        url: "/get_doc",
        type: "get",
        async: false,
        data: { docid: docid },
        success: function (response) {
            window.localStorage.setItem("docText", response.html);
            console.log(response.topicscores)
            //window.localStorage.setItem("docText", response.html);
            for (var i = 0; i < 30; i++) {
                //console.log(i)
                //console.log(90*response.topicscores[i])
                $(".progress-bar.prog" + i).css('width', 20 + 80 * response.topicscores[i] + '%').attr("aria-valuenow", 10 + 90 * response.topicscores[i])
            }
        },
        error: function (xhr) {
            //Do Something to handle error
        }
    });



    var txt = window.localStorage.getItem("docText");
    /*
    d3.select("#doc-text-html")
        .append("p")
        .html(txt);
    */
    d3.select("#doc-text-html")
            .append("p")
            .html(txt);
            /*
    d3.text("data/doc0.txt").then(function (data) {
        d3.select("#doc-text-html")
            .append("p")
            .html(data);
    });
*/
    //SVG D3
    var temp = '';
    $("span.hoverable").mouseenter(function() {
        temp = $(this).css("background-color");
        $(this).css("background-color", "#aaaaaa").css("border-radius", "3px");
    }).mouseleave(function() {
         $(this).css("background-color", temp).css("border-radius", "0px");
    });
    
    //var data;
    /*
    d3.json("data/doc0_linegraph.json", function(data) {
        console.log(data);
        topicLineGraph("textoverview1",data["data"]);
    });
    */
    //use did for doc<did>_linegraph
    d3.json("static/data/doc0_linegraph.json").then(function (data) {
        console.log(data);
        topicLineGraph("textoverview1", data["data"]);
    });

    /*
    $.ajax({
          url: "/get_linegraph_data",
          type: "get",
          async: false,
          data: {did:docid},
          success: function(response) {
            data = response
          },
          error: function(xhr) {
            //Do Something to handle error
        }
    });
    */
    //topicLineGraph("textoverview0",data["data"]);
    
    /*
                var topic_clrs = {}
                
                $('.tpcbutton').click(function() {
                        var myClass = $(this).attr("class");
                        var classes = myClass.split(" ");
    
                        var topic = "";
                        var selected = classes.indexOf("topic-selected");
    
                        for(i in classes){
                            if( classes[i].startsWith("t") && classes[i].length<4 ){
                                topic = classes[i]
                                break
                            }
                        }
                        var topicNo = parseInt(topic.replace("t",''))
                        if(topicNo in topic_clrs){
    
                        } 
                        else{
                            topic_clrs[topicNo] = 0
                        }
    
    
                    if(selected >= 0 || topic_clrs[topicNo] == 1){
                        $("span."+topic).css({"background-color":""});
                        $(this).removeClass("topic-selected");
                        topic_clrs[topicNo] = 0
                        $("div."+topic+".tpcbutton").css("border-color","transparent");
                    }
                    else{
                        
                        $("span."+topic).each(function( k, v ) {
    
                            var t = $(this).text();
                                var wordScore = topic_x_word[topic][t.toLowerCase()];
                            var r = ( topic_colors[topicNo][0] * (1+wordScore*2) ).toString()
                            var g = ( topic_colors[topicNo][1] * (1+wordScore*2) ).toString()
                            var b = ( topic_colors[topicNo][2] * (1+wordScore*2) ).toString()
                                var rgbtext = "rgb("+r+","+g+","+b+")";
    
                                $(this).css({"background-color":rgbtext});
                        });
    
    
                        // tagName = this.nodeName.toLowerCase();
                        // if (tagName == "div"){
                        // 	$("path."+topic).click()
                        // }
                        $("div."+topic+".tpcbutton").css("border-color","#000");
                        $(this).addClass("topic-selected");
                        topic_clrs[topicNo] = 1
                    }
                
    
                    }
    
                
            );
            */

}


$('.tpcbutton').click(function() {
        console.log("HEELLOOOO")
    });