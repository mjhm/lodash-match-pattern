var lodash = require('lodash-checkit');
var util = require('util');
var parser = require('./_parser');
var helpers = require('./helpers');

var fillSrcWithVoids = helpers.fillSrcWithVoids;
var fillTargWithVoids = helpers.fillTargWithVoids;
var checkSupersetMatch = helpers.checkSupersetMatch;
var checkSubsetMatch = helpers.checkSubsetMatch;

var _ = lodash.mixin( {
  arrayOfDups: function (s, n) {
    return lodash.times(n, lodash.cloneDeep.bind(lodash, s));
  },

  isDateString: function (s) {
    if (!lodash.isString(s)) return false;
    var d = new Date(String(s));
    return !lodash.isNaN(d.getTime());
  },

  isSize: function (s, n) {
    return _.size(s) === n;
  },

  isOmitted: lodash.isUndefined.bind(lodash)

});


var curryFunctionSpec = function (fnSpec) {
  var fnParts = fnSpec.split('|');
  var fn = lodashModule[fnParts[0]];
  if (! fn) {
    throw new Error('The function _.' + fnParts[0] + " doesn't exist");
  }
  fnParts.slice(1).forEach(function (fnArg) {
    fn = _.bind(fn, lodashModule, _, (isNaN(fnArg) ? fnArg : Number(fnArg)))
  });
  return fn;
};


var lodashModule = _;  // lodash-checkit by default

var matcher = function (matchFailMsg, targVal, srcVal, key) {
  if (_.isObject(targVal)) {

    if (_.isArray(targVal)) {
      if (_.includes(targVal, '...')) return checkSupersetMatch(matchFailMsg, targVal, srcVal);
      if (_.includes(targVal, '---')) return checkSubsetMatch(matchFailMsg, targVal, srcVal);
    }

    // Remap the srcVal if the sole key of 'targVal' is a lodash function.
    // This is useful for sorting or filtering the 'srcVal'.
    var targKeys = _.keys(targVal);
    if (/_\.[^\|]+/.test(targKeys[0])) {
      if (targKeys.length > 1) {
        throw new Error('There can only be one key/value pair when mapping source values.\n' +
          'targVal = ' + util.inspect(targVal) + '\n' +
          'srcVal = ' + util.inspect(srcVal) + '\n'
        )
      }
      var mappingFn = curryFunctionSpec(targKeys[0].slice(2));

      try {
        var newSrcVal = mappingFn(srcVal);
      } catch (error) {
        error.message = 'Error applying ' + key + ' to source values ' + util.inspect(srcVal) +
          '\n' + error.message;
        throw error;
      }
      // rerun matcher with the results of the function applied.
      return matcher(matchFailMsg, targVal[targKeys[0]], newSrcVal, key);
    }

    // Descend into objects and recurse _.isMatchWith.
    if (_.isObject(srcVal)) {
      var newSrcObj = fillSrcWithVoids(targVal, srcVal);
      var newTargObj = fillTargWithVoids(targVal, srcVal);
      return _.isMatchWith(newTargObj, newSrcObj, matcher.bind(null, matchFailMsg));
    }
  }
  // Extract strings that look like "_.isXxxx" into lodash matcher functions,
  // then parse out arguments for the matcher functions. For example "_.isInRange:0:25"

  var matchFn = /_\.is[A-Z]/.test(targVal) ? curryFunctionSpec(targVal.slice(2)) : null;

  // Here's where the item comparison happens.
  var currentIsMatch = matchFn ? matchFn(srcVal) : targVal === srcVal

  // 'matchFailMsg' is used for reporting the first encountered match failure from the pattern.
  if (!currentIsMatch) {
    if (key === '__testObj') {
      matchFailMsg.push(util.inspect(srcVal) + " didn't match " + util.inspect(targVal))
    } else if (/^\d+$/.test(key)) {
      matchFailMsg.push("Array[" + key + "] = " + util.inspect(srcVal) + " didn't match Array[" + key + "] = " + util.inspect(targVal));
    } else {
      matchFailMsg.push("{" + key + ": " + util.inspect(srcVal) + "} didn't match {" + key + ": " + util.inspect(targVal) + "}");
    }
  }
  return currentIsMatch;
};

var matchPattern = function (sourceData, targetPattern) {
  var isMatch;
  var matchFailMsg = [];
  _.isMatchWith({__testObj: targetPattern}, {__testObj: sourceData}, matcher.bind(null, matchFailMsg));
  return matchFailMsg.length ? matchFailMsg.join('\n') : null;
};

matchPattern.use = function (newLodashModule) {
  lodashModule = newLodashModule;
}

matchPattern.getLodashModule = function () { return lodashModule; }

module.exports = matchPattern;
