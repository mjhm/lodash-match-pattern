var _ = require('lodash-checkit');

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
    var currentIsMatch = (targVal.length - 1 === _.size(_.intersection(targVal, srcVal)));
    if (! currentIsMatch) {
      makeMsg(srcVal, targVal, '', "Array ${src} isn't a subset match of Array ${tgt}");
    }
    return currentIsMatch;
  },

  checkSupersetMatch: function (makeMsg, targVal, srcVal) {
    var currentIsMatch = (srcVal.length === _.size(_.intersection(targVal, srcVal)));
    if (! currentIsMatch) {
      makeMsg(srcVal, targVal, '', "Array ${src} isn't a superset match of Array ${tgt}");
    }
    return currentIsMatch;
  }
};
