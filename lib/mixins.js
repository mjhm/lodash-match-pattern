var _ = require('lodash-checkit');
var matchPattern = require('../')

var memo = {hash: {}};

module.exports = {

  isDateString: function (s) {
    if (!_.isString(s)) return false;
    var d = new Date(String(s));
    return !_.isNaN(d.getTime());
  },

  isSize: function (s, n) {
    return _.size(s) === n;
  },

  isOmitted: _.isUndefined.bind(_),

  isPrinted: function (s, label) {
    label = label || ''
    console.log(label, s)
    return true;
  },

  filterPattern: function (s, pattern) {
    return _.filter(s, function (v, k) {
      return !matchPattern(v, pattern);
    });
  },

  setMemo: function (s, key) {
    memo.hash[key] = s;
    return s;
  },

  getMemoHash: function (s) {
    return memo.hash;
  },

  isEqualToMemo: function (s, key) {
    return _.isEqual(s, memo.hash[key]);
  },

  isNotEqualToMemo: function (s, key) {
    return !_.isEqual(s, memo.hash[key]);
  },

  clearMemos: function (s) {
    memo.hash = {};
    return s;
  }

};
