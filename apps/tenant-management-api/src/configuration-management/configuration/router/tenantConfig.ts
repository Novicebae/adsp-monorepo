import { Request, Response, Router } from 'express';
import { TenantConfigurationRepository } from '../repository';
import { mapTenantConfig } from './mappers';
import { TenantConfigEntity } from '../model';
import HttpException from '../errorHandlers/httpException';
import * as HttpStatusCodes from 'http-status-codes';
import { errorHandler } from '../errorHandlers';
interface TenantConfigRouterProps {
  tenantConfigurationRepository: TenantConfigurationRepository;
}

export const createTenantConfigurationRouter = ({ tenantConfigurationRepository }: TenantConfigRouterProps): Router => {
  const tenantConfigRouter = Router();

  tenantConfigRouter.get('/list', async (req: Request, res: Response, _next) => {
    const { top, after } = req.query;

    try {
      const results = await tenantConfigurationRepository.find(parseInt((top as string) || '10', 10), after as string);

      res.json({
        page: results.page,
        results: results.results.map(mapTenantConfig),
      });
    } catch (err) {
      errorHandler(err, req, res);
    }
  });

  tenantConfigRouter.get('/', async (req, res, _next) => {
    const user = req.user;
    const tenant = `${user.tenantId}`;
    try {
      const results = await tenantConfigurationRepository.getTenantConfig(tenant);

      if (!results) {
        throw new HttpException(HttpStatusCodes.NOT_FOUND, `Tenant Config for tenant '${tenant}' not found`);
      }
      res.json(mapTenantConfig(results));
    } catch (err) {
      errorHandler(err, req, res);
    }
  });

  tenantConfigRouter.get('/:service', async (req, res, _next) => {
    const { service } = req.params;
    const user = req.user;
    const tenant = `${user.tenantId}`;
    try {
      const results = await tenantConfigurationRepository.getTenantConfig(tenant);

      if (!results) {
        throw new HttpException(HttpStatusCodes.NOT_FOUND, `Tenant Config for tenant '${tenant}' not found`);
      }
      res.json(mapTenantConfig(results).configurationSettingsList[service] || {});
    } catch (err) {
      errorHandler(err, req, res);
    }
  });

  tenantConfigRouter.post('/', async (req: Request, res: Response) => {
    const data = req.body;
    const { configurationSettingsList } = data;
    const user = req.user;
    const tenant = `${user.tenantId}`;
    try {
      if (!configurationSettingsList) {
        throw new HttpException(HttpStatusCodes.BAD_REQUEST, 'Tenant Realm Configuration Settings are required');
      }

      const tenantConfig = await tenantConfigurationRepository.getTenantConfig(tenant);
      let entity;
      if (tenantConfig) {
        entity = await tenantConfig.update(configurationSettingsList);
      } else {
        entity = await TenantConfigEntity.create(tenantConfigurationRepository, {
          ...data,
          tenantName: tenant,
        });
      }

      res.json(mapTenantConfig(entity));
    } catch (err) {
      errorHandler(err, req, res);
    }
  });

  tenantConfigRouter.put('/:service', async (req: Request, res: Response) => {
    const { service } = req.params;
    const serviceSettings = req.body;
    const user = req.user;
    const tenant = `${user.tenantId}`;
    try {
      if (!serviceSettings) {
        throw new HttpException(HttpStatusCodes.BAD_REQUEST, 'Tenant Realm Configuration Settings are required');
      }

      const tenantConfig = await tenantConfigurationRepository.getTenantConfig(tenant);
      const entity = await tenantConfig.updateService(service, serviceSettings);

      res.json(mapTenantConfig(entity).configurationSettingsList[service]);
    } catch (err) {
      errorHandler(err, req, res);
    }
  });

  tenantConfigRouter.put('/', async (req: Request, res: Response) => {
    const data = req.body;
    const user = req.user;
    const tenant = `${user.tenantId}`;
    const { configurationSettingsList } = data;
    console.log('put ', configurationSettingsList);
    try {
      const tenantConfig = await tenantConfigurationRepository.getTenantConfig(tenant);

      if (!tenantConfig) {
        throw new HttpException(HttpStatusCodes.NOT_FOUND, `Tenant Config for tenant ${tenant} not found`);
      }
      const entity = await tenantConfig.update(configurationSettingsList);

      res.json(mapTenantConfig(entity));
    } catch (err) {
      errorHandler(err, req, res);
    }
  });

  tenantConfigRouter.delete('/', async (req: Request, res: Response) => {
    const user = req.user;
    const tenant = `${user.tenantId}`;

    try {
      const results = await tenantConfigurationRepository.getTenantConfig(tenant);

      if (!results) {
        throw new HttpException(HttpStatusCodes.NOT_FOUND, `Tenant Config for tenant ${tenant} not found`);
      }
      const success = await results.delete();
      res.json(success);
    } catch (err) {
      errorHandler(err, req, res);
    }
  });

  return tenantConfigRouter;
};
