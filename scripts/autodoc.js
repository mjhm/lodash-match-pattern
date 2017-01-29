
var fs = require('fs');
var rewire = require('rewire');
var _ = rewire('lodash-checkit');


var lodashNativeDict = _.__get__('lodashNativeDict');
var checkitRegexDict = _.__get__('checkitRegexDict');
var checkitOtherDict = _.__get__('checkitOtherDict');
var lodashCaseDict = _.__get__('lodashCaseDict');
var notDict = _.__get__('notDict');

var all = _.assign({}, lodashNativeDict, checkitRegexDict, checkitOtherDict, lodashCaseDict, notDict);


var mixinLines = fs.readFileSync(__dirname + '/../lib/mixins.js', 'utf8').split(/\n/);

var mixins = {};
var lastComment = null;
mixinLines.forEach(function (line) {
  var fnName = lastComment ? (line.match(/^\s+(\w+)\:/) || [])[1] : null;
  if (fnName) {
    mixins[fnName] = lastComment.replace(/\|/g, '&#124;');
  }
  var commentMatch = line.match(/^\s+\/\/\s*(.*)/);
  lastComment = commentMatch ? commentMatch[1] : null;
});

var out = [ fs.readFileSync(__dirname + '/DOC_HEAD.md', 'utf8') ];

out.push(
  '## Matchers from lodash and checkit modules',
  '| Name | From |',
  '| ---  | ---  |'
);

Object.keys(all).sort().forEach(function (fnName) {
  out.push('| ' + fnName + ' | ' + all[fnName] + ' |');
});
out.push('');

out.push(
  '## Additional lodash-match-pattern matchers',
  '| Name | From |',
  '| ---  | ---  |'
);

Object.keys(mixins).filter(function (fn) { return /^is/.test(fn); }).sort().forEach(function (fn) {
  out.push('| ' + fn + ' | ' + mixins[fn] + ' |');
});
out.push('');

out.push(
  '## Additional lodash-match-pattern filters',
  '| Name | From |',
  '| ---  | ---  |'
);

Object.keys(mixins).filter(function (fn) { return !/^is/.test(fn); }).sort().forEach(function (fn) {
  out.push('| ' + fn + ' | ' + mixins[fn] + ' |');
});
out.push('');




fs.writeFileSync('./MATCHERS_AND_FILTERS.md', out.join('\n'));
