import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps';
import commonlib from '../common/common-library';
import common from '../common/common.page';
import NotificationsPage from './notifications.page';

const commonObj = new common();
const notificationsObj = new NotificationsPage();
let emailInput;
let phoneInput;
let instructionsInput;

Given('a tenant admin user is on notification overview page', function () {
  commonlib.tenantAdminDirectURLLogin(
    Cypress.config().baseUrl,
    Cypress.env('realm'),
    Cypress.env('email'),
    Cypress.env('password')
  );
  commonlib.tenantAdminMenuItem('Notification', 4000);
});

When('the user clicks Add notification type button', function () {
  notificationsObj.addANotificationTypeButtonOnOverview().click();
});

Then('the user views Add notification type modal', function () {
  notificationsObj.notificationTypeModal().should('exist');
});

When(
  'the user enters {string}, {string}, {string}, {string}, {string}, {string} on notification type modal',
  function (name, description, role, bot, sms, selfService) {
    const roles = role.split(',');
    notificationsObj.notificationTypeModalNameField().clear().type(name);
    notificationsObj.notificationTypeModalDescriptionField().clear().type(description);
    notificationsObj.notificationTypeModalSubscriberRolesDropdown().click({ force: true });
    // Deselect all previously selected roles and then select roles
    notificationsObj
      .notificationTypeModalSubscriberRolesDropdownItems()
      .each((element) => {
        cy.wrap(element)
          .invoke('attr', 'class')
          .then((classAttr) => {
            if (classAttr?.includes('-selected')) {
              cy.wrap(element).click();
            }
          });
      })
      .then(() => {
        for (let i = 0; i < roles.length; i++) {
          notificationsObj.notificationTypeModalSubscriberRolesDropdownItem(roles[i].trim()).click({ force: true });
        }
      });
    notificationsObj.notificationTypeModalSubscriberRolesDropdownBackground().click({ force: true }); // To collapse the dropdown after selection
    //bot checkbox
    notificationsObj
      .notificationChannelCheckbox('bot')
      .invoke('attr', 'class')
      .then((classAttVal) => {
        if (classAttVal == undefined) {
          expect.fail('Failed to get bot checkbox class attribute value.');
        } else {
          switch (bot) {
            case 'yes':
              if (classAttVal.includes('selected')) {
                cy.log('Bot check box is already selected. ');
              } else {
                notificationsObj.notificationChannelCheckbox('bot').click();
              }
              break;
            case 'no':
              {
                if (!classAttVal.includes('selected')) {
                  cy.log('Bot check box is already not selected. ');
                } else {
                  notificationsObj.notificationChannelCheckbox('bot').click();
                }
              }
              break;
            default:
              expect(bot).to.be.oneOf(['yes', 'no']);
          }
        }
      });
    //sms checkbox
    notificationsObj
      .notificationChannelCheckbox('sms')
      .invoke('attr', 'class')
      .then((classAttVal) => {
        if (classAttVal == undefined) {
          expect.fail('Failed to get sms checkbox class attribute value.');
        } else {
          switch (sms) {
            case 'yes':
              if (classAttVal.includes('selected')) {
                cy.log('SMS check box is already selected. ');
              } else {
                notificationsObj.notificationChannelCheckbox('sms').click();
              }
              break;
            case 'no':
              {
                if (!classAttVal.includes('selected')) {
                  cy.log('SMS check box is already not selected. ');
                } else {
                  notificationsObj.notificationChannelCheckbox('sms').click();
                }
              }
              break;
            default:
              expect(sms).to.be.oneOf(['yes', 'no']);
          }
        }
      });
    //Self-service checkbox
    notificationsObj
      .notificationTypeModalSelfServiceCheckbox()
      .invoke('attr', 'class')
      .then((classAttVal) => {
        if (classAttVal == undefined) {
          expect.fail('Failed to get subscribe checkbox class attribute value.');
        } else {
          switch (selfService) {
            case 'yes':
              if (classAttVal.includes('selected')) {
                cy.log('Self service check box is already selected. ');
              } else {
                notificationsObj.notificationTypeModalSelfServiceCheckbox().click();
                notificationsObj.notificationTypeModalSelfServiceCalloutContent().should('be.visible');
              }
              break;
            case 'no':
              {
                if (!classAttVal.includes('selected')) {
                  cy.log('Self service check box is already not selected. ');
                } else {
                  notificationsObj.notificationTypeModalSelfServiceCheckbox().click();
                  notificationsObj.notificationTypeModalSelfServiceCalloutContent().should('not.exist');
                }
              }
              break;
            default:
              expect(selfService).to.be.oneOf(['yes', 'no']);
          }
        }
      });
  }
);

