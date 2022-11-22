import { Schema } from 'mongoose';

export const serviceStatusEndpointSchema = new Schema(
  {
    status: {
      type: String,
      default: 'disabled',
      required: true,
    },
  },
  { _id: false }
);

export const endpointStatusEntrySchema = new Schema({
  ok: {
    type: Boolean,
  },
  url: {
    type: String,
    required: true,
  },
  status: {
    type: String,
  },
  applicationId: {
    type: String,
  },
  responseTime: {
    type: Number,
  },
  timestamp: {
    type: Number,
    index: true,
  },
});

export const serviceStatusApplicationSchema = new Schema(
  {
    appKey: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    statusTimestamp: {
      type: Number,
    },
    status: {
      type: String,
    },
    enabled: {
      type: Boolean,
    },
    endpoint: serviceStatusEndpointSchema,
  },
  { timestamps: true }
);

export const noticeEndpointSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

export const noticeApplicationSchema = new Schema(
  {
    message: {
      type: String,
      required: true,
    },
    tennantServRef: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    mode: {
      type: String,
      default: 'draft',
    },
    tenantId: {
      type: String,
      required: true,
    },
    isAllApplications: {
      type: Boolean,
      default: false,
    },
    endpoints: [noticeEndpointSchema],
    tenantName: {
      type: String,
    },
  },
  { timestamps: true }
);

// The property key for the configuration schema is the appKey prefixed by "app_".
// DEPRECATED It can also be a mongo _id (12 hex bytes), but this is
// supported for legacy purposes only (Nov. 2022).  Do not use.
export const appPropertyRegex = '(^[a-fA-F0-9]{24}$)|(^app_.+$)';

export const configurationSchema = {
  type: 'object',
  properties: {
    contact: {
      type: 'object',
      properties: {
        contactEmail: { type: 'string' },
      },
    },
  },
  patternProperties: {
    appPropertyRegex: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        appKey: { type: 'string', description: 'A unique identifier for the application' },
        name: { type: 'string', description: 'Name of the application' },
        url: { type: 'string', description: 'URL to be checked' },
        description: { type: 'string', description: 'Tell us about your application' },
      },
      required: ['name', 'url'],
      additionalProperties: false,
    },
  },
  additionalProperties: true,
};

noticeApplicationSchema.index({ createdAt: 1 });
