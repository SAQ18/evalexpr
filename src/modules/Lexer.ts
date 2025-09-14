import { Token, TokenType } from "../core/types";
import { ExpressionError } from "./ExpressionError";

class Lexer {
  private input: string;
  private position: number = 0;
  private current: string = "";

  constructor(input: string) {
    this.input = input.trim();
    this.current = this.input[this.position] || "";
  }

  private advance(): void {
    this.position++;
    this.current = this.input[this.position] || "";
  }

  private peek(offset: number = 1): string {
    return this.input[this.position + offset] || "";
  }

  private skipWhitespace(): void {
    while (this.current && /\s/.test(this.current)) {
      this.advance();
    }
  }

  private readString(): string {
    let value = "";
    this.advance(); // Skip opening quote

    while (this.current && this.current !== "'") {
      if (this.current === "\\") {
        if (this.peek() === "n") {
          value += "\n";
        } else if (this.peek() === "t") {
          value += "\t";
        } else if (this.peek() === "r") {
          value += "\r";
        } else if (this.peek() === "\\") {
          value += "\\";
        } else if (this.peek() === "'") {
          value += "'";
        } else {
          value += this.peek();
        }
        this.advance();
      } else {
        value += this.current;
      }
      this.advance();
    }

    if (this.current !== "'") {
      throw new ExpressionError("Unterminated string", this.position);
    }

    this.advance(); // Skip closing quote
    return value;
  }

  private readNumber(): string {
    let value = "";
    let hasDot = false;

    while (
      this.current &&
      (/\d/.test(this.current) || (this.current === "." && !hasDot))
    ) {
      if (this.current === ".") hasDot = true;
      value += this.current;
      this.advance();
    }

    return value;
  }

  private readIdentifier(): string {
    let value = "";

    while (this.current && /[a-zA-Z0-9_.]/.test(this.current)) {
      value += this.current;
      this.advance();
    }

    return value;
  }

  private readVariable(): string {
    this.advance(); // Skip $ or @
    return this.readIdentifier();
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];

    while (this.position < this.input.length) {
      this.skipWhitespace();

      if (!this.current) break;

      const startPos = this.position;

      // Single character tokens
      if (this.current === "(") {
        tokens.push({ type: TokenType.LPAREN, value: "(", position: startPos });
        this.advance();
        continue;
      }

      if (this.current === ")") {
        tokens.push({ type: TokenType.RPAREN, value: ")", position: startPos });
        this.advance();
        continue;
      }

      if (this.current === ",") {
        tokens.push({ type: TokenType.COMMA, value: ",", position: startPos });
        this.advance();
        continue;
      }

      if (this.current === "'") {
        tokens.push({
          type: TokenType.STRING,
          value: this.readString(),
          position: startPos,
        });
        continue;
      }

      if (this.current === "$") {
        const varName = this.readVariable();
        tokens.push({
          type: TokenType.FORM_VAR,
          value: varName,
          position: startPos,
        });
        continue;
      }

      if (this.current === "@") {
        const varName = this.readVariable();
        tokens.push({
          type: TokenType.CONTEXT_VAR,
          value: varName,
          position: startPos,
        });
        continue;
      }

      // Multi-character operators
      if (this.current === "=" && this.peek() === "=") {
        tokens.push({
          type: TokenType.OPERATOR,
          value: "==",
          position: startPos,
        });
        this.advance();
        this.advance();
        continue;
      }

      if (this.current === "!" && this.peek() === "=") {
        tokens.push({
          type: TokenType.OPERATOR,
          value: "!=",
          position: startPos,
        });
        this.advance();
        this.advance();
        continue;
      }

      if (this.current === "<" && this.peek() === "=") {
        tokens.push({
          type: TokenType.OPERATOR,
          value: "<=",
          position: startPos,
        });
        this.advance();
        this.advance();
        continue;
      }

      if (this.current === ">" && this.peek() === "=") {
        tokens.push({
          type: TokenType.OPERATOR,
          value: ">=",
          position: startPos,
        });
        this.advance();
        this.advance();
        continue;
      }

      if (this.current === "&" && this.peek() === "&") {
        tokens.push({
          type: TokenType.OPERATOR,
          value: "&&",
          position: startPos,
        });
        this.advance();
        this.advance();
        continue;
      }

      if (this.current === "|" && this.peek() === "|") {
        tokens.push({
          type: TokenType.OPERATOR,
          value: "||",
          position: startPos,
        });
        this.advance();
        this.advance();
        continue;
      }

      // Single character operators
      if (this.current === "<") {
        tokens.push({
          type: TokenType.OPERATOR,
          value: "<",
          position: startPos,
        });
        this.advance();
        continue;
      }

      if (this.current === ">") {
        tokens.push({
          type: TokenType.OPERATOR,
          value: ">",
          position: startPos,
        });
        this.advance();
        continue;
      }

      if (
        this.current === "+" ||
        this.current === "-" ||
        this.current === "*" ||
        this.current === "/" ||
        this.current === "%"
      ) {
        tokens.push({
          type: TokenType.OPERATOR,
          value: this.current,
          position: startPos,
        });
        this.advance();
        continue;
      }

      // Numbers
      if (/\d/.test(this.current)) {
        tokens.push({
          type: TokenType.NUMBER,
          value: this.readNumber(),
          position: startPos,
        });
        continue;
      }

      // Identifiers (keywords, function names)
      if (/[a-zA-Z_]/.test(this.current)) {
        const identifier = this.readIdentifier();

        if (identifier === "true" || identifier === "false") {
          tokens.push({
            type: TokenType.BOOLEAN,
            value: identifier,
            position: startPos,
          });
        } else if (identifier === "null") {
          tokens.push({
            type: TokenType.NULL,
            value: identifier,
            position: startPos,
          });
        } else if (identifier === "contains") {
          tokens.push({
            type: TokenType.FUNCTION,
            value: identifier,
            position: startPos,
          });
        } else {
          throw new ExpressionError(
            `Unknown identifier: ${identifier}`,
            startPos
          );
        }
        continue;
      }

      throw new ExpressionError(
        `Unexpected character: ${this.current}`,
        startPos
      );
    }

    tokens.push({ type: TokenType.EOF, value: "", position: this.position });
    return tokens;
  }
}

export { Lexer };
