// Composition root.
//
// All wiring of concrete classes into use-cases happens here exactly once.
// Use-cases are constructed lazily on first access — keeps cold-starts cheap
// and avoids instantiating Stripe/Cloudinary if the request doesn't need them.

import "server-only";

import { createAdminClient } from "../utils/supabase/server.js";

import { SupabaseUserRepository } from "./db/repositories/supabase-user-repository.js";
import { SupabaseBusinessRepository } from "./db/repositories/supabase-business-repository.js";
import { SupabaseRoleRepository } from "./db/repositories/supabase-role-repository.js";
import { SupabaseTemplateRepository } from "./db/repositories/supabase-template-repository.js";
import { SupabasePromotionRepository } from "./db/repositories/supabase-promotion-repository.js";
import { SupabaseSubscriptionTemplateRepository } from "./db/repositories/supabase-subscription-template-repository.js";
import { SupabaseBusinessSubscriptionRepository } from "./db/repositories/supabase-business-subscription-repository.js";
import { SupabasePhotoRepository } from "./db/repositories/supabase-photo-repository.js";

import { BcryptPasswordHasher } from "./auth/bcrypt-password-hasher.js";
import { JwtTokenService } from "./auth/jwt-token-service.js";
import { StripePaymentGateway } from "./stripe/stripe-payment-gateway.js";
import { CloudinaryUploader } from "./cloudinary/cloudinary-uploader.js";
import { IpInfoGeoLocator } from "./geo/ipinfo-geo-locator.js";

// ─── Auth use-cases ─────────────────────────────────────────────────────────
import { LoginUseCase } from "../application/auth/login.js";
import { RegisterUserUseCase } from "../application/auth/register-user.js";
import { RegisterBusinessUseCase } from "../application/auth/register-business.js";
import { VerifyTokenUseCase } from "../application/auth/verify-token.js";

// ─── User use-cases ─────────────────────────────────────────────────────────
import { GetUserProfileUseCase } from "../application/users/get-profile.js";
import { UpdateUserProfileUseCase } from "../application/users/update-profile.js";
import {
  AddToWishlistUseCase,
  RemoveFromWishlistUseCase,
  GetWishlistUseCase,
} from "../application/users/wishlist.js";

// ─── Promotion use-cases ────────────────────────────────────────────────────
import { ListPublicPromotionsUseCase } from "../application/promotions/list-public.js";
import { GetPromotionByIdUseCase } from "../application/promotions/get-by-id.js";
import { CalculatePromotionPriceUseCase } from "../application/promotions/calculate-price.js";
import { IncrementPromotionClickUseCase } from "../application/promotions/increment-click.js";
import { CreatePromotionUseCase } from "../application/promotions/create.js";
import { ListBusinessPromotionsUseCase } from "../application/promotions/list-for-business.js";
import { GetBusinessPromotionUseCase } from "../application/promotions/get-for-business.js";
import { UpdatePromotionUseCase } from "../application/promotions/update.js";
import { DeletePromotionUseCase } from "../application/promotions/delete.js";
import { ActivatePromotionUseCase } from "../application/promotions/activate.js";
import { DeactivatePromotionUseCase } from "../application/promotions/deactivate.js";

// ─── Business ───────────────────────────────────────────────────────────────
import { GetBusinessDashboardUseCase } from "../application/business/get-dashboard.js";

// ─── Templates ──────────────────────────────────────────────────────────────
import { ListTemplatesUseCase } from "../application/templates/list.js";

