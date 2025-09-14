import { evaluate, Evaluator } from "../";

describe("Evaluator", () => {
  it("should register function and evaluate", () => {
    const context = { form: {}, context: {} };

    Evaluator.registerFunction("add", (args: any[]) => {
      if (args.length !== 2) {
        throw new Error("add function requires exactly 2 arguments");
      }
      return Number(args[0]) + Number(args[1]);
    });

    expect(evaluate("add(3, 5)", context)).toBe(8);
  });

  it("should throw error for duplicate function registration", () => {
    expect(() => {
      Evaluator.registerFunction("contains", (args: any[]) => args.length);
    }).toThrow('Function with name "contains" is already registered');
  });

  it("should list registered functions", () => {
    const functions = Evaluator.getRegisteredFunctions();
    expect(functions).toContain("contains");
    expect(functions).toContain("add");

    expect(functions).toBeInstanceOf(Array);
    expect(functions.length).toBeGreaterThanOrEqual(2);

    // Ensure no duplicates
    const uniqueFunctions = Array.from(new Set(functions));
    expect(uniqueFunctions.length).toBe(functions.length);
  });

  it("should throw error for unknown function", () => {
    const context = { form: {}, context: {} };
    expect(() => evaluate("unknownFunc(1, 2)", context)).toThrow(
      "Unknown identifier: unknownFunc"
    );
  });

  it("should throw error for invalid function arguments", () => {
    const context = { form: {}, context: {} };
    expect(() => evaluate("contains(1)", context)).toThrow(
      "contains() expects 2 arguments, got 1"
    );
  });

  it("should throw error for invalid expressions", () => {
    const context = { form: {}, context: {} };
    expect(() => evaluate("5 + ", context)).toThrow(
      "Unexpected token:  at position 3"
    );
    expect(() => evaluate("5 / 0", context)).toThrow("Division by zero");
  });
});
