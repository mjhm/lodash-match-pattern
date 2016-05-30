Feature: Basic chai-match-pattern

  Background:
    Given I have a basic user

  Scenario: The user object matches a copy of itself.
    Then the user matches the pattern
    """
    {
      id: 43,
      email: "joe@matchapattern.org",
      website: "http://matchapattern.org",
      firstName: "Joe",
      lastName: "Matcher",
      createDate: "2016-05-22T00:23:23.343Z",
      tvshows: [
        "Match Game",
        "Sopranos",
        "House of Cards"
      ],
      mother: {
        id: 23,
        email: "mom@aol.com"
      },
      friends: [
        {id: 21, email: "bob@matchpattern.org", active: true},
        {id: 89, email: "jerry@matchpattern.org", active: false},
        {id: 14, email: "dan@matchpattern.org", active: true}
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
      firstName: /[A-Z][a-z]+/,
      lastName: _.isString,
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
    Given I change the email to "billybob@duckduck.go"
    Then the user matches the pattern
    """
    {
      id: _.isInteger,
      email: "billybob@duckduck.go",
      ...
    }
    """

  Scenario: Partial match of array
    Then the user matches the pattern
    """
    {
      tvshows: [
        "House of Cards",
        "Sopranos",
        ...
      ],
      ...
    }
    """

  Scenario: Superset match of array
    Then the user matches the pattern
    """
    {
      tvshows: [
        "House of Cards",
        "Match Game",
        "Sopranos",
        "Grey's Anatomy",
        ^^^
      ],
      ...
    }
    """

  Scenario: Omit the password
    Then the user matches the pattern
    """
    {
      id: 43,
      password: _.isOmitted,
      ...
    }
    """

  Scenario: Parameterized matchers example
    Then the user matches the pattern
    """
    {
      id: _.isBetween|42.9|43.1,
      tvshows: _.isContainerFor|"House of Cards",
      ...
    }
    """

  Scenario: Unsorted arrays via equalset or transform function.
    Then the user matches the pattern
    """
    {
      tvshows: [
        "Sopranos",
        "House of Cards",
        "Match Game",
        ===
      ],
      friends: {
        <-.sortBy|email: [
          {id: 21, email: "bob@matchpattern.org", active: true},
          {id: 14, email: "dan@matchpattern.org", active: true},
          {id: 89, email: "jerry@matchpattern.org", active: false}
        ]
      },
      ...
    }
    """

Scenario: Unsorted array variation with "<-.map" transform
  Then the user matches the pattern
  """
    {
      friends: {
        <-.map|email: [
          "bob@matchpattern.org",
          "dan@matchpattern.org",
          "jerry@matchpattern.org",
          ===
        ]
      },
      ...
    }
  """



  Scenario: Check the size of arrays with the "_.size" transform.
    Then the user matches the pattern
    """
      {
        friends: {
          <-.size: 3
        },
        ...
      }
    """


  Scenario: Transforms may be composed
    Then the user matches the pattern
    """
      {
        friends: {
          <-.filter|active: {
            <-.size: 2
          }
        },
        ...
      }
    """

  Scenario: Multiple tests can be performed using multiple map or apply functions
    Then the user matches the pattern
    """
      {
        tvshows: {
          <- : _.isSize|3,
          <- : _.isContainerFor|Sopranos
        },
        ...
      }
    """

  Scenario: Use custom matcher to do the same check as above
    Then the user matches the pattern
    """
      {
        tvshows: _.isSizeAndIncludes|3|Sopranos,
        ...
      }
    """
