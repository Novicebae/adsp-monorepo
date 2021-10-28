import { NotificationType } from '@abgov/adsp-service-sdk';
import { FORM_LOCKED, FORM_SUBMITTED, FORM_UNLOCKED } from './events';

const FORM_EVENT_NAMESPACE = 'form-service';

export const FormStatusNotificationType: NotificationType = {
  name: 'form-status-updates',
  description: 'Provides notification of updates to the status of a form.',
  publicSubscribe: false,
  subscriberRoles: [],
  events: [
    {
      namespace: FORM_EVENT_NAMESPACE,
      name: FORM_LOCKED,
      templates: {
        email: {
          subject: '{{ event.payload.form.definition.name }} locked',
          body: `
            <!doctype html>
            <html>
            <head>
            </head>
            <body>
            <p>Your draft {{ event.payload.form.definition.name }} form has been locked and will be deleted on {{ formatDate event.payload.deleteOn }}.</p>
            <p>
              No action is required if you do not intend to complete the submission.
              If you do wish to continue, please contact {{ event.payload.definition.supportEmail }} to unlock the draft.
            </p>
            </body>
            </html>`,
        },
      },
    },
    {
      namespace: FORM_EVENT_NAMESPACE,
      name: FORM_UNLOCKED,
      templates: {
        email: {
          subject: '{{ event.payload.form.definition.name }} unlocked',
          body: `
          <!doctype html>
          <html>
          <head>
          </head>
          <body>
          <p>Your draft {{ event.payload.form.definition.name }} form has been unlocked.</p>
          </body>
          </html>`,
        },
      },
    },
    {
      namespace: FORM_EVENT_NAMESPACE,
      name: FORM_SUBMITTED,
      templates: {
        email: {
          subject: '{{ event.payload.form.definition.name }} received',
          body: `
          <!doctype html>
          <html>
          <head>
          </head>
          <body>
          <p>Your {{ event.payload.form.definition.name }} submission has been received.</p>
          </body>
          </html>`,
        },
      },
    },
  ],
};
