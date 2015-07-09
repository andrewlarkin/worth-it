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
         });
  });
