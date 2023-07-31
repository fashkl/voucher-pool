import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiException extends HttpException {
  constructor(errorCode: any, message: string, httpStatusCode: HttpStatus | number =HttpStatus.BAD_REQUEST) {
    super({ errorCode, message }, httpStatusCode);
  }
}
