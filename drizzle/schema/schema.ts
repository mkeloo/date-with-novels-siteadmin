import { pgTable, unique, pgPolicy, serial, text, boolean, timestamp, foreignKey, check, integer, numeric, index, uuid, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const syncStatusEnum = pgEnum("sync_status_enum", ['pending', 'synced', 'failed'])


export const genres = pgTable("genres", {
	id: serial().primaryKey().notNull(),
	genreName: text("genre_name").notNull(),
	emojiList: text("emoji_list").array(),
	backgroundColor: text("background_color"),
	isEnabled: boolean("is_enabled").default(true).notNull(),
}, (table) => [
	unique("genres_genre_name_key").on(table.genreName),
	pgPolicy("Enable delete for users based on user_id", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(auth.uid() IS NOT NULL)` }),
	pgPolicy("Enable update for authenticated users only", { as: "permissive", for: "update", to: ["authenticated"] }),
	pgPolicy("Enable insert for authenticated users only", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["public"] }),
]);

export const themes = pgTable("themes", {
	id: serial().primaryKey().notNull(),
	themeName: text("theme_name").notNull(),
	emojiList: text("emoji_list").array(),
	backgroundGradient: text("background_gradient"),
	isEnabled: boolean("is_enabled").default(true).notNull(),
	supportsThemed: boolean("supports_themed").default(false),
	supportsRegular: boolean("supports_regular").default(false),
}, (table) => [
	unique("themes_theme_name_key").on(table.themeName),
	pgPolicy("Enable delete for users based on user_id", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(auth.uid() IS NOT NULL)` }),
	pgPolicy("Enable update for authenticated users only", { as: "permissive", for: "update", to: ["authenticated"] }),
	pgPolicy("Enable insert for authenticated users only", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["public"] }),
]);

export const packageTiers = pgTable("package_tiers", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	shortDescription: text("short_description"),
	longDescription: text("long_description"),
	iconName: text("icon_name"),
	supportsThemed: boolean("supports_themed").default(false).notNull(),
	supportsRegular: boolean("supports_regular").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow(),
}, (table) => [
	unique("package_tiers_slug_key").on(table.slug),
	pgPolicy("Enable delete for users based on user_id", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(auth.uid() IS NOT NULL)` }),
	pgPolicy("Enable update for authenticated users only", { as: "permissive", for: "update", to: ["authenticated"] }),
	pgPolicy("Enable insert for authenticated users only", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["public"] }),
]);

export const packages = pgTable("packages", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	themeId: integer("theme_id"),
	supportsThemed: boolean("supports_themed").default(false).notNull(),
	supportsRegular: boolean("supports_regular").default(false).notNull(),
	shortDescription: text("short_description"),
	isEnabled: boolean("is_enabled").default(false).notNull(),
	iconName: text("icon_name"),
	sort: integer().default(0),
	price: numeric({ precision: 10, scale: 2 }).default('0.00').notNull(),
	allowedGenres: text("allowed_genres").array(),
	packageTier: integer("package_tier"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow(),
	stripeProductId: text("stripe_product_id"),
	stripePriceId: text("stripe_price_id"),
	isStripeSynced: boolean("is_stripe_synced").default(false),
	stripeSyncError: text("stripe_sync_error"),
}, (table) => [
	foreignKey({
		columns: [table.packageTier],
		foreignColumns: [packageTiers.id],
		name: "packages_package_tier_fkey"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.themeId],
		foreignColumns: [themes.id],
		name: "packages_theme_id_fkey"
	}).onDelete("set null"),
	unique("packages_slug_key").on(table.slug),
	pgPolicy("Enable delete for users based on user_id", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(auth.uid() IS NOT NULL)` }),
	pgPolicy("Enable update for authenticated users only", { as: "permissive", for: "update", to: ["authenticated"] }),
	pgPolicy("Enable insert for authenticated users only", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["public"] }),
	check("packages_short_description_check", sql`char_length(short_description) <= 160`),
]);

