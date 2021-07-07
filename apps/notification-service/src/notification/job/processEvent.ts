import type { AdspId, ConfigurationService, TokenProvider } from '@abgov/adsp-service-sdk';
import type { DomainEvent, WorkQueueService } from '@core-services/core-common';
import { Logger } from 'winston';
import type { Notification } from '../types';
import type { SubscriptionRepository } from '../repository';
import type { TemplateService } from '../template';
import { NotificationConfiguration } from '../configuration';

interface ProcessEventJobProps {
  logger: Logger;
  serviceId: AdspId;
  tokenProvider: TokenProvider;
  configurationService: ConfigurationService;
  templateService: TemplateService;
  subscriptionRepository: SubscriptionRepository;
  queueService: WorkQueueService<Notification>;
}

export const createProcessEventJob = ({
  logger,
  serviceId,
  tokenProvider,
  configurationService,
  templateService,
  subscriptionRepository,
  queueService,
}: ProcessEventJobProps) => async (event: DomainEvent, done: (err?: unknown) => void): Promise<void> => {
  const { tenantId, namespace, name } = event;
  logger.debug(`Processing event ${namespace}:${name} for tenant ${tenantId}...`);

  try {
    const token = await tokenProvider.getAccessToken();
    const configuration = await configurationService.getConfiguration<NotificationConfiguration>(
      serviceId,
      token,
      tenantId
    );

    const types = configuration?.getEventNotificationTypes(event) || [];
    let count = 0;
    for (let i = 0; i < types.length; i++) {
      const type = types[i];

      // Page through all subscriptions and generate notifications.
      const notifications = [];
      let after: string = null;
      do {
        const { results, page } = await subscriptionRepository.getSubscriptions(type, 1000, after);
        const pageNotifications = type.generateNotifications(templateService, event, results);
        notifications.push(...pageNotifications);
        after = page.next;
      } while (after);

      notifications.forEach((notification) => queueService.enqueue(notification));
      count += notifications.length;
      logger.debug(
        `Generated ${notifications.length} notifications of type ${type.name} (ID: ${type.id}) for ${namespace}:${name} for tenant ${tenantId}.`
      );
    }

    if (count > 0) {
      logger.info(`Generated ${count} notifications for event ${namespace}:${name} for tenant ${tenantId}.`);
    } else {
      logger.debug(`Processed event ${namespace}:${name} for tenant ${tenantId} with no notifications generated.`);
    }

    done();
  } catch (err) {
    logger.warn(`Error encountered on processing event ${namespace}:${name}. ${err}`);
    done(err);
  }
};
