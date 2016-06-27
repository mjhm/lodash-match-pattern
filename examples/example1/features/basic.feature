Feature: Basic Features for lodash-match-pattern

  Background:
    Given I have a basic user

  Scenario: The user object matches a copy of itself.
    Then the user matches the pattern
    """
    {
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
        email: 'mom@aol.com'
      },
      friends: [
        {id: 21, email: 'pat@mp.co', active: true},
        {id: 89, email: 'gerri@mp.co', active: false},
        {id: 14, email: 'kim@mp.co', active: true}
      ]
    }
    """

  Scenario: The user object matches its property types.
    Then the user matches the pattern
    """
    {
      id: _.isInteger,
      email: _.isEmail,
      website: _.isUrl,
      firstName: /[A-Z]\w+/,
      lastName: /[a-z]/i,
      phone: /\(\d{3}\)\s*\d{3}[- ]\d{4}/,
      createDate: _.isDateString,
      tvshows: [
        _.isString,
        _.isString,
        _.isString
      ],
      mother: _.isObject,
      friends: _.isArray
    }
    """

  Scenario: Partial match example -- change the user email
    Given I change the email to "billyjoe@duckduck.go"
    Then the user matches the pattern
    """
    {
      id: _.isInteger,
      email: 'billyjoe@duckduck.go'
      ...
    }
    """

  Scenario: Partial match of array
    Then the user matches the pattern
    """
    {
      tvshows: [
        'House of Cards',
        'Sopranos'
        ...
      ]
      ...
    }
    """

  Scenario: Superset match of array
    Then the user matches the pattern
    """
    {
      tvshows: [
        'House of Cards',
        'Match Game',
        'Sopranos',
        "Grey's Anatomy"
        ^^^
      ]
      ...
    }
    """

  Scenario: Omit the password
    Then the user matches the pattern
    """
    {
      id: 43,
      password: _.isOmitted
      ...
    }
    """

  Scenario: Use parameters in a matcher
    Then the user matches the pattern
    """
    {
      id: _.isBetween|42.9|43.1,
      tvshows: _.isContainerFor|'House of Cards',
      ...
    }
    """
