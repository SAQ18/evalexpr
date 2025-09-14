export type Primitive = string | number | boolean | null;

export interface GenericValue {
  [key: string]:
    | Primitive
    | Array<Primitive>
    | Array<GenericValue>
    | GenericValue;
}

export interface EvaluationContext {
  form: GenericValue;
  context: GenericValue;
}

// Token types for the lexer
export const TokenType = {
  FORM_VAR: "FORM_VAR", // $variable
  CONTEXT_VAR: "CONTEXT_VAR", // @variable
  STRING: "STRING", // 'value'
  NUMBER: "NUMBER", // 123, 123.45
  BOOLEAN: "BOOLEAN", // true, false
  NULL: "NULL", // null
  OPERATOR: "OPERATOR", // ==, !=, <, >, <=, >=, &&, ||, +, -, *, /, %
  FUNCTION: "FUNCTION", // contains
  LPAREN: "LPAREN", // (
  RPAREN: "RPAREN", // )
  COMMA: "COMMA", // ,
  EOF: "EOF",
} as const;

export type TokenType = (typeof TokenType)[keyof typeof TokenType];

export interface Token {
  type: TokenType;
  value: string;
  position: number;
}
