import { evaluate, evaluateBoolean } from "../index";

describe("evaluateBoolean", () => {
  it("should evaluate simple expressions", () => {
    const context = {
      form: { age: 25, name: "John", fruits: ["apple", "banana"] },
      context: { isAdmin: true, fruit: { selected: "banana" } },
    };

    expect(evaluateBoolean("$age > 18", context)).toBe(true);
    expect(evaluateBoolean("$name == 'John'", context)).toBe(true);
    expect(evaluateBoolean("@isAdmin == true", context)).toBe(true);
    expect(evaluateBoolean("contains($fruits, @fruit.selected)", context)).toBe(
      true
    );
  });
  it("should handle undefined variables gracefully", () => {
    const context = {
      form: { age: 25 },
      context: {},
    };

    expect(evaluateBoolean("$undefinedVar > 18", context)).toBe(false);
    expect(evaluateBoolean("@undefinedContext == true", context)).toBe(false);
  });

  it("should evaluate complex expressions", () => {
    const context = {
      form: { age: 30, name: "Alice", fruits: ["apple", "banana"] },
      context: { isAdmin: false, fruit: { selected: "orange" } },
    };

    expect(
      evaluateBoolean("($age > 18 && $name == 'Alice') || @isAdmin", context)
    ).toBe(true);
    expect(
      evaluateBoolean("contains($fruits, @fruit.selected) || @isAdmin", context)
    ).toBe(false);
  });

  it("should return false for invalid expressions", () => {
    const context = {
      form: { age: 25 },
      context: {},
    };
    expect(() => evaluateBoolean("invalid expression", context)).toThrow();
    expect(() => evaluateBoolean("1 / 0", context)).toThrow();
  });

  it("should handle edge cases", () => {
    const context = {
      form: { age: null, name: "", fruits: [] },
      context: { isAdmin: null, fruit: { selected: null } },
    };

    expect(evaluateBoolean("$age == null", context)).toBe(true);
    expect(evaluateBoolean("$name == ''", context)).toBe(true);
    expect(evaluateBoolean("contains($fruits, 'apple')", context)).toBe(false);
    expect(() => evaluateBoolean("@isAdmin == undefined", context)).toThrow();
    expect(evaluateBoolean("@isAdmin == null", context)).toBe(true);
    expect(evaluateBoolean("@fruit.selected == null", context)).toBe(true);
  });

  it("should handle numeric and boolean literals", () => {
    const context = {
      form: { count: 10, isActive: true },
      context: {},
    };

    expect(evaluateBoolean("$isActive == true", context)).toBe(true);
    expect(evaluateBoolean("$isActive == false", context)).toBe(false);
  });

  it("should handle numeric operations", () => {
    const context = {
      form: { count: 10, isActive: true },
      context: {},
    };

    expect(evaluateBoolean("($count + 5) == 15", context)).toBe(true);
    expect(evaluateBoolean("($count / 5) == 2", context)).toBe(true);
    expect(evaluateBoolean("($count - 5) == 5", context)).toBe(true);
    expect(evaluateBoolean("($count % 2) == 0", context)).toBe(true);
  });

  it("should handle nested properties", () => {
    const context = {
      form: { user: "bob" },
      context: {},
    };

    expect(evaluateBoolean("$user == 'bob'", context)).toBe(true);
  });
});

describe("evaluateBoolean - Error Handling", () => {
  it("should throw an error for non-string expressions", () => {
    const context = {
      form: { age: 25 },
      context: {},
    };

    expect(() => evaluateBoolean(null as unknown as string, context)).toThrow(
      "Expression must be a non-empty string"
    );
    expect(() => evaluateBoolean(123 as unknown as string, context)).toThrow(
      "Expression must be a non-empty string"
    );
    expect(() => evaluateBoolean({} as unknown as string, context)).toThrow(
      "Expression must be a non-empty string"
    );
  });

  it("should throw an error for empty expressions", () => {
    const context = {
      form: { age: 25 },
      context: {},
    };

    expect(() => evaluateBoolean("", context)).toThrow(
      "Expression must be a non-empty string"
    );
  });
});