// ─── Admin ──────────────────────────────────────────────────────────────────
import { ListAdminUsersUseCase } from "../application/admin/list-users.js";
import { UpdateUserStatusUseCase } from "../application/admin/update-user-status.js";
import { ListAdminBusinessesUseCase } from "../application/admin/list-businesses.js";
import { UpdateBusinessStatusUseCase } from "../application/admin/update-business-status.js";
import { ToggleBusinessAutoApproveUseCase } from "../application/admin/toggle-auto-approve.js";
import { ListAdminPromotionsUseCase } from "../application/admin/list-promotions.js";
import { AdminDeletePromotionUseCase } from "../application/admin/delete-promotion.js";
import { ChangePromotionStatusUseCase } from "../application/admin/change-promotion-status.js";
import { GetAdminDashboardUseCase } from "../application/admin/get-dashboard.js";
import { UploadTemplatesUseCase } from "../application/admin/upload-templates.js";
import { DeleteTemplateUseCase } from "../application/admin/delete-template.js";
import { CreateAdminUserUseCase } from "../application/admin/create-admin-user.js";
import { UpdateAdminRoleUseCase } from "../application/admin/update-admin-role.js";
import { MakeAdminUseCase } from "../application/admin/make-admin.js";
import { GetUserPermissionsUseCase } from "../application/admin/get-user-permissions.js";

// ─── Roles ──────────────────────────────────────────────────────────────────
import { CreateRoleUseCase } from "../application/roles/create.js";
import { ListRolesUseCase } from "../application/roles/list.js";
import { UpdateRoleUseCase } from "../application/roles/update.js";
import { DeleteRoleUseCase } from "../application/roles/delete.js";

// ─── Subscriptions ──────────────────────────────────────────────────────────
import { CreateSubscriptionCheckoutUseCase } from "../application/subscriptions/create-checkout.js";
import { GetActiveSubscriptionUseCase } from "../application/subscriptions/get-active.js";
import { GetSubscriptionHistoryUseCase } from "../application/subscriptions/get-history.js";

// ─── Subscription templates ─────────────────────────────────────────────────
import { CreateSubscriptionTemplateUseCase } from "../application/subscription-templates/create.js";
import { ListSubscriptionTemplatesUseCase } from "../application/subscription-templates/list.js";
import { DeactivateSubscriptionTemplateUseCase } from "../application/subscription-templates/deactivate.js";

// ─── Payments ───────────────────────────────────────────────────────────────
import { HandleStripeWebhookUseCase } from "../application/payments/handle-webhook.js";

// ─── Location ───────────────────────────────────────────────────────────────
import { LookupLocationUseCase } from "../application/location/lookup.js";

// ─── Photos ─────────────────────────────────────────────────────────────────
import { ListPublicPhotosUseCase } from "../application/photos/list-public.js";

// Lazily-built singletons. Uses a Map so a missing env var only blows up the
// feature that needs it, not the entire request graph.
const cache = new Map();
const memo = (key, factory) => {
  if (!cache.has(key)) cache.set(key, factory());
  return cache.get(key);
};

// ── Repositories ─────────────────────────────────────────────────────────────
// All repos use the service-role Supabase client server-side (bypasses RLS).
// The admin client is a cached singleton inside utils/supabase/server.js.
const supabase = () => memo("supabase", () => createAdminClient());
const userRepo = () => memo("userRepo", () => new SupabaseUserRepository({ supabase: supabase() }));
const businessRepo = () => memo("businessRepo", () => new SupabaseBusinessRepository({ supabase: supabase() }));
const roleRepo = () => memo("roleRepo", () => new SupabaseRoleRepository({ supabase: supabase() }));
const templateRepo = () => memo("templateRepo", () => new SupabaseTemplateRepository({ supabase: supabase() }));
const promotionRepo = () => memo("promotionRepo", () => new SupabasePromotionRepository({ supabase: supabase() }));
const subscriptionTemplateRepo = () =>
  memo("subscriptionTemplateRepo", () => new SupabaseSubscriptionTemplateRepository({ supabase: supabase() }));
const subscriptionRepo = () =>
  memo("subscriptionRepo", () => new SupabaseBusinessSubscriptionRepository({ supabase: supabase() }));
const photoRepo = () => memo("photoRepo", () => new SupabasePhotoRepository({ supabase: supabase() }));

