const tenant = 'autotest';

//<KEYCLOAK_ROOT> is the in-house defined tag, which will be updated in the main.ts
module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'File service',
    version: '1.0.0',
    description:
      'The file service provides the capability to upload and download files. ' +
      'Tenants are registered with their own space  containing file types that include ' +
      'role based access policy.',
  },
  tags: [
    {
      name: 'File Type',
      description: 'API to retrieve file types. Types are configured via the configuration service.',
    },
    {
      name: 'File',
      description: 'API to upload and download files.',
    },
  ],
  components: {
    securitySchemes: {
      accessToken: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ accessToken: [] }],
};
