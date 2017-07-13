var chalk = require('chalk');
var lodash = require('lodash-checkit');
var util = require('util');
var parser = require('./_parser');
var helpers = require('./lib/helpers');
var normalize = require('./lib/normalize');
var mixins = require('./lib/mixins');

var fillSrcWithVoids = helpers.fillSrcWithVoids;
var fillTargWithVoids = helpers.fillTargWithVoids;
var checkSupersetMatch = helpers.checkSupersetMatch;
var checkSubsetMatch = helpers.checkSubsetMatch;

var debug = false;

var _ = lodash.mixin(mixins);

var lodashModule = _;  // lodash-checkit by default, but can be overriden by customization

// This curries the '|' separated arguments of a matcher or filter function
// e.g. _.isBetween|10|15 --> function (s) {return _.isBetween(s, 10, 15)}
var curryFunctionSpec = function (fnSpec) {
  var fnSplit = ( /^([^\|]+)(.*)/.exec(fnSpec) || ['dummy']).slice(1);
  var fnName = fnSplit.shift();
  var fnRest = fnSplit.shift();

  var fn = lodashModule[fnName];
  if (! lodashModule[fnName]) {
    throw new Error('The function _.' + fnName + " doesn't exist");
  }
  while (fnRest) {
    fnSplit = (
      /^\|\"([^\"]*)\"(.*)/.exec(fnRest) ||
      /^\|\'([^\']*)\'(.*)/.exec(fnRest) || ['dummy']
    ).slice(1);
    var fnArg = fnSplit.shift();
    if (!fnArg) {
      fnSplit = (/^\|([^\|]*)(.*)/.exec(fnRest) || ['dummy']).slice(1);
      fnArg = fnSplit.shift();
      if (! isNaN(fnArg)) {
        fnArg = Number(fnArg);
      }
    }
    fnRest = fnSplit.shift();
    if (debug) {
      // eslint-disable-next-line no-console
      console.log('fnName', fnName, 'fnArg', fnArg, 'fnRest', fnRest);
    }
    fn = _.bind(fn, lodashModule, _, fnArg);
  }
  return fn;
};

var echo = function (val) { return val; };

var matchMembers = function (targVal, srcVal, matcher) {
  // eslint-disable-next-line no-console
  if (debug) console.log('matchMembers', targVal, srcVal);
  var newSrcObj = fillSrcWithVoids(targVal, srcVal);
  var newTargObj = fillTargWithVoids(targVal, srcVal);
  // eslint-disable-next-line no-console
  if (debug) console.log('matchMembers newSrcObj', newSrcObj, 'newTargObj', newTargObj);
  return _.isMatchWith(newTargObj, newSrcObj, matcher);
};

