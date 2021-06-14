import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { GoAButton, GoANotification } from '@abgov/react-components';
import { CreateTenant, IsTenantAdmin } from '@store/tenant/actions';
import { RootState } from '@store/index';
import GoALinkButton from '@components/LinkButton';
import { GoAForm, GoAFormButtons, GoAFormItem } from '@components/Form';
import { Aside, Main, Page } from '@components/Html';
import SupportLinks from '@components/SupportLinks';
import { KeycloakCheckSSO, TenantLogin } from '@store/tenant/actions';
import { TenantLogout } from '@store/tenant/actions';

const CreateRealm = () => {
  const dispatch = useDispatch();
  const [name, setName] = useState('');

  const onCreateRealm = async () => {
    dispatch(CreateTenant(name));
  };

  const onChangeName = (event) => {
    setName(event.target.value);
  };

  const { isTenantAdmin, userInfo, isTenantCreated, tenantRealm } = useSelector((state: RootState) => ({
    isTenantAdmin: state.tenant.isTenantAdmin,
    userInfo: state.session.userInfo,
    isTenantCreated: state.tenant.isTenantCreated,
    tenantRealm: state.tenant.realm,
  }));

  useEffect(() => {
    if (!IsTenantAdmin) {
      dispatch(KeycloakCheckSSO('core'));
    }
  }, [IsTenantAdmin]);

  useEffect(() => {
    if (userInfo) {
      dispatch(IsTenantAdmin(userInfo.email));
    }
  }, [isTenantCreated]);

  const ErrorMessage = (props) => {
    const message = `${props.email} has already created a tenant. Currently only one tenant is allowed per person.`;
    return <GoANotification type="information" title="Notification Title" message={message} />;
  };

  return (
    <Page>
      <Main>
        {userInfo && isTenantAdmin && !isTenantCreated && <ErrorMessage email={userInfo.email} />}
        {isTenantCreated ? (
          <>
            <p>The '{name}' has been successfully created</p>
            <GoAButton
              onClick={() => {
                dispatch(TenantLogin(tenantRealm));
              }}
            >
              Tenant Login
            </GoAButton>
          </>
        ) : (
          <>
            {!isTenantAdmin ? (
              <>
                <h2>Create tenant</h2>
                <p>As a reminder, you are only able to create one tenant per user account.</p>
                <GoAForm>
                  <GoAFormItem>
                    <label htmlFor="name">Tenant Name</label>
                    <input id="name" type="text" value={name} onChange={onChangeName} />
                    <em>Names cannot container special characters (ex. ! % &amp;)</em>
                  </GoAFormItem>
                  <GoAFormButtons>
                    <GoALinkButton
                      to=""
                      buttonType="secondary"
                      onClick={() => {
                        dispatch(TenantLogout());
                      }}
                    >
                      Back
                    </GoALinkButton>

                    <GoAButton onClick={onCreateRealm}>Create Tenant</GoAButton>
                  </GoAFormButtons>
                </GoAForm>
              </>
            ) : null}
          </>
        )}
      </Main>
      <Aside>
        <SupportLinks />
      </Aside>
    </Page>
  );
};

export default CreateRealm;
