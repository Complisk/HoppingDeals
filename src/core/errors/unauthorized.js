import { DomainError } from "./domain-error.js";

export class UnauthorizedError extends DomainError {
  constructor(message = "Not authorized") {
    super(message);
  }
}
