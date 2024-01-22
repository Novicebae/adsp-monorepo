import { GoAAppHeader, GoAButton, GoAMicrositeHeader } from '@abgov/react-components-new';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom-6';
import {
  AppDispatch,
  configInitializedSelector,
  initializeTenant,
  loginUser,
  logoutUser,
  tenantSelector,
  userSelector,
} from '../state';
import { FeedbackNotification } from './FeedbackNotification';
import { AuthorizeUser } from './AuthorizeUser';

export const FormTenant = () => {
  const { tenant: tenantName } = useParams<{ tenant: string }>();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const tenant = useSelector(tenantSelector);

  const configInitialized = useSelector(configInitializedSelector);
  const { initialized: userInitialized, user } = useSelector(userSelector);

  useEffect(() => {
    if (configInitialized) {
      dispatch(initializeTenant(tenantName));
    }
  }, [configInitialized, tenantName, dispatch]);

  return (
    <React.Fragment>
      <GoAMicrositeHeader type="alpha" />
      <GoAAppHeader url="/" heading={`${tenant?.name || tenantName} - Task management`}>
        {userInitialized && (
          <span>
            <span>{user?.name}</span>
            {user ? (
              <GoAButton type="tertiary" onClick={() => dispatch(logoutUser({ tenant, from: location.pathname }))}>
                Sign out
              </GoAButton>
            ) : (
              <GoAButton type="tertiary" onClick={() => dispatch(loginUser({ tenant, from: location.pathname }))}>
                Sign in
              </GoAButton>
            )}
          </span>
        )}
      </GoAAppHeader>
      <FeedbackNotification />
      <main>
        <AuthorizeUser>
          <section>Signed in to {tenant?.name}</section>
        </AuthorizeUser>
      </main>
    </React.Fragment>
  );
};
