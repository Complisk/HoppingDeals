import { DomainError } from "./domain-error.js";

export class NotFoundError extends DomainError {
  constructor(resource = "Resource") {
    super(`${resource} not found`);
    this.resource = resource;
  }
}
