class Common {
  loginButton() {
    return cy.get('#kc-login');
  }

  usernameEmailField() {
    return cy.get('[name=username]');
  }

  passwordField() {
    return cy.get('[name=password]');
  }

  adminMenuItem(testid) {
    return cy.xpath(`//nav//*[@data-testid="${testid}"]`);
  }

  readTheApiDocsLink() {
    return cy.xpath(
      '//*[contains(text(), "Helpful links")]/following-sibling::a[contains(text(), "Read the API docs")]'
    );
  }

  APIDocsPageTitle(text) {
    return cy.xpath(`//*[@class="title" and contains(text(), "${text}")]`);
  }

  serviceTab(service, text) {
    return cy.xpath(`//h1[contains(text(),"${service}")]/ancestor::main//div[text()="${text}"]`);
  }

  notificationMessage() {
    return cy.get('goa-notification');
  }

  deleteConfirmationModalTitle() {
    return cy.xpath('//*[@data-testid="delete-confirmation" and @data-state="visible"]//*[@class="modal-title"]');
  }

  deleteConfirmationModalContent() {
    return cy.xpath('//*[@data-testid="delete-confirmation" and @data-state="visible"]//*[@class="goa-scrollable"]');
  }

  deleteConfirmationModalDeleteBtn() {
    return cy.xpath(
      '//*[@data-testid="delete-confirmation" and @data-state="visible"]//*[@data-testid="delete-confirm"]'
    );
  }

  modalTitle() {
    return cy.xpath(
      '//div[@class="modal-root" and @data-state="visible"]/div[@class="modal"]/div[@class="modal-container"]/div[@class="modal-title"]'
    );
  }

  seeTheCodeLink() {
    return cy.xpath('//*[contains(text(), "Helpful links")]/following-sibling::a[contains(text(), "See the code")]');
  }

  supportLink(link) {
    return cy.xpath(`//h3[text()="Support"]/following-sibling::*/*[contains(text(), "${link}")]`);
  }

  serviceOverviewContent(serviceOverviewTitle) {
    return cy.xpath(`//h1[text()="${serviceOverviewTitle}"]/ancestor::main//p`);
  }
}
export default Common;