// ── Adapters ─────────────────────────────────────────────────────────────────
const hasher = () => memo("hasher", () => new BcryptPasswordHasher());
const tokens = () =>
  memo(
    "tokens",
    () =>
      new JwtTokenService({
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRE || "7d",
      })
  );
const payments = () =>
  memo(
    "payments",
    () =>
      new StripePaymentGateway({
        secretKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      })
  );
const uploader = () =>
  memo(
    "uploader",
    () =>
      new CloudinaryUploader({
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
      })
  );
const geoLocator = () =>
  memo("geoLocator", () => new IpInfoGeoLocator({ token: process.env.IPINFO_TOKEN }));

// ── Token expiry exposed for cookie maxAge ──────────────────────────────────
export const tokenExpirySeconds = () => tokens().expiresInSeconds;

// ── Public container façade. Each property is a lazy getter that returns a
// fresh use-case (use-cases are stateless, so per-request instances are fine).
export const container = {
  // Auth
  get login() { return new LoginUseCase({ userRepo: userRepo(), businessRepo: businessRepo(), hasher: hasher(), tokens: tokens() }); },
  get registerUser() { return new RegisterUserUseCase({ userRepo: userRepo(), hasher: hasher(), tokens: tokens() }); },
  get registerBusiness() { return new RegisterBusinessUseCase({ businessRepo: businessRepo(), hasher: hasher(), tokens: tokens() }); },
  get verifyToken() { return new VerifyTokenUseCase({ userRepo: userRepo(), businessRepo: businessRepo(), tokens: tokens() }); },

  // Users
  get getUserProfile() { return new GetUserProfileUseCase({ userRepo: userRepo() }); },
  get updateUserProfile() { return new UpdateUserProfileUseCase({ userRepo: userRepo() }); },
  get addToWishlist() { return new AddToWishlistUseCase({ userRepo: userRepo(), promotionRepo: promotionRepo() }); },
  get removeFromWishlist() { return new RemoveFromWishlistUseCase({ userRepo: userRepo() }); },
  get getWishlist() { return new GetWishlistUseCase({ userRepo: userRepo(), promotionRepo: promotionRepo() }); },

  // Promotions (public)
  get listPublicPromotions() { return new ListPublicPromotionsUseCase({ promotionRepo: promotionRepo() }); },
  get getPromotionById() { return new GetPromotionByIdUseCase({ promotionRepo: promotionRepo() }); },
  get calculatePromotionPrice() { return new CalculatePromotionPriceUseCase(); },
  get incrementPromotionClick() { return new IncrementPromotionClickUseCase({ promotionRepo: promotionRepo() }); },

  // Promotions (business)
  get createPromotion() {
    return new CreatePromotionUseCase({
      promotionRepo: promotionRepo(),
      businessRepo: businessRepo(),
      subscriptionRepo: subscriptionRepo(),
      payments: payments(),
    });
  },
  get listBusinessPromotions() { return new ListBusinessPromotionsUseCase({ promotionRepo: promotionRepo() }); },
  get getBusinessPromotion() { return new GetBusinessPromotionUseCase({ promotionRepo: promotionRepo() }); },
  get updatePromotion() { return new UpdatePromotionUseCase({ promotionRepo: promotionRepo() }); },
  get deletePromotion() { return new DeletePromotionUseCase({ promotionRepo: promotionRepo() }); },
  get activatePromotion() { return new ActivatePromotionUseCase({ promotionRepo: promotionRepo() }); },
  get deactivatePromotion() { return new DeactivatePromotionUseCase({ promotionRepo: promotionRepo() }); },

  // Business
  get getBusinessDashboard() { return new GetBusinessDashboardUseCase({ promotionRepo: promotionRepo() }); },

  // Templates (public)
  get listTemplates() { return new ListTemplatesUseCase({ templateRepo: templateRepo() }); },

  // Admin
  get listAdminUsers() { return new ListAdminUsersUseCase({ userRepo: userRepo() }); },
  get updateUserStatus() { return new UpdateUserStatusUseCase({ userRepo: userRepo() }); },
  get listAdminBusinesses() { return new ListAdminBusinessesUseCase({ businessRepo: businessRepo() }); },
  get updateBusinessStatus() { return new UpdateBusinessStatusUseCase({ businessRepo: businessRepo() }); },
  get toggleBusinessAutoApprove() { return new ToggleBusinessAutoApproveUseCase({ businessRepo: businessRepo() }); },
  get listAdminPromotions() { return new ListAdminPromotionsUseCase({ promotionRepo: promotionRepo() }); },
  get adminDeletePromotion() { return new AdminDeletePromotionUseCase({ promotionRepo: promotionRepo() }); },
  get changePromotionStatus() { return new ChangePromotionStatusUseCase({ promotionRepo: promotionRepo() }); },
  get getAdminDashboard() { return new GetAdminDashboardUseCase({ userRepo: userRepo(), businessRepo: businessRepo(), promotionRepo: promotionRepo() }); },
  get uploadTemplates() { return new UploadTemplatesUseCase({ templateRepo: templateRepo(), uploader: uploader() }); },
  get deleteTemplate() { return new DeleteTemplateUseCase({ templateRepo: templateRepo(), uploader: uploader() }); },
  get createAdminUser() { return new CreateAdminUserUseCase({ userRepo: userRepo(), roleRepo: roleRepo(), hasher: hasher() }); },
  get updateAdminRole() { return new UpdateAdminRoleUseCase({ userRepo: userRepo(), roleRepo: roleRepo() }); },
  get makeAdmin() { return new MakeAdminUseCase({ userRepo: userRepo(), roleRepo: roleRepo() }); },
  get getUserPermissions() { return new GetUserPermissionsUseCase({ userRepo: userRepo() }); },

  // Roles
  get createRole() { return new CreateRoleUseCase({ roleRepo: roleRepo() }); },
  get listRoles() { return new ListRolesUseCase({ roleRepo: roleRepo() }); },
  get updateRole() { return new UpdateRoleUseCase({ roleRepo: roleRepo() }); },
  get deleteRole() { return new DeleteRoleUseCase({ roleRepo: roleRepo() }); },

  // Subscriptions
  get createSubscriptionCheckout() {
    return new CreateSubscriptionCheckoutUseCase({
      businessRepo: businessRepo(),
      subscriptionTemplateRepo: subscriptionTemplateRepo(),
      payments: payments(),
      env: { frontendUrl: process.env.NEXT_PUBLIC_API_URL || "" },
    });
  },
  get getActiveSubscription() { return new GetActiveSubscriptionUseCase({ subscriptionRepo: subscriptionRepo() }); },
  get getSubscriptionHistory() { return new GetSubscriptionHistoryUseCase({ subscriptionRepo: subscriptionRepo() }); },

  // Subscription templates
  get createSubscriptionTemplate() { return new CreateSubscriptionTemplateUseCase({ subscriptionTemplateRepo: subscriptionTemplateRepo() }); },
  get listSubscriptionTemplates() { return new ListSubscriptionTemplatesUseCase({ subscriptionTemplateRepo: subscriptionTemplateRepo() }); },
  get deactivateSubscriptionTemplate() { return new DeactivateSubscriptionTemplateUseCase({ subscriptionTemplateRepo: subscriptionTemplateRepo() }); },

  // Payments
  get handleStripeWebhook() {
    return new HandleStripeWebhookUseCase({
      businessRepo: businessRepo(),
      subscriptionRepo: subscriptionRepo(),
      subscriptionTemplateRepo: subscriptionTemplateRepo(),
      promotionRepo: promotionRepo(),
      payments: payments(),
    });
  },
  get paymentGateway() { return payments(); },

  // Location
  get lookupLocation() { return new LookupLocationUseCase({ geoLocator: geoLocator() }); },

  // Photos
  get listPublicPhotos() { return new ListPublicPhotosUseCase({ photoRepo: photoRepo() }); },
};
