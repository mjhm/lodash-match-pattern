var matchPattern = require('lodash-match-pattern');

var _ = require('lodash-checkit');
_.mixin({
  literalEllipsis: function (array) {
    return array.map(function (elem) {
      if (elem === '...') return 'LITERAL...';
      if (elem === '^^^') return 'LITERAL^^^';
      if (elem === '===') return 'LITERAL===';
      return elem;
    });
  },

  isSizeAndIncludes: function (array, size, includes) {
    if (! _.isArray(array)) return false;
    if (_.size(array) !== size) return false;
    return _.includes(array, includes);
  }
});
matchPattern.use(_);


module.exports = function () {
  var self = this;
  self.Given(/^I have a basic user$/, function () {
    self.user = {
      "id": 43,
      "email": "joe@matchapattern.org",
      "website": "http://matchapattern.org",
      "firstName": "Joe",
      "lastName": "Matcher",
      "createDate": "2016-05-22T00:23:23.343Z",
      "tvshows": [
        "Match Game",
        "Sopranos",
        "House of Cards"
      ],
      "mother": {
        "id": 23,
        "email": "mom@aol.com"
      },
      "friends": [
        {"id": 21, "email": "bob@matchpattern.org", "active": true},
        {"id": 89, "email": "jerry@matchpattern.org", "active": false},
        {"id": 14, "email": "dan@matchpattern.org", "active": true},
      ]
    }
  });

  self.Given(/^I change the email to "([^"]*)"$/, function (newEmail) {
    self.user.email = newEmail;
  });

  self.Then(/^the user matches the pattern$/, function (targetPattern) {
    var matchResult = matchPattern(self.user, targetPattern);
    if (matchResult) throw matchResult;
  });

  self.Given(/^I change tvshows to$/, function (tvshows) {
    try {
      var tvshowsJson = JSON.parse(tvshows);
    }
    catch (err) {
      throw new Error("JSON.parse: Can't parse #{tvshows} " + err.message);
    }
    self.user.tvshows = tvshowsJson;
  });

};
