(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.app = mod.exports;
  }
})(this, function (exports) {
  (function (global, factory) {
    if (typeof define === "function" && define.amd) {
      define([], factory);
    } else if (typeof exports !== "undefined") {
      factory();
    } else {
      var mod = {
        exports: {}
      };
      factory();
      global.app = mod.exports;
    }
  })(this, function () {
    'use strict';

    var app = angular.module('app', ['template-cache', 'github-user-repositories']).config(['$logProvider', function ($logProvider) {
      $logProvider.debugEnabled(false);
    }]);
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsUUFFRSxNQUFNLFFBQVEsTUFBUixDQUFlLEtBQWYsRUFBc0IsQ0FDMUIsZ0JBRDBCLEVBRTFCLDBCQUYwQixDQUF0QixFQUlILE1BSkcsQ0FJSSxDQUFDLGNBQUQsRUFBaUIsVUFBVSxZQUFWLEVBQXdCO0FBQy9DLG1CQUFhLFlBQWIsQ0FBMEIsS0FBMUI7QUFDRCxLQUZPLENBSkosQ0FGUiIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdFxuXG4gIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdhcHAnLCBbXG4gICAgJ3RlbXBsYXRlLWNhY2hlJyxcbiAgICAnZ2l0aHViLXVzZXItcmVwb3NpdG9yaWVzJ1xuICBdKVxuICAgIC5jb25maWcoWyckbG9nUHJvdmlkZXInLCBmdW5jdGlvbiAoJGxvZ1Byb3ZpZGVyKSB7XG4gICAgICAkbG9nUHJvdmlkZXIuZGVidWdFbmFibGVkKGZhbHNlKTtcbiAgICB9XSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
