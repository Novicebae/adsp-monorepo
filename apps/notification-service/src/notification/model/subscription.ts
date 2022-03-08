import { AdspId, DomainEvent, NotificationType } from '@abgov/adsp-service-sdk';
import { SubscriptionRepository } from '../repository';
import { NotificationTypeEvent, SubscriberChannel, Subscription, SubscriptionCriteria } from '../types';
import { SubscriberEntity } from './subscriber';

export class SubscriptionEntity implements Subscription {
  tenantId: AdspId;
  typeId: string;
  criteria: SubscriptionCriteria;
  subscriberId: string;

  static async create(
    repository: SubscriptionRepository,
    subscriber: SubscriberEntity,
    subscription: Subscription
  ): Promise<SubscriptionEntity> {
    const entity = new SubscriptionEntity(repository, subscription, subscriber);
    return repository.saveSubscription(entity);
  }

  constructor(
    private repository: SubscriptionRepository,
    subscription: Subscription,
    public subscriber: SubscriberEntity = null
  ) {
    this.tenantId = subscription.tenantId;
    this.typeId = subscription.typeId;
    this.subscriberId = subscription.subscriberId;
    this.criteria = subscription.criteria || {};
  }

  shouldSend(event: DomainEvent): boolean {
    // truthy event AND correlationId match AND context match
    return (
      !!event &&
      (!this.criteria.correlationId || this.criteria.correlationId === event.correlationId) &&
      !Object.entries(this.criteria.context || {}).find(([key, value]) => value !== event.context[key])
    );
  }

  getSubscriberChannel(type: NotificationType, event: NotificationTypeEvent): SubscriberChannel {
    const channel = this.subscriber?.channels.find(
      ({ channel }) => type.channels?.includes(channel) && event.templates[channel]
    );
    return channel;
  }
}
