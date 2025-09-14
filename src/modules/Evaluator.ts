import { ExpressionError } from "../index";
import { EvaluationContext } from "../core/types";

class Evaluator {
  private context: EvaluationContext;

  constructor(context: EvaluationContext) {
    this.context = context;
  }

  private getNestedValue(obj: any, path: string): any {
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

      case "form_var": {
        const formValue = this.getNestedValue(this.context.form, node.name);
        return formValue !== undefined ? formValue : null;
      }

      case "context_var": {
        const contextValue = this.getNestedValue(
          this.context.context,
          node.name
        );
        return contextValue !== undefined ? contextValue : null;
      }

      case "binary": {
        const left = this.evaluate(node.left);
        const right = this.evaluate(node.right);

        switch (node.operator) {
          case "==":
            return left === right;
          case "!=":
            return left !== right;
          case "+":
            return (left as any) + (right as any);
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
          case "<":
            return Number(left) < Number(right);
          case ">":
            return Number(left) > Number(right);
          case "<=":
            return Number(left) <= Number(right);
          case ">=":
            return Number(left) >= Number(right);
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
}

export { Evaluator };
