import { AdspId, Channel, isAllowedUser, Tenant, User } from '@abgov/adsp-service-sdk';
import type { DomainEvent } from '@core-services/core-common';
import { UnauthorizedError } from '@core-services/core-common';
import { getTemplateBody } from '@core-services/shared';
import { Logger } from 'winston';
import { SubscriptionRepository } from '../repository';
import { TemplateService } from '../template';
import { Template } from '../types';
import {
  NotificationType,
  Notification,
  NotificationTypeEvent,
  SubscriptionCriteria,
  ServiceUserRoles,
  Subscriber,
} from '../types';
import { SubscriberEntity } from './subscriber';
import { SubscriptionEntity } from './subscription';

export class NotificationTypeEntity implements NotificationType {
  tenantId?: AdspId;
  id: string;
  name: string;
  description: string;
  publicSubscribe = false;
  manageSubscribe = false;
  Subscribe = false;
  subscriberRoles: string[] = [];
  events: NotificationTypeEvent[] = [];

  constructor(type: NotificationType, tenantId?: AdspId) {
    this.tenantId = tenantId;
    Object.assign(this, type);
  }

  canSubscribe(user: User, subscriber: Subscriber): boolean {
    // User is an subscription admin, or user has subscriber role and is creating subscription for self.

    return (
      isAllowedUser(
        user,
        this.tenantId,
        [ServiceUserRoles.SubscriptionAdmin, ServiceUserRoles.SubscriptionApp],
        true
      ) ||
      (!!user &&
        user?.id === subscriber.userId &&
        (this.publicSubscribe || isAllowedUser(user, this.tenantId, [...this.subscriberRoles])) &&
        this.manageSubscribe)
    );
  }

  async subscribe(
    repository: SubscriptionRepository,
    user: User,
    subscriber: SubscriberEntity,
    criteria?: SubscriptionCriteria
  ): Promise<SubscriptionEntity> {
    if (!this.canSubscribe(user, subscriber)) {
      throw new UnauthorizedError('User not authorized to subscribe.');
    }

    return await SubscriptionEntity.create(repository, subscriber, {
      tenantId: subscriber.tenantId,
      typeId: this.id,
      subscriberId: subscriber.id,
      criteria,
    });
  }

  async unsubscribe(repository: SubscriptionRepository, user: User, subscriber: SubscriberEntity): Promise<boolean> {
    if (!this.canSubscribe(user, subscriber)) {
      throw new UnauthorizedError('User not authorized to unsubscribe.');
    }

    return repository.deleteSubscriptions(subscriber.tenantId, this.id, subscriber.id);
  }

  generateNotifications(
    logger: Logger,
    templateService: TemplateService,
    tenant: Tenant,
    event: DomainEvent,
    subscriptions: SubscriptionEntity[]
  ): Notification[] {
    const notifications: Notification[] = [];
    subscriptions.forEach((subscription) => {
      if (subscription.shouldSend(event)) {
        const notification = this.generateNotification(logger, templateService, tenant, event, subscription);
        if (notification) {
          notifications.push(notification);
        }
      }
    });

    return notifications;
  }

  overrideWith(customType: NotificationTypeEntity): NotificationTypeEntity {
    const mergedType = new NotificationTypeEntity(this);

    mergedType.events.map((event) => {
      customType.events.forEach((ev) => {
        if (`${ev.namespace}:${ev.name}` === `${event.namespace}:${event.name}`) {
          event.templates = { ...event.templates, ...ev.templates };
        }
      });
      return event;
    });

    return mergedType;
  }

  private generateNotification(
    logger: Logger,
    templateService: TemplateService,
    tenant: Tenant,
    event: DomainEvent,
    subscription: SubscriptionEntity
  ): Notification {
    const eventNotification = this.events.find((e) => e.namespace === event.namespace && e.name === event.name);
    const { address, channel } = (eventNotification && subscription.getSubscriberChannel(eventNotification)) || {};

    if (!address) {
      logger.warn(
        `No matching channel for subscriber '${subscription.subscriber?.addressAs}' (ID: ${subscription.subscriber?.id}) on type ${this.id} for event ${event.namespace}:${event.name}.`,
        {
          context: 'NotificationType',
          tenant: event.tenantId?.toString(),
        }
      );

      return null;
    } else {
      const subscriber = {
        id: subscription.subscriber.id,
        userId: subscription.subscriber.userId,
        addressAs: subscription.subscriber.addressAs,
      };

      return {
        tenantId: event.tenantId.toString(),
        type: {
          id: this.id,
          name: this.name,
        },
        event: {
          namespace: event.namespace,
          name: event.name,
          timestamp: event.timestamp,
        },
        correlationId: event.correlationId,
        context: event.context,
        to: address,
        channel,
        message: templateService.generateMessage(this.getTemplate(channel, eventNotification.templates[channel]), {
          event,
          subscriber,
          tenant,
        }),
        subscriber,
      };
    }
  }

  private getTemplate(channel: Channel, template: Template): Template {
    if (channel === Channel.email) {
      template['body'] = getTemplateBody(template.body.toString());
    }
    return template;
  }
}
