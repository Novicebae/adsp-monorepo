import { Router } from 'express';
import * as passport from 'passport';

import directoryRouter from './directory';
import fileRouter from './file';
import realmRouter from './realm';
import { tenantPublicRouter, tenantRouter } from './tenant';

export const apiRouter = Router();
export const apiPublicRouter = Router();

const passportMiddleware = passport.authenticate(['jwt'], { session: false });

apiPublicRouter.use('/tenant/v1', tenantPublicRouter);
apiRouter.use('/discovery/v1', [passportMiddleware, directoryRouter]);
apiRouter.use('/realm', [passportMiddleware, realmRouter]);
apiRouter.use('/file/v1', [passportMiddleware, fileRouter]);
apiRouter.use('/tenant/v1', [passportMiddleware, tenantRouter]);