var matcher = function (makeMsg, targVal, srcVal, key) {
  // eslint-disable-next-line no-console
  if (debug) console.log('matcher', targVal, srcVal);
  var isMatch;
  if (_.isArray(targVal)) {
    if (!_.isArrayLike(srcVal)) {
      makeMsg(srcVal, targVal);
      return false;
    }
    if (_.includes(targVal, '__MP_superset')) return checkSupersetMatch(makeMsg, targVal, srcVal);
    if (_.includes(targVal, '__MP_subset')) return checkSubsetMatch(makeMsg, targVal, srcVal);
    if (_.includes(targVal, '__MP_equalset')) {
      isMatch = checkSubsetMatch(echo, targVal, srcVal) && checkSupersetMatch(echo, targVal, srcVal);
      if (!isMatch) {
        makeMsg(srcVal, targVal, '', "Array ${src} isn't an equalset match of Array ${tgt}");
      }
      return isMatch;
    }

    isMatch = (targVal.length === srcVal.length) &&
      _.isMatchWith(targVal, srcVal, matcher.bind(null, makeMsg));
    if (!isMatch && !makeMsg().length) {
      makeMsg(srcVal, targVal);
    }
    return isMatch;
  }

  if (_.isPlainObject(targVal)) {

    var hasNonMapApplyKeys = false;
    var mapApplyResults = [];

    _.forEach(targVal, function (tv, k) {
      var mapApplyMatch = k.match(/^__MP_(map|apply)\d+\s*(.*)/) || [];
      // eslint-disable-next-line no-console
      if (debug) console.log('mapApplyMatch', k, mapApplyMatch);
      var mapApply = mapApplyMatch[1];
      var mapApplyFname = mapApplyMatch[2];
      var fn = mapApplyFname ? curryFunctionSpec(mapApplyFname) : echo;

      if (mapApply === 'map') {
        if (_.isObject(srcVal)) {
          if (mapApplyFname) {
            if (_.isArray(srcVal)) {
              mapApplyResults.push(matcher(makeMsg, tv, _.map(srcVal, fn), key));
            } else {
              mapApplyResults.push(matcher(makeMsg, tv, _.mapValues(srcVal, fn), key));
            }
          } else {
            _.forEach(srcVal, function (so) {
              mapApplyResults.push(matcher(makeMsg, tv, so, key));
            });
          }
        } else {
          // mapApplyResults.push(matchMembers(tv, fn(srcVal), matcher.bind(null, matchFailMsg)));
          mapApplyResults.push(matcher(makeMsg, tv, fn(srcVal)));
        }
      } else if (mapApply === 'apply') {
        // eslint-disable-next-line no-console
        if (debug) console.log('apply result', fn(srcVal));
        mapApplyResults.push(matcher(makeMsg, tv, fn(srcVal)));
      } else {
        hasNonMapApplyKeys = true;
      }
    });

    if (mapApplyResults.length) {
      if (hasNonMapApplyKeys) {
        var targStr = util.inspect(targVal)
          .replace(/__MP_apply\d+\s*/, '"<-."')
          .replace(/__MP_map\d+\s*/, '"<-."');
        throw new Error('target ' + targStr +
          ' has both ordinary keys as well as keys for map(<=) and/or apply(<-)');
      }
      return _.every(mapApplyResults);
    }

    if (!_.isArrayLike(srcVal) && !_.isNumber(srcVal) && !_.isString(srcVal) && !_.isNil(srcVal)) {
      return matchMembers(targVal, srcVal, matcher.bind(null, makeMsg));
    }
  }

  var matchFn = null;
  if ( /^__MP_match/.test(targVal)) {
    matchFn = curryFunctionSpec(targVal.replace(/^__MP_match\s*/, ''));
  } else if (_.isFunction(targVal)) {
    matchFn = targVal;
  } else if (/^__MP_regex/.test(targVal)) {
    var targMatch = targVal.match(/^__MP_regex\(([^)]*)\)\s(.*)/);
    var re = new RegExp(targMatch[2], targMatch[1]);
    matchFn = RegExp.prototype.test.bind(re);
  } else if (_.isRegExp(targVal)) {
    matchFn = RegExp.prototype.test.bind(targVal);
  }

  // Here's where the leaf node item comparison happens.
  var currentIsMatch = matchFn ? matchFn(srcVal) : targVal === srcVal;

  if (!currentIsMatch) {
    if (key === '__testObj') {
      makeMsg(srcVal, targVal);
    } else if (/^\d+$/.test(key)) {
      makeMsg(srcVal, targVal, key, "Array[${key}] = ${src} didn't match target Array[${key}] = ${tgt}");
    } else {
      makeMsg(srcVal, targVal, key, "{${key}: ${src}} didn't match target {${key}: ${tgt}}");
    }
  }
  return currentIsMatch;
};

var makeMsg = function (matchFailMsg, srcVal, targVal, key, template) {
  if (arguments.length  === 1) {
    return matchFailMsg;
  }
  if (!template) {
    template = "${src} didn't match target ${tgt}";
  }
  if (_.isArray(targVal)) {
    targVal = _.without(targVal, '__MP_superset', '__MP_subset', '__MP_equalset');
  }
  if (_.isFunction(targVal)) {
    targVal = targVal.toString().split(/\n/)[0].replace(/\{.*/, '{...}');
  }
  var param = {
    key: key,
    src: util.inspect(srcVal),
    tgt: util.inspect(targVal).replace(/__MP_match\s*/g, '_.')
  };
  matchFailMsg.push(_.template(template)(param));
};

var matchPattern = function (sourceData, targetPattern) {
  var targetObject = targetPattern;

  if (_.isObject(targetPattern)) {
    targetObject = normalize(targetPattern);
  }
  if (_.isString(targetPattern)) {
    try {
      targetObject = parser.parse(targetPattern);
      // eslint-disable-next-line no-console
      if (debug) console.log('parsed', targetObject);
    }
    catch (error) {
      var msg = 'matchPattern: Error parsing pattern: ' + error.message;
      var errStart = error.location.start.offset;
      var errEnd = error.location.end.offset;
      var startLine = error.location.start.line;
      var startColumn = error.location.start.column;
      msg += '\nline:' + startLine + ' column:' + startColumn;

      var chalkPattern = chalk.green(targetPattern.slice(0, errStart)) +
        chalk.red(targetPattern.slice(errStart, errEnd)) +
        chalk.blue(targetPattern.slice(errEnd));
      var chalkLines = chalkPattern.split(/\n/);
      var outLines = chalkLines.slice(0,startLine);
      outLines.push(_.repeat('-', startColumn - 1) + '^' + '---');
      Array.prototype.push.apply(outLines, chalkLines.slice(startLine));
      msg += '\n' + outLines.join('\n');
      throw new Error(msg);
    }
  }
  // eslint-disable-next-line no-console
  if (debug) console.log('parse/normalize targetObject', targetObject);
  var matchFailMsg = [];
  _.isMatchWith(
    {__testObj: targetObject},
    {__testObj: sourceData},
    matcher.bind(null, makeMsg.bind(null, matchFailMsg)));
  return matchFailMsg.length ? matchFailMsg.join('\n') : null;
};

matchPattern.use = function (newLodashModule) {
  lodashModule = newLodashModule;
};

matchPattern.getLodashModule = function () { return lodashModule; };

module.exports = matchPattern;
