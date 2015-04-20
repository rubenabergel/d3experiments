function lineChart() {
    var _chart = {};

    var _width = 1200, _height = 300,
            _margins = {top: 30, left: 30, right: 30, bottom: 30},
            _x, _y,
            _data = [],
            _svg,
            _bodyG,
            _xAxis,
            _line,
            _xmax,
            _xmin,
            _ymax,
            _ymin;

    _chart.render = function () {
        if (!_svg) {
            _x = d3.time.scale().range([0, quadrantWidth()]).domain([new Date(_xmax.valueOf() - 24 * 60 * 60 * 1000), _xmax]);
            _y = d3.scale.linear().range([quadrantHeight(), 0]).domain([0,1]);
            _xAxis = d3.svg.axis().scale(_x).orient("bottom");
            _svg = d3.select("div.lineChartContainer").append("svg")
                    .attr("class", "lineChart")
                    .attr("height", _height)
                    .attr("width", _width);

            renderAxes(_svg, true);

            defineBodyClip(_svg);
        }

        renderBody(_svg);
    };

    _chart.update = function(days){
        var dateLowerLimit = new Date(2014, 6, 31-days);
        var today = new Date(2014,7,1);

        _x.domain([new Date(_xmax.valueOf() - days *  24 * 60 * 60 * 1000), _xmax]);
        renderAxes(_svg, false);
        renderLines();


    }
    function renderAxes(svg, isInit) {
        var axesG;
        if (isInit){
            axesG = svg.append("g")
                .attr("class", "axes");
        }else{
            axesG = svg.select('g.axes');
        }

        renderXAxis(axesG, isInit);

        renderYAxis(axesG);
    }

    function renderXAxis(axesG, isInit){
        if (isInit){
            axesG.append("g")
                    .attr("class", "x axis")
                    .attr("transform", function () {
                        return "translate(" + xStart() + "," + yStart() + ")";
                    })
                    .call(_xAxis);
        }
        axesG.select('.x.axis').transition().call(_xAxis);

    }

    function renderYAxis(axesG){
        var yAxis = d3.svg.axis()
                .scale(_y.range([quadrantHeight(), 0]))
                .orient("left");

        axesG.append("g")
                .attr("class", "y axis")
                .attr("transform", function () {
                    return "translate(" + xStart() + "," + yEnd() + ")";
                })
                .call(yAxis);

    }

    function defineBodyClip(svg) {
        var padding = 5;

        svg.append("defs")
                .append("clipPath")
                .attr("id", "body-clip")
                .append("rect")
                .attr("x", 0 - padding)
                .attr("y", 0)
                .attr("width", quadrantWidth() + 2 * padding)
                .attr("height", quadrantHeight());
    }

    function renderBody(svg) {
        if (!_bodyG)
            _bodyG = svg.append("g")
                    .attr("class", "body")
                    .attr("transform", "translate("
                        + xStart() + ","
                        + yEnd() + ")")
                    .attr("clip-path", "url(#body-clip)");

        renderLines();
    }



    function renderLines() {
        _line = d3.svg.line()
                        .x(function (d) { return _x(d.x); })
                        .y(function (d) { return _y(d.y); });
        _bodyG.selectAll("path.line")
                    .data([_data])
                .enter()
                .append("path")
                .style("stroke", function (d, i) {
                    return 'blue';
                })
                .attr("class", "line");

        _bodyG.selectAll("path.line")
                .data([_data])
                .transition()
                .attr("d", function (d) { return _line(d); });

        if (trendFlag === true){
        _bodyG.selectAll("path.trend")
                    .data([trendLineToBeDrawn])
                .enter()
                .append("path")
                .style("stroke", function (d, i) {
                    return 'yellow';
                })
                .attr("class", "trend");

        _bodyG.selectAll("path.trend")
                .data([trendLineToBeDrawn])
                .transition()
                .attr("d", function (d) { return _line(d); });
        }else{
            d3.select("path.trend").remove();
        }

        if (meanFlag === true){
        _bodyG.selectAll("path.mean")
                    .data([meanLineToBeDrawn])
                .enter()
                .append("path")
                .style("stroke", function (d, i) {
                    return 'red';
                })
                .attr("class", "mean");

        _bodyG.selectAll("path.mean")
                .data([meanLineToBeDrawn])
                .transition()
                .attr("d", function (d) { return _line(d); });
        }else{
            d3.select("path.mean").remove();
        }
    }


    function xStart() {
        return _margins.left;
    }

    function yStart() {
        return _height - _margins.bottom;
    }

    function xEnd() {
        return _width - _margins.right;
    }

    function yEnd() {
        return _margins.top;
    }

    function quadrantWidth() {
        return _width - _margins.left - _margins.right;
    }

    function quadrantHeight() {
        return _height - _margins.top - _margins.bottom;
    }

    _chart.width = function (w) {
        if (!arguments.length) return _width;
        _width = w;
        return _chart;
    };

    _chart.height = function (h) {
        if (!arguments.length) return _height;
        _height = h;
        return _chart;
    };

    _chart.margins = function (m) {
        if (!arguments.length) return _margins;
        _margins = m;
        return _chart;
    };

    _chart.colors = function (c) {
        if (!arguments.length) return _colors;
        _colors = c;
        return _chart;
    };

    _chart.x = function (x) {
        if (!arguments.length) return _x;
        _x = x;
        return _chart;
    };

    _chart.y = function (y) {
        if (!arguments.length) return _y;
        _y = y;
        return _chart;
    };

    _chart.setSeries = function (series) {
        var xmin = d3.min(series, function(d){return d.x;});
        var xmax = d3.max(series, function(d){return d.x;});
        var ymin = d3.min(series, function(d){return d.y;});
        var ymax = d3.max(series, function(d){return d.y;});
        if ( typeof _xmin === "undefined" ){
            _xmin = xmin;
            _xmax = xmax;
            _ymin = ymin;
            _ymax = ymax;
        }else{
            _xmin = Math.min(_xmin, xmin);
            _xmax = Math.max(_xmax, xmax);

            _ymin = Math.min(_ymin, ymin);
            _ymax = Math.max(_ymax, ymax);

        }
        _data = series;
        return _chart;
    };

    return _chart;
}