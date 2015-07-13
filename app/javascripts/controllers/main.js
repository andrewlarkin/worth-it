'use strict';

/**
 * @ngdoc function
 * @name worthItApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the worthItApp
 */
angular.module('worthItApp')
  .controller('MainCtrl', function ($scope, $http) {
    $http.get('/data')
         .success(function (data) {
            $scope.strikes = data.strike;

            var reducedData = data.strike.reduce(function (a, b) {
              var d = {};
              var date = new Date(b.date);

              d.number = b.number;

              d.date = {
                day: date.getDate() + 1,
                month: date.getMonth() + 1,
                year: date.getFullYear()
              };

              d.deaths_max = isNaN(parseInt(b.deaths_max)) ? 0 : parseInt(b.deaths_max);

              d.children = isNaN(parseInt(b.children)) ? 0 : parseInt(b.children);

              var tempCivAry = b.civilians.split('-');

              if (tempCivAry.length > 1 && !isNaN(parseInt(tempCivAry[1]))) {
                d.civilians = parseInt(tempCivAry[1]) - d.children;
              } else {
                d.civilians = isNaN(parseInt(tempCivAry[0])) ? 0 : parseInt(tempCivAry) - d.children;
              }

              d.enemies = d.deaths_max - d.civilians - d.children;

              var names = b.names[0].split(','); // Convert that weird non-array string to an array

              d.targetEliminated = b.target === '' ? 'N/A' : names.indexOf(b.target) !== -1;

              return a.concat(d);
            }, []);

            d3.select('.chart')
              .selectAll('div')
              .data(reducedData)
              .enter().append('div')
              .style('width', function (d) {
                return (d.deaths_max * 10) + 'px';
              })
              .text(function (d) {
                return d.number + ' - Enemies: ' + d.enemies + ' - Civilians: ' + d.civilians + ' - Children: ' + d.children;
              });
         });
  });
