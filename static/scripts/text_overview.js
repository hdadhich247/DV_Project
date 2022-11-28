colors_str = ['rgb(238,156,189)', 'rgb(172,190,173)', 'rgb(203,220,177)', 'rgb(179,234,170)', 'rgb(216,188,170)', 'rgb(165,208,192)', 'rgb(221,250,207)', 'rgb(161,227,219)', 'rgb(252,215,228)', 'rgb(206,253,185)', 'rgb(199,206,232)', 'rgb(229,189,245)', 'rgb(246,206,244)', 'rgb(224,160,156)', 'rgb(225,244,232)', 'rgb(254,227,238)', 'rgb(221,231,229)', 'rgb(235,175,175)', 'rgb(236,237,254)', 'rgb(196,197,181)', 'rgb(206,245,246)', 'rgb(242,214,250)', 'rgb(207,241,163)', 'rgb(194,194,236)', 'rgb(224,168,185)', 'rgb(216,225,249)', 'rgb(225,183,224)', 'rgb(236,234,205)', 'rgb(204,239,227)', 'rgb(207,249,211)']

function topicLineGraph(id, data, topic_colors) {
    var card_body = document.getElementById(id);
    d3.select(card_body)
        .selectAll("*")
        .remove();
    var width = 300,
        height = 610,
        margin = 30;
    data.forEach(function (d) {
        d.values.forEach(function (d) {
            d.line = +d.line;
            d.frequency = +d.frequency;
        });
    });
    // Define scale
    var x = d3.scaleLinear()
        .domain(d3.extent(data[0].values, function (d) {
            return d.line;
        }))
        .range([0, height - margin]);
    var y = d3.scaleLinear()
        // .domain([0, 241])
        .domain([0.1, 0])
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
        .y(function (d) {
            return x(d.line);
        })
        .x(function (d) {
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
        .attr("d", function (d) {
            return line(d.values);
        })
        .style("stroke", function (d) {
            var topic_num = parseInt(d.id.replace("t", ""));
            var r = topic_colors[topic_num][0]
            var g = topic_colors[topic_num][1]
            var b = topic_colors[topic_num][2]
            var rgbtext = "rgb(" + r + "," + g + "," + b + ")";
            return rgbtext
        })
        .style("fill", "none")
        .style("stroke-width", "3")
        .style("opacity", "0.7")
        .on("mouseover", function (d) {
            d3.selectAll(".line")
                .style("opacity", "0.2");
            d3.select(this)
                .style("stroke-width", "3")
                .style("opacity", "1")
                .style("cursor", "pointer");
            svg.append("text")
                .attr("x", (width - margin) / 3)
                .attr("y", 0)
                .attr("class", "title")
                .style("fill", "none")
                .style("font-size", "15px")
                .text(d.name)
                .attr("text-anchor", "middle");
        })
        .on("mouseout", function (d) {
            d3.selectAll(".line")
                .style("opacity", "0.7");
            d3.select(this)
                .style("stroke-width", "3")
                .style("cursor", "none");
            svg.select(".title")
                .remove();
        });
}

function textViewInit(dname) {
    $("h5#doc-title").text(dname);
    
    var hd_doc_id = 1; //TODO: Get from corpus view or the main page
    var file_name_linegraph = "static/data/doc" + hd_doc_id + "_linegraph.json"
    var file_name_doc = "static/data/doc" + hd_doc_id + ".txt"

    d3.json("static/data/doc_ids.json").then(function (data) {
        console.log(data)
        $("h5#doc-title").text(data["doc"+hd_doc_id].replace(".txt", ""));

    });
    
    
    var topic_x_word
    d3.json("static/data/topic_words.json").then(function (data) {
        globalThis.topic_x_word = data
    });
    console.log("DATA LOAD DONE")
    var topic_colors = [[206, 230, 174], [155, 230, 225], [206, 224, 163], [208, 178, 225], [187, 209, 234], [253, 236, 216], [207, 215, 207], [218, 155, 183], [204, 221, 185], [207, 163, 227], [254, 254, 169], [235, 180, 199], [189, 217, 230], [204, 227, 233], [197, 175, 170], [196, 194, 207], [208, 250, 180], [157, 218, 169], [156, 238, 254], [158, 157, 228], [210, 169, 220], [155, 233, 220], [243, 211, 222], [248, 245, 172], [215, 177, 197], [241, 192, 240], [178, 159, 199], [253, 180, 201], [214, 231, 175], [186, 214, 248]]
    var doc_vs_topic_scores
    d3.json("static/data/doc_topic.json").then(function (data) {
            //do what you need here
            console.log("HEREHEREHEREHEREHERE")
            console.log(data);
            globalThis.doc_vs_topic_scores = data
            for (var i = 0; i < 30; i++) {
                $(".progress-bar.prog" + i).css('width', 20 + 80 * data["doc1"][i] + '%').attr("aria-valuenow", 10 + 90 * data["doc1"][i]).css('background-color', colors_str[i])

            }
        
    });

    d3.text(file_name_doc).then(function (data) {

        data.replace("\n", "<br>")
        window.localStorage.setItem("docText1", data);
        
    });
    var txt = window.localStorage.getItem("docText1");

    d3.select("#doc-text-html")
            .append("p")
            .html(txt);

    //SVG D3
    var temp = '';
    $("span.hoverable").mouseenter(function () {
        temp = $(this).css("background-color");
        $(this).css("background-color", "#aaaaaa").css("border-radius", "3px");
    }).mouseleave(function () {
        $(this).css("background-color", temp).css("border-radius", "0px");
    });

    //use did for doc<did>_linegraph
    d3.json(file_name_linegraph).then(function (data) {
        console.log(data);
        topicLineGraph("textoverview1", data["data"],  topic_colors);
    });

    var topic_clrs = {}
    $('.tpcbutton').click(function () {
        var myClass = $(this).attr("class");
        var classes = myClass.split(" ");
        var topic = "";
        var selected = classes.indexOf("topic-selected");
        for (i in classes) {
            if (classes[i].startsWith("t") && classes[i].length < 4) {
                topic = classes[i]
                break
            }
        }
        var topicNo = parseInt(topic.replace("t", ''))
        if (topicNo in topic_clrs) {

        }
        else {
            topic_clrs[topicNo] = 0
        }
        if (selected >= 0 || topic_clrs[topicNo] == 1) {
            $("span." + topic).css({ "background-color": "" });
            $(this).removeClass("topic-selected");
            topic_clrs[topicNo] = 0
            $("div." + topic + ".tpcbutton").css("border-color", "transparent");
        }
        else {
            $("span." + topic).each(function (k, v) {
                var t = $(this).text();
                var wordScore = globalThis.topic_x_word[topic][t.toLowerCase()];
                var r = ( topic_colors[topicNo][0] * (1 + wordScore * 40)).toString()
                var g = ( topic_colors[topicNo][1] * (1 + wordScore * 40)).toString()
                var b = ( topic_colors[topicNo][2] * (1 + wordScore * 40)).toString()

                var rgbtext = "rgb(" + r + "," + g + "," + b + ")";
                
                $(this).css({ "background-color": rgbtext});
            });

            $("div." + topic + ".tpcbutton").css("border-color", "#000");
            $(this).addClass("topic-selected");
            topic_clrs[topicNo] = 1
        }
    }
    );
}