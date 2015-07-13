(function () {
  var margin, height, width, strikesByYear,
      chart, xAxis, yAxis, x, y;

  function parseDate(date) {
    var d = new Date(date);

    return {
      day: d.getDate() + 1,
      month: d.getMonth() + 1,
      year: d.getFullYear()
    };
  }

  function parseStringCount(string) {
    var tempAry, count;

    tempAry = string.split('-');
    count = parseInt(tempAry[1]);

    if (tempAry.length > 1 && !isNaN(count)) {
      return count;
    } else {
      count = parseInt(tempAry[0]);
      return isNaN(count) ? 0 : count;
    }
  };

  function formatDate(dateObj) {
    return dateObj.month + '.' + dateObj.day + '.' + dateObj.year;
  }

  function groupData(data) {
    var i=0, groupedData = [], tempObj, d;

    for (i=0; i < data.length; i+=1) {

      if (data[i].deaths_max === "0") {
        continue;
      }

      d = {};

      d.date = parseDate(data[i].date);

      if (d.date.year < 2002) {
        continue;
      }

      // group by year
      if (typeof tempObj === 'undefined' || tempObj.year !== d.date.year) {
        tempObj = { 
          year: d.date.year,
          deaths_max: 0,
          enemies: 0,
          civilians: 0,
          children: 0,
          maxCount: 0,
          strikes: []
        };

        groupedData.push(tempObj);
      }

      d.deaths_max = parseStringCount(data[i].deaths_max);
      d.children = parseStringCount(data[i].children);
      d.civilians = parseStringCount(data[i].civilians);

      d.enemies = d.deaths_max - d.civilians;

      var names = data[i].names[0].split(','); // Convert that weird non-array string to an array

      d.targetEliminated = data[i].target === '' ? 'N/A' : names.indexOf(data[i].target) !== -1;

      tempObj.strikes.push(d);

      tempObj.deaths_max += d.deaths_max;
      tempObj.enemies += d.enemies;
      tempObj.civilians += d.civilians;
      tempObj.children += d.children;
    }

    return groupedData;
  }

  margin = {top: 20, right: 30, left: 40, bottom: 40};
  height = 600 - margin.top - margin.bottom;
  width = 800 - margin.left - margin.right;

  x = d3.scale.ordinal()
        .rangeBands([0,width]);

  y = d3.scale.linear()
        .range([height,0]);

  xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom');

  yAxis = d3.svg.axis()
            .scale(y)
            .orient('left');

  chart = d3.select('.chart')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  d3.json('/data', function (error, data) {
    if (error) { return console.log('Error loading data:',error); }

    strikesByYear = groupData(data.strike);

    renderVisualization(strikesByYear);
  });

  function clearChart() {
    chart.html()
  }

  function renderVisualization(data) {
    var barGroup, enemyBar, civilianBar, childrenBar,
        barWidth;

    barWidth = width / data.length;

    y.domain([0, d3.max(data, function (d) { return d.deaths_max; })]);

    var yearRange = [], i;

    for (i=0; i<data.length;i+=1) {
      if (data[i].year) {
        yearRange.push(data[i].year);
      } else {
        yearRange.push(formatDate(data[i].date));
      }
    }

    x.domain(yearRange);

    chart.append('g')
         .attr('class', 'chart-axis x')
         .attr('transform', 'translate(0,' + height + ')')
         .call(xAxis);

    chart.append('g')
        .attr('class', 'chart-axis y')
        .call(yAxis);

    barGroup = chart.selectAll('.chart-bar')
                    .data(data);

    barGroup.enter().append('g')
            .attr('class', 'chart-bar')
            .attr('transform', function (d, i) { return 'translate(' + i * barWidth + ',0)'; })
            .attr('title', function (d) { return 'Total deaths: ' + d.deaths_max; })
            .on('click', function (d) {
              barGroup.remove();
              renderVisualization(d.strikes);
            });

    childrenBar = barGroup.append('g')
                          .classed('chart-bar-children', true)
                          .attr('transform', function (d) { 
                            return 'translate(0,' + y(d.children) + ')'; 
                          });

    childrenBar.append('rect')
               .attr('height', function (d) { return height - y(d.children); })
               .attr('width', barWidth);

    civilianBar = barGroup.append('g')
                          .classed('chart-bar-civilians', true)
                          .attr('transform', function (d) { 
                            return 'translate(0,' + (y(d.children) - (height - y(d.civilians))) + ')';
                          });

    civilianBar.append('rect')
               .attr('height', function (d) { return height - y(d.civilians); })
               .attr('width', barWidth);

    enemyBar = barGroup.append('g')
                       .classed('chart-bar-enemies', true)
                       .attr('transform', function (d) { 
                          return 'translate(0,' + (y(d.children) - (height - y(d.civilians)) - (height - y(d.enemies))) + ')'; 
                        });

    enemyBar.append('rect')
            .attr('height', function (d) { return height - y(d.enemies); })
            .attr('width', barWidth);
  }
}());