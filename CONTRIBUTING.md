# Thank You in Advance

* By all means submit issues, bug reports, suggestions, etc. to the github issues page.
* I'm also especially interested in novel use cases where this tool adds value. So additional examples are very welcome.
* Let me know if you're interested in submitting a PR -- and probably start the communication with an "issue". However it's very likely that PRs that don't break the existing tests will be welcome.

### Code Structure

* index.js -- the core code, and probably a good target for refactoring.
* parser/matchpattern.pegjs -- A PEGJS parser description for the Pattern Notations, this is compiled into `_parser.js` which contains the actual parser.
* normalize.js -- processes JS Objects so that they are consistent with parsed Pattern Notation objects.
* helpers.js -- assorted helpers for `index.js`
* test/ all tests

### Testing
All tests:
```
npm test
```

Individual test files
```
mocha test/index_spec.js // for example
```

### Linting

Coming soon!
