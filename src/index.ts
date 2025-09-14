/* eslint-disable @typescript-eslint/no-explicit-any */

import { evaluate, evaluateBoolean } from "./expression";
import { ExpressionError } from "./modules/ExpressionError";

// Export the error class and Evaluator for external error handling and function registration
export { ExpressionError, evaluateBoolean, evaluate };
