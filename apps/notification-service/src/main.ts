import { AdspId, initializePlatform, User } from '@abgov/adsp-service-sdk';
import {
  createLogger,
  createAmqpEventService,
  createAmqpQueueService,
  createErrorHandler,
  createAmqpConfigUpdateService,
} from '@core-services/core-common';
import * as express from 'express';
import * as fs from 'fs';
import * as passport from 'passport';
import * as compression from 'compression';
import * as cors from 'cors';
import * as helmet from 'helmet';
import { environment } from './environments/environment';
import {
  applyNotificationMiddleware,
  configurationSchema,
  Notification,
  NotificationConfiguration,
  NotificationSendFailedDefinition,
  NotificationSentDefinition,
  NotificationsGeneratedDefinition,
  NotificationType,
  ServiceUserRoles,
} from './notification';
import { createRepositories } from './mongo';
import { initializeProviders } from './provider';
import { createTemplateService } from './handlebars';
import { createVerifyService } from './verify';

const logger = createLogger('notification-service', environment.LOG_LEVEL || 'info');

async function initializeApp() {
  const app = express();

  app.use(compression());
  app.use(helmet());
  app.use(express.json({ limit: '1mb' }));
  app.use(cors());

  const serviceId = AdspId.parse(environment.CLIENT_ID);
  const {
    coreStrategy,
    tenantStrategy,
    tenantHandler,
    tokenProvider,
    tenantService,
    configurationHandler,
    configurationService,
    clearCached,
    directory,
    eventService,
    healthCheck,
  } = await initializePlatform(
    {
      displayName: 'Notification service',
      description: 'Service for subscription based notifications.',
      serviceId,
      accessServiceUrl: new URL(environment.KEYCLOAK_ROOT_URL),
      clientSecret: environment.CLIENT_SECRET,
      directoryUrl: new URL(environment.DIRECTORY_URL),
      configurationSchema,
      configurationConverter: (config: Record<string, NotificationType>, tenantId?: AdspId) =>
        new NotificationConfiguration(config, tenantId),
      events: [NotificationsGeneratedDefinition, NotificationSentDefinition, NotificationSendFailedDefinition],
      roles: [
        {
          role: ServiceUserRoles.SubscriptionAdmin,
          description: 'Administrator role for managing subscriptions',
          inTenantAdmin: true,
        },
        {
          role: ServiceUserRoles.SubscriptionApp,
          description: 'Role for service accounts that allows update of subscribers and subscriptions.',
        },
        {
          role: ServiceUserRoles.CodeSender,
          description: 'Role for sending and checking verify codes to subscribers',
        },
      ],
    },
    { logger }
  );

  passport.use('core', coreStrategy);
  passport.use('tenant', tenantStrategy);

  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    done(null, user as User);
  });

  app.use(passport.initialize());
  app.use(
    '/subscription',
    passport.authenticate(['core', 'tenant'], { session: false }),
    tenantHandler,
    configurationHandler
  );

  const { botRepository, ...repositories } = await createRepositories({ ...environment, logger });

  const eventSubscriber = await createAmqpEventService({
    ...environment,
    queue: 'event-notification',
    logger,
  });

  const queueService = await createAmqpQueueService<Notification>({
    ...environment,
    queue: 'notification-send',
    logger,
  });

  const configurationSync = await createAmqpConfigUpdateService({
    ...environment,
    logger,
  });

  configurationSync.getItems().subscribe(({ item, done }) => {
    clearCached(item.tenantId, item.serviceId);
    done();
  });

  // This should be done with 'trust proxy', but that depends on the proxies using the x-forward headers.
  const ROOT_URL = 'rootUrl';
  function getRootUrl(req: express.Request, _res: express.Response, next: express.NextFunction) {
    const host = req.get('host');
    req[ROOT_URL] = new URL(`${host === 'localhost' ? 'http' : 'https'}://${host}`);
    next();
  }

  const templateService = createTemplateService();

  const providers = initializeProviders(logger, app, botRepository, environment);

  const verifyService = createVerifyService({ providers, templateService, directory, tokenProvider });

  applyNotificationMiddleware(app, {
    ...repositories,
    serviceId,
    logger,
    tokenProvider,
    configurationService,
    eventService,
    templateService,
    tenantService,
    eventSubscriber,
    queueService,
    verifyService,
    providers,
  });

  let swagger = null;
  app.use('/swagger/docs/v1', (_req, res) => {
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

  app.get('/health', async (_req, res) => {
    const platform = await healthCheck();
    res.json({
      ...platform,
      db: repositories.isConnected(),
      msg: eventSubscriber.isConnected(),
    });
  });

  app.get('/', getRootUrl, async (req, res) => {
    const rootUrl = req[ROOT_URL];
    res.json({
      _links: {
        self: new URL(req.originalUrl, rootUrl).href,
        health: new URL('/health', rootUrl).href,
        api: new URL('/subscription/v1', rootUrl).href,
        doc: new URL('/swagger/docs/v1', rootUrl).href,
      },
    });
  });

  const errorHandler = createErrorHandler(logger);
  app.use(errorHandler);

  return app;
}

initializeApp().then((app) => {
  const port = environment.PORT || 3335;

  const server = app.listen(port, () => {
    logger.info(`Listening at http://localhost:${port}`);
  });
  server.on('error', (err) => logger.error(`Error encountered in server: ${err}`));
});
