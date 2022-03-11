export interface NotificationItem {
  name: string;
  description?: string;
  events: Array<EventItem>;
  subscriberRoles: string[];
  channels: string[];
  id: string;
  publicSubscribe: boolean;
  customized?: boolean;
  manageSubscribe?: boolean;
}

export interface ContactInformation {
  contactEmail?: string;
  phoneNumber?: string;
  supportInstructions?: string;
}

export interface EventItem {
  name: string;
  namespace?: string;
  templates?: Template;
  customized?: boolean;
}

export interface Template {
  email?: notifyText;
  sms?: notifyText;
}

export interface notifyText {
  subject: string;
  body: string;
}

export interface RequestBodyProperties {
  type?: string;
  description?: string;
  format?: string;
}
export interface RequestBodySchema {
  schema: {
    properties: Record<string, RequestBodyProperties>;
  };
}

export interface NotificationMetrics {
  notificationsSent?: number;
  notificationsFailed?: number;
}

export interface NotificationState {
  supportContact: ContactInformation;
  notificationTypes: Record<string, NotificationItem> | undefined;
  core: Record<string, NotificationItem>;
  metrics: NotificationMetrics;
}

export const NOTIFICATION_INIT: NotificationState = {
  supportContact: {},
  notificationTypes: undefined,
  core: {},
  metrics: {},
};
