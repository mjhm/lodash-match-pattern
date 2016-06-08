var matchPattern = require('lodash-match-pattern');
var _ = matchPattern.getLodashModule();

_.mixin({
  literalSetToken: function (elem) {
    if (elem === '...') return 'LITERAL...';
    if (elem === '^^^') return 'LITERAL^^^';
    if (elem === '===') return 'LITERAL===';
    return elem;
  },

  isActiveSize: function (array, size) {
    if (! _.isArray(array)) return false;
    var activeSize = _.size(_.filter(array, 'active'));
    return activeSize === size;
  }
});


module.exports = function () {
  var self = this;
  self.Given(/^I have a basic user$/, function () {
    self.user = {
      id: 43,
      email: 'joe@matchapattern.org',
      website: 'http://matchapattern.org',
      firstName: 'Joe',
      lastName: 'Matcher',
      createDate: '2016-05-22T00:23:23.343Z',
      tvshows: [
        'Match Game',
        'Sopranos',
        'House of Cards'
      ],
      mother: {
        id: 23,
        email: "mom@aol.com"
      },
      friends: [
        {id: 21, email: 'bob@mp.co', active: true},
        {id: 89, email: 'jerry@mp.co', active: false},
        {id: 14, email: 'dan@mp.co', active: true},
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

  self.Then(/^the duplicate user matches the pattern$/, function (targetPattern) {
    var matchResult = matchPattern(self.dup, targetPattern);
    if (matchResult) throw matchResult;
  });


  self.Given(/^I change tvshows to$/, function (tvshows) {
    try {
      var tvshowsJson = JSON.parse(tvshows);
    }
    catch (err) {
      throw new Error("JSON.parse: Can't parse " + tvshows + ' ' + err.message);
    }
    self.user.tvshows = tvshowsJson;
  });

  self.Given(/^the user is duplicated$/, function () {
    self.dup = _.cloneDeep(self.user);
    self.dup.id = self.user.id + 1;
    self.dup.createDate = new Date().toISOString();
  });

};
