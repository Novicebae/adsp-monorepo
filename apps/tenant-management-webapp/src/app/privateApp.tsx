import React, { ReactNode, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route } from 'react-router-dom';
import Header from '@components/AppHeader';
import { HeaderCtx } from '@lib/headerContext';
import Container from '@components/Container';
import { RootState } from '@store/index';
import { KeycloakCheckSSOWithLogout } from '@store/tenant/actions';
import { GoAPageLoader } from '@abgov/react-components';
import { NotificationBanner } from './notificationBanner';
import styled from 'styled-components';

interface privateAppProps {
  children: ReactNode;
}
export function PrivateApp({ children }: privateAppProps): JSX.Element {
  const [title, setTitle] = useState<string>('');
  const dispatch = useDispatch();
  const urlParams = new URLSearchParams(window.location.search);
  const realmFromParams = urlParams.get('realm');
  const realm = realmFromParams || localStorage.getItem('realm');

  if (realmFromParams) {
    localStorage.setItem('realm', realmFromParams);
  }

  const { tenantRealm } = useSelector((state: RootState) => ({
    tenantRealm: state.tenant.realm,
  }));

  useEffect(() => {
    dispatch(KeycloakCheckSSOWithLogout(tenantRealm || realm));
  }, []);

  return (
    <HeaderCtx.Provider value={{ setTitle }}>
      <ScrollBarFixTop>
        <Header serviceName={title} admin={true} />
        {/*
      NOTE: we might need to add the following function in the near feature
      */}
        {/* <IdleTimer
        checkInterval={10}
        timeoutFn={() => {
          dispatch(TenantLogout());
        }}
        continueFn={() => {
          location.reload();
        }}
      /> */}

        <NotificationBanner />
      </ScrollBarFixTop>
      <ScrollBarFixMain>
        <Container>{children}</Container>
      </ScrollBarFixMain>
    </HeaderCtx.Provider>
  );
}

const PageLoader = (): JSX.Element => {
  return <GoAPageLoader visible={true} message="Loading..." type="infinite" pagelock={false} />;
};

// eslint-disable-next-line
export function PrivateRoute({ component: Component, ...rest }): JSX.Element {
  const userInfo = useSelector((state: RootState) => state.session?.userInfo);
  const ready = !!userInfo;

  return <Route {...rest} render={(props) => (ready ? <Component {...props} /> : <PageLoader />)} />;
}

export default PrivateApp;

const ScrollBarFixTop = styled.div`
  margin-right: calc(100% - 100vw); ;
`;

const ScrollBarFixMain = styled.div`
  margin-left: calc(100vw - 100%);
  margin-right: 0;
`;
