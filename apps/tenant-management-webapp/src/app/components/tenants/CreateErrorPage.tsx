import React from 'react';
import GoALinkButton from '@components/_/LinkButton';
import { Aside, Main, Page } from '@components/_/Html';
import SupportLinks from '@components/_/SupportLinks';

const CreateErrorPage = () => {
  return (
    <Page>
      <Main>
        <h1>There was a problem creating your tenant</h1>
        <p>We apologize for the inconvenience, but we could not successfully create your tenant, please try again.</p>
        <GoALinkButton to="/tenants/create" buttonType="primary">
          Create Tenant
        </GoALinkButton>
      </Main>
      <Aside>
        <SupportLinks />
      </Aside>
    </Page>
  );
};

export default CreateErrorPage;
