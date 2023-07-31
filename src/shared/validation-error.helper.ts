export const ValidationErrorHelper = (errors: string[]) => (
  {
    status: 422,
    schema: {
      properties: {
        errorCode: {
          type: 'string',
          description: 'Equals VALIDATION_ERROR',
          example: 'VALIDATION_ERROR'
        },
        message: {
          type: 'string'
        },
        validationErrors: {
          type: 'array',
          description: 'One or many error codes',
          items: {
            type: 'string',
            enum: errors,
            example: 'INVALID'
          }
        }
      }
    }
  }
);
