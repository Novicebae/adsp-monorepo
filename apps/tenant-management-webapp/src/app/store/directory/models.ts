export interface Directory {
  directory: Service[];
}
export interface Service {
  name?: string;
  _id?: string;
  namespace: string;
  service?: string;
  api?: string;
  url: string;
  urn?: string;
  metadata?: Metadata;
  isCore?: boolean;
}

export interface Metadata {
  name?: string;
  description?: string;
  _links?: Links;
}
export interface Links {
  self: { href: string };
  docs?: { href: string };
  api?: { href: string };
  health?: { href: string };
}

export interface MetadataFetchResponse {
  _id: string;
  service: string;
  host: string;
  metadata: Metadata;
}

export const defaultService: Service = {
  namespace: '',
  url: '',
  service: '',
  api: '',
  urn: '',
};

export const DIRECTORY_INIT: Directory = {
  directory: [],
};