Then('the user clicks save button in notification type modal', function () {
  notificationsObj.notificationTypeModalSaveBtn().click();
  cy.wait(2000);
});

Then(
  'the user {string} the notification type card of {string}, {string}, {string}, {string}, {string}',
  function (viewOrNot, name, desc, roles, publicOrNot, selfService) {
    roles = roles.replace('Anyone (Anonymous)', '');
    if (viewOrNot == 'views') {
      notificationsObj.notificationTypeCardTitle(name).should('exist');
      notificationsObj.notificationTypeCardDesc(name).invoke('text').should('contain', desc);
      notificationsObj.notificationTypeSubscriberRoles(name).invoke('text').should('contain', roles);
      notificationsObj.notificationTypePublicSubscription(name).invoke('text').should('contain', publicOrNot);
      notificationsObj.notificationTypeSelfService(name).invoke('text').should('contain', selfService);
    } else if (viewOrNot == 'should not view') {
      notificationsObj.notificationTypeCardTitle(name).should('not.exist');
    } else {
      expect(viewOrNot).to.be.oneOf(['views', 'should not view']);
    }
  }
);

Then('the user views Add notification type button on Notification types page', function () {
  notificationsObj.addANotificationTypeButtonOnNotificationTypesPage().should('exist');
});

When('the user clicks {string} button for the notification type card of {string}', function (buttonType, cardTitle) {
  switch (buttonType) {
    case 'edit':
      notificationsObj.notificationTypeEditBtn(cardTitle).click();
      break;
    case 'delete':
      notificationsObj.notificationTypeDeleteBtn(cardTitle).click();
      break;
    default:
      expect(buttonType).to.be.oneOf(['edit', 'delete']);
  }
});

Then('the user views Edit notification type modal for {string}', function (cardTitle) {
  notificationsObj.notificationTypeModalTitle().invoke('text').should('eq', 'Edit notification type');
  notificationsObj.notificationTypeModalNameField().invoke('attr', 'value').should('eq', cardTitle);
});

Given('a tenant admin user is on notification types page', function () {
  commonlib.tenantAdminDirectURLLogin(
    Cypress.config().baseUrl,
    Cypress.env('realm'),
    Cypress.env('email'),
    Cypress.env('password')
  );
  commonlib.tenantAdminMenuItem('Notification', 4000);
  commonObj.serviceTab('Notification', 'Notification types').click();
  cy.wait(2000);
});

When('the user clicks Select event button for {string}', function (cardTitle) {
  notificationsObj.notificationTypeSelectAnEventBtn(cardTitle).click({ force: true });
});

Then('the user views Select an event modal', function () {
  notificationsObj.selectAnEventModalTitle().invoke('text').should('equal', 'Select an event');
});

When('the user selects {string} in the event dropdown', function (event) {
  notificationsObj.selectAnEventModalEventDropdown().click();
  notificationsObj.selectAnEventModalEventDropdownItem(event).click();
});

When('the user cannot select {string} in the event dropdown', function (event) {
  notificationsObj.selectAnEventModalEventDropdown().click();
  notificationsObj.selectAnEventModalEventDropdownItem(event).should('not.exist');
  notificationsObj.selectAnEventModalEventDropdown().click({ force: true }); //Force clicking the dropdown to collapse the dropdown
});

When('the user clicks Next button on Select an event page', function () {
  notificationsObj.selectAnEventModalNextBtn().click();
});

When('the user clicks Cancel button in Select an event modal', function () {
  notificationsObj.selectAnEventModalCancelBtn().click();
});

Then('the user views Add an email template page', function () {
  notificationsObj.addAnEmailTemplateModalTitle().invoke('text').should('contain', 'Add an email template');
});

When('the user clicks Add button in Add an email template page', function () {
  notificationsObj.addAnEmailTemplateModalAddBtn().click();
  cy.wait(2000);
});

