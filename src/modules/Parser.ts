import { ExpressionError } from "../index";
import { Token, TokenType } from "../core/types";

class Parser {
  private tokens: Token[];
  private position: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private get current(): Token {
    return (
      this.tokens[this.position] || {
        type: TokenType.EOF,
        value: "",
        position: -1,
      }
    );
  }

  private advance(): void {
    this.position++;
  }

  private expect(type: TokenType): Token {
    if (this.current.type !== type) {
      throw new ExpressionError(
        `Expected ${type}, got ${this.current.type}`,
        this.current.position
      );
    }
    const token = this.current;
    this.advance();
    return token;
  }

  public parse(): any {
    const result = this.parseOr();
    if (this.current.type !== TokenType.EOF) {
      throw new ExpressionError(
        `Unexpected token: ${this.current.value}`,
        this.current.position
      );
    }
    return result;
  }

  private parseOr(): any {
    let left = this.parseAnd();

    while (
      this.current.type === TokenType.OPERATOR &&
      this.current.value === "||"
    ) {
      this.advance();
      const right = this.parseAnd();
      left = { type: "binary", operator: "||", left, right };
    }

    return left;
  }

  private parseAnd(): any {
    let left = this.parseComparison();

    while (
      this.current.type === TokenType.OPERATOR &&
      this.current.value === "&&"
    ) {
      this.advance();
      const right = this.parseComparison();
      left = { type: "binary", operator: "&&", left, right };
    }

    return left;
  }

  private parseComparison(): any {
    const left = this.parsePrimary();

    if (
      this.current.type === TokenType.OPERATOR &&
      ["==", "!=", "<", ">", "<=", ">=", "*", "+", "-", "/", "%"].includes(
        this.current.value
      )
    ) {
      const operator = this.current.value;
      this.advance();
      const right = this.parsePrimary();
      return { type: "binary", operator, left, right };
    }

    return left;
  }

  private parsePrimary(): any {
    if (this.current.type === TokenType.LPAREN) {
      this.advance();
      const expr = this.parseOr();
      this.expect(TokenType.RPAREN);
      return expr;
    }

    const currentToken = this.current;
    if (currentToken.type === TokenType.FUNCTION) {
      const functionName = currentToken.value;
      this.advance();
      this.expect(TokenType.LPAREN);

      const args = [];
      if (this.current.type !== TokenType.RPAREN) {
        args.push(this.parseOr());
        while (this.current.type === TokenType.COMMA) {
          this.advance();
          args.push(this.parseOr());
        }
      }

      this.expect(TokenType.RPAREN);
      return { type: "function", name: functionName, args };
    }

    if (currentToken.type === TokenType.FORM_VAR) {
      const variable = this.current.value;
      this.advance();
      return { type: "form_var", name: variable };
    }

    if (currentToken.type === TokenType.CONTEXT_VAR) {
      const variable = this.current.value;
      this.advance();
      return { type: "context_var", name: variable };
    }

    if (currentToken.type === TokenType.STRING) {
      const value = this.current.value;
      this.advance();
      return { type: "literal", value };
    }

    if (currentToken.type === TokenType.NUMBER) {
      const value = this.current.value.includes(".")
        ? parseFloat(this.current.value)
        : parseInt(this.current.value, 10);
      this.advance();
      return { type: "literal", value };
    }

    if (currentToken.type === TokenType.BOOLEAN) {
      const value = this.current.value === "true";
      this.advance();
      return { type: "literal", value };
    }

    if (currentToken.type === TokenType.NULL) {
      this.advance();
      return { type: "literal", value: null };
    }

    throw new ExpressionError(
      `Unexpected token: ${this.current.value}`,
      this.current.position
    );
  }
}

export { Parser };
