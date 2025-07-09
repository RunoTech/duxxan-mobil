import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  walletAddress: varchar("wallet_address", { length: 42 }).notNull().unique(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }),
  profession: varchar("profession", { length: 100 }),
  bio: text("bio"),
  profileImage: text("profile_image"),
  profilePhoto: text("profile_photo"), // JPEG photo stored as base64
  email: varchar("email", { length: 255 }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  dateOfBirth: varchar("date_of_birth", { length: 10 }), // YYYY-MM-DD format
  gender: varchar("gender", { length: 10 }),
  city: varchar("city", { length: 100 }),
  address: text("address"),
  website: varchar("website", { length: 255 }),
  socialMediaTwitter: varchar("social_media_twitter", { length: 100 }),
  socialMediaInstagram: varchar("social_media_instagram", { length: 100 }),
  socialMediaLinkedin: varchar("social_media_linkedin", { length: 100 }),
  socialMediaFacebook: varchar("social_media_facebook", { length: 100 }),
  isActive: boolean("is_active").default(true),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("5.0"),
  ratingCount: integer("rating_count").default(0),
  // New organization fields
  organizationType: varchar("organization_type", { length: 20 }).default("individual"), // individual, foundation, association, official
  organizationName: varchar("organization_name", { length: 200 }),
  verificationUrl: text("verification_url"),
  isVerified: boolean("is_verified").default(false),
  country: varchar("country", { length: 3 }), // ISO country code
  accountStatus: varchar("account_status", { length: 20 }).default("active"), // active, pending_approval, rejected
  accountSubmittedAt: timestamp("account_submitted_at"),
  accountApprovedAt: timestamp("account_approved_at"),
  accountRejectedAt: timestamp("account_rejected_at"),
  approvalDeadline: timestamp("approval_deadline"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
});