Then('the user {string} the event of {string} in {string}', function (viewOrNot, event, cardTitle) {
  cy.wait(2000); // To wait for the record to show up in the grid before validating the record existence
  let numOfMatch = 0;
  if (viewOrNot == 'views') {
    notificationsObj.notificationTypeEvents(cardTitle).then((elements) => {
      for (let i = 0; i < elements.length; i++) {
        if (elements[i].innerText == event) numOfMatch = numOfMatch + 1;
      }
      expect(numOfMatch).equals(1);
    });
  } else if (viewOrNot == 'should not view') {
    notificationsObj.notificationTypeCardFooterItems(cardTitle).then((footerItems) => {
      if (footerItems.length == 1) {
        cy.log('No event for the notification type');
      } else {
        notificationsObj.notificationTypeEvents(cardTitle).then((elements) => {
          for (let i = 0; i < elements.length; i++) {
            if (elements[i].innerText == event) numOfMatch = numOfMatch + 1;
          }
          expect(numOfMatch).equals(0);
        });
      }
    });
  } else {
    expect(viewOrNot).to.be.oneOf(['views', 'should not view']);
  }
});

When('the user clicks {string} button for {string} in {string}', function (buttonName, event, cardTitle) {
  switch (buttonName) {
    case 'edit':
      notificationsObj.notificationTypeEventEditButton(cardTitle, event).click();
      cy.wait(1000);
      break;
    case 'delete':
      notificationsObj.eventDeleteIcon(cardTitle, event).click();
      break;
    default:
      expect(buttonName).to.be.oneOf(['edit', 'delete']);
  }
});

Then('the user {string} the notification type card of {string}', function (viewOrNot, name) {
  if (viewOrNot == 'views') {
    notificationsObj.notificationTypeCardTitle(name).should('exist');
  } else if (viewOrNot == 'should not view') {
    notificationsObj.notificationTypeCardTitle(name).should('not.exist');
  } else {
    expect(viewOrNot).to.be.oneOf(['views', 'should not view']);
  }
});

Then(
  'the user views {string} has self-service-allowed attribute is {string}',
  function (notificationTypeName, selfService) {
    expect(selfService).to.be.oneOf(['yes', 'no']);
    notificationsObj
      .notificationTypeCoreSelfService(notificationTypeName)
      .invoke('text')
      .should('contain', selfService);
  }
);

Then('the user {string} {string} for {string} in {string}', function (viewOrNot, elementType, eventName, typeName) {
  if (viewOrNot == 'views') {
    switch (elementType) {
      case 'email template indicator':
        notificationsObj.notificationTypeEventMailIcon(typeName, eventName).should('exist');
        break;
      case 'Edit button':
        notificationsObj.notificationTypeEventEditButton(typeName, eventName).should('exist');
        break;
      case 'Reset':
        notificationsObj.notificationTypeEventDeleteBtn(typeName, eventName).should('exist');
        break;
      default:
        expect(elementType).to.be.oneOf(['email template indicator', 'Preview link', 'Edit button', 'Reset']);
    }
  } else if (viewOrNot == 'should not view') {
    switch (elementType) {
      case 'email template indicator':
        notificationsObj.notificationTypeEventMailIcon(typeName, eventName).should('not.exist');
        break;
      case 'Edit button':
        notificationsObj.notificationTypeEventEditButton(typeName, eventName).should('not.exist');
        break;
      case 'Reset':
        notificationsObj.notificationTypeEventDeleteBtn(typeName, eventName).should('not.exist');
        break;
      default:
        expect(elementType).to.be.oneOf(['email template indicator', 'Preview link', 'Edit button', 'Reset']);
    }
  } else {
    expect(viewOrNot).to.be.oneOf(['views', 'should not view']);
  }
});

Then('the user views Preview an email template modal', function () {
  notificationsObj.eventTemplatePreviewModalTitle().invoke('text').should('contain', 'Preview an email template');
});

When('the user clicks Close button in Preview an email template modal', function () {
  notificationsObj.eventTemplatePreviewModalCloseBtn().click();
});

Then('Preview event template modal is closed', function () {
  notificationsObj.eventTemplatePreviewModal().should('not.exist');
});

Given('a tenant admin user is on notification subscriptions page', function () {
  commonlib.tenantAdminDirectURLLogin(
    Cypress.config().baseUrl,
    Cypress.env('realm'),
    Cypress.env('email'),
    Cypress.env('password')
  );
  commonlib.tenantAdminMenuItem('Notification', 4000);
  commonObj.serviceTab('Notification', 'Subscriptions').click();
  cy.wait(5000);
});

