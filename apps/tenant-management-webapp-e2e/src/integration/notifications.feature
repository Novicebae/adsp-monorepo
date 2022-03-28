@notifications
Feature: Notifications

    @TEST_CS-945 @REQ_CS-641 @REQ_CS-788 @REQ_CS-979 @REQ_CS-1068 @regression
    Scenario: As a service owner, I can add/edit/delete Notification Types
        Given a tenant admin user is on notification overview page
        When the user clicks Add notification type button
        Then the user views Add notification type modal
        When the user enters "autotest-addNotificationType", "autotest notification desc", "Anyone (Anonymous)", "yes" on notification type modal
        And the user clicks save button
        Then the user "views" the notification type card of "autotest-addNotificationType", "autotest notification desc", "Anyone (Anonymous)", "yes", "yes"
        # Verify there is Add notification button on the notification type page as well after saving a new notification type
        And the user views Add notification type button on Notification types page
        When the user clicks "edit" button for the notification type card of "autotest-addNotificationType"
        Then the user views Edit notification type modal for "autotest-addNotificationType"
        When the user enters "autotest-editNotificationType", "Edited notification type desc", "auto-test-role1, file-service-admin", "no" on notification type modal
        And the user clicks save button
        Then the user "views" the notification type card of "autotest-editNotificationType", "Edited notification type desc", "auto-test-role1, file-service-admin", "no", "no"
        When the user clicks "delete" button for the notification type card of "autotest-editNotificationType"
        Then the user views delete "notification type" confirmation modal for "autotest-editNotificationType"
        When the user clicks Delete button in delete confirmation modal
        Then the user "should not view" the notification type card of "autotest-editNotificationType", "Edited notification type desc", "auto-test-role1, file-service-admin", "no", "no"

    # TEST DATA: a precreated notification type named "autotest-notificationType"
    @TEST_CS-949 @REQ_CS-277 @regression
    Scenario: As a service owner, I can add and delete events of a notification type
        Given a tenant admin user is on notification types page
        # Add an event and verify the event can't be added again
        When the user clicks Select event button for "autotest-notificationType"
        Then the user views Select an event modal
        When the user selects "tenant-service:tenant-created" in the event dropdown
        And the user clicks Next button on Select an event page
        Then the user views Add an email template page
        When the user enters "autotest subject" as subject and "autotest body" as body
        And the user clicks Add button in Add an email template page
        Then the user "views" the event of "tenant-service:tenant-created" in "autotest-notificationType"
        When the user clicks Select event button for "autotest-notificationType"
        Then the user views Select an event modal
        When the user cannot select "tenant-service:tenant-created" in the event dropdown
        And the user clicks Cancel button in Select an event modal
        # Delete an event
        When the user clicks "delete" button for "tenant-service:tenant-created" in "autotest-notificationType"
        Then the user views delete "event" confirmation modal for "tenant-service:tenant-created"
        When the user clicks Delete button in delete confirmation modal
        Then the user "should not view" the event of "tenant-service:tenant-created" in "autotest-notificationType"

    @TEST_CS-976 @REQ_CS-906 @regression
    Scenario: Test the registration of notification type in status service for application health change
        Given a tenant admin user is on notification types page
        # Verify the type and its events
        Then the user "views" the notification type card of "Application health check change"
        And the user "views" the event of "status-service:health-check-started" in "Application health check change"
        And the user "views" the event of "status-service:health-check-stopped" in "Application health check change"
        And the user "views" the event of "status-service:application-unhealthy" in "Application health check change"
        And the user "views" the event of "status-service:application-healthy" in "Application health check change"
        # Verify the events' email icons and preview links, and no edit buttons
        And the user "views" "email template indicator" for "status-service:health-check-started" in "Application health check change"
        And the user "views" "Preview link" for "status-service:health-check-started" in "Application health check change"
        And the user "views" "Edit button" for "status-service:health-check-started" in "Application health check change"
        And the user "views" "email template indicator" for "status-service:health-check-stopped" in "Application health check change"
        And the user "views" "Preview link" for "status-service:health-check-stopped" in "Application health check change"
        And the user "views" "Edit button" for "status-service:health-check-stopped" in "Application health check change"
        And the user "views" "email template indicator" for "status-service:application-unhealthy" in "Application health check change"
        And the user "views" "Preview link" for "status-service:application-unhealthy" in "Application health check change"
        And the user "views" "Edit button" for "status-service:application-unhealthy" in "Application health check change"
        And the user "views" "email template indicator" for "status-service:application-healthy" in "Application health check change"
        And the user "views" "Preview link" for "status-service:application-healthy" in "Application health check change"
        And the user "views" "Edit button" for "status-service:application-healthy" in "Application health check change"
        # Verify email template is read-only (pick one event)
        When the user clicks Preview button on "status-service:health-check-started" in "Application health check change"
        Then the user views Preview an email template modal
        # Future work: need in-depth research on test automation with Monaco-editor before we can automate test steps.
        # When the user attempts to edit the template
        # Then the user gets "Cannot edit in read-only editor"
        When the user clicks Close button in Preview an email template modal
        Then Preview an email template modal is closed
        # Verify the event is still there (had a bug of the event disappearing after preview)
        And the user "views" the event of "status-service:health-check-started" in "Application health check change"

    @TEST_CS-976 @REQ_CS-906 @regression
    Scenario: Test the registration of notification type in status service for application health change
        Given a tenant admin user is on notification types page
        # Verify the type and its events
        Then the user "views" the notification type card of "Application health check change"
        And the user "views" the event of "status-service:health-check-started" in "Application health check change"
        And the user "views" the event of "status-service:health-check-stopped" in "Application health check change"
        And the user "views" the event of "status-service:application-unhealthy" in "Application health check change"
        And the user "views" the event of "status-service:application-healthy" in "Application health check change"
        # Verify the events' email icons and preview links, and no edit buttons
        And the user "views" "email template indicator" for "status-service:health-check-started" in "Application health check change"
        And the user "views" "Edit button" for "status-service:health-check-started" in "Application health check change"
        And the user "views" "email template indicator" for "status-service:health-check-stopped" in "Application health check change"
        And the user "views" "Edit button" for "status-service:health-check-stopped" in "Application health check change"
        And the user "views" "email template indicator" for "status-service:application-unhealthy" in "Application health check change"
        And the user "views" "Edit button" for "status-service:application-unhealthy" in "Application health check change"
        And the user "views" "email template indicator" for "status-service:application-healthy" in "Application health check change"
        And the user "views" "Edit button" for "status-service:application-healthy" in "Application health check change"
    # Verify email template is read-only (pick one event)
    # Future work: need in-depth research on test automation with Monaco-editor before we can automate test steps.
    # When the user attempts to edit the template
    # Then the user gets "Cannot edit in read-only editor"
    # Verify the event is still there (had a bug of the event disappearing after preview)

    @TEST_CS-1081 @REQ_CS-1029 @TEST_CS-1002 @REQ_CS-1027 @regression
    Scenario: Test As a tenant admin, I can delete a subscription
        # Autotest user should be already subscribed to application health change notifications. If not, set it to subscribed
        Given a tenant admin user is on status applications page
        When the user "selects" the subscribe checkbox for health check notification type
        Then the user views the subscribe checkbox is "checked"
        # Test subscription deletion
        Given a tenant admin user is on notification subscriptions page
        When the user types "Auto Test" in Search subuscriber address as field and "auto.test@gov.ab.ca" in Search subscriber email field
        And the user clicks Search button on notifications page
        Then the user "views" the subscription of "Auto Test", "auto.test@gov.ab.ca" under "Application health check change"
        When the user clicks delete button of "Auto Test", "auto.test@gov.ab.ca" under "Application health check change"
        Then the user views Delete subscription modal
        And the user views the Delete subscription confirmation message of "auto.test@gov.ab.ca"
        When the user clicks Confirm button on Delete subscription modal
        Then the user "should not view" the subscription of "Auto Test", "auto.test@gov.ab.ca" under "Application health check change"
        # Restore the subscription
        Given a tenant admin user is on status applications page
        Then the user views the subscribe checkbox is "unchecked"
        When the user "selects" the subscribe checkbox for health check notification type
        Then the user views a callout message of "You are subscribed! You will receive notifications on auto.test@gov.ab.ca for status-application-health-change"

    @TEST_CS-986 @TEST_CS-443 @REQ_CS-1068 @REQ_CS-963 @REQ_CS-978 @regression
    Scenario: As a tenant admin, I can see notification type for application status change updates
        Given a tenant admin user is on notification types page
        Then the user "views" the notification type card of "Application status update"
        And the user views "Application status update" has self-service-allowed attribute is "yes"
        # Verify the events' email template indicator, preview link and edit button
        And the user "views" the event of "status-service:application-status-changed" in "Application status update"
        And the user "views" the event of "status-service:application-notice-published" in "Application status update"
        And the user "views" "email template indicator" for "status-service:application-status-changed" in "Application status update"
        And the user "views" "Preview link" for "status-service:application-status-changed" in "Application status update"
        And the user "views" "Edit button" for "status-service:application-status-changed" in "Application status update"
        And the user "views" "email template indicator" for "status-service:application-notice-published" in "Application status update"
        And the user "views" "Preview link" for "status-service:application-notice-published" in "Application status update"
        And the user "views" "Edit button" for "status-service:application-notice-published" in "Application status update"
        When the user clicks Preview button on "status-service:application-status-changed" in "Application status update"
        Then the user views Preview an email template modal
        When the user clicks Close button in Preview an email template modal
        Then Preview an email template modal is closed
        When the user clicks Preview button on "status-service:application-notice-published" in "Application status update"
        Then the user views Preview an email template modal
        When the user clicks Close button in Preview an email template modal
        Then Preview an email template modal is closed
    @TEST_CS-986 @TEST_CS-443 @REQ_CS-1068 @REQ_CS-963 @REQ_CS-978 @regression
    Scenario: As a tenant admin, I can see notification type for application status change updates
        Given a tenant admin user is on notification types page
        Then the user "views" the notification type card of "Application status update"
        And the user views "Application status update" has self-service-allowed attribute is "yes"
        # Verify the events' email template indicator, preview link and edit button
        And the user "views" the event of "status-service:application-status-changed" in "Application status update"
        And the user "views" the event of "status-service:application-notice-published" in "Application status update"
        And the user "views" "email template indicator" for "status-service:application-status-changed" in "Application status update"
        And the user "views" "Edit button" for "status-service:application-status-changed" in "Application status update"
        And the user "views" "email template indicator" for "status-service:application-notice-published" in "Application status update"
        And the user "views" "Edit button" for "status-service:application-notice-published" in "Application status update"

    @TEST_CS-1097 @REQ_CS-1031 @regression
    Scenario: As a tenant admin, I can find subscriptions for a particular subscriber
        Given a tenant admin user is on notification subscribers page
        When the user searches subscribers with "address as" containing "auto"
        Then the user views all the subscribers with "address as" containing "auto"
        When the user searches subscribers with "email" containing "auto.Test"
        Then the user views all the subscribers with "email" containing "auto.Test"
        When the user searches subscribers with address as containing "auto test" and email containing "auto.test"
        Then the user views subscribers with "address as" containing "auto test" and "email" containing "auto.test"
        When the user expands the subscription list for the subscriber of "Auto Test" and "auto.test@gov.ab.ca"
        Then the user views the subscription of "status-application-health-change" for the subscriber of "Auto Test" and "auto.test@gov.ab.ca"

    @TEST_CS-1224 @REQ_CS-1183 @regression
    Scenario: As a tenant admin, I can delete a subscriber
        # Autotest user should be already subscribed to application health change notifications. If not, set it to subscribed
        Given a tenant admin user is on status applications page
        When the user "selects" the subscribe checkbox for health check notification type
        Then the user views the subscribe checkbox is "checked"
        # Test subscriber deletion
        Given a tenant admin user is on notification subscribers page
        When the user searches subscribers with address as containing "Auto Test" and email containing "auto.test@gov.ab.ca"
        Then the user "views" the subscriber of "Auto Test", "auto.test@gov.ab.ca"
        When the user clicks delete button of "Auto Test", "auto.test@gov.ab.ca" on subscribers page
        Then the user views Delete subscriber modal
        # The validation of delete confirmation modal content is skipped due to the bug of CS-1266
        # And the user views the Delete subscriber confirmation message of "auto.test@gov.ab.ca"
        When the user clicks Delete button on Delete subscriber modal
        Then the user "should not view" the subscriber of "Auto Test", "auto.test@gov.ab.ca"
        When the user selects "Subscriptions" tab for "Notifications"
        Then the user "should not view" the subscription of "Auto Test", "auto.test@gov.ab.ca" under "Status-Application-Health-Change"
        # Restore the subscription
        Given a tenant admin user is on status applications page
        Then the user views the subscribe checkbox is "unchecked"
        When the user "selects" the subscribe checkbox for health check notification type
        Then the user views a callout message of "You are subscribed! You will receive notifications on auto.test@gov.ab.ca for status-application-health-change"

    @TEST_CS-1191 @REQ_CS-1148 @regression
    Scenario Outline: As a tenant admin, I can configure subscription management contact information on notifications overview page
        Given a tenant admin user is on notification overview page
        When the user clicks edit button for contact information
        Then the user views Edit contact information modal
        When the user enters "<Email>", "<Phone>" and "<Instructions>" in Edit contact information modal
        And the user clicks Save button in Edit contact information modal
        Then the user views contact information of "<Email>", "<Phone>" and "<Instructions>" on notifications page
        # In the step definition, rnd{} will use a random 4-digit number to attach/replace part of the static strings in {}
        Examples:
            | Email              | Phone                 | Instructions  |
            | rnd{abc@gov.ab.ca} | rnd{1 (780) 567-1456} | rnd{autotest} |

    @TEST_CS-1282 @REQ_CS-905 @regression
    Scenario: As an interested stakeholder, I can verify status notifications for a tenant, so that I know about service availability.
        Given a tenant admin user is on notification subscribers page
        When the user searches subscribers with address as containing "Auto Test" and email containing "auto.test@gov.ab.ca"
        Given a tenant admin user is on status applications page
        Then the user "views" "Autotest" in the application list
        # ###Change status from empty to outage and verify the even
        # When the user clicks Change status button for "autotest-status-change-event"
        # Then the user views Manual status change modal
        # When the user selects "Outage" and clicks Save button
        #     Then the user views the "Outage" status for "autotest-status-change-event"
        #  When the user waits "20" seconds
        And the user selects the "Event log" menu item
        Then the "Event log" landing page is displayed
        When the user searches with "status-service:application-status-changed", "now-2mins" as minimum timestamp, "now+2mins" as maximum timestamp
        # And the user clicks Show details button for the latest event of "application-status-changed" for "status-service"
        # Then the user views the event details with status changing from "Empty" to "Outage"

        When the user selects the "Status" menu item
        And the user selects "Applications" tab for "Status"
        Then the user "views" "autotest-status-change-event" in the application list
        When the user clicks "Delete" button for "autotest-status-change-event"
        Then the user views delete "application" confirmation modal for "autotest-status-change-event"
        When the user clicks Delete button in delete confirmation modal
        Then the user "should not view" "autotest-status-change-event" in the application list
