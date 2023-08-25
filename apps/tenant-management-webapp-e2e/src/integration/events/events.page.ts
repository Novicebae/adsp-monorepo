class eventsPage {
  eventsOverviewh3Title() {
    return cy.xpath('//h1[contains(text(), Events)]/following-sibling::div[2]//h2');
  }

  event(namespace, eventName) {
    return cy.xpath(
      `//div[@class="group-name" and contains(text(), "${namespace}")]/following-sibling::div//td[@data-testid="name" and contains(text(), "${eventName}")]`
    );
  }

  eventWithDesc(namespace, eventName, eventDesc) {
    return cy.xpath(
      `//div[@class="group-name" and contains(text(), "${namespace}")]/following-sibling::div//td[@data-testid="name" and contains(text(), "${eventName}")]/following-sibling::td[contains(text(), "${eventDesc}")]`
    );
  }

  eventNames(namespace) {
    return cy.xpath(
      `//div[@class="group-name" and contains(text(), "${namespace}")]/following-sibling::div//td[@data-testid="name"]`
    );
  }

  eventDescs(namespace) {
    return cy.xpath(
      `//div[@class="group-name" and contains(text(), "${namespace}")]/following-sibling::div//td[@data-testid="description"]`
    );
  }

  showDetailsIcon(namespace, eventName) {
    return cy.xpath(
      `//div[@class="group-name" and contains(text(), "${namespace}")]/following-sibling::div//td[@data-testid="name" and contains(text(), "${eventName}")]/following-sibling::td//*[@data-testid="toggle-details-visibility" and @icon="eye"]`
    );
  }

  hideDetailsIcon(namespace, eventName) {
    return cy.xpath(
      `//div[@class="group-name" and contains(text(), "${namespace}")]/following-sibling::div//td[@data-testid="name" and contains(text(), "${eventName}")]/following-sibling::td//*[@data-testid="toggle-details-visibility" and @icon="eye-off"]`
    );
  }

  eventDetails(namespace, eventName) {
    return cy.xpath(
      `//div[@class="group-name" and contains(text(), "${namespace}")]/following-sibling::div//td[@data-testid="name" and contains(text(), "${eventName}")]/parent::tr/following-sibling::tr//*[@data-testid="details"]`
    );
  }

  addDefinitionButton() {
    return cy.get('[data-testid="add-definition"]');
  }

  definitionModal() {
    return cy.xpath('//*[@data-testid="definition-form" and @open="true"]');
  }

  definitionModalTitle() {
    return cy.xpath('//*[@data-testid="definition-form" and @open="true"]//*[@slot="heading"]');
  }

  definitionModalNamespaceFormItem() {
    return cy.xpath('//goa-modal[@open="true"]//goa-input[@data-testid="form-namespace"]/parent::goa-form-item');
  }

  definitionModalNamespaceField() {
    return cy.xpath('//*[@data-testid="definition-form" and @open="true"]//*[@data-testid="form-namespace"]');
  }

  definitionModalNameFormItem() {
    return cy.xpath('//goa-modal[@open="true"]//goa-input[@data-testid="form-name"]/parent::goa-form-item');
  }

  definitionModalNameField() {
    return cy.xpath('//*[@data-testid="definition-form" and @open="true"]//*[@data-testid="form-name"]');
  }

  definitionModalDescriptionField() {
    return cy.xpath('//*[@data-testid="definition-form" and @open="true"]//*[@data-testid="form-description"]');
  }

  definitionModalPayloadSchema() {
    return cy.xpath(
      '//*[@data-testid="definition-form" and @open="true"]//*[@class="monaco-scrollable-element editor-scrollable vs"]'
    );
  }

  definitionModalSaveButton() {
    return cy.xpath('//*[@data-testid="definition-form" and @open="true"]//*[@data-testid="form-save"]');
  }

  definitionModalCancelButton() {
    return cy.xpath('//*[@data-testid="definition-form" and @open="true"]//*[@data-testid="form-cancel"]');
  }

  editDefinitionButton(namespace, eventName, eventDesc) {
    return cy.xpath(
      `//div[@class="group-name" and contains(text(), "${namespace}")]/following-sibling::div//td[@data-testid="name" and contains(text(), "${eventName}")]/following-sibling::td[@data-testid="description" and contains(text(), "${eventDesc}")]/following-sibling::td//*[@data-testid="edit-details"]`
    );
  }

  editDefinitionButtonWithNamespaceAndName(namespace, eventName) {
    return cy.xpath(
      `//div[@class="group-name" and contains(text(), "${namespace}")]/following-sibling::div//td[@data-testid="name" and contains(text(), "${eventName}")]/following-sibling::td[@data-testid="description"]/following-sibling::td//*[@data-testid="edit-details"]`
    );
  }

  deleteDefinitionButton(namespace, eventName, eventDesc) {
    return cy.xpath(
      `//div[@class="group-name" and contains(text(), "${namespace}")]/following-sibling::div//td[@data-testid="name" and contains(text(), "${eventName}")]/following-sibling::td[@data-testid="description" and contains(text(), "${eventDesc}")]/following-sibling::td//*[@data-testid="delete-details"]`
    );
  }

  deleteDefinitionButtonWithNamespaceAndName(namespace, eventName) {
    return cy.xpath(
      `//div[@class="group-name" and contains(text(), "${namespace}")]/following-sibling::div//td[@data-testid="name" and contains(text(), "${eventName}")]/following-sibling::td[@data-testid="description"]/following-sibling::td//*[@data-testid="delete-details"]`
    );
  }

  coreStreamsSectionTitle() {
    return cy.xpath('//*[text()="Core streams"]');
  }

  streamToggleButton(streamName) {
    return cy.xpath(
      `//*[@data-testid="Platform-stream-table"]//tbody/tr/td[text()="${streamName}"]/following-sibling::td//*[@data-testid="toggle-stream-visibility"]`
    );
  }

  streamDetails(streamName) {
    return cy.xpath(
      `//tbody/tr/td[text()="${streamName}"]/parent::*/following-sibling::tr//*[contains(@data-testid, "details")]`
    );
  }

  addStreamBtn() {
    return cy.get('[data-testid="add-stream"]');
  }

  streamModal() {
    return cy.get('[data-testid="stream-form"]');
  }

  streamModalTitle() {
    return cy.xpath('//*[@data-testid="stream-form" and @data-state="visible"]//div[@class="modal-title"]');
  }

  streamModalNameInput() {
    return cy.xpath('//*[@data-testid="stream-form" and @data-state="visible"]//*[@data-testid="stream-name"]');
  }

  streamModalDescriptionInput() {
    return cy.xpath('//*[@data-testid="stream-form" and @data-state="visible"]//*[@data-testid="stream-description"]');
  }

  streamModalSaveButton() {
    return cy.xpath('//*[@data-testid="stream-form" and @data-state="visible"]//*[@data-testid="form-save"]');
  }

  streamModalEventDropdown() {
    return cy.xpath(
      '//*[@data-testid="stream-form" and @data-state="visible"]/*[@class="modal"]//*[@data-testid="streamEvents-dropdown"]'
    );
  }

  streamModalEventDropdownItem(text) {
    return cy.xpath(
      `//*[@data-testid="stream-form" and @data-state="visible"]/*[@class="modal"]//*[@data-testid="streamEvents-dropdown"]/following-sibling::*//*[contains(text(), "${text}")]`
    );
  }

  streamModalEventDropdownItems() {
    return cy.xpath(
      '//*[@data-testid="stream-form" and @data-state="visible"]/*[@class="modal"]//*[@data-testid="streamEvents-dropdown"]/following-sibling::*//li'
    );
  }

  streamModalEventDropdownBackground() {
    return cy.xpath('//*[@data-testid="streamEvents-dropdown-background"]');
  }

  streamModalRoleCheckbox(roleLabel) {
    return cy.xpath(
      `//*[@data-testid="stream-form"]//tbody/tr/td[@class="role-label" and text()="${roleLabel}"]/following-sibling::td//goa-checkbox`
    );
  }

  streamModalClientRoleCheckbox(clientName, roleName) {
    return cy.xpath(
      `//*[@data-testid="stream-form"]//thead/tr/th[@class="role-name" and text()="${clientName}"]/ancestor::thead/following-sibling::tbody/tr/td[@class="role-label" and text()="${roleName}"]/following-sibling::td//goa-checkbox`
    );
  }

  streamModalRoleCheckboxes() {
    return cy.xpath(`//*[@data-testid="stream-form"]//goa-checkbox[contains(@name, "auto-test-role1")]`);
  }

  streamModalRolesCheckboxes() {
    return cy.xpath(`//*[@data-testid="stream-form"]//goa-checkbox[contains(@name, "auto-test-role1")]`);
  }

  streamNameList() {
    return cy.get('[data-testid="stream-name"]');
  }

  streamTableBody() {
    return cy.xpath('//table[@data-testid="autotest-stream-table"]//tbody');
  }

  streamDetailsEyeIcon(name) {
    return cy.xpath(
      `//*[@data-testid="stream-name" and contains(text(), "${name}")]/following-sibling::td//*[@data-testid="toggle-stream-visibility" and @icon="eye"]`
    );
  }

  streamDetailsEyeOffIcon(name) {
    return cy.xpath(
      `//*[@data-testid="stream-name" and contains(text(), "${name}")]/following-sibling::td//*[@data-testid="toggle-stream-visibility" and @icon="eye-off"]`
    );
  }

  streamEditBtn(name) {
    return cy.xpath(
      `//*[@data-testid="stream-name" and contains(text(), "${name}")]/following-sibling::td//*[@data-testid="edit-stream"]`
    );
  }

  streamDeleteBtn(name) {
    return cy.xpath(
      `//*[@data-testid="stream-name" and contains(text(), "${name}")]/following-sibling::td//*[@data-testid="delete-stream"]`
    );
  }

  streamModalEventChips() {
    return cy.get('goa-chip');
  }

  streamModalPublicCheckbox() {
    return cy.xpath('//*[@data-testid="stream-form"]//goa-checkbox[@name="stream-anonymousRead-checkbox"]');
  }
}

export default eventsPage;