When(
  'the user types {string} in Search subuscriber address as field and {string} in Search subscriber email field',
  function (addressAs, email) {
    notificationsObj.searchSubscriberAddressAs().clear().type(addressAs);
    notificationsObj.searchSubscriberEmail().clear().type(email);
  }
);

When('the user types {string} in Search subscriber email field', function (email) {
  notificationsObj.searchSubscriberEmail().clear().type(email);
});

When('the user clicks Search button on notifications page', function () {
  notificationsObj.notificationSearchBtn().click();
});

//notification type in sentence case, only first letter is upper case
Then(
  'the user {string} the subscription of {string}, {string} under {string}',
  function (viewOrNot, addressAd, email, notificationType) {
    switch (viewOrNot) {
      case 'views':
        notificationsObj.notificationRecord(notificationType, addressAd, email).should('exist');
        break;
      case 'should not view':
        notificationsObj.notificationRecord(notificationType, addressAd, email).should('not.exist');
        break;
      default:
        expect(viewOrNot).to.be.oneOf(['views', 'should not view']);
    }
  }
);

When(
  'the user clicks delete button of {string}, {string} under {string}',
  function (addressAd, email, notificationType) {
    notificationsObj.deleteIconForNotificationRecord(notificationType, addressAd, email).click({ force: true });
  }
);

Then('the user views Delete subscription modal', function () {
  notificationsObj.deleteConfirmationModal().should('exist');
  notificationsObj.deleteConfirmationModalTitle().invoke('text').should('eq', 'Delete subscription');
});

Then('the user views the Delete subscription confirmation message of {string}', function (email) {
  notificationsObj.deleteConfirmationModalContent().should('contain.text', email);
});

When('the user clicks Confirm button on Delete subscription modal', function () {
  notificationsObj.deleteConfirmationModalConfirmBtn().scrollIntoView().click();
});

Given('a tenant admin user is on notification subscribers page', function () {
  commonlib.tenantAdminDirectURLLogin(
    Cypress.config().baseUrl,
    Cypress.env('realm'),
    Cypress.env('email'),
    Cypress.env('password')
  );
  commonlib.tenantAdminMenuItem('Notification', 4000);
  commonObj.serviceTab('Notification', 'Subscribers').click();
  cy.wait(5000);
});

When('the user searches subscribers with {string} containing {string}', function (searchField, searchText) {
  //Enter search text
  switch (searchField) {
    case 'address as':
      notificationsObj.subscribersAddressAsSearchField().clear().type(searchText);
      notificationsObj.subscribersEmailSearchField().clear();
      break;
    case 'email':
      notificationsObj.subscribersEmailSearchField().clear().type(searchText);
      notificationsObj.subscribersAddressAsSearchField().clear();
      break;
    default:
      expect(searchField).to.be.oneOf(['address as', 'email']);
  }

  //Click Search button
  notificationsObj.subscribersSearchBtn().click();
  cy.wait(2000);
});

When(
  'the user searches subscribers with address as containing {string}, email containing {string} and phone number containing {string}',
  function (addressAs, email, phoneNumber) {
    notificationsObj.searchSubscriberAddressAs().clear().type(addressAs);
    notificationsObj.searchSubscriberEmail().clear().type(email);
    expect(phoneNumber).match(/(EMPTY)|[0-9]{10}/);
    if (phoneNumber == 'EMPTY') {
      notificationsObj.searchSubscriberPhone().clear();
    } else {
      notificationsObj.searchSubscriberPhone().clear().type(phoneNumber);
    }
    notificationsObj.notificationSearchBtn().click();
  }
);

Then('the user views all the subscribers with {string} containing {string}', function (headerLabel, searchText) {
  //Find which column to search
  let columnNumber;
  notificationsObj
    .subscriberTableHeader()
    .get('th')
    .then((elements) => {
      for (let i = 0; i < elements.length; i++) {
        if (elements[i].innerText.toLowerCase() == headerLabel) {
          columnNumber = i;
        }
      }
    });

  //Search all cells of the column
  notificationsObj.subscriberTableBody().each((rows) => {
    cy.wrap(rows).within(() => {
      cy.get('td').each(($col, index) => {
        if (index == columnNumber) {
          expect($col.text().toLowerCase()).to.contain(searchText.toLowerCase());
        }
      });
    });
  });
});

