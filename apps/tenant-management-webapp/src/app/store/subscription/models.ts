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
}

export interface SubscriberService {
  subscription: Subscription;
  subscriptions: SubscriptionWrapper[];
  subscriber: Subscriber;
  successMessage: string;
  search: {
    subscribers: {
      data: Subscriber[] | undefined;
      hasNext: boolean;
      pageSize: number;
      top: number;
    }
  }
}

export const SUBSCRIBER_INIT: SubscriberService = {
  subscription: undefined,
  subscriptions: undefined,
  subscriber: undefined,
  successMessage: null,
  search: {
    subscribers: {
      data: undefined,
      hasNext: false,
      pageSize: DEFAULT_PAGE_SIZE,
      top: DEFAULT_PAGE_SIZE
    }
  }
};

export interface SubscriberSearchCriteria {
  email?: string;
  name?: string;
  next?: boolean;
}