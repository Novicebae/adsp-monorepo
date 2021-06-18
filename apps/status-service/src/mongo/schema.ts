import { Schema } from 'mongoose';

export const serviceStatusEndpointSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
    },
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
  responseTime: {
    type: Number,
  },
  timestamp: {
    type: Number,
  },
});

export const serviceStatusApplicationSchema = new Schema(
  {
    tenantId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    statusTimestamp: {
      type: Number,
    },
    publicStatus: {
      type: String,
      required: false,
    },
    internalStatus: {
      type: String,
      default: 'disabled',
      required: true,
    },
    endpoints: [serviceStatusEndpointSchema],
  },
  { timestamps: true }
);
