import { ExpressionError } from "../index";
import { EvaluationContext, Primitive } from "../core/types";

class Evaluator {
  private context: EvaluationContext;

  constructor(context: EvaluationContext) {
    this.context = context;
  }

  private getNestedValue(
    obj: any,
    path: string
  ): Primitive | Primitive[] | null {
    const parts = path.split(".");
    let current = obj;

    for (const part of parts) {
      if (current == null) return null;

      // Handle array indices
      if (!isNaN(Number(part)) && Array.isArray(current)) {
        current = current[Number(part)];
      } else if (typeof current === "object") {
        current = current[part];
      } else {
        return null;
      }
    }

    if (current === undefined) {
      throw new ExpressionError(`Undefined variable: ${path}`);
    }

    return current;
  }

  // Extensible function registry for adding custom functions
  private static functionRegistry: Record<string, (args: any[]) => any> = {
    contains: (args: any[]) => {
      if (args.length !== 2) {
        throw new ExpressionError(
          `contains() expects 2 arguments, got ${args.length}`
        );
      }
      const [array, value] = args;
      if (!Array.isArray(array)) {
        return false;
      }
      // Case-sensitive comparison
      return array.includes(value);
    },
  };

  // Static method to register custom functions
  public static registerFunction(
    name: string,
    func: (args: any[]) => any
  ): void {
    if (Evaluator.functionRegistry[name]) {
      throw new ExpressionError(
        `Function with name "${name}" is already registered`
      );
    }
    Evaluator.functionRegistry[name] = func;
  }

  public static getRegisteredFunctions(): Array<string> {
    return Object.keys(Evaluator.functionRegistry);
  }

  private evaluateFunctionFromRegistry(name: string, args: any[]): any {
    const func = Evaluator.functionRegistry[name];
    if (!func) {
      throw new ExpressionError(`Unknown function: ${name}`);
    }
    return func(args);
  }

  public evaluate(node: any): any {
    switch (node.type) {
      case "literal":
        return node.value;

      case "form_var":
        return this.getNestedValue(this.context.form, node.name);

      case "context_var":
        return this.getNestedValue(this.context.context, node.name);

      case "binary": {
        const left = this.evaluate(node.left);
        const right = this.evaluate(node.right);

        switch (node.operator) {
          case "==":
            return left === right;
          case "!=":
            return left !== right;
          case "+":
            return this.add(left, right);
          case "-":
            return Number(left) - Number(right);
          case "*":
            return Number(left) * Number(right);
          case "/":
            if (Number(right) === 0) {
              throw new ExpressionError("Division by zero");
            }
            return Number(left) / Number(right);
          case "%":
            return Number(left) % Number(right);
          case "<": {
            if (left == null || right == null) return false;
            return Number(left) < Number(right);
          }
          case ">": {
            if (left == null || right == null) return false;
            return Number(left) > Number(right);
          }
          case "<=": {
            if (left == null || right == null) return false;
            return Number(left) <= Number(right);
          }
          case ">=": {
            if (left == null || right == null) return false;
            return Number(left) >= Number(right);
          }
          case "&&":
            return Boolean(left) && Boolean(right);
          case "||":
            return Boolean(left) || Boolean(right);
          default:
            throw new ExpressionError(`Unknown operator: ${node.operator}`);
        }
      }

      case "function": {
        const args = node.args.map((arg: any) => this.evaluate(arg));
        return this.evaluateFunctionFromRegistry(node.name, args);
      }

      default:
        throw new ExpressionError(`Unknown node type: ${node.type}`);
    }
  }

  private add(left: any, right: any): number | string {
    // If either operand is null and the other is a number, return NaN
    if (
      (left === null && typeof right === "number") ||
      (typeof left === "number" && right === null)
    ) {
      return NaN;
    }

    // Handle string concatenation - if either operand is a string, concatenate
    if (typeof left === "string" || typeof right === "string") {
      return String(left) + String(right);
    }

    // Handle numeric addition (both are numbers)
    if (typeof left === "number" && typeof right === "number") {
      // Handle NaN cases
      if (Number.isNaN(left) || Number.isNaN(right)) {
        return NaN;
      }

      // Handle infinity edge cases
      if (left === Infinity && right === -Infinity) return NaN;
      if (left === -Infinity && right === Infinity) return NaN;

      return left + right;
    }

    // Default JavaScript addition for everything else
    return (left as any) + (right as any);
  }
}

export { Evaluator };
