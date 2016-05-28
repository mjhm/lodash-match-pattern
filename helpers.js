var _ = require('lodash-checkit');
var util = require('util');


module.exports = {
  // These helpers fill out the src or targ object with "undefined" for missing
  // keys, so that they can be appropriately compared.
  fillSrcWithVoids: function (targObj, srcObj) {
    var newTargKeys = _.keys(_.omit(targObj, '...'));
    return _.assign(
      _.zipObject(newTargKeys),
      targObj.hasOwnProperty('...') ? _.pick(srcObj, newTargKeys) : srcObj
    );
  },

  fillTargWithVoids: function (targObj, srcObj) {
    return _.assign(_.zipObject(_.keys(srcObj)), _.omit(targObj, '...'));
  },

  checkSupersetMatch: function (matchFailMsg, targVal, srcVal) {
    var currentIsMatch = (targVal.length - 1 === _.size(_.intersection(targVal, srcVal)));
    if (! currentIsMatch) {
      matchFailMsg.push("Array " + util.inspect(srcVal) + " isn't a superset match of Array " + util.inspect(targVal));
    }
    return currentIsMatch;
  },

  checkSubsetMatch: function (matchFailMsg, targVal, srcVal) {
    var currentIsMatch = (srcVal.length === _.size(_.intersection(targVal, srcVal)));
    if (! currentIsMatch) {
      matchFailMsg.push("Array " + util.inspect(srcVal) + " isn't a subset match of Array " + util.inspect(targVal));
    }
    return currentIsMatch;
  }
};