export const packageDescriptions = pgTable("package_descriptions", {
	id: serial().primaryKey().notNull(),
	packageId: integer("package_id").notNull(),
	longDescription: text("long_description").notNull(),
	readerNotice: text("reader_notice").notNull(),
	packageContents: text("package_contents").array(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow(),
}, (table) => [
	foreignKey({
		columns: [table.packageId],
		foreignColumns: [packages.id],
		name: "package_descriptions_package_id_fkey"
	}).onDelete("cascade"),
	unique("unique_package_id").on(table.packageId),
	pgPolicy("Enable insert for authenticated users only", { as: "permissive", for: "insert", to: ["authenticated"], withCheck: sql`true` }),
	pgPolicy("Enable update for authenticated users only", { as: "permissive", for: "update", to: ["authenticated"] }),
	pgPolicy("Enable delete for users based on user_id", { as: "permissive", for: "delete", to: ["authenticated"] }),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["public"] }),
]);

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'date' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'date' }).notNull(),
	userTypeId: integer("user_type_id").default(2).notNull(),
}, (table) => [
	unique("user_email_unique").on(table.email),
	pgPolicy("Enable delete for users based on user_id", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(auth.uid() IS NOT NULL)` }),
	pgPolicy("Enable update for authenticated users only", { as: "permissive", for: "update", to: ["authenticated"] }),
	pgPolicy("Enable insert for authenticated users only", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["public"] }),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'date' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'date' }),
	updatedAt: timestamp("updated_at", { mode: 'date' }),
}, () => [
	pgPolicy("Enable delete for users based on user_id", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(auth.uid() IS NOT NULL)` }),
	pgPolicy("Enable update for authenticated users only", { as: "permissive", for: "update", to: ["authenticated"] }),
	pgPolicy("Enable insert for authenticated users only", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["public"] }),
]);

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'date' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'date' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'date' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'date' }).notNull(),
}, (table) => [
	foreignKey({
		columns: [table.userId],
		foreignColumns: [user.id],
		name: "account_user_id_user_id_fk"
	}).onDelete("cascade"),
	pgPolicy("Enable delete for users based on user_id", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(auth.uid() IS NOT NULL)` }),
	pgPolicy("Enable update for authenticated users only", { as: "permissive", for: "update", to: ["authenticated"] }),
	pgPolicy("Enable insert for authenticated users only", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["public"] }),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'date' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'date' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'date' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
		columns: [table.userId],
		foreignColumns: [user.id],
		name: "session_user_id_user_id_fk"
	}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
	pgPolicy("Enable delete for users based on user_id", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(auth.uid() IS NOT NULL)` }),
	pgPolicy("Enable update for authenticated users only", { as: "permissive", for: "update", to: ["authenticated"] }),
	pgPolicy("Enable insert for authenticated users only", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["public"] }),
]);

export const folders = pgTable("folders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	parentType: text("parent_type").notNull(),
	parentId: uuid("parent_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow(),
}, (table) => [
	index("idx_folders_parent_id").using("btree", table.parentId.asc().nullsLast().op("uuid_ops")),
	index("idx_folders_parent_type").using("btree", table.parentType.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.parentId],
		foreignColumns: [table.id],
		name: "folders_parent_id_fkey"
	}).onDelete("cascade"),
	unique("folders_slug_key").on(table.slug),
	pgPolicy("Enable update for authenticated users only", { as: "permissive", for: "update", to: ["authenticated"], using: sql`(auth.uid() IS NOT NULL)`, withCheck: sql`true` }),
	pgPolicy("Enable delete for users based on user_id", { as: "permissive", for: "delete", to: ["authenticated"] }),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("Enable insert for authenticated users only", { as: "permissive", for: "insert", to: ["authenticated"] }),
]);

export const uploads = pgTable("uploads", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	filePath: text("file_path").notNull(),
	fileSizeMb: numeric("file_size_mb", { precision: 10, scale: 2 }).notNull(),
	altText: text("alt_text"),
	refType: text("ref_type").notNull(),
	refId: text("ref_id").notNull(),
	sortOrder: integer("sort_order").default(1),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow(),
}, (table) => [
	index("idx_uploads_ref_type_ref_id").using("btree", table.refType.asc().nullsLast().op("text_ops"), table.refId.asc().nullsLast().op("text_ops")),
	pgPolicy("Enable update for authenticated users only", { as: "permissive", for: "update", to: ["authenticated"], using: sql`(auth.uid() IS NOT NULL)`, withCheck: sql`true` }),
	pgPolicy("Enable delete for users based on user_id", { as: "permissive", for: "delete", to: ["authenticated"] }),
	pgPolicy("Enable insert for authenticated users only", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["public"] }),
]);

