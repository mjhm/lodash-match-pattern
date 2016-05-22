var lodash = require('lodash-checkit');
var util = require('util');

var _ = lodash.mixin( {
  arrayOfDups: function (s, n) {
    return lodash.times(n, lodash.cloneDeep.bind(lodash, s));
  },

  isDateString: function (s) {
    if (!lodash.isString(s)) return false;
    var d = new Date(String(s));
    return !lodash.isNaN(d.getTime());
  }
});

// These helpers fill out the src or targ object with "undefined" for missing
// keys, so that they can be appropriately compared.
var fillSrcWithVoids = function (targObj, srcObj) {
  var newTargKeys = _.keys(_.omit(targObj, '...'));
  return _.assign(
    _.zipObject(newTargKeys),
    targObj.hasOwnProperty('...') ? _.pick(srcObj, newTargKeys) : srcObj
  );
}

var fillTargWithVoids = function (targObj, srcObj) {
  return _.assign(_.zipObject(_.keys(srcObj)), _.omit(targObj, '...'));
}

var colonArgToParam = function (colonArg) {
  var a = colonArg.slice(1);
  return isNaN(a) ? a : Number(a);
}

var lodashModule = _;  // lodash-checkit by default

var matchFail;

var matcher = function (targVal, srcVal, key) {
  var currentIsMatch;
  if (_.isObject(targVal)) {

    // Check partial match and superset casees for an array.
    if (_.isArray(targVal)) {
      if (_.includes(targVal, '...')) {
        currentIsMatch = (targVal.length - 1 === _.size(_.intersection(targVal, srcVal)));
        if (! currentIsMatch) {
          matchFail = "Array " + util.inspect(srcVal) + " isn't a superset match of Array " + util.inspect(targVal);
        }
        return currentIsMatch;
      }
      if (_.includes(targVal, '---')) {
        currentIsMatch = (srcVal.length === _.size(_.intersection(targVal, srcVal)));
        if (! currentIsMatch) {
          matchFail = "Array " + util.inspect(srcVal) + " isn't a subset match of Array " + util.inspect(targVal);
        }
        return currentIsMatch;
      }
    }

    // Remap the srcVal if the sole key of 'targVal' is a lodash function.
    // This is useful for sorting or filtering the 'srcVal'.
    var targKeys = _.keys(targVal);
    if (/_\.[^\:]+/.test(targKeys[0])) {
      if (targKeys.length > 1) {
        throw new Error('There can only be one key/value pair when mapping source values.\n' +
          'targVal = ' + util.inspect(targVal) + '\n' +
          'srcVal = ' + util.inspect(srcVal) + '\n'
        )
      }
      var keyLodashMatch = targKeys[0].match(/^_\.([^\:]+)(\:[^\:]*)?(\:[^\:]*)?/) || [];
      var keyLodashFn = lodashModule[keyLodashMatch[1]]
      if (! keyLodashFn) {
        throw new Error('The mapping function _.' + keyLodashMatch[1] + " doesn't exist");
      }
      var keyArgs = [ srcVal ];
      if (keyLodashMatch[2] !== undefined) {
        keyArgs.push(colonArgToParam(keyLodashMatch[2]));
      }
      if (keyLodashMatch[3] !== undefined) {
        keyArgs.push(colonArgToParam(keyLodashMatch[3]));
      }
      try {
        var newSrcVal = keyLodashFn.apply(lodashModule, keyArgs);
      } catch (error) {
        error.message = 'Error applying ' + key + ' to source values ' + util.inspect(srcVal) +
          '\n' + error.message;
        throw error;
      }
      // rerun matcher with the function applied.
      return matcher(targVal[targKeys[0]], newSrcVal, key);
    }

    // Descend into objects and recurse _.isMatchWith.
    if (_.isObject(srcVal)) {
      var newSrcObj = fillSrcWithVoids(targVal, srcVal);
      var newTargObj = fillTargWithVoids(targVal, srcVal);
      return _.isMatchWith(newTargObj, newSrcObj, matcher);
    }
  }
  // Extract strings that look like "_.isXxxx" into lodash matcher functions,
  // then parse out arguments for the matcher functions. For example "_.isInRange:0:25"
  var lodashMatch = (String(targVal).match(/^_\.(is[A-Z][^\:]*)(\:[^\:]*)?(\:[^\:]*)?/) || []);
  var lodashMatchFn = lodashMatch[1] ? lodashModule[lodashMatch[1]] : null
  var matcherArgs = [ srcVal ];
  if (lodashMatch[2] !== undefined) {
    matcherArgs.push(colonArgToParam(lodashMatch[2]));
  }
  if (lodashMatch[3] !== undefined) {
    matcherArgs.push(colonArgToParam(lodashMatch[3]));
  }

  // Here's where the item comparison happens.
  currentIsMatch = lodashMatchFn ? lodashMatchFn.apply(lodashModule, matcherArgs) : targVal === srcVal

  // 'matchFail' is used for reporting the first encountered match failure from the pattern.
  if (!currentIsMatch) {
    if (key === '__testObj') {
      matchFail = util.inspect(srcVal) + " didn't match " + util.inspect(targVal)
    } else if (/^\d+$/.test(key)) {
      matchFail = "Array[" + key + "] = " + util.inspect(srcVal) + " didn't match Array[" + key + "] = " + util.inspect(targVal);
    } else {
      matchFail = "{" + key + ": " + util.inspect(srcVal) + "} didn't match {" + key + ": " + util.inspect(targVal) + "}"
    }
  }
  return currentIsMatch;
};

var matchPattern = function (sourceData, targetPattern) {
  var isMatch;
  matchFail = null;
  _.isMatchWith({__testObj: targetPattern}, {__testObj: sourceData}, matcher);
  return matchFail;
};

matchPattern.use = function (newLodashModule) {
  lodashModule = newLodashModule;
}

matchPattern.getLodashModule = function () { return lodashModule; }

module.exports = matchPattern;
