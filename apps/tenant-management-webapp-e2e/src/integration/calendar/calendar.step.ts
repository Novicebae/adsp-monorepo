import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps';
import commonlib from '../common/common-library';
import CalendarPage from './calendar.page';

const calendarObj = new CalendarPage();

Given('a tenant admin user is on script service overview page', function () {
  commonlib.tenantAdminDirectURLLogin(
    Cypress.config().baseUrl,
    Cypress.env('realm'),
    Cypress.env('email'),
    Cypress.env('password')
  );
  commonlib.tenantAdminMenuItem('Script', 4000);
});

Then('the user clicks Add calendar button on overview tab', function () {
  calendarObj.addCalendarOverviewTabBtn().shadow().find('button').click({ force: true });
  cy.wait(2000);
});

When('the user clicks Add calendar button', function () {
  calendarObj.addCalendarBtn().shadow().find('button').click({ force: true });
  cy.wait(2000);
});

Then('the user views Add calendar modal', function () {
  calendarObj.addScriptModalTitle().invoke('text').should('eq', 'Add calendar');
});

When('the user clicks Save button in Add calendar modal', function () {
  calendarObj.calendarModalSaveButton().shadow().find('button').click({ force: true });
  cy.wait(1000);
});

When('the user clicks Cancel button in Add calendar modal', function () {
  calendarObj.calendarModalCancelButton().shadow().find('button').click({ force: true });
});

Then('the user views Calendar tab table header on calendars page', function () {
calendarObj.calendarTableHeader().should('be.visible');
});

When('the user enters {string} in name field in calendar modal', function (name) {
  calendarObj.addCalendarModalNameField().shadow().find('input').clear().type(name, { delay: 100, force: true });
});

Then('the user views the error message of {string} on namespace in calendar modal', function (errorMsg) {
  calendarObj
    .addCalendarModalNameFormItem()
    .shadow()
    .find('[class="error-msg"]')
    .invoke('text')
    .should('contain', errorMsg);
});

When('the user enters {string}, {string}, {string} in Add calendar modal',
  function (name, desc, role) {
    cy.viewport(1920, 1080);
    calendarObj.addCalendarModalNameField().shadow().find('input').clear().type(name, { delay: 100, force: true });
    calendarObj.addCalendarModalDescriptionField().shadow().find('.goa-textarea').clear().type(desc, { force: true });
    // Select roles or client roles
    const roles = role.split(',');
    for (let i = 0; i < roles.length; i++) {
      if (roles[i].includes(':')) {
     const clientRoleStringArray = roles[i].split(':');
     let clientName = '';
     for (let j = 0; j < clientRoleStringArray.length - 1; j++) {
       if (j !== clientRoleStringArray.length - 2) {
         clientName = clientName + clientRoleStringArray[j].trim() + ':';
       } else {
         clientName = clientName + clientRoleStringArray[j];
       }
     }
     const roleName = clientRoleStringArray[clientRoleStringArray.length - 1];
     calendarObj
       .addCalendarModalClientRolesTable(clientName)
       .shadow()
       .find('.role-name')
       .contains(roleName)
       .next()
       .find('goa-checkbox')
       .shadow()
       .find('.goa-checkbox-container')
       .scrollIntoView()
       .click({ force: true });
    } else {
    calendarObj
       .addCalendarModalRolesTable()
       .shadow()
       .find('.role-name')
       .contains(roles[i].trim())
       .next()
       .find('goa-checkbox')
       .shadow()
       .find('.goa-checkbox-container')
       .scrollIntoView()
       .click({ force: true });
   }
 }
});

