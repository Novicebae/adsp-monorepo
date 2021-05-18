import { AuthenticationConfig, authenticateToken } from '@core-services/core-common';
import type { RequestHandler } from 'express';
import * as HttpStatusCodes from 'http-status-codes';

enum TenantServiceRoles {
  TenantServiceAdmin = 'tenant-service-admin',
  PlatformService = 'platform-service',
  DirectoryAdmin = 'directory-admin',
}

export const requireTenantServiceAdmin: RequestHandler = async (req, res, next: () => void) => {
  const authConfig: AuthenticationConfig = {
    requireCore: true,
    allowedRoles: [TenantServiceRoles.TenantServiceAdmin],
  };

  if (authenticateToken(authConfig, req.user)) {
    next();
  } else {
    res.sendStatus(HttpStatusCodes.UNAUTHORIZED);
  }
};

export const requireDirectoryAdmin: RequestHandler = async (req, res, next: () => void) => {
  const authConfig: AuthenticationConfig = {
    requireCore: true,
    allowedRoles: [TenantServiceRoles.DirectoryAdmin],
  };

  if (authenticateToken(authConfig, req.user)) {
    next();
  } else {
    res.sendStatus(HttpStatusCodes.UNAUTHORIZED);
  }
};

export const requirePlatformService: RequestHandler = (req, res, next) => {
  const authConfig: AuthenticationConfig = {
    requireCore: true,
    allowedRoles: [TenantServiceRoles.PlatformService],
  };

  if (authenticateToken(authConfig, req.user)) {
    next();
  } else {
    res.sendStatus(HttpStatusCodes.UNAUTHORIZED);
  }
};
