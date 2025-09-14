class ExpressionError extends Error {
  constructor(message: string, position?: number) {
    super(
      position !== undefined ? `${message} at position ${position}` : message
    );
    this.name = "ExpressionError";
  }
}

export { ExpressionError };
