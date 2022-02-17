var _ = require('lodash-checkit');
var util = require('util');

var replacer = function (k, v) {
  if (/^__MP_/.test(v)) {
    throw new Error("matching functions aren't allowed in a set match");
  } else if (_.isPlainObject(v)) {
    var orderedV = {};
    (_.keys(v).sort()).forEach( function (vk) {
      orderedV[vk] = v[vk];
    });
    return orderedV;
  } else {
    return v;
  }
};

var serializeElements = function (ar) {
  try {
    return ar.map(function (elem) {
      return JSON.stringify(elem, replacer);
    });
  } catch (err) {
    err.message = err.message + '\n' + util.inspect(ar);
    throw err;
  }
};

module.exports = {
  // These helpers fill out the src or targ object with "undefined" for missing
  // keys, so that they can be appropriately compared.
  fillSrcWithVoids: function (targObj, srcObj) {
    var newTargKeys = _.keys(_.omit(targObj, '__MP_subset'));
    return _.assign(
      _.zipObject(newTargKeys),
      // eslint-disable-next-line no-prototype-builtins
      targObj.hasOwnProperty('__MP_subset') ? _.pick(srcObj, newTargKeys) : srcObj 
    );
  },

  fillTargWithVoids: function (targObj, srcObj) {
    return _.assign(_.zipObject(_.keys(srcObj)), _.omit(targObj, '__MP_subset'));
  },

  checkSubsetMatch: function (makeMsg, targVal, srcVal) {
    var targArray = _.reject(targVal, function (elem) {
      return _.isString(elem) && /^__MP_.*set/.test(elem);
    });

    var intersect = _.intersection(serializeElements(targArray), serializeElements(srcVal));
    var currentIsMatch = targArray.length === intersect.length;
    if (! currentIsMatch) {
      makeMsg(srcVal, targVal, '', "Array ${src} isn't a subset match of Array ${tgt}");
    }
    return currentIsMatch;
  },

  checkSupersetMatch: function (makeMsg, targVal, srcVal) {
    var targArray = _.reject(targVal, function (elem) {
      return _.isString(elem) && /^__MP_/.test(elem);
    });
    var intersect = _.intersection(serializeElements(targArray), serializeElements(srcVal));
    var currentIsMatch = srcVal.length === intersect.length;
    if (! currentIsMatch) {
      makeMsg(srcVal, targVal, '', "Array ${src} isn't a superset match of Array ${tgt}");
    }
    return currentIsMatch;
  }
};
