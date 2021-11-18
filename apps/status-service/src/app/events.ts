import { AdspId, DomainEvent, DomainEventDefinition } from '@abgov/adsp-service-sdk';
import { ServiceStatusApplication } from './types';

const ApplicationDefinition = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: ['string', 'null'] },
    description: { type: ['string', 'null'] },
    url: { type: ['string', 'null'] },
  },
};

interface ApplicationEvent {
  id: string;
  name: string;
  description: string;
  url: string;
}

export const HealthCheckStartedDefinition: DomainEventDefinition = {
  name: 'health-check-started',
  description: 'Signalled when healthcheck started for an event.',
  payloadSchema: {
    type: 'object',
    properties: {
      application: ApplicationDefinition,
    },
  },
};

export const HealthCheckStoppedDefinition: DomainEventDefinition = {
  name: 'health-check-stopped',
  description: 'Signalled when an application health check is stopped.',
  payloadSchema: {
    type: 'object',
    properties: {
      application: ApplicationDefinition,
    },
  },
};

export const HealthCheckHealthyDefinition: DomainEventDefinition = {
  name: 'application-healthy',
  description: 'Signalled when an application is determined to be healthy by the health check.',
  payloadSchema: {
    type: 'object',
    properties: {
      application: ApplicationDefinition,
    },
  },
};

export const HealthCheckUnhealthyDefinition: DomainEventDefinition = {
  name: 'application-unhealthy',
  description: 'Signalled when an application is determined to be unhealthy by the health check.',
  payloadSchema: {
    type: 'object',
    properties: {
      application: ApplicationDefinition,
      error: { type: 'string' },
    },
  },
};

export const ApplicationStatusChangedDefinition: DomainEventDefinition = {
  name: 'application-status-changed',
  description: 'Signalled when an application status is changed.',
  payloadSchema: {
    type: 'object',
    properties: {
      applicationId: {
        type: 'string',
      },
      applicationName: {
        type: 'string',
      },
      applicationDescription: {
        type: 'string',
      },
      originalStatus: {
        type: 'string',
      },
      newStatus: {
        type: 'string',
      },
      updatedBy: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          userName: { type: 'string' },
        },
      },
    },
  },
};

const mapApplication = (application: ServiceStatusApplication): ApplicationEvent => {
  return {
    id: application._id,
    name: application.name,
    description: application.description,
    url: application.endpoint.url,
  };
};

export const applicationStatusToStarted = (application: ServiceStatusApplication): DomainEvent => ({
  name: 'health-check-started',
  timestamp: new Date(),
  tenantId: AdspId.parse(application.tenantId),
  payload: {
    application: mapApplication(application),
  },
});

export const applicationStatusToStopped = (application: ServiceStatusApplication): DomainEvent => ({
  name: 'health-check-stopped',
  timestamp: new Date(),
  tenantId: AdspId.parse(application.tenantId),
  payload: {
    application: mapApplication(application),
  },
});

export const applicationStatusToUnhealthy = (application: ServiceStatusApplication, error: string): DomainEvent => ({
  name: 'application-unhealthy',
  timestamp: new Date(),
  tenantId: AdspId.parse(application.tenantId),
  payload: {
    application: mapApplication(application),
    error,
  },
});

export const applicationStatusToHealthy = (application: ServiceStatusApplication): DomainEvent => ({
  name: 'application-healthy',
  timestamp: new Date(),
  tenantId: AdspId.parse(application.tenantId),
  payload: {
    application: mapApplication(application),
  },
});

export const applicationStatusChange = (application: ServiceStatusApplication): DomainEvent => ({
  name: 'application-status-changed',
  timestamp: new Date(),
  tenantId: AdspId.parse(application.tenantId),
  payload: {
    application: mapApplication(application),
  },
});
