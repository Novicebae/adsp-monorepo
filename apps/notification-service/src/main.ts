import { AdspId, initializePlatform, UnauthorizedUserError, User } from '@abgov/adsp-service-sdk';
import {
  createLogger,
  createAmqpEventService,
  createAmqpQueueService,
  createErrorHandler,
  assertAuthenticatedHandler,
} from '@core-services/core-common';
import { InstallProvider } from '@slack/oauth';
import * as express from 'express';
import * as fs from 'fs';
import * as passport from 'passport';
import * as compression from 'compression';
import * as cors from 'cors';
import * as helmet from 'helmet';
import { environment } from './environments/environment';
import {
  applyNotificationMiddleware,
  Channel,
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
import { createABNotifySmsProvider, createEmailProvider, createSlackProvider } from './provider';
import { createTemplateService } from './handlebars';

const logger = createLogger('notification-service', environment.LOG_LEVEL || 'info');

async function initializeApp() {
  const app = express();

  app.use(compression());
  app.use(helmet());
  app.use(express.json({ limit: '1mb' }));
  app.use(cors());

  const serviceId = AdspId.parse(environment.CLIENT_ID);
  const {
    tenantStrategy,
    tenantHandler,
    tokenProvider,
    configurationHandler,
    configurationService,
    eventService,
    healthCheck,
  } = await initializePlatform(
    {
      displayName: 'Notification Service',
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
      ],
    },
    { logger }
  );

  passport.use('jwt', tenantStrategy);

  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    done(null, user as User);
  });

  app.use(passport.initialize());
  app.use('/subscription', passport.authenticate(['jwt'], { session: false }), tenantHandler, configurationHandler);

  const { installationStore, ...repositories } = await createRepositories({ ...environment, logger });

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

  const slackInstaller = new InstallProvider({
    clientId: environment.SLACK_CLIENT_ID,
    clientSecret: environment.SLACK_CLIENT_SECRET,
    stateSecret: environment.SLACK_STATE_SECRET,
    installationStore,
  });

  const templateService = createTemplateService();
  applyNotificationMiddleware(app, {
    ...repositories,
    serviceId,
    logger,
    tokenProvider,
    configurationService,
    eventService,
    templateService,
    eventSubscriber,
    queueService,
    providers: {
      [Channel.email]: environment.SMTP_HOST ? createEmailProvider(environment) : null,
      [Channel.sms]: environment.NOTIFY_API_KEY ? createABNotifySmsProvider(environment) : null,
      [Channel.slack]: environment.SLACK_CLIENT_ID ? createSlackProvider(logger, slackInstaller) : null,
    },
  });

  // This should be done with 'trust proxy', but that depends on the proxies using the x-forward headers.
  const ROOT_URL = 'rootUrl';
  function getRootUrl(req: express.Request, _res: express.Response, next: express.NextFunction) {
    const host = req.get('host');
    req[ROOT_URL] = new URL(`${host === 'localhost' ? 'http' : 'https'}://${host}`);
    next();
  }

  app.get(
    '/slack/install',
    passport.authenticate(['jwt'], { session: false }),
    assertAuthenticatedHandler,
    getRootUrl,
    async (req, res, next) => {
      try {
        const user = req.user;
        if (!user.roles?.includes(ServiceUserRoles.SubscriptionAdmin)) {
          throw new UnauthorizedUserError('install Slack app', user);
        }

        const { from } = req.query;
        const slackInstall = await slackInstaller.generateInstallUrl({
          scopes: ['chat:write'],
          metadata: from as string,
          redirectUri: new URL('/slack/oauth_redirect', req[ROOT_URL]).href,
        });

        res.send(slackInstall);
      } catch (err) {
        next(err);
      }
    }
  );

  app.get('/slack/oauth_redirect', async (req, res) => {
    await slackInstaller.handleCallback(req, res, {
      success: (_installation, options) => res.redirect(options.metadata),
    });
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
        slack: new URL('/slack/install', rootUrl).href,
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
