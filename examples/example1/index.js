
module.exports = function () {
  this.user = {
    id: 43,
    email: 'joe@matchapattern.org',
    website: 'http://matchapattern.org',
    firstName: 'Joe',
    lastName: 'Matcher',
    phone: '(333) 444-5555',
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
      {id: 21, email: 'pat@mp.co', active: true},
      {id: 89, email: 'gerri@mp.co', active: false},
      {id: 14, email: 'kim@mp.co', active: true},
    ]
  };
};
