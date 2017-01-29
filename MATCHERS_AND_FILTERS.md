
# Complete List of Lodash Match Pattern Matching Functions and Added Filters

0. [Matchers from lodash and checkit modules](#matchers-from-lodash-and-checkit-modules)
0. [Additional lodash-match-pattern matchers](#additional -odash-match-pattern-matchers)
0. [Additional lodash-match-pattern filters](#additional-lodash-match-pattern-filters)

## Matchers from lodash and checkit modules
| Name | From |
| ---  | ---  |
| isAlpha | checkit "alpha" regex /^[a-z]+$/i |
| isAlphaDash | checkit "alphaDash" regex /^[a-z0-9_\-]+$/i |
| isAlphaNumeric | checkit "alphaNumeric" regex /^[a-z0-9]+$/i |
| isAlphaUnderscore | checkit "alphaUnderscore" regex /^[a-z0-9_]+$/i |
| isArguments | lodash [isArguments](https://lodash.com/docs/#isArguments) |
| isArray | lodash [isArray](https://lodash.com/docs/#isArray) |
| isArrayBuffer | lodash [isArrayBuffer](https://lodash.com/docs/#isArrayBuffer) |
| isArrayLike | lodash [isArrayLike](https://lodash.com/docs/#isArrayLike) |
| isArrayLikeObject | lodash [isArrayLikeObject](https://lodash.com/docs/#isArrayLikeObject) |
| isBase64 | checkit "base64" regex /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==&#124;[A-Za-z0-9+\/]{3}=)?$/ |
| isBetween | checkit validator [between](https://github.com/tgriesser/checkit#available-validators) |
| isBoolean | lodash [isBoolean](https://lodash.com/docs/#isBoolean) |
| isBuffer | lodash [isBuffer](https://lodash.com/docs/#isBuffer) |
| isCamelCase | lodash [camelCase](https://lodash.com/docs/#camelCase) |
| isContainerFor | checkit validator [contains](https://github.com/tgriesser/checkit#available-validators) |
| isDate | lodash [isDate](https://lodash.com/docs/#isDate) |
| isDifferent | checkit validator [different](https://github.com/tgriesser/checkit#available-validators) |
| isElement | lodash [isElement](https://lodash.com/docs/#isElement) |
| isEmail | checkit "email" regex /^(.+)@(.+)\.(.+)$/i |
| isEmpty | lodash [isEmpty](https://lodash.com/docs/#isEmpty) |
| isEqual | lodash [isEqual](https://lodash.com/docs/#isEqual) |
| isEqualWith | lodash [isEqualWith](https://lodash.com/docs/#isEqualWith) |
| isError | lodash [isError](https://lodash.com/docs/#isError) |
| isExactLength | checkit validator [exactLength](https://github.com/tgriesser/checkit#available-validators) |
| isExists | checkit validator [exists](https://github.com/tgriesser/checkit#available-validators) |
| isFinite | lodash [isFinite](https://lodash.com/docs/#isFinite) |
| isFunction | lodash [isFunction](https://lodash.com/docs/#isFunction) |
| isGreaterThan | checkit validator [greaterThan](https://github.com/tgriesser/checkit#available-validators) |
| isGreaterThanEqualTo | checkit validator [greaterThanEqualTo](https://github.com/tgriesser/checkit#available-validators) |
| isInRange | checkit validator [range](https://github.com/tgriesser/checkit#available-validators) |
| isInteger | lodash [isInteger](https://lodash.com/docs/#isInteger) |
| isIpv4 | checkit "ipv4" regex /^((25[0-5]&#124;2[0-4][0-9]&#124;1[0-9]{2}&#124;[0-9]{1,2})\.){3}(25[0-5]&#124;2[0-4][0-9]&#124;1[0-9]{2}&#124;[0-9]{1,2})$/i |
| isIpv6 | checkit "ipv6" regex /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:&#124;\b)&#124;){5}&#124;([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::&#124;:\b&#124;$))&#124;(?!\2\3)){2}&#124;(((2[0-4]&#124;1\d&#124;[1-9])?\d&#124;25[0-5])\.?\b){4})$/i |
| isKebabCase | lodash [kebabCase](https://lodash.com/docs/#kebabCase) |
| isLength | lodash [isLength](https://lodash.com/docs/#isLength) |
| isLessThan | checkit validator [lessThan](https://github.com/tgriesser/checkit#available-validators) |
| isLessThanEqualTo | checkit validator [lessThanEqualTo](https://github.com/tgriesser/checkit#available-validators) |
| isLowerCase | lodash [lowerCase](https://lodash.com/docs/#lowerCase) |
| isLuhn | checkit "luhn" regex /^(?:4[0-9]{12}(?:[0-9]{3})?&#124;5[1-5][0-9]{14}&#124;6(?:011&#124;5[0-9][0-9])[0-9]{12}&#124;3[47][0-9]{13}&#124;3(?:0[0-5]&#124;[68][0-9])[0-9]{11}&#124;(?:2131&#124;1800&#124;35\d{3})\d{11})$/ |
| isMap | lodash [isMap](https://lodash.com/docs/#isMap) |
| isMatch | lodash [isMatch](https://lodash.com/docs/#isMatch) |
| isMatchWith | lodash [isMatchWith](https://lodash.com/docs/#isMatchWith) |
| isMaxLength | checkit validator [maxLength](https://github.com/tgriesser/checkit#available-validators) |
| isMinLength | checkit validator [minLength](https://github.com/tgriesser/checkit#available-validators) |
| isNaN | lodash [isNaN](https://lodash.com/docs/#isNaN) |
| isNative | lodash [isNative](https://lodash.com/docs/#isNative) |
| isNatural | checkit "natural" regex /^[0-9]+$/i |
| isNaturalNonZero | checkit "naturalNonZero" regex /^[1-9][0-9]*$/i |
| isNil | lodash [isNil](https://lodash.com/docs/#isNil) |
| isNotAlpha | not "isAlpha" |
| isNotAlphaDash | not "isAlphaDash" |
| isNotAlphaNumeric | not "isAlphaNumeric" |
| isNotAlphaUnderscore | not "isAlphaUnderscore" |
| isNotBase64 | not "isBase64" |
| isNotBetween | not "isBetween" |
| isNotCamelCase | not "isCamelCase" |
| isNotContainerFor | not "isContainerFor" |
| isNotDifferent | not "isDifferent" |
| isNotEmail | not "isEmail" |
| isNotExactLength | not "isExactLength" |
| isNotExists | not "isExists" |
| isNotGreaterThan | not "isGreaterThan" |
| isNotGreaterThanEqualTo | not "isGreaterThanEqualTo" |
| isNotInRange | not "isInRange" |
| isNotIpv4 | not "isIpv4" |
| isNotIpv6 | not "isIpv6" |
| isNotKebabCase | not "isKebabCase" |
| isNotLessThan | not "isLessThan" |
| isNotLessThanEqualTo | not "isLessThanEqualTo" |
| isNotLowerCase | not "isLowerCase" |
| isNotLuhn | not "isLuhn" |
| isNotMaxLength | not "isMaxLength" |
| isNotMinLength | not "isMinLength" |
| isNotNatural | not "isNatural" |
| isNotNaturalNonZero | not "isNaturalNonZero" |
| isNotNumeric | not "isNumeric" |
| isNotRequired | not "isRequired" |
| isNotSnakeCase | not "isSnakeCase" |
| isNotStartCase | not "isStartCase" |
| isNotUpperCase | not "isUpperCase" |
| isNotUrl | not "isUrl" |
| isNotUuid | not "isUuid" |
| isNull | lodash [isNull](https://lodash.com/docs/#isNull) |
| isNumber | lodash [isNumber](https://lodash.com/docs/#isNumber) |
| isNumeric | checkit validator [numeric](https://github.com/tgriesser/checkit#available-validators) |
| isObject | lodash [isObject](https://lodash.com/docs/#isObject) |
| isObjectLike | lodash [isObjectLike](https://lodash.com/docs/#isObjectLike) |
| isPlainObject | lodash [isPlainObject](https://lodash.com/docs/#isPlainObject) |
| isRegExp | lodash [isRegExp](https://lodash.com/docs/#isRegExp) |
| isRequired | checkit validator [required](https://github.com/tgriesser/checkit#available-validators) |
| isSafeInteger | lodash [isSafeInteger](https://lodash.com/docs/#isSafeInteger) |
| isSet | lodash [isSet](https://lodash.com/docs/#isSet) |
| isSnakeCase | lodash [snakeCase](https://lodash.com/docs/#snakeCase) |
| isStartCase | lodash [startCase](https://lodash.com/docs/#startCase) |
| isString | lodash [isString](https://lodash.com/docs/#isString) |
| isSymbol | lodash [isSymbol](https://lodash.com/docs/#isSymbol) |
| isTypedArray | lodash [isTypedArray](https://lodash.com/docs/#isTypedArray) |
| isUndefined | lodash [isUndefined](https://lodash.com/docs/#isUndefined) |
| isUpperCase | lodash [upperCase](https://lodash.com/docs/#upperCase) |
| isUrl | checkit "url" regex /^((http&#124;https):\/\/(\w+:{0,1}\w*@)?(\S+)&#124;)(:[0-9]+)?(\/&#124;\/([\w#!:.?+=&%@!\-\/]))?$/ |
| isUuid | checkit "uuid" regex /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i |
| isWeakMap | lodash [isWeakMap](https://lodash.com/docs/#isWeakMap) |
| isWeakSet | lodash [isWeakSet](https://lodash.com/docs/#isWeakSet) |

## Additional lodash-match-pattern matchers
| Name | From |
| ---  | ---  |
| isDateString | is parsable into a valid date |
| isDefined | any defined value including null |
| isEqualToMemo | s -> _.isEqualToMemo&#124;key -> memo.hash.key === s |
| isNotEqualToMemo | s -> _.isNotEqualToMemo&#124;key -> memo.hash.key !== s |
| isOmitted | alias for _.isUndefined |
| isPrinted | the most useful function; prints and returns true |
| isSetAsMemo | s -> _.isSetAsMemo&#124;key -> true  and sets memo.hash.key = s |
| isSize | s -> _.isSize&#124;n -> _.size(s) === n |

## Additional lodash-match-pattern filters
| Name | From |
| ---  | ---  |
| clearMemos | clears memo.hash |
| extractUrls | extracts URLs from a string into an array |
| filterPattern | use a lodash-match-pattern as a filter argument |
| setMemo | s -> _.setMemo&#124;key -> s  and sets memo.hash.key = s |
