var lodash = require('lodash');
var util = require('util');
var Checkit = require('checkit');
var _ = lodash.runInContext();

_.mixin({
  isDateString: function(s) {
    var d = new Date(s);
    return !_.isNaN(d.getTime());
  },
  isEmail: function(s) {
    var err, ref, validated;
    ref = Checkit.checkSync('email', s, ['required', 'email']);
    err = ref[0];
    validated = ref[1];
    return Boolean(validated);
  },
  isEpochStart: function(s) {
    return s === '1970-01-01T00:00:00.000Z';
  },
  isOmitted: function(s) {
    return typeof s === 'undefined';
  }
});

var checkitRegexMixins = _.mapKeys(
  _.mapValues(Checkit.Regex, function (re, reKey) {
    return function (s) {
      return re.test(s)
    };
  }),
function (reFn, reKey) {
  return 'is' + _.upperFirst(reKey);
});

_.mixin(checkitRegexMixins);

var matchFail = null;

// These helpers fill out the src or targ object with "undefined" for missing
// keys, so that they can be appropriately compared.
var fillSrcWithVoids = function (targObj, srcObj) {
  var newTargKeys = _.keys(_.omit(targObj, '...'));
  return _.assign(
    _.zipObject(newTargKeys),
    targObj['...'] ? _.pick(srcObj, newTargKeys) : srcObj
  );
}

var fillTargWithVoids = function (targObj, srcObj) {
  return _.assign(_.zipObject(_.keys(srcObj)), _.omit(targObj, '...'));
}

var matcher = function (targVal, srcVal, key) {
  if (_.isObject(targVal) && _.isObject(srcVal)) {
    var newSrcObj = fillSrcWithVoids(targVal, srcVal);
    var newTargObj = fillTargWithVoids(targVal, srcVal);
    return _.isMatchWith(newTargObj, newSrcObj, matcher);
  }
  // Match strings that look like "_.is..."
  var lodashMatcher = (String(targVal).match(/^_\.(is\w.*)/) || [])[1];
  var currentIsMatch = lodashMatcher ? _[lodashMatcher](srcVal) : targVal === srcVal

  if (!currentIsMatch) {
    matchFail = (key === '__testObj') ?
      util.inspect(srcVal) + " didn't match " + util.inspect(targVal)  :
      "{" + key + ": " + util.inspect(srcVal) + "} didn't match {" + key + ": " + util.inspect(targVal) + "}"
  }
  return currentIsMatch;
};

module.exports = function(targetPattern, data) {
  var isMatch;
  matchFail = null;
  _.isMatchWith({__testObj: targetPattern}, {__testObj: data}, matcher);
  return matchFail;
};
