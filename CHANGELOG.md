
#### 2.1.0
* Upgraded dependencies and removed obsolete dev modules. Breaking changes are unlikely.

#### 2.0.1
* Upgraded all dependencies. Breaking changes are unlikely.

#### 1.3.1
* Fixed https://github.com/Originate/lodash-match-pattern/issues/34 so that array set matches can work with objects other than numbers and strings.

#### 1.2.0
* Added `_.isDefined` and included complete list of matchers and custom filters.

#### 1.1.0
* Added third parameter to lodash collection methods 'every', 'filter', 'find', 'findLast', 'partition', 'reject', 'some' to simplify specifications of filtering on a shortcut predicate.

#### 1.0.0
* update dependencies
  * breaking change from `lodash-checkit` -- bug fixed so that `lodash` functions take precedence over derived `isXXX` functions from `checkit`
* added commenting via `#` in patterns

#### 0.2.0
* update dependencies (minor breaking change from 'checkit')
* `_.isPrinted` object depth increased from 2 to 10
* mv tonic_example.js

#### 0.1.12
* add dependency-lint
* add coverage

#### 0.1.11
* fix filterPattern bug
* tonic example
* README updates

#### 0.1.10
* Fixed regex bugs
* Simplified and improved README.md
* Added mocha example files
* Allow skipping comma before `...`
* ESLinting

#### 0.1.9
* Allow "has" prefixes
* Better syntax error indicator

#### 0.1.8
* Misc documentation fixes
* Better error messaging with error location and `chalk`
* Added `extractUrls` to lodash mixins.
