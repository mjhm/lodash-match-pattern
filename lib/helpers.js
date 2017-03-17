var _ = require('lodash-checkit');

var replacer = function (k, v) {
  if (_.isPlainObject(v)) {
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
  return ar.map(function (elem) {
    return _.isPlainObject(elem) ? JSON.stringify(elem, replacer) : elem;
  });
};

module.exports = {
  // These helpers fill out the src or targ object with "undefined" for missing
  // keys, so that they can be appropriately compared.
  fillSrcWithVoids: function (targObj, srcObj) {
    var newTargKeys = _.keys(_.omit(targObj, '__MP_subset'));
    return _.assign(
      _.zipObject(newTargKeys),
      targObj.hasOwnProperty('__MP_subset') ? _.pick(srcObj, newTargKeys) : srcObj
    );
  },

  fillTargWithVoids: function (targObj, srcObj) {
    return _.assign(_.zipObject(_.keys(srcObj)), _.omit(targObj, '__MP_subset'));
  },

  checkSubsetMatch: function (makeMsg, targVal, srcVal) {
    var targArray = _.reject(targVal, function (elem) {
      return _.isString(elem) && /^__MP_/.test(elem);
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
