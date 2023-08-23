import React, { useEffect, useState } from 'react';
import { Main } from '@components/Html';
import Container from '@components/Container';
import DataTable from '@components/DataTable';
import { GoASkeletonGridColumnContent } from '@abgov/react-components';
import { GoAButton, GoACallout } from '@abgov/react-components-new';
import { FetchContactInfoService } from '@store/notification/actions';
import { GoAModal, GoAModalActions, GoAModalTitle } from '@abgov/react-components/experimental';

import SubscriptionsList from '@components/SubscriptionsList';

import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { getMySubscriberDetails, unsubscribe } from '@store/subscription/actions';
import { RootState } from '@store/index';
import { Subscription } from '@store/subscription/models';
import {
  NoSubscriberCallout,
  ContactInformationWrapper,
  CalloutWrapper,
  SubscriptionListContainer,
  DescriptionWrapper,
} from './styled-components';
import { phoneWrapper } from '@lib/wrappers';
import { ContactInfoCard } from './ContactInfoCard';
import { KeycloakCheckSSOWithLogout } from '@store/tenant/actions';

interface SubscriptionsProps {
  realm: string;
}

const Subscriptions = ({ realm }: SubscriptionsProps): JSX.Element => {
  const dispatch = useDispatch();
  const { subscriber, hasSubscriberId } = useSelector((state: RootState) => ({
    subscriber: state.subscription.subscriber,
    hasSubscriberId: state.subscription.hasSubscriberId,
  }));
  const contact = useSelector((state: RootState) => state.notification?.contactInfo);
  const [showUnSubscribeModal, setShowUnSubscribeModal] = useState(false);
  const [selectedUnsubscribeSub, setSelectedUnsubscribeSub] = useState<Subscription>();

  const indicator = useSelector((state: RootState) => {
    return state?.session?.indicator;
  });

  // we need to wait for userInfo api call so that the followup api calls can make use of the jwt token
  const userInfo = useSelector((state: RootState) => state.session?.userInfo);

  // call that gets user jwt token
  useEffect(() => {
    dispatch(KeycloakCheckSSOWithLogout(realm));
  }, []);

  // only make the following 2 effects once we have user info and token ready
  useEffect(() => {
    if (userInfo !== undefined) {
      dispatch(getMySubscriberDetails());
    }
  }, [userInfo]);

  useEffect(() => {
    if (userInfo !== undefined) {
      dispatch(FetchContactInfoService({ realm }));
    }
  }, [userInfo]);

  const unSubscribe = (typeId: string) => {
    setShowUnSubscribeModal(true);
    setSelectedUnsubscribeSub(subscriber?.subscriptions.filter((item) => item.typeId === typeId)[0]);
  };

  const resetSelectedUnsubscribe = () => {
    setShowUnSubscribeModal(false);
    setSelectedUnsubscribeSub(undefined);
  };

  const unSubscribeModal = () => {
    return (
      <GoAModal isOpen={true} key={1} data-testId="unsubscribe-modal">
        <GoAModalTitle>Are you sure you want unsubscribe?</GoAModalTitle>
        <GoAModelTextWrapper data-testId="unsubscribe-modal-content">
          If you decide to unsubscribe from “{selectedUnsubscribeSub.type.name}” you won’t receive any updates from the
          service in the future.{' '}
        </GoAModelTextWrapper>
        <GoAModalActions>
          <GoAButton
            type="secondary"
            testId="unsubscribe-modal-cancel-button"
            onClick={() => {
              resetSelectedUnsubscribe();
            }}
          >
            Cancel
          </GoAButton>
          <GoAButton
            type="primary"
            testId="unsubscribe-modal-okay-button"
            onClick={() => {
              dispatch(
                unsubscribe({
                  type: selectedUnsubscribeSub.typeId,
                  subscriberId: selectedUnsubscribeSub.subscriberId,
                })
              );
              resetSelectedUnsubscribe();
            }}
          >
            Unsubscribe
          </GoAButton>
        </GoAModalActions>
      </GoAModal>
    );
  };

  return (
    <SubscriptionManagement>
      <Main>
        <Container hs={2} vs={4.5} xlHSpacing={12}>
          <h1 data-testid="service-name">Subscription management</h1>
          <DescriptionWrapper>
            <p data-testid="service-description">
              Use this page to manage your contact information and subscriptions. Please note that you need to contact
              support to modify some subscriptions.
            </p>
          </DescriptionWrapper>
          {showUnSubscribeModal ? unSubscribeModal() : ''}
          <ContactInformationWrapper>
            <ContactInfoCard subscriber={subscriber} />
          </ContactInformationWrapper>
          {!hasSubscriberId ? (
            <NoSubscriberCallout>
              <GoACallout type="important" heading="You have no subscriptions" />
            </NoSubscriberCallout>
          ) : (
            <>
              <SubscriptionListContainer>
                <DataTable data-testid="subscriptions-table">
                  {!subscriber || subscriber?.subscriptions.length > 0 ? (
                    <tr>
                      <th id="subscriptions">Subscription</th>
                      <th id="descriptions">Description</th>
                      <th id="available-channels">Available channels</th>
                      <th id="action">Action</th>
                    </tr>
                  ) : (
                    ''
                  )}
                  <tbody>
                    {subscriber ? (
                      <SubscriptionsList onUnsubscribe={unSubscribe} subscriber={subscriber} />
                    ) : indicator?.show || subscriber === undefined ? (
                      <tr>
                        <td colSpan={4}>
                          <GoASkeletonGridColumnContent rows={5}></GoASkeletonGridColumnContent>
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={4}>No Subscriptions</td>
                      </tr>
                    )}
                  </tbody>
                </DataTable>

                {subscriber?.subscriptions?.length <= 0 ? (
                  <GoACallout type="important" heading="You have no subscriptions" />
                ) : (
                  ''
                )}
              </SubscriptionListContainer>

              {indicator?.show ? (
                <GoASkeletonGridColumnContent rows={5}></GoASkeletonGridColumnContent>
              ) : (
                <CalloutWrapper id="contactSupport">
                  <GoACallout heading="Need help? Contact your service admin" type="information">
                    <div>{contact?.supportInstructions || ''}</div>
                    <div>
                      {contact?.contactEmail && (
                        <>
                          Email:{' '}
                          <a rel="noopener noreferrer" target="_blank" href={`mailto:${contact?.contactEmail}`}>
                            {contact?.contactEmail}
                          </a>
                        </>
                      )}
                    </div>
                    {contact?.phoneNumber && <div>Phone: {phoneWrapper(contact?.phoneNumber)}</div>}
                    <div data-testid="service-notice-date-range"></div>
                  </GoACallout>
                </CalloutWrapper>
              )}
            </>
          )}
        </Container>
      </Main>
    </SubscriptionManagement>
  );
};
export default Subscriptions;

const SubscriptionManagement = styled.div`
  tr > th {
    padding-bottom: 0.5rem;
  }
`;

const GoAModelTextWrapper = styled.div`
  padding: 0 1.5rem 0 1.75rem;
  max-width: 36rem;
`;
