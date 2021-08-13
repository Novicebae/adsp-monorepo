import { Router } from 'express';
import { IsDefined } from 'class-validator';
import validationMiddleware from '../../middleware/requestValidator';
import * as HttpStatusCodes from 'http-status-codes';
import { requireTenantServiceAdmin, requireTenantAdmin } from '../../middleware/authentication';
import * as TenantService from '../services/tenant';
import { logger } from '../../middleware/logger';
import { v4 as uuidv4 } from 'uuid';
import { EventService } from '@abgov/adsp-service-sdk';
import { tenantCreated } from '../events';
import { ServiceRegistration } from '../../configuration-management';
import { TenantRepository } from '../repository';
import { TenantServiceRoles } from '../../roles';

class CreateTenantDto {
  @IsDefined()
  name: string;
}
class GetTenantDto {
  @IsDefined()
  id: string;
}
class DeleteTenantDto {
  @IsDefined()
  realm: string;
}
class TenantByEmailDto {
  @IsDefined()
  email;
}

class TenantByRealmDto {
  @IsDefined()
  realm;
}

interface TenantRouterProps {
  eventService: EventService;
  services: ServiceRegistration;
  tenantRepository: TenantRepository;
}

export const createTenantRouter = ({ tenantRepository, eventService, services }: TenantRouterProps): Router => {
  const tenantRouter = Router();

  async function getTenantByEmail(req, res) {
    try {
      const { email } = req.payload;
      console.log(JSON.stringify(email) + '<email');
      console.log(JSON.stringify(req.user) + '<rolesxxxxxssss');
      const tenant = await tenantRepository.findBy({ adminEmail: email });
      console.log(JSON.stringify(tenant) + '<tenant');
      res.json(tenant.obj());
    } catch (e) {
      res.status(HttpStatusCodes.NOT_FOUND).json();
    }
  }

  async function hasAdminRole(req, res) {
    const { roles } = req.user;
    console.log(JSON.stringify(roles) + '<roles');
    console.log(
      JSON.stringify(roles.includes(TenantServiceRoles.TenantAdmin)) + '<roles.includes(TenantServiceRoles.TenantAdmin)'
    );
    res.json(roles.includes(TenantServiceRoles.TenantAdmin));
  }

  async function getTenantByRealm(req, res) {
    const { realm } = req.payload;

    try {
      const tenant = await tenantRepository.findBy({ realm });
      console.log(JSON.stringify(tenant) + '<tenant-----');
      res.json({
        success: true,
        tenant: tenant.obj(),
      });
    } catch (e) {
      logger.error(`Failed to get tenant by realm: ${e.message}`);
      res.status(HttpStatusCodes.BAD_REQUEST).json({
        success: false,
        errors: [e.message],
      });
    }
  }

  async function fetchIssuers(req, res) {
    const issuers = await tenantRepository.issuers();
    if (issuers) {
      res.json(issuers);
    } else {
      res.status(HttpStatusCodes.BAD_REQUEST).json();
    }
  }

  async function fetchRealmTenantMapping(req, res) {
    const mapping = await tenantRepository.fetchRealmToNameMapping();
    if (mapping) {
      res.json(mapping);
    } else {
      res.status(HttpStatusCodes.BAD_REQUEST);
    }
  }

  async function getTenant(req, res) {
    const { id } = req.payload;

    try {
      const tenant = await tenantRepository.findBy({ id });
      res.json({
        success: true,
        tenant: tenant.obj(),
      });
    } catch (e) {
      logger.error(`Failed to get tenant by id: ${e.message}`);
      res.status(HttpStatusCodes.BAD_REQUEST).json({
        success: false,
        errors: [e.message],
      });
    }
  }

  async function createTenant(req, res) {
    const payload = req.payload;
    const tenantName = payload.name;
    const email = req.user.email;

    let tokenIssuer = req.user.token.iss;
    tokenIssuer = tokenIssuer.replace('core', tenantName);

    try {
      const hasRealm = await TenantService.isRealmExisted(tenantName);
      if (hasRealm) {
        // To upgrade existing realm to support platform team service. Email is from the payload
        const email = payload?.email;
        if (!email) {
          throw new TenantService.TenantError('email filed is missing', HttpStatusCodes.BAD_REQUEST);
        }
        logger.info(`Found key realm with name ${tenantName}`);
        await TenantService.validateEmailInDB(email);
        const { ...tenant } = await TenantService.createNewTenantInDB(email, tenantName, tenantName, tokenIssuer);
        const response = { ...tenant, newTenant: false };
        eventService.send(tenantCreated(req.user, response, false));
        res.status(HttpStatusCodes.OK).json(response);
      }

      logger.info('Starting create realm....');

      const generatedRealmName = uuidv4();

      await TenantService.validateEmailInDB(email);
      await TenantService.createRealm(services, generatedRealmName, email, tenantName);
      const { ...tenant } = await TenantService.createNewTenantInDB(email, generatedRealmName, tenantName, tokenIssuer);

      const data = { status: 'ok', message: 'Create Realm Success!', realm: generatedRealmName };

      eventService.send(tenantCreated(req.user, { ...tenant }, true));

      res.status(HttpStatusCodes.OK).json(data);
    } catch (err) {
      if (err instanceof TenantService.TenantError) {
        res.status(err.errorCode).json({ error: err.message });
      }

      res.status(err.response.status).json({ error: err.message });
    }
  }

  async function deleteTenant(req, res) {
    const payload = req.payload;
    const keycloakRealm = payload.realm;

    try {
      const results = await TenantService.deleteTenant(keycloakRealm);
      res.status(HttpStatusCodes.OK).json({
        success: results.IdPBrokerClient.isDeleted && results.keycloakRealm.isDeleted && results.db.isDeleted,
        ...results,
      });
    } catch (err) {
      if (err instanceof TenantService.TenantError) {
        res.status(err.errorCode).json({ error: err.message });
      } else {
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
      }
    }
  }

  async function getRealmRoles(req, res, next) {
    //TODO: suppose we can use the req.tenant to fetch the realm
    const tenant = req.user.token.iss.split('/').pop();

    try {
      const roles = await TenantService.getRealmRoles(tenant);
      res.json({
        roles: roles,
      });
    } catch (err) {
      logger.error(`Failed to get tenant realm roles with error: ${err.message}`);

      next(err);
    }
  }

  /**
   * @deprecated Used for issuers cache and mappings to tenants.
   */
  tenantRouter.get('/issuers', requireTenantServiceAdmin, fetchIssuers);
  tenantRouter.get('/realm/roles', requireTenantAdmin, getRealmRoles);
  tenantRouter.get('/realms/names', requireTenantServiceAdmin, fetchRealmTenantMapping);

  // Tenant admin only APIs
  // Used by the admin web app.
  tenantRouter.post('/', [validationMiddleware(CreateTenantDto)], createTenant);
  tenantRouter.get('/:id', [validationMiddleware(GetTenantDto)], getTenant);
  tenantRouter.get('/realm/:realm', validationMiddleware(TenantByRealmDto), getTenantByRealm);
  tenantRouter.post('/email', [validationMiddleware(TenantByEmailDto)], getTenantByEmail);
  tenantRouter.post('/hasadminrole', hasAdminRole);
  tenantRouter.delete('/', [requireTenantServiceAdmin, validationMiddleware(DeleteTenantDto)], deleteTenant);

  return tenantRouter;
};
