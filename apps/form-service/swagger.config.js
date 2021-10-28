module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'Form Service',
    version: '0.0.0',
    description: '',
  },
  tags: [],
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
