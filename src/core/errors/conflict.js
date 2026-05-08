import { DomainError } from "./domain-error.js";

export class ConflictError extends DomainError {
  constructor(message = "Conflict") {
    super(message);
  }
}