Then(
  'the user views subscribers with {string} containing {string} and {string} containing {string}',
  function (headerLabel1, searchText1, headerLabel2, searchText2) {
    //Find which columns to search
    let columnNumber1;
    let columnNumber2;
    notificationsObj
      .subscriberTableHeader()
      .get('th')
      .then((elements) => {
        for (let i = 0; i < elements.length; i++) {
          if (elements[i].innerText.toLowerCase() == headerLabel1) {
            columnNumber1 = i;
          } else if (elements[i].innerText.toLowerCase() == headerLabel2) {
            columnNumber2 = i;
          }
        }
      });

    //Search all cells of the columns
    notificationsObj.subscriberTableBody().each((rows) => {
      cy.wrap(rows).within(() => {
        cy.get('td').each(($col, index) => {
          if (index == columnNumber1) {
            expect($col.text().toLowerCase()).to.contain(searchText1.toLowerCase());
          } else if (index == columnNumber2) {
            expect($col.text().toLowerCase()).to.contain(searchText2.toLowerCase());
          }
        });
      });
    });
  }
);

When('the user expands the subscription list for the subscriber of {string} and {string}', function (addressAs, email) {
  notificationsObj.subscriberIconEye(addressAs, email).click();
});

Then(
  'the user views the subscription of {string} for the subscriber of {string} and {string}',
  function (subscription, addressAs, email) {
    notificationsObj.subscriberSubscriptions(addressAs, email).invoke('text').should('contain', subscription);
  }
);

Then(
  'the user {string} the subscriber of {string}, {string}, {string}',
  function (viewOrNot, addressAs, email, phoneNumber) {
    let phoneNumberInDisplay;
    expect(phoneNumber).match(/(EMPTY)|[0-9]{10}/);
    if (phoneNumber !== 'EMPTY') {
      phoneNumberInDisplay =
        phoneNumber.substring(0, 3) + ' ' + phoneNumber.substring(3, 6) + ' ' + phoneNumber.substring(6, 10);
    }
    switch (viewOrNot) {
      case 'views':
        if (phoneNumber == 'EMPTY') {
          notificationsObj.subscriber(addressAs, email).should('exist');
        } else {
          notificationsObj.subscriberWithPhoneNumber(addressAs, email, phoneNumberInDisplay).should('exist');
        }
        break;
      case 'should not view':
        if (phoneNumber == 'EMPTY') {
          notificationsObj.subscriber(addressAs, email).should('not.exist');
        } else {
          notificationsObj.subscriberWithPhoneNumber(addressAs, email, phoneNumberInDisplay).should('not.exist');
        }
        break;
      default:
        expect(viewOrNot).to.be.oneOf(['views', 'should not view']);
    }
  }
);

When('the user clicks {string} button of {string}, {string} on subscribers page', function (button, addressAs, email) {
  switch (button) {
    case 'delete':
      notificationsObj.subscriberDeleteIcon(addressAs, email).click();
      break;
    case 'edit':
      notificationsObj.subscriberEditIcon(addressAs, email).click();
      break;
    default:
      expect(button).to.be.oneOf(['delete', 'edit']);
  }
});

Then('the user views Delete subscriber modal', function () {
  notificationsObj.subscriberDeleteConfirmationModalTitle().invoke('text').should('eq', 'Delete subscriber');
});

When('the user clicks Delete button on Delete subscriber modal', function () {
  notificationsObj.subscriberDeleteConfirmationModalDeleteBtn().click();
  cy.wait(4000); //Wait for the subscriber list to be updated
});

When('the user clicks edit button for contact information', function () {
  notificationsObj.contactInformationEdit().click();
});

Then('the user views Edit contact information modal', function () {
  notificationsObj.editContactModal().should('exist');
});

When(
  'the user enters {string}, {string} and {string} in Edit contact information modal',
  function (email, phone, instructions) {
    // Check phone parameter to match 1111111 format
    // Generate a random number between 1000 and 2000
    const rand_str = String(Math.floor(Math.random() * 1000 + 1000));

    const editedEmail = email.match(/(?<=rnd{)[^{}]+(?=})/g);
    if (editedEmail == null) {
      emailInput = email;
    } else {
      emailInput = (rand_str + email).replace('rnd{', '').replace('}', '');
    }
    const editedPhone = phone.match(/(?<=rnd{)[^{}]+(?=})/g);
    if (editedPhone == null) {
      phoneInput = phone;
    } else {
      phoneInput = editedPhone.toString().slice(0, -4) + rand_str;
    }
    const editedInstructions = instructions.match(/(?<=rnd{)[^{}]+(?=})/g);
    if (editedInstructions == null) {
      instructionsInput = instructions;
    } else {
      instructionsInput = (rand_str + instructions).replace('rnd{', '').replace('}', '');
    }
    notificationsObj.editContactModalEmail().clear().type(emailInput);
    notificationsObj.editContactModalPhone().clear().type(phoneInput);
    notificationsObj.editContactModalInstructions().clear().type(instructionsInput);
  }
);

