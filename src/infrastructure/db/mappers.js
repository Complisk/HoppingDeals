import {
  User,
  Business,
  Role,
  Template,
  Promotion,
  SubscriptionTemplate,
  BusinessSubscription,
  SubscriptionHistory,
} from "../../core/entities/index.js";

const num = (v) => (v == null ? v : Number(v));

export const toUser = (row) => row && new User({
  ...row,
  role: row.role ? toRole(row.role) : null,
});

export const toBusiness = (row) => row && new Business(row);

export const toRole = (row) => row && new Role(row);

export const toTemplate = (row) => row && new Template(row);

export const toPromotion = (row) => row && new Promotion({
  ...row,
  price: num(row.price),
  business: row.business ? toBusiness(row.business) : null,
  template: row.template ? toTemplate(row.template) : null,
});

export const toSubscriptionTemplate = (row) =>
  row && new SubscriptionTemplate({ ...row, price: num(row.price) });

export const toBusinessSubscription = (row) =>
  row &&
  new BusinessSubscription({
    ...row,
    template: row.template ? toSubscriptionTemplate(row.template) : null,
  });

export const toSubscriptionHistory = (row) => row && new SubscriptionHistory(row);
