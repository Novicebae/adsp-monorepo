import { Router } from 'express';
import * as passport from 'passport';

import directoryRouter from './directory';
import fileRouter from './file';
import realmRouter from './realm';
import { tenantPublicRouter, tenantRouter } from './tenant';

export const apiRouter = Router();
const passportMiddleware = passport.authenticate(['jwt'], { session: false });

apiRouter.use('/discovery/v1', [passportMiddleware, directoryRouter]);
apiRouter.use('/realm', [passportMiddleware, realmRouter]);
apiRouter.use('/file/v1', [passportMiddleware, realmRouter]);
apiRouter.use('/tenant/v1', [passportMiddleware, realmRouter]);

apiRouter.use('/tenant/v1', tenantPublicRouter);
