import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { GoAButton, GoAModal, GoAButtonGroup } from '@abgov/react-components-new';
import { RootState } from '@store/index';
import { TenantLogout } from '@store/tenant/actions';

export const LogoutModal = (): JSX.Element => {
  const { isExpired } = useSelector((state: RootState) => ({
    isExpired: state.session?.isExpired,
  }));
  const [countdownTime, setCountdownTime] = useState(120);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isExpired === true) {
      const timer = setInterval(() => {
        setCountdownTime((time) => {
          if (time === 0) {
            clearInterval(timer);

            dispatch(TenantLogout());
            return 0;
          } else return time - 1;
        });
      }, 1000);
    }
  }, [dispatch, isExpired]);

  return (
    <GoAModal
      open={isExpired === true}
      testId="tenant-logout-notice-modal"
      heading="Session expired"
      actions={
        <GoAButtonGroup alignment="end">
          <GoAButton
            testId="session-continue-button"
            onClick={() => {
              const tenantRealm = encodeURIComponent(localStorage.getItem('realm'));
              const idpFromUrl = encodeURIComponent(localStorage.getItem('idpFromUrl'));
              localStorage.removeItem('realm');
              if (idpFromUrl === null || idpFromUrl === 'core') {
                const url = `${tenantRealm}/login`;
                window.location.replace(url);
              } else {
                const url = `${tenantRealm}/login?kc_idp_hint=${idpFromUrl}`;
                window.location.replace(url);
              }
            }}
          >
            Continue
          </GoAButton>
          <GoAButton
            testId="session-again-button"
            type="secondary"
            onClick={() => {
              dispatch(TenantLogout());
            }}
          >
            Logout
          </GoAButton>
        </GoAButtonGroup>
      }
    >
      <p>
        Your current login session will be expired in <b>{`${countdownTime}`}</b> seconds. Any unsaved changes will be
        lost.
      </p>
    </GoAModal>
  );
};
