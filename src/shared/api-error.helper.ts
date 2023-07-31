export const ApiErrorHelper = (errorCodes: string[], status = 400) => ({
  status,
  schema: {
    properties: {
      errorCode: {
        type: 'string',
        example: 'UNEXPECTED_ERROR',
        enum: errorCodes
      },
      message: {
        type: 'string'
      }
    },
  },
});
