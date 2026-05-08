import { NotFoundError } from "../../core/errors/index.js";

// Soft-delete: flip isActive=false rather than removing the row, since old
// subscriptions may still reference the template.
export class DeactivateSubscriptionTemplateUseCase {
  constructor({ subscriptionTemplateRepo }) {
    this.subscriptionTemplateRepo = subscriptionTemplateRepo;
  }

  async execute({ id }) {
    const template = await this.subscriptionTemplateRepo.findById(id);
    if (!template) throw new NotFoundError("Template");
    await this.subscriptionTemplateRepo.update(id, { isActive: false });
    return { message: "Subscription template deactivated successfully" };
  }
}
