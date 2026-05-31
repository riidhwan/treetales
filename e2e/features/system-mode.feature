Feature: System Mode mobile installation
  Background:
    Given the mobile install choice has not been dismissed

  Scenario: Android Edge users wait for the native install prompt event
    Given I am viewing the mobile install choice
    Then the install action is disabled
    When I try the disabled install action
    Then TreeTales keeps waiting for the native install prompt
    And TreeTales does not show manual install instructions

  Scenario: Install action calls the deferred browser install prompt
    Given I am viewing the mobile install choice
    When the browser install prompt becomes available and will be accepted
    And I choose to install the app
    Then TreeTales calls the browser install prompt once
    And TreeTales opens the Story dashboard
    And TreeTales remembers that the mobile install choice was accepted

  Scenario: Dismissing the native prompt keeps the install choice visible
    Given I am viewing the mobile install choice
    When the browser install prompt becomes available and will be dismissed
    And I choose to install the app
    Then TreeTales calls the browser install prompt once
    And TreeTales keeps the mobile install choice visible after dismissal
    And TreeTales has not remembered the mobile install choice
