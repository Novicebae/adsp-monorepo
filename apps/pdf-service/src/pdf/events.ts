import { AdspId, DomainEvent, DomainEventDefinition } from '@abgov/adsp-service-sdk';
import { FileResult } from './types';

export const PDF_GENERATION_QUEUED = 'pdf-generation-queued';
export const PdfGenerationQueuedDefinition: DomainEventDefinition = {
  name: PDF_GENERATION_QUEUED,
  description: 'Signalled when a PDF generation job is queued.',
  payloadSchema: {
    type: 'object',
    properties: {
      jobId: { type: 'string' },
      templateId: { type: 'string' },
      requestedBy: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
      },
    },
  },
};

export const PDF_GENERATED = 'pdf-generated';
export const PdfGeneratedDefinition: DomainEventDefinition = {
  name: PDF_GENERATED,
  description: 'Signalled when a PDF has been generated.',
  payloadSchema: {
    type: 'object',
    properties: {
      jobId: { type: 'string' },
      templateId: { type: 'string' },
      file: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          urn: { type: 'string' },
          filename: { type: 'string' },
        },
      },
      requestedBy: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
      },
    },
  },
  interval: {
    namespace: 'pdf-service',
    name: PDF_GENERATION_QUEUED,
    metric: 'pdf-generation',
  },
};

export const PDF_GENERATION_FAILED = 'pdf-generation-failed';
export const PdfGenerationFailedDefinition: DomainEventDefinition = {
  name: PDF_GENERATION_FAILED,
  description: 'Signalled when a PDF generation has failed.',
  payloadSchema: {
    type: 'object',
    properties: {
      jobId: { type: 'string' },
      templateId: { type: 'string' },
      requestedBy: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
      },
    },
  },
  interval: {
    namespace: 'pdf-service',
    name: PDF_GENERATION_QUEUED,
    metric: 'pdf-generation-failed',
  },
};

export const pdfGenerationQueued = (
  tenantId: AdspId,
  jobId: string,
  templateId: string,
  requestedBy: { id: string; name: string }
): DomainEvent => ({
  name: PDF_GENERATION_QUEUED,
  tenantId,
  correlationId: jobId,
  context: { jobId, templateId },
  timestamp: new Date(),
  payload: {
    jobId,
    templateId,
    requestedBy,
  },
});

export const pdfGenerated = (
  tenantId: AdspId,
  jobId: string,
  templateId: string,
  file: FileResult,
  requestedBy: { id: string; name: string }
): DomainEvent => ({
  name: PDF_GENERATED,
  tenantId,
  correlationId: jobId,
  context: { jobId, templateId },
  timestamp: new Date(),
  payload: {
    jobId,
    templateId,
    file,
    requestedBy,
  },
});

export const pdfGenerationFailed = (
  tenantId: AdspId,
  jobId: string,
  templateId: string,
  requestedBy: { id: string; name: string }
): DomainEvent => ({
  name: PDF_GENERATION_FAILED,
  tenantId,
  correlationId: jobId,
  context: { jobId, templateId },
  timestamp: new Date(),
  payload: {
    jobId,
    templateId,
    requestedBy,
  },
});
