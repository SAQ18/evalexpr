import { Evaluator } from "./modules/Evaluator";
import { ExpressionError } from "./modules/ExpressionError";
import { Lexer } from "./modules/Lexer";
import { Parser } from "./modules/Parser";
import { EvaluationContext } from "./core/types";

const evaluate = (expression: string, context: EvaluationContext) => {
  try {
    if (!expression || typeof expression !== "string") {
      throw new ExpressionError("Expression must be a non-empty string");
    }

    const lexer = new Lexer(expression);
    const tokens = lexer.tokenize();

    const parser = new Parser(tokens);
    const ast = parser.parse();

    const evaluator = new Evaluator(context);
    const result = evaluator.evaluate(ast);

    return result;
  } catch (error) {
    if (error instanceof ExpressionError) {
      throw error;
    }
    throw new ExpressionError(
      `Evaluation failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

const evaluateBoolean = (
  expression: string,
  context: EvaluationContext
): boolean => {
  const result = evaluate(expression, context);
  if (typeof result !== "boolean") {
    throw new ExpressionError("Expression did not evaluate to a boolean");
  }
  return result;
};

// Export the error class and Evaluator for external error handling and function registration
export { evaluateBoolean, evaluate };
