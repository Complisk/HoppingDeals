export class CreateSubscriptionTemplateUseCase {
  constructor({ subscriptionTemplateRepo }) {
    this.subscriptionTemplateRepo = subscriptionTemplateRepo;
  }

  execute(input) {
    return this.subscriptionTemplateRepo.create(input);
  }
}
