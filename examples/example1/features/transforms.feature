Feature: Transform Functionality

  Background:
    Given I have a basic user

  Scenario: Match unsorted arrays via a _.sortBy transform
    Then the user matches the pattern
    """
    {
      friends: {
        <-.sortBy|email: [
          {id: 89, email: 'gerri@mp.co', active: false},
          {id: 14, email: 'kim@mp.co', active: true},
          {id: 21, email: 'pat@mp.co', active: true}
        ]
      },
      ...
    }
    """

Scenario: Map transform checks that the email addresses are all from the "mp.co" domain
  Then the user matches the pattern
    """
    {
      friends: {
        <=: { email: /@mp.co$/, ...}
      },
      ...
    }
    """

Scenario: Check that all addresses from the friends list are contained in a whitelist
  Then the user matches the pattern
    """
    {
      friends: {
        <=.get|email: {
          <=.toLower: [
            'pat@mp.co',
            'gerri@mp.co',
            'kim@mp.co',
            'paula@mp.co',
            ^^^
          ]
        }
      },
      ...
    }
    """

Scenario: Composition example. Match size of the filtered friends list in 4 different ways
  Then the user matches the pattern
    """
    {
      friends: {
        <-.filter|active: {
          <-.size: 2,
          <-: _.isSize|2,
          <-.isSize|2: true
        },
        <=.get|active: {
          <=.toNumber: {
            <-.sum: 2
          }
        }
      },
      ...
    }
    """
