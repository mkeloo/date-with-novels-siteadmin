import { relations } from "drizzle-orm/relations";
import { packageTiers, packages, themes, packageDescriptions, user, account, session, folders, packageStripeSync, transactions, orders } from "./schema";

export const packagesRelations = relations(packages, ({one, many}) => ({
	packageTier: one(packageTiers, {
		fields: [packages.packageTier],
		references: [packageTiers.id]
	}),
	theme: one(themes, {
		fields: [packages.themeId],
		references: [themes.id]
	}),
	packageDescriptions: many(packageDescriptions),
	packageStripeSyncs: many(packageStripeSync),
	transactions: many(transactions),
	orders: many(orders),
}));

export const packageTiersRelations = relations(packageTiers, ({many}) => ({
	packages: many(packages),
}));

export const themesRelations = relations(themes, ({many}) => ({
	packages: many(packages),
}));

export const packageDescriptionsRelations = relations(packageDescriptions, ({one}) => ({
	package: one(packages, {
		fields: [packageDescriptions.packageId],
		references: [packages.id]
	}),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	sessions: many(session),
	transactions: many(transactions),
	orders: many(orders),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const foldersRelations = relations(folders, ({one, many}) => ({
	folder: one(folders, {
		fields: [folders.parentId],
		references: [folders.id],
		relationName: "folders_parentId_folders_id"
	}),
	folders: many(folders, {
		relationName: "folders_parentId_folders_id"
	}),
}));

export const packageStripeSyncRelations = relations(packageStripeSync, ({one}) => ({
	package: one(packages, {
		fields: [packageStripeSync.packageId],
		references: [packages.id]
	}),
}));

export const transactionsRelations = relations(transactions, ({one, many}) => ({
	package: one(packages, {
		fields: [transactions.packageId],
		references: [packages.id]
	}),
	user: one(user, {
		fields: [transactions.userId],
		references: [user.id]
	}),
	orders: many(orders),
}));

export const ordersRelations = relations(orders, ({one}) => ({
	package: one(packages, {
		fields: [orders.packageId],
		references: [packages.id]
	}),
	transaction: one(transactions, {
		fields: [orders.transactionId],
		references: [transactions.id]
	}),
	user: one(user, {
		fields: [orders.userId],
		references: [user.id]
	}),
}));