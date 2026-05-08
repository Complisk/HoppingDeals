export class ListSubscriptionTemplatesUseCase {
  constructor({ subscriptionTemplateRepo }) {
    this.subscriptionTemplateRepo = subscriptionTemplateRepo;
  }

  execute() {
    return this.subscriptionTemplateRepo.list();
  }
}
