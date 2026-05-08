import { ValidationError } from "../../core/errors/index.js";
import {
  isValidDateRange,
  calculateMonthsFromDateRange,
} from "../../shared/date-utils.js";
import { calculatePrice } from "../../shared/pricing.js";

export class CalculatePromotionPriceUseCase {
  async execute({ runDate, stopDate, cities, states, timezones, businessType }) {
    if (!isValidDateRange(runDate, stopDate)) {
      throw new ValidationError("Invalid date range");
    }
    const months = calculateMonthsFromDateRange(runDate, stopDate);
    const price = calculatePrice({
      months,
      cities,
      states,
      timezones,
      businessType,
    });
    return { price, months };
  }
}