describe("evaluateBoolean - Edge Cases", () => {
  it("should handle expressions with excessive whitespace", () => {
    const context = {
      form: { age: 25, name: "John" },
      context: {},
    };

    expect(evaluateBoolean("   $age    >    18   ", context)).toBe(true);
    expect(evaluateBoolean("   $name   ==   'John'   ", context)).toBe(true);
  });

  it("should handle expressions with special characters in strings", () => {
    const context = {
      form: { greeting: "Hello, World!" },
      context: {},
    };

    expect(evaluateBoolean("$greeting == 'Hello, World!'", context)).toBe(true);
    expect(evaluateBoolean("$greeting == 'Hello, \\'World!\\''", context)).toBe(
      false
    );
  });
});

describe("evaluate", () => {
  it("should return the correct value for non-boolean expressions", () => {
    const context = {
      form: { age: 25, name: "John", fruits: ["apple", "banana"] },
      context: { isAdmin: true, fruit: { selected: "banana" } },
    };

    expect(evaluate("$age + 5", context)).toBe(30);
    expect(evaluate("$name + ' Doe'", context)).toBe("John Doe");
    expect(evaluate("contains($fruits, 'apple')", context)).toBe(true);
  });

  it("should throw an error for invalid expressions", () => {
    const context = {
      form: { age: 25 },
      context: {},
    };
    expect(() => evaluate("1 / 0", context)).toThrow();
    expect(() => evaluate("undefinedVar + 5", context)).toThrow();
  });

  it("should handle null and undefined values correctly", () => {
    const context = {
      form: { age: null, name: null },
      context: {},
    };

    expect(evaluate("$age == null", context)).toBe(true);
    expect(() => evaluate("$name == undefined", context)).toThrow();
  });

  it("should handle complex nested expressions", () => {
    const context = {
      form: { age: 30, name: "Alice", fruits: ["apple", "banana"] },
      context: { isAdmin: false, fruit: { selected: "orange" } },
    };

    expect(
      evaluate("($age > 18 && $name == 'Alice') || @isAdmin", context)
    ).toBe(true);
    expect(
      evaluate("contains($fruits, @fruit.selected) || @isAdmin", context)
    ).toBe(false);
  });

  it("should handle numeric and boolean literals", () => {
    const context = {
      form: { count: 10, isActive: true },
      context: {},
    };

    expect(evaluate("$isActive == true", context)).toBe(true);
    expect(evaluate("$isActive == false", context)).toBe(false);
    expect(evaluate("($count + 5) == 15", context)).toBe(true);
  });

  it("should handle numeric operations", () => {
    const context = {
      form: { count: 10, isActive: true },
      context: {},
    };

    expect(evaluate("($count + 5)", context)).toBe(15);
    expect(evaluate("($count / 5)", context)).toBe(2);
    expect(evaluate("($count - 5)", context)).toBe(5);
    expect(evaluate("($count % 2)", context)).toBe(0);
    expect(evaluate("$count * 5", context)).toBe(50);
  });

  it("should handle negative numbers correctly", () => {
    const context = { form: {}, context: {} };
    expect(evaluate("-5 + 3", context)).toBe(-2);
    expect(evaluate("10 + -2", context)).toBe(8);
    expect(evaluate("-3 * -2", context)).toBe(6);
    expect(evaluate("(-4) / 2", context)).toBe(-2);
  });

  it("should handle nested properties in context", () => {
    const context = {
      form: {
        user: { name: "bob" },
        dob: { year: 1990 },
      },
      context: {
        user: {
          details: {
            age: 28,
            name: "Bob",
            address: { line1: "35 enfield drive" },
          },
        },
      },
    };

    expect(evaluate("@user.details.age + 2", context)).toBe(30);
    expect(evaluate("@user.details.name + ' Smith'", context)).toBe(
      "Bob Smith"
    );
    expect(evaluate("@user.details.address.line1", context)).toBe(
      "35 enfield drive"
    );

    expect(evaluate("$user.name + ' Smith'", context)).toBe("bob Smith");
    expect(evaluate("$dob.year + 10", context)).toBe(2000);
  });
});
