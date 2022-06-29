import { AdspId, initializePlatform, User } from '@abgov/adsp-service-sdk';
import { createErrorHandler } from '@core-services/core-common';
import * as cors from 'cors';
import * as compression from 'compression';
import * as helmet from 'helmet';
import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import * as healthCheck from 'express-healthcheck';
import * as fs from 'fs';
import * as passport from 'passport';
import { environment } from './environments/environment';
import { createRepositories, disconnect } from './mongo';
import { logger } from './middleware/logger';
import {
  TenantCreatedDefinition,
  TenantDeletedDefinition,
  configurationSchema,
  applyTenantMiddleware,
  TenantServiceImpl,
  TenantServiceRoles,
} from './tenant';
import { createKeycloakRealmService } from './keycloak';

async function initializeApp(): Promise<express.Application> {
  const repositories = await createRepositories({ ...environment, logger });

  const app = express();
  app.use(compression());
  app.use(helmet());
  app.use(express.json());
  app.use(cors());

  if (environment.TRUSTED_PROXY) {
    app.set('trust proxy', environment.TRUSTED_PROXY);
  }

  const serviceId = AdspId.parse(environment.CLIENT_ID);
  const { coreStrategy, tenantStrategy, eventService, configurationHandler } = await initializePlatform(
    {
      serviceId,
      displayName: 'Tenant service',
      description: 'Service for management of ADSP tenants.',
      clientSecret: environment.CLIENT_SECRET,
      directoryUrl: new URL(environment.DIRECTORY_URL),
      accessServiceUrl: new URL(environment.KEYCLOAK_ROOT_URL),
      configurationSchema,
      configurationConverter: (c) => Object.entries(c).map(([k, v]) => ({ serviceId: AdspId.parse(k), ...v })),
      events: [TenantCreatedDefinition, TenantDeletedDefinition],
      roles: [
        // Note: Tenant Admin role is a special composite role.
        {
          role: TenantServiceRoles.TenantAdmin,
          description: 'Administrator role for accessing the ADSP tenant admin.',
        },
        {
          role: TenantServiceRoles.PlatformService,
          description: 'Service role for backend services for reading tenants.',
        },
      ],
    },
    { logger },
    {
      tenantService: new TenantServiceImpl(repositories.tenantRepository),
    }
  );

  passport.use('jwt', coreStrategy);
  passport.use('jwt-tenant', tenantStrategy);

  passport.serializeUser(function (user, done) {
    done(null, user);
  });
  passport.deserializeUser(function (user, done) {
    done(null, user as User);
  });

  app.use(passport.initialize());

  app.use('/health', healthCheck());

  // Q: log info should include user info?
  app.use('/', (req: Request, resp: Response, next: NextFunction) => {
    resp.on('finish', () => {
      if (resp.statusCode === 401) {
        logger.error('401 Unauthorized, Please set valid token in request', `${JSON.stringify(req.query)}`);
      } else if (resp.statusCode === 404) {
        logger.error('404 Not Found, Please input valid request resource', `${JSON.stringify(req.query)}`);
      }
    });
    logger.debug(`${req.method} ${req.path}`);
    next();
  });

  const realmService = createKeycloakRealmService({ logger, KEYCLOAK_ROOT_URL: environment.KEYCLOAK_ROOT_URL });
  applyTenantMiddleware(app, {
    ...repositories,
    logger,
    eventService,
    realmService,
    configurationHandler,
  });

  const errorHandler = createErrorHandler(logger);
  app.use(errorHandler);

  let swagger = null;

  app.get('/', async (req, res) => {
    const rootUrl = new URL(`${req.protocol}://${req.get('host')}`);
    res.json({
      name: 'Tenant service',
      description: 'Service for management of ADSP tenants.',
      _links: {
        self: { href: new URL(req.originalUrl, rootUrl).href },
        health: { href: new URL('/health', rootUrl).href },
        docs: { href: new URL('/swagger/docs/v1', rootUrl).href },
      },
    });
  });

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
  return app;
}

initializeApp()
  .then((app) => {
    const port = environment.PORT || 3333;

    const server = app.listen(port, () => {
      logger.info(`Listening at http://localhost:${port}/api`);
    });

    const handleExit = async (message: string, code: number, err: Error) => {
      await disconnect(logger);
      server.close();
      err === null ? logger.info(message) : logger.error(message, err);
      process.exit(code);
    };

    process.on('SIGINT', async () => {
      handleExit('Tenant management api exit, Byte', 1, null);
    });
    process.on('SIGTERM', async () => {
      handleExit('Tenant management api was termination, Byte', 1, null);
    });
    process.on('uncaughtException', async (err: Error) => {
      handleExit('Tenant management api Uncaught exception', 1, err);
    });
  })
  .catch((err) => logger.error(err));