export const packageStripeSync = pgTable("package_stripe_sync", {
	id: serial().primaryKey().notNull(),
	packageId: integer("package_id").notNull(),
	stripeProductId: text("stripe_product_id"),
	stripePriceId: text("stripe_price_id"),
	syncStatus: syncStatusEnum("sync_status").default('pending').notNull(),
	lastSyncedAt: timestamp("last_synced_at", { withTimezone: true, mode: 'date' }),
	syncError: text("sync_error"),
}, (table) => [
	foreignKey({
		columns: [table.packageId],
		foreignColumns: [packages.id],
		name: "package_stripe_sync_package_id_fkey"
	}).onDelete("cascade"),
	unique("package_stripe_sync_package_id_key").on(table.packageId),
	pgPolicy("Enable delete for users based on user_id", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(auth.uid() IS NOT NULL)` }),
	pgPolicy("Enable update for authenticated users only", { as: "permissive", for: "update", to: ["authenticated"] }),
	pgPolicy("Enable insert for authenticated users only", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["public"] }),
]);

export const transactions = pgTable("transactions", {
	id: serial().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	packageId: integer("package_id"),
	stripePaymentIntentId: text("stripe_payment_intent_id"),
	stripeCheckoutSessionId: text("stripe_checkout_session_id"),
	stripeCustomerId: text("stripe_customer_id"),
	stripeReceiptUrl: text("stripe_receipt_url"),
	amount: numeric({ precision: 10, scale: 2 }).notNull(),
	currency: text().default('usd').notNull(),
	status: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow(),
}, (table) => [
	foreignKey({
		columns: [table.packageId],
		foreignColumns: [packages.id],
		name: "transactions_package_id_fkey"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [user.id],
		name: "transactions_user_id_fkey"
	}).onDelete("cascade"),
	pgPolicy("Enable delete for users based on user_id", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(auth.uid() IS NOT NULL)` }),
	pgPolicy("Enable update for authenticated users only", { as: "permissive", for: "update", to: ["authenticated"] }),
	pgPolicy("Enable insert for authenticated users only", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["public"] }),
]);

export const userTypes = pgTable("user_types", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
}, (table) => [
	unique("user_types_name_key").on(table.name),
	pgPolicy("Enable insert for authenticated users only", { as: "permissive", for: "insert", to: ["authenticated"], withCheck: sql`true` }),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["public"] }),
]);

export const orders = pgTable("orders", {
	id: serial().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	packageId: integer("package_id"),
	transactionId: integer("transaction_id"),
	status: text().default('received').notNull(),
	trackingId: text("tracking_id"),
	orderedAt: timestamp("ordered_at", { withTimezone: true, mode: 'date' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).defaultNow(),
}, (table) => [
	foreignKey({
		columns: [table.packageId],
		foreignColumns: [packages.id],
		name: "orders_package_id_fkey"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.transactionId],
		foreignColumns: [transactions.id],
		name: "orders_transaction_id_fkey"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [user.id],
		name: "orders_user_id_fkey"
	}).onDelete("cascade"),
	pgPolicy("Enable delete for users based on user_id", { as: "permissive", for: "delete", to: ["authenticated"], using: sql`(auth.uid() IS NOT NULL)` }),
	pgPolicy("Enable update for authenticated users only", { as: "permissive", for: "update", to: ["authenticated"] }),
	pgPolicy("Enable insert for authenticated users only", { as: "permissive", for: "insert", to: ["authenticated"] }),
	pgPolicy("Enable read access for all users", { as: "permissive", for: "select", to: ["public"] }),
]);


export const schema = {
	genres,
	themes,
	packageTiers,
	packages,
	packageDescriptions,
	user,
	verification,
	account,
	session,
	folders,
	uploads,
	packageStripeSync,
	transactions,
	userTypes,
	orders
}