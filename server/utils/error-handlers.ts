class ErrorHandler extends Error {
  statusCode: number;

  constructor(status: number, message: string) {
    super(message);
    this.statusCode = status;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ErrorHandler;
