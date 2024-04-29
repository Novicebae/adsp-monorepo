import { When, Then } from 'cypress-cucumber-preprocessor/steps';
import FormsPage from './forms.page';
import { injectAxe } from '../../support/app.po';
import { htmlReport } from '../../support/axe-html-reporter-util';

const formsObj = new FormsPage();
let responseObj: Cypress.Response<any>;
let formId;

When('a user goes to form app overview site', function () {
  cy.visit('/');
  cy.wait(2000); // Wait all the redirects to settle down
});

Then('the user views the overview page of form app', function () {
  formsObj.formAppOverviewHeader().should('exist');
});

Then('no critical or serious accessibility issues on {string} page', function (pageName) {
  injectAxe();
  // check all accessibility issues and generate a report without failing the step.
  cy.checkA11y(
    null!,
    {},
    (violations) => {
      htmlReport(violations, true, 'public service status page' + '-all');
    },
    true
  );
  // check critical and serious accessibility issues and generate a report. Fail the step if there are any.
  cy.checkA11y(null!, { includedImpacts: ['critical', 'serious'] }, (violations) => {
    htmlReport(violations, true, pageName + '-critical&serious');
  });
});

When('an authenticated user is in the form app', function () {
  cy.visit('/' + Cypress.env('realm') + '/login?kc_idp_hint=');
  // Enter user name and password and click log in button
  formsObj.usernameEmailField().type(Cypress.env('email'));
  formsObj.passwordField().type(Cypress.env('password'));
  formsObj.loginButton().click();
  cy.wait(4000); // Wait all the redirects to settle down
});

When('an authenticated user is logged in to see {string} application', function (formDefinition) {
  cy.visit('/' + Cypress.env('realm-name') + '/' + formDefinition + '/login?kc_idp_hint=');
  // Enter user name and password and click log in button
  formsObj.usernameEmailField().type(Cypress.env('email'));
  formsObj.passwordField().type(Cypress.env('password'));
  formsObj.loginButton().click();
  cy.wait(8000); // Wait all the redirects to settle down
});

Then('the user views a from draft of {string}', function (formDefinition) {
  cy.url().should('include', formDefinition);
  cy.url().then((url) => {
    formId = url.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    expect(formId).to.be.not.null;
  });
});

When('the user sends a delete form request', function () {
  expect(formId).not.equals(null);
  const formDeleteRequestURL = Cypress.env('formApi') + 'form/v1/forms/' + formId;
  cy.request({
    method: 'DELETE',
    url: formDeleteRequestURL,
    auth: {
      bearer: Cypress.env('autotest-admin-token'),
    },
  }).then(function (response) {
    responseObj = response;
  });
});

Then('the new form is deleted', function () {
  expect(responseObj.status).to.eq(200);
  expect(responseObj.body.deleted).to.equal(true);
});

When('the user enters {string} in a text field labelled {string}', function (text, label) {
  formsObj.formTextField(label).shadow().find('input').clear().type(text, { force: true, delay: 200 });
});

When('the user enters {string} in a date picker labelled {string}', function (date, label) {
  formsObj.formDateInput(label).shadow().find('input').clear().type(date, { force: true });
});

When('the user enters {string} in a dropdown labelled {string}', function (value, label) {
  formsObj.formDropdown(label).shadow().find('input').click({ force: true });
  formsObj.formDropdown(label).shadow().find('li').contains(value).click({ force: true });
});

When('the user clicks Next button on the form', function () {
  formsObj.formNextButton().shadow().find('button').click({ force: true });
});

When('the user {string} a checkbox labelled {string}', function (checkboxOperation, label) {
  formsObj
    .formCheckbox(label)
    .shadow()
    .find('.goa-checkbox-container')
    .invoke('attr', 'class')
    .then((classAttVal) => {
      if (classAttVal == undefined) {
        expect.fail('Failed to get checkbox class attribute value.');
      } else {
        switch (checkboxOperation) {
          case 'selects':
            if (classAttVal.includes('selected')) {
              cy.log('The checkbox was already checked.');
            } else {
              formsObj.formCheckbox(label).shadow().find('.goa-checkbox-container').click();
            }
            break;
          case 'unselects':
            if (classAttVal.includes('selected')) {
              formsObj.formCheckbox(label).shadow().find('.goa-checkbox-container').click();
            } else {
              cy.log('The checkbox was already unchecked.');
            }
            break;
          default:
            expect(checkboxOperation).to.be.oneOf(['selects', 'unselects']);
        }
      }
    });
});

When('the user clicks submit button on the form', function () {
  cy.wait(2000);
  formsObj.formSubmitButton().shadow().find('button').click({ force: true });
  cy.wait(10000);
});

When('the user clicks object array button on the form', function () {
  formsObj.formObjectArrayButton().shadow().find('button').click({ force: true });
});

When('the user enters {string} in object array element text field labelled {string}', function (text, label) {
  formsObj
    .formObjectArrayDependantTextField(label)
    .shadow()
    .find('input')
    .clear()
    .type(text, { force: true, delay: 200 });
});

When('the user enters {string} in object array element date input labelled {string}', function (date, label) {
  formsObj.formObjectArrayDependantDateInput(label).shadow().find('input').clear().type(date, { force: true });
});

Then('the user views a callout with a message of {string}', function (message) {
  formsObj.formSuccessCallout().shadow().find('h3').should('have.text', message);
});

Then(
  'the user views the summary of {string} with {string} as {string} {string}',
  function (sectionName, value, requiredOrNot, label) {
    let isFound = false;
    if (label.includes(':')) {
      const objectArrayLabels = label.split(':');
      const arrayLabel = objectArrayLabels[1].toLowerCase();
      const fieldLabel = objectArrayLabels[0];
      formsObj
        .formSummaryPageOjectArrayItems(sectionName, arrayLabel)
        .then((items) => {
          for (let i = 0; i < items.length; i++) {
            cy.log(items[i].outerText);
            switch (requiredOrNot) {
              case 'required':
                if (items[i].outerText == fieldLabel + ' *: ' + value) {
                  isFound = true;
                  cy.log(String(isFound));
                }
                break;
              case 'not required':
                if (items[i].outerText == fieldLabel + ' : ' + value) {
                  isFound = true;
                  cy.log(String(isFound));
                }
                break;
              default:
                expect(requiredOrNot).to.be.oneOf(['required', 'not required']);
            }
          }
        })
        .then(() => {
          expect(isFound).to.be.true;
        });
    } else {
      formsObj
        .formSummaryPageItems(sectionName)
        .then((items) => {
          for (let i = 0; i < items.length; i++) {
            cy.log(items[i].outerText);
            switch (requiredOrNot) {
              case 'required':
                if (items[i].outerText == label + ' *: ' + value) {
                  isFound = true;
                  cy.log(String(isFound));
                }
                break;
              case 'not required':
                if (items[i].outerText == label + ' : ' + value) {
                  isFound = true;
                  cy.log(String(isFound));
                }
                break;
              default:
                expect(requiredOrNot).to.be.oneOf(['required', 'not required']);
            }
          }
        })
        .then(() => {
          expect(isFound).to.be.true;
        });
    }
  }
);
