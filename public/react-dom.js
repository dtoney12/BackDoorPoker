"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * ReactDOM v0.14.7
 *
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */
// Based off https://github.com/ForbesLindesay/umd/blob/master/template.js
;(function (f) {
  // CommonJS
  if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === "object" && typeof module !== "undefined") {
    module.exports = f(require('react'));

    // RequireJS
  } else if (typeof define === "function" && define.amd) {
    define(['react'], f);

    // <script>
  } else {
    var g;
    if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      // works providing we're not in "use strict";
      // needed for Java 8 Nashorn
      // see https://github.com/facebook/react/issues/3037
      g = this;
    }
    g.ReactDOM = f(g.React);
  }
})(function (React) {
  return React.__SECRET_DOM_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2xpYi9yZWFjdC9yZWFjdC1kb20uanMiXSwibmFtZXMiOlsiZiIsImV4cG9ydHMiLCJtb2R1bGUiLCJyZXF1aXJlIiwiZGVmaW5lIiwiYW1kIiwiZyIsIndpbmRvdyIsImdsb2JhbCIsInNlbGYiLCJSZWFjdERPTSIsIlJlYWN0IiwiX19TRUNSRVRfRE9NX0RPX05PVF9VU0VfT1JfWU9VX1dJTExfQkVfRklSRUQiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7Ozs7Ozs7Ozs7QUFXQTtBQUNBLENBQUMsQ0FBQyxVQUFTQSxDQUFULEVBQVk7QUFDWjtBQUNBLE1BQUksUUFBT0MsT0FBUCx5Q0FBT0EsT0FBUCxPQUFtQixRQUFuQixJQUErQixPQUFPQyxNQUFQLEtBQWtCLFdBQXJELEVBQWtFO0FBQ2hFQSxXQUFPRCxPQUFQLEdBQWlCRCxFQUFFRyxRQUFRLE9BQVIsQ0FBRixDQUFqQjs7QUFFRjtBQUNDLEdBSkQsTUFJTyxJQUFJLE9BQU9DLE1BQVAsS0FBa0IsVUFBbEIsSUFBZ0NBLE9BQU9DLEdBQTNDLEVBQWdEO0FBQ3JERCxXQUFPLENBQUMsT0FBRCxDQUFQLEVBQWtCSixDQUFsQjs7QUFFRjtBQUNDLEdBSk0sTUFJQTtBQUNMLFFBQUlNLENBQUo7QUFDQSxRQUFJLE9BQU9DLE1BQVAsS0FBa0IsV0FBdEIsRUFBbUM7QUFDakNELFVBQUlDLE1BQUo7QUFDRCxLQUZELE1BRU8sSUFBSSxPQUFPQyxNQUFQLEtBQWtCLFdBQXRCLEVBQW1DO0FBQ3hDRixVQUFJRSxNQUFKO0FBQ0QsS0FGTSxNQUVBLElBQUksT0FBT0MsSUFBUCxLQUFnQixXQUFwQixFQUFpQztBQUN0Q0gsVUFBSUcsSUFBSjtBQUNELEtBRk0sTUFFQTtBQUNMO0FBQ0E7QUFDQTtBQUNBSCxVQUFJLElBQUo7QUFDRDtBQUNEQSxNQUFFSSxRQUFGLEdBQWFWLEVBQUVNLEVBQUVLLEtBQUosQ0FBYjtBQUNEO0FBRUYsQ0EzQkEsRUEyQkUsVUFBU0EsS0FBVCxFQUFnQjtBQUNqQixTQUFPQSxNQUFNQyw0Q0FBYjtBQUNELENBN0JBIiwiZmlsZSI6InJlYWN0LWRvbS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogUmVhY3RET00gdjAuMTQuN1xuICpcbiAqIENvcHlyaWdodCAyMDEzLTIwMTUsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqXG4gKi9cbi8vIEJhc2VkIG9mZiBodHRwczovL2dpdGh1Yi5jb20vRm9yYmVzTGluZGVzYXkvdW1kL2Jsb2IvbWFzdGVyL3RlbXBsYXRlLmpzXG47KGZ1bmN0aW9uKGYpIHtcbiAgLy8gQ29tbW9uSlNcbiAgaWYgKHR5cGVvZiBleHBvcnRzID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGYocmVxdWlyZSgncmVhY3QnKSk7XG5cbiAgLy8gUmVxdWlyZUpTXG4gIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoWydyZWFjdCddLCBmKTtcblxuICAvLyA8c2NyaXB0PlxuICB9IGVsc2Uge1xuICAgIHZhciBnO1xuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBnID0gd2luZG93O1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgZyA9IGdsb2JhbDtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBnID0gc2VsZjtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gd29ya3MgcHJvdmlkaW5nIHdlJ3JlIG5vdCBpbiBcInVzZSBzdHJpY3RcIjtcbiAgICAgIC8vIG5lZWRlZCBmb3IgSmF2YSA4IE5hc2hvcm5cbiAgICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svcmVhY3QvaXNzdWVzLzMwMzdcbiAgICAgIGcgPSB0aGlzO1xuICAgIH1cbiAgICBnLlJlYWN0RE9NID0gZihnLlJlYWN0KTtcbiAgfVxuXG59KShmdW5jdGlvbihSZWFjdCkge1xuICByZXR1cm4gUmVhY3QuX19TRUNSRVRfRE9NX0RPX05PVF9VU0VfT1JfWU9VX1dJTExfQkVfRklSRUQ7XG59KTtcbiJdfQ==