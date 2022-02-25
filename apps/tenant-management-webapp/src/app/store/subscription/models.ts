export const DEFAULT_PAGE_SIZE = 10;

export interface Subscription {
  id: string;
  subscriberId?: string;
  tenantId?: string;
  typeId?: string;
  urn?: string;
}

export interface SubscriptionWrapper {
  subscriber?: Subscriber;
  subscriberId?: string;
  typeId?: string;
  criterial?: string;
}

export interface Channels {
  address?: string;
  channel?: string;
  verified?: boolean;
}

export interface Subscriber {
  id: string;
  urn?: string;
  addressAs?: string;
  channels?: Channels[];
  userId?: string;
  accountLink?: string;
  visibleSubscriptions?: boolean;
}

export interface HasNext {
  id: string;
  hasNext: boolean;
  top: number;
}

export interface SubscriberAndSubscriptions {
  subscriber: Subscriber;
  subscriptions: SubscriptionWrapper[];
}

export interface SubscriberService {
  subscription: Subscription;
  subscriptionsHasNext: HasNext[];
  subscriptions: SubscriptionWrapper[];
  subscriber: Subscriber;
  subscriberSubscriptions: Record<string, SubscriberAndSubscriptions>;
  successMessage: string;
  subscribers: Record<string, Subscriber>;
  search: {
    results: string[];
    next: string;
  };
  updateError: string;
}

export const SUBSCRIBER_INIT: SubscriberService = {
  subscription: undefined,
  subscriptionsHasNext: [],
  subscriptions: undefined,
  subscriber: undefined,
  subscriberSubscriptions: {},
  successMessage: null,
  subscribers: {},
  search: {
    results: [],
    next: null,
  },
  updateError: '',
};

export interface SubscriberSearchCriteria {
  email?: string;
  name?: string;
  next?: string;
}

export interface SubscriptionSearchCriteria {
  email?: string;
  name?: string;
  next?: boolean;
  top?: number;
}