// Footer content management
export const footerSections = pgTable("footer_sections", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  content: text("content").notNull(),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const footerLinks = pgTable("footer_links", {
  id: serial("id").primaryKey(),
  sectionId: integer("section_id").references(() => footerSections.id),
  title: varchar("title", { length: 100 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  description: text("description"),
  isExternal: boolean("is_external").default(false),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Countries table for international filtering
export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 3 }).notNull().unique(), // ISO 3166-1 alpha-3
  code2: varchar("code2", { length: 2 }).notNull().unique(), // ISO 3166-1 alpha-2
  name: varchar("name", { length: 100 }).notNull(),
  nameNative: varchar("name_native", { length: 100 }),
  flag: varchar("flag", { length: 10 }), // Unicode flag emoji
  continent: varchar("continent", { length: 20 }),
  region: varchar("region", { length: 50 }),
  currency: varchar("currency", { length: 10 }),
  isActive: boolean("is_active").default(true),
});

// Admin kontrolü tablosu
export const adminSettings = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  settingKey: varchar("setting_key", { length: 100 }).notNull().unique(),
  settingValue: text("setting_value").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ülke kısıtlamaları tablosu
export const countryRestrictions = pgTable("country_restrictions", {
  id: serial("id").primaryKey(),
  countryCode: varchar("country_code", { length: 3 }).notNull().unique(), // ISO 3166-1 alpha-3
  countryName: varchar("country_name", { length: 100 }).notNull(),
  isBlocked: boolean("is_blocked").default(false), // Tamamen yasaklı mı
  allowRaffles: boolean("allow_raffles").default(true), // Çekiliş oluşturabilir mi
  allowDonations: boolean("allow_donations").default(true), // Bağış kampanyası oluşturabilir mi
  allowParticipation: boolean("allow_participation").default(true), // Katılım yapabilir mi
  restrictionReason: text("restriction_reason"), // Kısıtlama sebebi
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const raffles = pgTable("raffles", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => users.id).notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  prizeValue: decimal("prize_value", { precision: 15, scale: 6 }).notNull(),
  ticketPrice: decimal("ticket_price", { precision: 15, scale: 6 }).notNull(),
  maxTickets: integer("max_tickets").notNull(),
  ticketsSold: integer("tickets_sold").default(0),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true),
  winnerId: integer("winner_id").references(() => users.id),
  isApprovedByCreator: boolean("is_approved_by_creator").default(false),
  isApprovedByWinner: boolean("is_approved_by_winner").default(false),
  winnerSelectedAt: timestamp("winner_selected_at"),
  approvalDeadline: timestamp("approval_deadline"), // 6 days from winner selection
  // Country filtering fields
  countryRestriction: varchar("country_restriction", { length: 20 }).default("all"), // "all", "selected", "exclude"
  allowedCountries: text("allowed_countries"), // JSON array of ISO country codes
  excludedCountries: text("excluded_countries"), // JSON array of ISO country codes
  // Manual raffle system (fake but realistic)
  isManual: boolean("is_manual").default(false), // Manuel yönetilen çekiliş
  createdByAdmin: boolean("created_by_admin").default(false), // Admin tarafından oluşturuldu
  // Pasif çekiliş sistemi
  isDraft: boolean("is_draft").default(false), // Taslak olarak kaydet
  requiresApproval: boolean("requires_approval").default(false), // Admin onayı gerekiyor mu
  approvalStatus: varchar("approval_status", { length: 20 }).default("pending"), // pending, approved, rejected
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  adminNotes: text("admin_notes"), // Admin notları
  // Blockchain payment verification (not used for manual raffles)
  transactionHash: varchar("transaction_hash", { length: 66 }), // Ethereum transaction hash
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  raffleId: integer("raffle_id").references(() => raffles.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  quantity: integer("quantity").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 6 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  goalAmount: decimal("goal_amount", { precision: 15, scale: 6 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 15, scale: 6 }).default("0"),
  donorCount: integer("donor_count").default(0),
  endDate: timestamp("end_date"), // Now nullable for unlimited donations
  isActive: boolean("is_active").default(true),
  // New donation system fields
  isUnlimited: boolean("is_unlimited").default(false),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("10.00"), // 10% for individual, 2% for organizations
  startupFee: decimal("startup_fee", { precision: 15, scale: 6 }).default("0"), // 100 USDT for unlimited
  startupFeePaid: boolean("startup_fee_paid").default(false),
  totalCommissionCollected: decimal("total_commission_collected", { precision: 15, scale: 6 }).default("0"),
  category: varchar("category", { length: 50 }).default("general"), // health, education, disaster, etc.
  country: varchar("country", { length: 3 }), // For flag display
  // Country filtering fields
  countryRestriction: varchar("country_restriction", { length: 20 }).default("all"), // "all", "selected", "exclude"
  allowedCountries: text("allowed_countries"), // JSON array of ISO country codes
  excludedCountries: text("excluded_countries"), // JSON array of ISO country codes
  createdAt: timestamp("created_at").defaultNow(),
});

// Corporate Fund System
export const corporateFunds = pgTable("corporate_funds", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description").notNull(),
  fundType: varchar("fund_type", { length: 50 }).notNull(), // "emergency", "education", "health", "infrastructure"
  totalCapital: decimal("total_capital", { precision: 15, scale: 6 }).notNull(),
  availableAmount: decimal("available_amount", { precision: 15, scale: 6 }).notNull(),
  allocatedAmount: decimal("allocated_amount", { precision: 15, scale: 6 }).default("0"),
  disbursedAmount: decimal("disbursed_amount", { precision: 15, scale: 6 }).default("0"),
  minimumAllocation: decimal("minimum_allocation", { precision: 15, scale: 6 }).default("1000"), // Minimum 1000 USDT
  maximumAllocation: decimal("maximum_allocation", { precision: 15, scale: 6 }).default("50000"), // Maximum 50K USDT
  isActive: boolean("is_active").default(true),
  approvalRequired: boolean("approval_required").default(true),
  managerId: integer("manager_id").references(() => users.id).notNull(),
  boardMembers: text("board_members"), // JSON array of user IDs
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const fundAllocations = pgTable("fund_allocations", {
  id: serial("id").primaryKey(),
  fundId: integer("fund_id").references(() => corporateFunds.id).notNull(),
  donationId: integer("donation_id").references(() => donations.id).notNull(),
  allocatedAmount: decimal("allocated_amount", { precision: 15, scale: 6 }).notNull(),
  disbursedAmount: decimal("disbursed_amount", { precision: 15, scale: 6 }).default("0"),
  status: varchar("status", { length: 20 }).default("pending"), // "pending", "approved", "disbursed", "rejected"
  allocationReason: text("allocation_reason").notNull(),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  disbursedAt: timestamp("disbursed_at"),
  transactionHash: varchar("transaction_hash", { length: 66 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const donationContributions = pgTable("donation_contributions", {
  id: serial("id").primaryKey(),
  donationId: integer("donation_id").references(() => donations.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  fundAllocationId: integer("fund_allocation_id").references(() => fundAllocations.id), // Corporate fund contribution
  amount: decimal("amount", { precision: 15, scale: 6 }).notNull(),
  commissionAmount: decimal("commission_amount", { precision: 15, scale: 6 }).default("0"),
  netAmount: decimal("net_amount", { precision: 15, scale: 6 }).default("0"), // amount - commission
  contributionType: varchar("contribution_type", { length: 20 }).default("individual"), // "individual", "corporate_fund"
  donorCountry: varchar("donor_country", { length: 3 }), // For live chart display
  createdAt: timestamp("created_at").defaultNow(),
});

export const userRatings = pgTable("user_ratings", {
  id: serial("id").primaryKey(),
  raterId: integer("rater_id").references(() => users.id).notNull(),
  ratedId: integer("rated_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  createdAt: timestamp("created_at").defaultNow(),
});

// DUXXAN Internal Mail System
export const mailMessages = pgTable("mail_messages", {
  id: serial("id").primaryKey(),
  fromWalletAddress: varchar("from_wallet_address", { length: 42 }).notNull(),
  toWalletAddress: varchar("to_wallet_address", { length: 42 }).notNull(),
  subject: varchar("subject", { length: 200 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 20 }).notNull(), // system, user, community
  isRead: boolean("is_read").default(false),
  isStarred: boolean("is_starred").default(false),
  raffleId: integer("raffle_id").references(() => raffles.id), // For raffle-related messages
  communityId: integer("community_id"), // For community messages
  createdAt: timestamp("created_at").defaultNow(),
});

export const mailAttachments = pgTable("mail_attachments", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").references(() => mailMessages.id).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").references(() => users.id).notNull(),
  followingId: integer("following_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Community channels
export const channels = pgTable("channels", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  description: text("description").notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  creatorId: integer("creator_id").references(() => users.id).notNull(),
  subscriberCount: integer("subscriber_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  isDemo: boolean("is_demo").default(false),
  demoContent: text("demo_content"),
  totalPrizeAmount: varchar("total_prize_amount", { length: 50 }).default('0'),
  activeRaffleCount: integer("active_raffle_count").default(0),
});

// Channel subscriptions
export const channelSubscriptions = pgTable("channel_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  channelId: integer("channel_id").references(() => channels.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Upcoming raffles (preview announcements)
export const upcomingRaffles = pgTable("upcoming_raffles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  prizeValue: decimal("prize_value", { precision: 15, scale: 6 }).notNull(),
  ticketPrice: decimal("ticket_price", { precision: 15, scale: 6 }).notNull(),
  maxTickets: integer("max_tickets").notNull(),
  startDate: timestamp("start_date").notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  creatorId: integer("creator_id").references(() => users.id).notNull(),
  channelId: integer("channel_id").references(() => channels.id),
  interestedCount: integer("interested_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Interest tracking for upcoming raffles
export const upcomingRaffleInterests = pgTable("upcoming_raffle_interests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  upcomingRaffleId: integer("upcoming_raffle_id").references(() => upcomingRaffles.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Device login logging table with enhanced fingerprinting
export const userDevices = pgTable("user_devices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  deviceType: varchar("device_type", { length: 20 }).notNull(), // mobile, desktop, tablet
  deviceName: varchar("device_name", { length: 100 }), // device model/name
  browser: varchar("browser", { length: 50 }),
  operatingSystem: varchar("operating_system", { length: 50 }),
  ipAddress: varchar("ip_address", { length: 45 }), // supports IPv6
  userAgent: text("user_agent"),
  location: varchar("location", { length: 100 }), // city, country if available
  // Enhanced device fingerprinting for security
  deviceFingerprint: varchar("device_fingerprint", { length: 64 }).notNull(),
  acceptLanguage: varchar("accept_language", { length: 100 }),
  acceptEncoding: varchar("accept_encoding", { length: 100 }),
  screenResolution: varchar("screen_resolution", { length: 20 }),
  colorDepth: varchar("color_depth", { length: 10 }),
  // Security and trust tracking
  isVerified: boolean("is_verified").default(false),
  isTrusted: boolean("is_trusted").default(false),
  suspiciousActivity: integer("suspicious_activity").default(0),
  securityScore: integer("security_score").default(50), // 0-100 trust score
  // Detailed geolocation tracking
  countryCode: varchar("country_code", { length: 3 }), // ISO country code
  countryName: varchar("country_name", { length: 100 }),
  city: varchar("city", { length: 100 }),
  region: varchar("region", { length: 100 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  timezone: varchar("timezone", { length: 50 }),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User photos table for storing multiple photos
export const userPhotos = pgTable("user_photos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  photoData: text("photo_data").notNull(), // base64 encoded JPEG
  photoType: varchar("photo_type", { length: 20 }).default("profile"), // profile, gallery, document
  fileName: varchar("file_name", { length: 255 }),
  fileSize: integer("file_size"), // in bytes
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  rafflesCreated: many(raffles, { relationName: "raffles_creator" }),
  rafflesWon: many(raffles, { relationName: "raffles_winner" }),
  tickets: many(tickets),
  donationsCreated: many(donations),
  donationContributions: many(donationContributions),
  ratingsGiven: many(userRatings, { relationName: "ratings_rater" }),
  ratingsReceived: many(userRatings, { relationName: "ratings_rated" }),
  // Mail system
  sentMails: many(mailMessages, { relationName: "sent_mails" }),
  receivedMails: many(mailMessages, { relationName: "received_mails" }),
  following: many(follows, { relationName: "follows_follower" }),
  followers: many(follows, { relationName: "follows_following" }),
  devices: many(userDevices),
  photos: many(userPhotos),
  // Corporate funds
  managedFunds: many(corporateFunds, { relationName: "fund_manager" }),
  approvedAllocations: many(fundAllocations, { relationName: "allocation_approver" }),
}));

export const userDevicesRelations = relations(userDevices, ({ one }) => ({
  user: one(users, {
    fields: [userDevices.userId],
    references: [users.id],
  }),
}));

export const userPhotosRelations = relations(userPhotos, ({ one }) => ({
  user: one(users, {
    fields: [userPhotos.userId],
    references: [users.id],
  }),
}));

export const footerSectionsRelations = relations(footerSections, ({ many }) => ({
  links: many(footerLinks),
}));

export const footerLinksRelations = relations(footerLinks, ({ one }) => ({
  section: one(footerSections, {
    fields: [footerLinks.sectionId],
    references: [footerSections.id],
  }),
}));

export const rafflesRelations = relations(raffles, ({ one, many }) => ({
  creator: one(users, {
    fields: [raffles.creatorId],
    references: [users.id],
    relationName: "raffles_creator",
  }),
  winner: one(users, {
    fields: [raffles.winnerId],
    references: [users.id],
    relationName: "raffles_winner",
  }),
  category: one(categories, {
    fields: [raffles.categoryId],
    references: [categories.id],
  }),
  tickets: many(tickets),

}));

export const donationsRelations = relations(donations, ({ one, many }) => ({
  creator: one(users, {
    fields: [donations.creatorId],
    references: [users.id],
  }),
  contributions: many(donationContributions),
}));

export const channelsRelations = relations(channels, ({ one, many }) => ({
  creator: one(users, {
    fields: [channels.creatorId],
    references: [users.id],
  }),
  subscriptions: many(channelSubscriptions),
  upcomingRaffles: many(upcomingRaffles),
}));

export const channelSubscriptionsRelations = relations(channelSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [channelSubscriptions.userId],
    references: [users.id],
  }),
  channel: one(channels, {
    fields: [channelSubscriptions.channelId],
    references: [channels.id],
  }),
}));

export const upcomingRafflesRelations = relations(upcomingRaffles, ({ one, many }) => ({
  creator: one(users, {
    fields: [upcomingRaffles.creatorId],
    references: [users.id],
  }),
  channel: one(channels, {
    fields: [upcomingRaffles.channelId],
    references: [channels.id],
  }),
  interests: many(upcomingRaffleInterests),
}));

export const upcomingRaffleInterestsRelations = relations(upcomingRaffleInterests, ({ one }) => ({
  user: one(users, {
    fields: [upcomingRaffleInterests.userId],
    references: [users.id],
  }),
  upcomingRaffle: one(upcomingRaffles, {
    fields: [upcomingRaffleInterests.upcomingRaffleId],
    references: [upcomingRaffles.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  walletAddress: true,
  username: true,
  name: true,
  profession: true,
  bio: true,
  profileImage: true,
  profilePhoto: true,
  email: true,
  phoneNumber: true,
  dateOfBirth: true,
  gender: true,
  city: true,
  address: true,
  website: true,
  socialMediaTwitter: true,
  socialMediaInstagram: true,
  socialMediaLinkedin: true,
  socialMediaFacebook: true,
  organizationType: true,
  organizationName: true,
  verificationUrl: true,
  country: true,
}).extend({
  walletAddress: z.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum wallet address format")
    .min(42, "Wallet address must be 42 characters")
    .max(42, "Wallet address must be 42 characters"),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscore and dash"),
  name: z.string().max(100, "Name must be less than 100 characters").optional(),
  profession: z.string().max(100, "Profession must be less than 100 characters").optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  email: z.string().email("Invalid email format").optional(),
  phoneNumber: z.string().max(20, "Phone number must be less than 20 characters").optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  city: z.string().max(100, "City must be less than 100 characters").optional(),
  address: z.string().max(500, "Address must be less than 500 characters").optional(),
  website: z.string().url("Must be a valid URL").optional(),
  socialMediaTwitter: z.string().max(100).optional(),
  socialMediaInstagram: z.string().max(100).optional(),
  socialMediaLinkedin: z.string().max(100).optional(),
  socialMediaFacebook: z.string().max(100).optional(),
  organizationType: z.enum(["individual", "foundation", "association", "official"]).default("individual"),
  organizationName: z.string().max(200, "Organization name must be less than 200 characters").optional(),
  verificationUrl: z.string().url("Must be a valid URL").optional(),
  country: z.string().length(3, "Country code must be 3 characters").optional(),
});

export const insertUserDeviceSchema = createInsertSchema(userDevices).pick({
  deviceType: true,
  deviceName: true,
  browser: true,
  operatingSystem: true,
  ipAddress: true,
  userAgent: true,
  location: true,
});

export const insertUserPhotoSchema = createInsertSchema(userPhotos).pick({
  photoData: true,
  photoType: true,
  fileName: true,
  fileSize: true,
});

// Footer schema types
export const insertFooterSectionSchema = createInsertSchema(footerSections).pick({
  title: true,
  slug: true,
  content: true,
  isActive: true,
  sortOrder: true,
});

export const insertFooterLinkSchema = createInsertSchema(footerLinks).pick({
  sectionId: true,
  title: true,
  url: true,
  description: true,
  isExternal: true,
  isActive: true,
  sortOrder: true,
});

// Types
export type FooterSection = typeof footerSections.$inferSelect;
export type FooterLink = typeof footerLinks.$inferSelect;
export type InsertFooterSection = z.infer<typeof insertFooterSectionSchema>;
export type InsertFooterLink = z.infer<typeof insertFooterLinkSchema>;

export const insertRaffleSchema = createInsertSchema(raffles).pick({
  categoryId: true,
  title: true,
  description: true,
  prizeValue: true,
  ticketPrice: true,
  maxTickets: true,
  endDate: true,
  countryRestriction: true,
  allowedCountries: true,
  excludedCountries: true,
}).extend({
  transactionHash: z.string().optional(),
}).extend({
  title: z.string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be less than 200 characters")
    .regex(/^[a-zA-Z0-9\s\-_.!?()&]+$/, "Title contains invalid characters"),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be less than 2000 characters"),
  prizeValue: z.string()
    .regex(/^\d+(\.\d{1,6})?$/, "Prize value must be a valid number with up to 6 decimal places")
    .refine(val => parseFloat(val) > 0 && parseFloat(val) <= 10000000, "Prize value must be between 1 USDT and 10,000,000 USDT"),
  ticketPrice: z.string()
    .regex(/^\d+(\.\d{1,6})?$/, "Ticket price must be a valid number with up to 6 decimal places")
    .refine(val => parseFloat(val) >= 1 && parseFloat(val) <= 100000, "Ticket price must be between 1 USDT and 100,000 USDT"),
  maxTickets: z.number()
    .int("Max tickets must be a whole number")
    .min(1, "Must have at least 1 ticket")
    .max(1000000, "Cannot exceed 1,000,000 tickets"),
  categoryId: z.number()
    .int("Category ID must be a whole number")
    .min(1, "Invalid category selected"),
  endDate: z.union([
    z.date(),
    z.string().transform((val) => new Date(val))
  ]).refine((date) => date > new Date(), "End date must be in the future"),
});

// Admin Settings Schema
export const insertAdminSettingSchema = createInsertSchema(adminSettings).pick({
  settingKey: true,
  settingValue: true,
  description: true,
  isActive: true,
}).extend({
  settingKey: z.string()
    .min(3, "Setting key must be at least 3 characters")
    .max(100, "Setting key must be less than 100 characters"),
  settingValue: z.string()
    .min(1, "Setting value cannot be empty"),
  description: z.string().optional(),
});

// Country Restrictions Schema
export const insertCountryRestrictionSchema = createInsertSchema(countryRestrictions).pick({
  countryCode: true,
  countryName: true,
  isBlocked: true,
  allowRaffles: true,
  allowDonations: true,
  allowParticipation: true,
  restrictionReason: true,
}).extend({
  countryCode: z.string()
    .length(3, "Country code must be 3 characters")
    .regex(/^[A-Z]{3}$/, "Country code must be uppercase letters"),
  countryName: z.string()
    .min(2, "Country name must be at least 2 characters")
    .max(100, "Country name must be less than 100 characters"),
  restrictionReason: z.string().optional(),
});

// New Corporate Funds Table for CorporateFundsPage
export const newCorporateFunds = pgTable("new_corporate_funds", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description").notNull(),
  targetAmount: decimal("target_amount", { precision: 15, scale: 6 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 15, scale: 6 }).default("0"),
  category: varchar("category", { length: 50 }).notNull(),
  organizationType: varchar("organization_type", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  creatorId: integer("creator_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// New Corporate Fund Schema for CorporateFundsPage
export const insertCorporateFundSchema = z.object({
  name: z.string()
    .min(5, "Fund name must be at least 5 characters")
    .max(200, "Fund name must be less than 200 characters"),
  description: z.string()
    .min(20, "Description must be at least 20 characters")
    .max(1000, "Description must be less than 1000 characters"),
  targetAmount: z.string()
    .regex(/^\d+(\.\d{1,6})?$/, "Target amount must be a valid number")
    .refine(val => parseFloat(val) >= 1000, "Minimum target amount is 1,000 USDT"),
  category: z.enum(["education", "healthcare", "environment", "social", "technology", "disaster", "research", "culture", "other"]),
  organizationType: z.enum(["corporation", "foundation", "association", "cooperative", "government", "international", "university", "hospital"]),
  status: z.enum(["pending", "active", "completed", "rejected"]).default("pending"),
});

// Old Corporate Fund Schemas (for backward compatibility)
export const insertOldCorporateFundSchema = createInsertSchema(corporateFunds).pick({
  name: true,
  description: true,
  fundType: true,
  totalCapital: true,
  minimumAllocation: true,
  maximumAllocation: true,
  approvalRequired: true,
  boardMembers: true,
}).extend({
  name: z.string()
    .min(5, "Fund name must be at least 5 characters")
    .max(200, "Fund name must be less than 200 characters"),
  description: z.string()
    .min(20, "Description must be at least 20 characters")
    .max(1000, "Description must be less than 1000 characters"),
  fundType: z.enum(["emergency", "education", "health", "infrastructure", "environmental", "social"]),
  totalCapital: z.string()
    .regex(/^\d+(\.\d{1,6})?$/, "Total capital must be a valid number")
    .refine(val => parseFloat(val) >= 10000, "Minimum fund capital is 10,000 USDT"),
  minimumAllocation: z.string()
    .regex(/^\d+(\.\d{1,6})?$/, "Minimum allocation must be a valid number")
    .default("1000"),
  maximumAllocation: z.string()
    .regex(/^\d+(\.\d{1,6})?$/, "Maximum allocation must be a valid number")
    .default("50000"),
});

export const insertFundAllocationSchema = createInsertSchema(fundAllocations).pick({
  fundId: true,
  donationId: true,
  allocatedAmount: true,
  allocationReason: true,
}).extend({
  allocatedAmount: z.string()
    .regex(/^\d+(\.\d{1,6})?$/, "Allocation amount must be a valid number")
    .refine(val => parseFloat(val) >= 100, "Minimum allocation is 100 USDT"),
  allocationReason: z.string()
    .min(50, "Allocation reason must be at least 50 characters")
    .max(500, "Allocation reason must be less than 500 characters"),
});

export const insertDonationSchema = createInsertSchema(donations).pick({
  title: true,
  description: true,
  goalAmount: true,
  endDate: true,
  isUnlimited: true,
  category: true,
  country: true,
  countryRestriction: true,
  allowedCountries: true,
  excludedCountries: true,
}).extend({
  title: z.string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be less than 200 characters"),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be less than 2000 characters"),
  goalAmount: z.string()
    .regex(/^\d+(\.\d{1,6})?$/, "Goal amount must be a valid number with up to 6 decimal places")
    .refine(val => parseFloat(val) > 0 && parseFloat(val) <= 100000000, "Goal amount must be between 1 and 100,000,000 USDT"),
  endDate: z.string().datetime().optional(),
  isUnlimited: z.boolean().default(false),
  category: z.string().max(50, "Category must be less than 50 characters").default("general"),
  country: z.string().length(3, "Country code must be 3 characters").optional(),
});

export const insertTicketSchema = createInsertSchema(tickets).pick({
  raffleId: true,
  quantity: true,
  totalAmount: true,
});

export const insertDonationContributionSchema = createInsertSchema(donationContributions).pick({
  donationId: true,
  amount: true,
  donorCountry: true,
}).extend({
  amount: z.string()
    .regex(/^\d+(\.\d{1,6})?$/, "Amount must be a valid number with up to 6 decimal places")
    .refine(val => parseFloat(val) >= 10, "Minimum donation amount is 10 USDT"),
  commissionAmount: z.string()
    .regex(/^\d+(\.\d{1,6})?$/, "Commission amount must be a valid number")
    .optional(),
  netAmount: z.string()
    .regex(/^\d+(\.\d{1,6})?$/, "Net amount must be a valid number")
    .optional(),
  donorCountry: z.string().length(3, "Country code must be 3 characters").optional(),
});

export const insertUserRatingSchema = createInsertSchema(userRatings).pick({
  ratedId: true,
  rating: true,
});

export const insertChannelSchema = createInsertSchema(channels).pick({
  name: true,
  description: true,
  categoryId: true,
});

export const insertChannelSubscriptionSchema = createInsertSchema(channelSubscriptions).pick({
  channelId: true,
});

export const insertUpcomingRaffleSchema = createInsertSchema(upcomingRaffles).pick({
  title: true,
  description: true,
  prizeValue: true,
  ticketPrice: true,
  maxTickets: true,
  startDate: true,
  categoryId: true,
  channelId: true,
});

export const insertUpcomingRaffleInterestSchema = createInsertSchema(upcomingRaffleInterests).pick({
  upcomingRaffleId: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserDevice = typeof userDevices.$inferSelect;
export type InsertUserDevice = z.infer<typeof insertUserDeviceSchema>;
export type UserPhoto = typeof userPhotos.$inferSelect;
export type InsertUserPhoto = z.infer<typeof insertUserPhotoSchema>;
export type Raffle = typeof raffles.$inferSelect;
export type InsertRaffle = z.infer<typeof insertRaffleSchema>;
export type Donation = typeof donations.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type DonationContribution = typeof donationContributions.$inferSelect;
export type InsertDonationContribution = z.infer<typeof insertDonationContributionSchema>;
export type UserRating = typeof userRatings.$inferSelect;
export type InsertUserRating = z.infer<typeof insertUserRatingSchema>;
export type Category = typeof categories.$inferSelect;
export type Country = typeof countries.$inferSelect;
// ChatMessage type removed - using mail system now
export type Channel = typeof channels.$inferSelect;
export type InsertChannel = z.infer<typeof insertChannelSchema>;
export type ChannelSubscription = typeof channelSubscriptions.$inferSelect;
export type InsertChannelSubscription = z.infer<typeof insertChannelSubscriptionSchema>;
export type UpcomingRaffle = typeof upcomingRaffles.$inferSelect;
export type InsertUpcomingRaffle = z.infer<typeof insertUpcomingRaffleSchema>;
export type UpcomingRaffleInterest = typeof upcomingRaffleInterests.$inferSelect;
export type InsertUpcomingRaffleInterest = z.infer<typeof insertUpcomingRaffleInterestSchema>;

// Mail System Types
export type MailMessage = typeof mailMessages.$inferSelect;
export type InsertMailMessage = typeof mailMessages.$inferInsert;
export type MailAttachment = typeof mailAttachments.$inferSelect;
export type InsertMailAttachment = typeof mailAttachments.$inferInsert;

// New Corporate Fund Types for CorporateFundsPage
export type CorporateFund = typeof newCorporateFunds.$inferSelect;
export type InsertCorporateFund = z.infer<typeof insertCorporateFundSchema>;

// Old Corporate Fund Types (for backward compatibility)
export type OldCorporateFund = typeof corporateFunds.$inferSelect;
export type InsertOldCorporateFund = z.infer<typeof insertOldCorporateFundSchema>;
export type FundAllocation = typeof fundAllocations.$inferSelect;
export type InsertFundAllocation = z.infer<typeof insertFundAllocationSchema>;
