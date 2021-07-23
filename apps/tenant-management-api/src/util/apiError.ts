interface apiError {
  code: number;
  message: string;
  isOperational: boolean;
}
export class ApiError extends Error {
  statusCode: number;
  /**
   * Operational errors are not bugs and can occur from time to time mostly
   * because of one or a combination of several external factors like a database
   * server timing out or a user deciding to make an attempt on SQL injection by
   * entering SQL queries in an input field
   *
   * */
  isOperational: boolean;
  message: string;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.message = message;
  }
  getJson = (): apiError => {
    return {
      code: this.statusCode,
      message: this.message,
      isOperational: this.isOperational,
    };
  };
}
