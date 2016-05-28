var _ = require('lodash-checkit');

var normalizeObject = function (obj) {
  if (_.isArray(obj)) {
    return normalizeArray(obj);
  }
  if (_.isFunction(obj)) {
    return obj;
  }
  if (_.isObject(obj)) {
    var normedKeys = _.mapKeys(obj, function (val, key) {
      if (key === '<-') return '__MP_apply';
      if (key === '<=') return '__MP_map';
      if (key === '...') return '__MP_subset';
      var applyMatch = key.match(/\<\-\.(.+)$/);
      if (applyMatch) return '__MP_apply ' + applyMatch[1];
      var mapMatch = key.match(/\<\=\.(.+)$/);
      if (mapMatch) return '__MP_map ' + mapMatch[1];
      return key;
    });
    return _.mapValues(normedKeys, function (val, key) {
      if (key === '__MP_subset') return '';
      if (/^_\.is/.test(val)) return '__MP_match ' + val.slice(2);
      return normalizeObject(val);
    })
  }
  return obj;
};

var normalizeArray = function (arr) {
  var normArr = arr.map(function (obj) {
    return normalizeObject(obj);
  });
  var ilast = normArr.length - 1;
  var last = normArr[ilast] || null;
  if (last === '...') normArr[ilast] = '__MP_subset'
  if (last === '^^^') normArr[ilast] = '__MP_superset'
  if (last === '===') normArr[ilast] = '__MP_equalset'
  return normArr;
};

module.exports = normalizeObject;
