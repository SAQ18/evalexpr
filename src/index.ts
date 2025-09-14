export {
  type GenericValue,
  type Primitive,
  type EvaluationContext,
} from "./core/types";

export { Evaluator } from "./modules/Evaluator";
export { ExpressionError } from "./modules/ExpressionError";

export { evaluateBoolean, evaluate } from "./expression";
