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

    angular.module('app', ['template-cache', 'github-user-repositories']).config(["$logProvider", function ($logProvider) {}]);
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxDQUFDLFVBQVUsUUFBUSxTQUFTO0VBQzFCLElBQUksT0FBTyxXQUFXLGNBQWMsT0FBTyxLQUFLO0lBQzlDLE9BQU8sQ0FBQyxZQUFZO1NBQ2YsSUFBSSxPQUFPLFlBQVksYUFBYTtJQUN6QyxRQUFRO1NBQ0g7SUFDTCxJQUFJLE1BQU07TUFDUixTQUFTOztJQUVYLFFBQVEsSUFBSTtJQUNaLE9BQU8sTUFBTSxJQUFJOztHQUVsQixNQUFNLFVBQVUsU0FBUztFQUMxQixDQUFDLFVBQVUsUUFBUSxTQUFTO0lBQzFCLElBQUksT0FBTyxXQUFXLGNBQWMsT0FBTyxLQUFLO01BQzlDLE9BQU8sSUFBSTtXQUNOLElBQUksT0FBTyxZQUFZLGFBQWE7TUFDekM7V0FDSztNQUNMLElBQUksTUFBTTtRQUNSLFNBQVM7O01BRVg7TUFDQSxPQUFPLE1BQU0sSUFBSTs7S0FFbEIsTUFBTSxZQUFZO0lBQ25COztJQTFCSixRQUFRLE9BQU8sT0FBTyxDQUNwQixrQkFDQSw2QkFFQyx3QkFBTyxVQUFVLGNBQWM7O0dBMEIvQiIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyLm1vZHVsZSgnYXBwJywgW1xuICAndGVtcGxhdGUtY2FjaGUnLFxuICAnZ2l0aHViLXVzZXItcmVwb3NpdG9yaWVzJ1xuXSlcbiAgLmNvbmZpZyhmdW5jdGlvbiAoJGxvZ1Byb3ZpZGVyKSB7XG5cblxuICB9KTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