Then('the user clicks Save button in Edit contact information modal', function () {
  notificationsObj.editContactModalSaveBtn().click();
  cy.wait(2000);
});

Then(
  'the user views contact information of {string}, {string} and {string} on notifications page',
  function (email, phone, instructions) {
    const editedEmail = email.match(/(?<=rnd{)[^{}]+(?=})/g);
    if (editedEmail == '') {
      notificationsObj.contactInformationEmail().invoke('text').should('contain', email);
    } else {
      notificationsObj.contactInformationEmail().invoke('text').should('contain', emailInput);
    }
    const editedPhone = phone.match(/(?<=rnd{)[^{}]+(?=})/g);
    if (editedPhone == '') {
      notificationsObj
        .contactInformationPhone()
        .invoke('text')
        .then(($text) => {
          const phoneNumber = $text
            .replace(/([^0-9])+/, '')
            .replace(' ', '')
            .replace(' ', '');
          cy.wrap(phoneNumber).should('contain', phoneInput);
        });
    } else {
      notificationsObj
        .contactInformationPhone()
        .invoke('text')
        .then(($text) => {
          const phoneNumber = $text
            .replace(/([^0-9])+/, '')
            .replace(' ', '')
            .replace(' ', '');
          cy.wrap(phoneNumber).should('contain', phoneInput);
        });
    }
    const editedInstructions = instructions.match(/(?<=rnd{)[^{}]+(?=})/g);
    if (editedInstructions == '') {
      notificationsObj.contactInformationInstructions().invoke('text').should('contain', instructions);
    } else {
      notificationsObj.contactInformationInstructions().invoke('text').should('contain', instructionsInput);
    }
  }
);

When('the user modifies the name to {string} and email to {string} in subscriber modal', function (name, editEmail) {
  notificationsObj.editSubscriberModalNameField().clear().type(name);
  notificationsObj.editSubscriberModalEmailField().clear().type(editEmail);
});

When('the user clicks Edit button of {string} and {string} on subscribers page', function (addressAs, email) {
  notificationsObj.subscriberEditIcon(addressAs, email).click();
});

Then('the user views Edit subscriber modal', function () {
  notificationsObj.editSubscriberModal().should('exist');
});

Then('the user clicks Save button in Edit subscriber modal', function () {
  notificationsObj.editSubscriberModalSaveBtn().click();
  cy.wait(2000);
});

When('the user enters {string} in Phone number field', function (phoneNumber) {
  expect(phoneNumber).match(/(EMPTY)|[0-9]{10}/);
  if (phoneNumber !== 'EMPTY') {
    notificationsObj.editSubscriberModalPhoneNumberField().clear().type(phoneNumber);
  } else {
    notificationsObj.editSubscriberModalPhoneNumberField().clear();
  }
});

When('the user clicks Add notification type button on Notification type page', function () {
  notificationsObj.addNotificationTypeBtnOnNotificationType().click();
});