Then('the user {string} the calendar of {string}, {string}, {string}', function (viewOrNot, name, desc, role) {
  findCalendar(name, desc, role).then((rowNumber) => {
    switch (viewOrNot) {
      case 'views':
        expect(rowNumber).to.be.greaterThan(
          0,
          'Calendar of ' + name + ', ' + desc + ', ' + role + ' has row #' + rowNumber
        );
        break;
      case 'should not view':
        expect(rowNumber).to.equal(0, 'Calendar of ' + name + ', ' + desc + ', ' + role + ' has row #' + rowNumber);
        break;
      default:
        expect(viewOrNot).to.be.oneOf(['views', 'should not view']);
    }
  });
});
//Find a calendar with name, description and role(s)
//Input: calendar name, calendar description, role(s) in a string separated with comma
//Return: row number if the calendar is found; zero if the script isn't found
function findCalendar(name, desc, role) {
  return new Cypress.Promise((resolve, reject) => {
    try {
      let rowNumber = 0;
      const roles = role.split(',');
      const targetedNumber = roles.length + 2; // Name, description and roles all need to match to find the calendar
      calendarObj
        .calendarTableBody()
        .find('tr')
        .then((rows) => {
          rows.toArray().forEach((rowElement) => {
            let counter = 0;
            // cy.log(rowElement.cells[0].innerHTML); // Print out the name cell innerHTML for debug purpose
            if (rowElement.cells[0].innerHTML.includes(name)) {
              counter = counter + 1;
            }
            // cy.log(rowElement.cells[2].innerHTML); // Print out the description cell innerHTML for debug purpose
            if (rowElement.cells[2].innerHTML.includes(desc)) {
              counter = counter + 1;
            }
            // cy.log(rowElement.cells[3].innerHTML); // Print out the role cell innerHTML for debug purpose
            roles.forEach((runningRole) => {
              if (rowElement.cells[3].innerHTML.includes(runningRole.trim())) {
                counter = counter + 1;
              }
            });
            Cypress.log({
              name: 'Number of matched items for row# ' + rowElement.rowIndex + ': ',
              message: String(String(counter)),
            });
            if (counter == targetedNumber) {
              rowNumber = rowElement.rowIndex;
            }
          });
          Cypress.log({
            name: 'Row number for the found script: ',
            message: String(rowNumber),
          });
          resolve(rowNumber);
        });
    } catch (error) {
      reject(error);
    }
  });
}

When(
  'the user clicks {string} button for the calendar of {string}, {string}, {string}',
  function (button, name, desc, role) {
    findCalendar(name, desc, role).then((rowNumber) => {
      expect(rowNumber).to.be.greaterThan(
        0,
        'Script of ' + name + ', ' + desc + ', ' + role + ' has row #' + rowNumber
      );
      cy.wait(1000); // Wait for buttons to show up
      switch (button.toLowerCase()) {
        case 'edit':
          calendarObj.calendarEditButton(rowNumber).shadow().find('button').click({ force: true });
          break;
        case 'delete':
          calendarObj.calendarDeleteButton(rowNumber).shadow().find('button').click({ force: true });
          break;
        default:
          expect(button).to.be.oneOf(['edit', 'delete']);
      }
    });
  }
);

Then('the user views Edit calendar modal', function () {
  calendarObj.editCalendarModal().should('exist');
});

When('the user enters {string} as description and selects {string} as role in Edit calendar modal', function (description, role) {
  calendarObj.editCalendarModalDescriptionField().shadow().find('.goa-textarea').clear().type(description, { force: true });
  //Unselect all checkboxes
  calendarObj
  .editCalendarModalTable()
  .shadow()
  .find('goa-checkbox')
  .shadow()
  .find('.goa-checkbox-container')
  .then((elements) => {
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].getAttribute('class')?.includes('--selected')) {
        elements[i].click();
      }
    }
  });
  // Select roles
  const roles = role.split(',');
    for (let i = 0; i < roles.length; i++) {
      if (roles[i].includes(':')) {
     const clientRoleStringArray = roles[i].split(':');
     let clientName = '';
     for (let j = 0; j < clientRoleStringArray.length - 1; j++) {
       if (j !== clientRoleStringArray.length - 2) {
         clientName = clientName + clientRoleStringArray[j].trim() + ':';
       } else {
         clientName = clientName + clientRoleStringArray[j];
       }
     }
      const roleName = clientRoleStringArray[clientRoleStringArray.length - 1];
      calendarObj
       .addCalendarModalClientRolesTable(clientName)
       .shadow()
       .find('.role-name')
       .contains(roleName)
       .next()
       .find('goa-checkbox')
       .shadow()
       .find('.goa-checkbox-container')
       .scrollIntoView()
       .click({ force: true });
    } else {
    calendarObj
       .addCalendarModalRolesTable()
       .shadow()
       .find('.role-name')
       .contains(roles[i].trim())
       .next()
       .find('goa-checkbox')
       .shadow()
       .find('.goa-checkbox-container')
       .scrollIntoView()
       .click({ force: true });
      }
  }
});

When('the user clicks Save button in Edit calendar modal', function () {
  cy.wait(1000); // Wait for the button to enable
  calendarObj.calendarModalSaveButton().shadow().find('button').scrollIntoView().click({ force: true });
  cy.wait(2000); // Wait for the save operation
});