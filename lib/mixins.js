/* eslint no-control-regex: 0 */
var _ = require('lodash-checkit');
var url = url = require('url');
var he = require('he');
var util = require('util');

var memo = {hash: {}};

module.exports = {

  // is parsable into a valid date
  isDateString: function (s) {
    if (!_.isString(s)) return false;
    var d = new Date(String(s));
    return !_.isNaN(d.getTime());
  },

  // s -> _.isSize|n -> _.size(s) === n
  isSize: function (s, n) {
    return _.size(s) === n;
  },

  // alias for _.isUndefined
  isOmitted: _.isUndefined.bind(_),

  // any defined value including null
  isDefined: function (s) {
    return s !== undefined;
  },

  // the most useful function; prints and returns true
  isPrinted: function (s, label) {
    label = label || '';
    console.log(label, util.inspect(s, {depth: 10})); // eslint-disable-line no-console
    return true;
  },

  // use a lodash-match-pattern as a filter argument
  filterPattern: function (s, pattern) {
    var matchPattern = require('../');
    return _.filter(s, function (v) {
      return !matchPattern(v, pattern);
    });
  },

  // s -> _.setMemo|key -> s  and sets memo.hash.key = s
  setMemo: function (s, key) {
    memo.hash[key] = s;
    return s;
  },

  // s -> _.isSetAsMemo|key -> true  and sets memo.hash.key = s
  isSetAsMemo: function (s, key) {
    memo.hash[key] = s;
    return true;
  },

  getMemoHash: function () {
    return memo.hash;
  },

  // s -> _.isEqualToMemo|key -> memo.hash.key === s
  isEqualToMemo: function (s, key) {
    return _.isEqual(s, memo.hash[key]);
  },

  // s -> _.isNotEqualToMemo|key -> memo.hash.key !== s
  isNotEqualToMemo: function (s, key) {
    return !_.isEqual(s, memo.hash[key]);
  },

  // clears memo.hash
  clearMemos: function (s) {
    memo.hash = {};
    return s;
  },

  // extracts URLs from a string into an array
  extractUrls: function (s) {
  // Addapted from: http://daringfireball.net/2010/07/improved_regex_for_matching_urls
    /* eslint-disable indent */
    var re = new RegExp([
      // '\b',
      '(',                           // Capture 1: entire matched URL
        '(?:',
          '[a-z][\\w\-]+\:',           // URL protocol and colon
          '(?:',
            '/{1,3}',                    // 1-3 slashes
            '|',                         //   or
            '[a-z0-9%]',                 // Single letter or digit or '%'
                                          // (Trying not to match e.g. "URI::Escape")
          ')',
          '|',                         //   or
          'www\\d{0,3}[\\.]',          // "www.", "www1.", "www2." … "www999."
          '|',                         //   or
          '[a-z0-9\\.-]+[\\.][a-z]{2,4}/',  // looks like domain name followed by a slash
        ')',
        '(?:',                       // One or more:
          '[^\\s\\r\\n()<>]+',         // Run of non-space, non-()<>
          '|',                         //   or
          '\\(([^\\s\\r\\n()<>]+|(\\([^\\s\\r\\n()<>]+\\)))*\\)', // balanced parens, up to 2 levels
        ')+',
        '(?:',                       // End with:
          '\\(([^\\s\\r\\n()<>]+|(\\([^\\s\\r\\n()<>]+\\)))*\\)', // balanced parens, up to 2 levels
          '|',                         //   or
          '[^\\s\\r\\n`!()\\[\\]{};:\'"\\.,<>?«»“”‘’]',  // not a space or one of these punct chars
        ')',
      ')'
    ].join(''), 'gmi');
    /* eslint-enable indent */
    var matches = he.decode(s).match(re);
    return (matches || []).map(function (urlStr) {
      return url.parse(urlStr, true);
    });
  }
};

['every', 'filter', 'find', 'findLast', 'partition', 'reject', 'some'].forEach(function (fnName) {
  var lodashFn = _[fnName].bind(_);
  module.exports[fnName] = function (col, pred, testVal) {
    if (typeof testVal === 'undefined') {
      return lodashFn(col, pred);
    } else {
      return lodashFn(col, [pred, testVal]);
    }
  };
});
