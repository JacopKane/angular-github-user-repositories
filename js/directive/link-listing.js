/**
 * Created by furkantunali on 22/07/16.
 */

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.linkListing = mod.exports;
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
      global.linkListing = mod.exports;
    }
  })(this, function () {});
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJkaXJlY3RpdmUvbGluay1saXN0aW5nLmpzIiwic291cmNlc0NvbnRlbnQiOltdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
