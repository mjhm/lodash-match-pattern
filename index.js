var _ = require('lodash-checkit');
var util = require('util');

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


module.exports = function () {
  var matchFail;
  var lodashModule = _;  // lodash-checkit by default

  var matcher = function (targVal, srcVal, key) {
    if (_.isObject(targVal)) {

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
        return _.isMatchWith(targVal, newSrcVal);
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
    var currentIsMatch = lodashMatchFn ? lodashMatchFn.apply(lodashModule, matcherArgs) : targVal === srcVal

    // 'matchFail' is used for reporting the first encountered match failure from the pattern.
    if (!currentIsMatch) {
      matchFail = (key === '__testObj') ?
        util.inspect(srcVal) + " didn't match " + util.inspect(targVal)  :
        "{" + key + ": " + util.inspect(srcVal) + "} didn't match {" + key + ": " + util.inspect(targVal) + "}"
    }
    return currentIsMatch;
  };

  var matchPattern = function (sourceData, targetPattern) {
    var isMatch;
    matchFail = null;
    _.isMatchWith({__testObj: targetPattern}, {__testObj: sourceData}, matcher);
    return matchFail;
  };

  if (arguments.length === 1) {
    lodashModule = arguments[0];
    return matchPattern;
  }

  return matchPattern(arguments[0], arguments[1]);
};
