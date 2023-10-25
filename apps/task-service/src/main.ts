import * as express from 'express';
import { readFile } from 'fs';
import { promisify } from 'util';
import * as passport from 'passport';
import * as compression from 'compression';
import * as cors from 'cors';
import * as helmet from 'helmet';
import { AdspId, initializePlatform, ServiceMetricsValueDefinition } from '@abgov/adsp-service-sdk';
import type { User } from '@abgov/adsp-service-sdk';
import { createLogger, createErrorHandler } from '@core-services/core-common';
import { environment } from './environments/environment';
import {
  applyTaskMiddleware,
  configurationSchema,
  QueueEntity,
  TaskServiceConfiguration,
  TaskServiceRoles,
  TaskAssignedDefinition,
  TaskCancelledDefinition,
  TaskCompletedDefinition,
  TaskCreatedDefinition,
  TaskPrioritySetDefinition,
  TaskStartedDefinition,
  TaskUpdatedDefinition,
} from './task';
import { createRepositories } from './postgres';

const logger = createLogger('task-service', environment.LOG_LEVEL);

const initializeApp = async (): Promise<express.Application> => {
  const app = express();

  app.use(compression());
  app.use(helmet());
  app.use(express.json({ limit: '1mb' }));
  app.use(cors());

  if (environment.TRUSTED_PROXY) {
    app.set('trust proxy', environment.TRUSTED_PROXY);
  }

  const serviceId = AdspId.parse(environment.CLIENT_ID);
  const accessServiceUrl = new URL(environment.KEYCLOAK_ROOT_URL);
  const {
    coreStrategy,
    configurationHandler,
    eventService,
    metricsHandler,
    tenantHandler,
    tenantStrategy,
    healthCheck,
    traceHandler,
  } = await initializePlatform(
    {
      serviceId,
      displayName: 'Task service',
      description: 'Service that provides a model for tasks and work queues.',
      roles: [
        {
          role: TaskServiceRoles.Admin,
          description: 'Administrator role for tasks, definitions, and queues.',
          inTenantAdmin: true,
        },
        {
          role: TaskServiceRoles.TaskReader,
          description: 'Reader role for access tasks.',
        },
        {
          role: TaskServiceRoles.TaskWriter,
          description: 'Writer role for creating and updating tasks.',
        },
      ],
      events: [
        TaskCreatedDefinition,
        TaskUpdatedDefinition,
        TaskPrioritySetDefinition,
        TaskAssignedDefinition,
        TaskStartedDefinition,
        TaskCompletedDefinition,
        TaskCancelledDefinition,
      ],
      configurationSchema,
      configurationConverter: ({ queues }: TaskServiceConfiguration) => ({
        queues: Object.entries(queues || {}).reduce((qs, [k, q]) => ({ ...qs, [k]: new QueueEntity(q) }), {}),
      }),
      enableConfigurationInvalidation: true,
      clientSecret: environment.CLIENT_SECRET,
      accessServiceUrl,
      directoryUrl: new URL(environment.DIRECTORY_URL),
      values: [ServiceMetricsValueDefinition],
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
  app.use(traceHandler);

  app.use(
    '/task',
    metricsHandler,
    passport.authenticate(['core', 'tenant'], { session: false }),
    tenantHandler,
    configurationHandler
  );

  const repositories = await createRepositories({ logger, ...environment });
  applyTaskMiddleware(app, {
    KEYCLOAK_ROOT_URL: environment.KEYCLOAK_ROOT_URL,
    serviceId,
    logger,
    taskRepository: repositories.taskRepository,
    eventService,
  });

  const swagger = JSON.parse(await promisify(readFile)(`${__dirname}/swagger.json`, 'utf8'));
  app.use('/swagger/docs/v1', (_req, res) => {
    res.json(swagger);
  });

  app.get('/health', async (_req, res) => {
    const platform = await healthCheck();
    res.json({ ...platform, db: await repositories.isConnected() });
  });

  app.get('/', async (req, res) => {
    const rootUrl = new URL(`${req.protocol}://${req.get('host')}`);
    res.json({
      name: 'Task service',
      description: 'Service that provides a model for tasks and work queues.',
      _links: {
        self: { href: new URL(req.originalUrl, rootUrl).href },
        health: { href: new URL('/health', rootUrl).href },
        api: { href: new URL('/task/v1', rootUrl).href },
        docs: { href: new URL('/swagger/docs/v1', rootUrl).href },
      },
    });
  });

  const errorHandler = createErrorHandler(logger);
  app.use(errorHandler);

  return app;
};

initializeApp().then((app) => {
  const port = environment.PORT || 3341;

  const server = app.listen(port, () => {
    logger.info(`Listening at http://localhost:${port}`);
  });
  server.on('error', (err) => logger.error(`Error encountered in server: ${err}`));
});
