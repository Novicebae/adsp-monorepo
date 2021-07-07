import * as fs from 'fs';
import { Application } from 'express';
import { Logger } from 'winston';
import { DomainEventSubscriberService, WorkQueueService } from '@core-services/core-common';
import { Repositories } from './repository';
import { createJobs } from './job';
import { TemplateService } from './template';
import { Notification, Providers } from './types';
import { createSubscriptionRouter } from './router';
import { AdspId, ConfigurationService, TokenProvider } from '@abgov/adsp-service-sdk';

export * from './types';
export * from './repository';
export * from './model';
export * from './template';

interface NotificationMiddlewareProps extends Repositories {
  serviceId: AdspId;
  logger: Logger;
  tokenProvider: TokenProvider;
  configurationService: ConfigurationService;
  templateService: TemplateService;
  eventSubscriber: DomainEventSubscriberService;
  queueService: WorkQueueService<Notification>;
  providers: Providers;
}

export const applyNotificationMiddleware = (
  app: Application,
  {
    serviceId,
    logger,
    tokenProvider,
    configurationService,
    subscriptionRepository,
    templateService,
    eventSubscriber,
    queueService,
    providers,
  }: NotificationMiddlewareProps
): Application => {
  createJobs({
    serviceId,
    logger,
    tokenProvider,
    configurationService,
    templateService,
    events: eventSubscriber.getItems(),
    queueService,
    subscriptionRepository,
    providers,
  });

  const routerProps = {
    logger,
    subscriptionRepository,
  };
  const subscriptionRouter = createSubscriptionRouter(routerProps);

  app.use('/subscription/v1', subscriptionRouter);

  let swagger = null;
  app.use('/swagger/docs/v1', (req, res) => {
    if (swagger) {
      res.json(swagger);
    } else {
      fs.readFile(`${__dirname}/swagger.json`, 'utf8', (err, data) => {
        if (err) {
          res.sendStatus(404);
        } else {
          swagger = JSON.parse(data);
          res.json(swagger);
        }
      });
    }
  });

  return app;
};