Then(
  'the user {string} {string} for the event of {string} in {string} on tenant events',
  function (viewOrNot, elementType, eventName, typeName) {
    if (viewOrNot == 'views') {
      switch (elementType) {
        case 'email template indicator':
          notificationsObj.tenantNotificationTypeEventMailIcon(typeName, eventName).should('exist');
          notificationsObj.tenantNotificationTypeEventMailBadge(typeName, eventName).should('not.exist');
          break;
        case 'bot template indicator':
          notificationsObj.tenantNotificationTypeEventBotIcon(typeName, eventName).should('exist');
          notificationsObj.tenantNotificationTypeEventBotIconBadge(typeName, eventName).should('not.exist');
          break;
        case 'sms template indicator':
          notificationsObj.tenantNotificationTypeEventSmsIcon(typeName, eventName).should('exist');
          notificationsObj.tenantNotificationTypeEventSmsIconBadge(typeName, eventName).should('not.exist');
          break;
        case 'email template indicator with warning':
          notificationsObj.tenantNotificationTypeEventMailBadge(typeName, eventName).should('exist');
          notificationsObj.tenantNotificationTypeEventMailIcon(typeName, eventName).should('exist');
          break;
        case 'bot template indicator with warning':
          notificationsObj.tenantNotificationTypeEventBotIconBadge(typeName, eventName).should('exist');
          notificationsObj.tenantNotificationTypeEventBotIcon(typeName, eventName).should('exist');
          break;
        case 'sms template indicator with warning':
          notificationsObj.tenantNotificationTypeEventSmsIconBadge(typeName, eventName).should('exist');
          notificationsObj.tenantNotificationTypeEventSmsIcon(typeName, eventName).should('exist');
          break;
        default:
          expect(elementType).to.be.oneOf([
            'email template indicator',
            'bot template indicator',
            'sms template indicator',
            'email template indicator with warning',
            'bot template indicator with warning',
            'sms template indicator with warning',
          ]);
      }
    } else if (viewOrNot == 'should not view') {
      switch (elementType) {
        case 'bot template indicator':
          notificationsObj.tenantNotificationTypeEventBotIcon(typeName, eventName).should('not.exist');
          break;
        case 'sms template indicator':
          notificationsObj.tenantNotificationTypeEventSmsIcon(typeName, eventName).should('not.exist');
          break;
        case 'email template indicator with warning':
          notificationsObj.tenantNotificationTypeEventMailBadge(typeName, eventName).should('not.exist');
          break;
        case 'bot template indicator with warning':
          notificationsObj.tenantNotificationTypeEventBotIconBadge(typeName, eventName).should('not.exist');
          break;
        case 'sms template indicator with warning':
          notificationsObj.tenantNotificationTypeEventSmsIconBadge(typeName, eventName).should('not.exist');
          break;
        default:
          expect(elementType).to.be.oneOf([
            'bot template indicator',
            'sms template indicator',
            'email template indicator with warning',
            'bot template indicator with warning',
            'sms template indicator with warning',
          ]);
      }
    } else {
      expect(viewOrNot).to.be.oneOf(['views', 'should not view']);
    }
  }
);

Then('the user views that email channel is greyed out', function () {
  notificationsObj.notificationChannelEmailCheckbox().should('be.disabled');
  notificationsObj.notificationChannelEmailCheckbox().should('be.checked');
});

When('the user selects {string} tab on the event template', function (tab) {
  notificationsObj.notificationEventTemplateTab(tab).click();
  cy.wait(1000);
});

When(
  'the user enters {string} as subject and {string} as body {string} template page',
  function (subjectText, bodyText, channel) {
    notificationsObj.addTemplateModalSubject(channel).type(subjectText);
    notificationsObj.addTemplateModalBody(channel).type(bodyText);
  }
);

Then('the user views an email template modal title for {string}', function (notificationEvent) {
  notificationsObj.editTemplateModalTitle().invoke('text').should('contain', notificationEvent);
});

Then('the user views the email subject {string}', function (subject) {
  notificationsObj.editTemplateModalEmailSubject().invoke('text').should('contain', subject);
  notificationsObj.editTemplateModalEmailSubjectPreviewPane().invoke('text').should('contain', subject);
});

Then('the user views the email body {string}', function (emailBody) {
  notificationsObj.editTemplateModalEmailBody().invoke('text').should('contain', emailBody);
  notificationsObj.editContactModalBodyEmailPreviewPane().then(function ($iFrame) {
    const iFrameContent = $iFrame.contents().find('body');
    cy.wrap(iFrameContent).find('[class*="email-content"]').invoke('text').should('contain', emailBody);
  });
});

When('the user clicks Close button in event template modal', function () {
  cy.scrollTo('bottom');
  notificationsObj.editTemplateModalCloseBtn().click();
});

When('the user views the link for managing email subscription', function () {
  notificationsObj
    .editContactModalBodyEmailPreviewPane()
    .its('0.contentDocument.body')
    .find('footer')
    .contains('Please do not reply to this email. Manage your subscription here.');
  notificationsObj
    .editContactModalBodyEmailPreviewPane()
    .its('0.contentDocument.body')
    .find('footer')
    .find('[class="goa-footer-event"]')
    .find('a[href*="https://subscription.adsp-uat.alberta.ca/2ef492af-0a16-470b-9ea5-c8bfa7b08a7c/login"]');
});
