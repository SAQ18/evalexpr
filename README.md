# EvalExpr

A secure TypeScript expression evaluator for dynamic form validation and conditional logic with support for context variables, form fields, and custom functions.

[![npm version](https://badge.fury.io/js/evalexpr.svg)](https://badge.fury.io/js/evalexpr)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🔒 **Secure evaluation** - No `eval()` or similar dangerous functions
- 🎯 **Type-safe** - Built with TypeScript for better development experience
- 🚀 **Fast parsing** - Custom lexer and parser for optimal performance
- 📝 **Form-focused** - Designed specifically for form validation and conditional logic
- 🔧 **Extensible** - Register custom functions for domain-specific operations
- 🎨 **Context-aware** - Support for both form fields (`$variable`) and context variables (`@variable`)
- 🧪 **Well-tested** - Comprehensive test suite with edge case coverage

## Installation

```bash
npm install evalexpr
```

## Quick Start

```typescript
import { evaluateBoolean, evaluate, ExpressionError } from "evalexpr";

// Define your context
const context = {
  form: {
    age: 25,
    name: "John",
    fruits: ["apple", "banana"],
  },
  context: {
    isAdmin: true,
    settings: { theme: "dark" },
  },
};

// Boolean evaluation
const isAdult = evaluateBoolean("$age >= 18", context); // true
const isJohn = evaluateBoolean("$name == 'John'", context); // true
const hasApple = evaluateBoolean("contains($fruits, 'apple')", context); // true

// Value evaluation
const totalAge = evaluate("$age + 5", context); // 30
const greeting = evaluate("'Hello, ' + $name", context); // "Hello, John"
```

## Syntax

### Variable Access

- **Form variables**: `$variableName` - Access form field values
- **Context variables**: `@variableName` - Access context/environment values
- **Nested properties**: `$user.profile.name` or `@settings.theme`

```typescript
const context = {
  form: {
    user: { name: "Alice", age: 30 },
    preferences: ["email", "sms"],
  },
  context: {
    settings: { theme: "dark", notifications: true },
  },
};

evaluateBoolean("$user.name == 'Alice'", context); // true
evaluateBoolean("@settings.theme == 'dark'", context); // true
```

### Operators

#### Comparison Operators

- `==` - Equal to
- `!=` - Not equal to
- `<` - Less than
- `>` - Greater than
- `<=` - Less than or equal to
- `>=` - Greater than or equal to

#### Arithmetic Operators

- `+` - Addition (also string concatenation)
- `-` - Subtraction
- `*` - Multiplication
- `/` - Division
- `%` - Modulo

#### Logical Operators

- `&&` - Logical AND
- `||` - Logical OR

#### Examples

```typescript
// Comparison
evaluateBoolean("$age > 18", context);
evaluateBoolean("$status != 'pending'", context);

// Arithmetic
evaluate("$price * $quantity", context);
evaluate("$score + $bonus", context);

// Logical
evaluateBoolean("$age > 18 && $hasLicense", context);
evaluateBoolean("$isVip || $score > 1000", context);
```

### Literals

#### String Literals

```typescript
evaluateBoolean("$name == 'John'", context);
evaluate("'Hello, ' + $name", context);
```

#### Numeric Literals

```typescript
evaluateBoolean("$age > 21", context);
evaluate("$count + 10", context);
```

#### Boolean Literals

```typescript
evaluateBoolean("$isActive == true", context);
evaluateBoolean("$isDisabled == false", context);
```

#### Null Literal

```typescript
evaluateBoolean("$optionalField == null", context);
```

### Built-in Functions

#### `contains(array, value)`

Checks if an array contains a specific value.

```typescript
const context = {
  form: { tags: ["urgent", "bug", "frontend"] },
  context: {},
};

evaluateBoolean("contains($tags, 'urgent')", context); // true
evaluateBoolean("contains($tags, 'backend')", context); // false
```

## API Reference

### Functions

#### `evaluateBoolean(expression: string, context: EvaluationContext): boolean`

Evaluates an expression and returns the result as a boolean.

**Parameters:**

- `expression` - The expression string to evaluate
- `context` - The evaluation context containing form and context data

**Returns:** `boolean`

**Throws:** `ExpressionError` for invalid expressions

#### `evaluate(expression: string, context: EvaluationContext): any`

Evaluates an expression and returns the raw result.

**Parameters:**

- `expression` - The expression string to evaluate
- `context` - The evaluation context containing form and context data

**Returns:** `any` - The evaluated result

**Throws:** `ExpressionError` for invalid expressions

### Types

#### `EvaluationContext`

```typescript
interface EvaluationContext {
  form: Record<string, Primitive | Array<Primitive>>;
  context: GenericValue;
}
```

#### `Primitive`

```typescript
type Primitive = string | number | boolean | null;
```

### Custom Functions

You can extend the evaluator with custom functions:

```typescript
import { Evaluator } from "evalexpr";

// Register a custom function
Evaluator.registerFunction("startsWith", (args) => {
  if (args.length !== 2) {
    throw new Error("startsWith expects 2 arguments");
  }
  const [str, prefix] = args;
  return String(str).startsWith(String(prefix));
});

// Use in expressions
const context = {
  form: { email: "john@example.com" },
  context: {},
};

evaluateBoolean("startsWith($email, 'john')", context); // true
```

## Complex Examples

### Form Validation

```typescript
const formData = {
  form: {
    age: 25,
    email: "user@example.com",
    password: "securePass123",
    confirmPassword: "securePass123",
    agreedToTerms: true,
    country: "US",
  },
  context: {
    minimumAge: 18,
    allowedCountries: ["US", "CA", "UK"],
  },
};

// Validation rules
const validations = [
  {
    rule: "$age >= @minimumAge",
    message: "Must be at least 18 years old",
  },
  {
    rule: "$password == $confirmPassword",
    message: "Passwords must match",
  },
  {
    rule: "$agreedToTerms == true",
    message: "Must agree to terms",
  },
  {
    rule: "contains(@allowedCountries, $country)",
    message: "Country not supported",
  },
];

validations.forEach(({ rule, message }) => {
  if (!evaluateBoolean(rule, formData)) {
    console.log(`Validation failed: ${message}`);
  }
});
```

### Conditional Rendering Logic

```typescript
const context = {
  form: {
    userType: "premium",
    subscriptionExpiry: "2024-12-31",
    featuresUsed: 15,
  },
  context: {
    currentDate: "2024-06-15",
    maxFreeFeatures: 10,
    premiumFeatures: ["analytics", "export", "api"],
  },
};

// Conditional rendering rules
const showPremiumFeatures = evaluateBoolean(
  "$userType == 'premium' && $subscriptionExpiry > @currentDate",
  context
); // true

const showUpgradePrompt = evaluateBoolean(
  "$userType == 'free' && $featuresUsed >= @maxFreeFeatures",
  context
); // false

const showAnalytics = evaluateBoolean(
  "contains(@premiumFeatures, 'analytics') && $userType == 'premium'",
  context
); // true
```

## Error Handling

The library throws `ExpressionError` for various error conditions:

```typescript
import { ExpressionError } from "evalexpr";

try {
  evaluateBoolean("invalid syntax here", context);
} catch (error) {
  if (error instanceof ExpressionError) {
    console.log(`Expression error: ${error.message}`);
  }
}

// Common error scenarios:
// - Invalid syntax: "1 +"
// - Division by zero: "10 / 0"
// - Unknown functions: "unknownFunc()"
// - Invalid operators: "5 $ 3"
// - Empty expressions: ""
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Project Structure

```
src/
├── core/
│   └── types.ts          # Type definitions
├── modules/
│   ├── Evaluator.ts      # Expression evaluator
│   ├── ExpressionError.ts # Error handling
│   ├── Lexer.ts          # Tokenization
│   └── Parser.ts         # AST parsing
├── __tests__/
│   └── index.test.ts     # Test suite
├── expression.ts         # Main expression functions
└── index.ts              # Public API exports
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Keywords

expression-evaluator, form-validation, conditional-logic, typescript, parser, ast, evaluator, safe-eval, dynamic-forms, business-rules, context-variables, form-fields, boolean-expressions, rule-engine, expression-parser, conditional-rendering, form-logic, validation-engine, secure-evaluation, custom-functions, lexer, syntax-parser, expression-language, form-conditions, reactive-forms
