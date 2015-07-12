'use strict';

/**
 * @ngdoc service
 * @name worthItApp.d3Service
 * @description
 * # d3Service
 * Factory in the worthItApp.
 */
angular.module('worthItApp')
  .factory('d3Service', ['$document', '$q', '$rootScope', function($document, $q, $rootScope) {
    var d, scriptTag;

    d = $q.defer();

    function onScriptLoad() {
      // Load client in the browser
      $rootScope.$apply(function() { d.resolve(window.d3); });
    }

    scriptTag = $document[0].createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.async = true;
    scriptTag.src = 'bower_components/d3/d3.js';
    
    scriptTag.onreadystatechange = function () {
      if (this.readyState === 'complete') { onScriptLoad(); }
    };

    scriptTag.onload = onScriptLoad;

    var s = $document[0].getElementsByTagName('body')[0];
    s.appendChild(scriptTag);

    return {
      d3: function() { return d.promise; }
    };
  });
