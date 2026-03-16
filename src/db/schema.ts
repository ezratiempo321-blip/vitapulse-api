
import { boolean, integer, pgTable, timestamp, varchar, text, unique, serial } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm';

export const users = pgTable('users_table', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),  
    name: varchar({ length: 255 }).notNull(), 
    birthday: varchar({ length: 255 }).notNull(),  
    sex: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),  
    contact: varchar({ length: 255 }).notNull().unique(),
    password: varchar({ length: 255 }).notNull(),
    role: text({enum: ['admin', 'general']}).default('general').notNull(),
    isVerified: boolean().default(false),
    status: boolean().default(false),
    created_At: timestamp().default(new Date(Date.now())),
});

export const verificationToken = pgTable("verificationToken", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),  
    token: text().notNull().unique(),
    userId: integer().references(() => users.id, { onDelete: 'cascade' }),
    tokenExpires: timestamp().notNull(),
});
export const passwordResetToken = pgTable("resetToken", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),  
    token: text().notNull().unique(),
    userId: integer().references(() => users.id, { onDelete: 'cascade' }),
    tokenExpires: timestamp().notNull(),
});

export type User = typeof users.$inferSelect;

export const usersRelation = relations(users, ({many})=>({
    bpPulseRecords: many(bpPulseRecords),
    alertHistory: many(alertHistory),
    logs: many(logs),

}))

export const bpPulseRecords = pgTable('bp_records_table', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),  
    user_id: integer().references(()=> users.id, {onDelete: 'cascade'}).notNull(),  // Foreign key to users table
    systolic: integer().notNull(),  // Systolic blood pressure
    diastolic: integer().notNull(),  // Diastolic blood pressure
    bpStatus: text().notNull(),  // Whether the reading is abnormal (true/false)
    pulse: integer().notNull(), //pulse rate 
    pulseStatus: text().notNull(),  // Whether the reading is abnormal (true/false)
    clinicalBpLabel: text().notNull(),
    timestamp: text().notNull(),  // Timestamp of the measurement
});

export type records = typeof bpPulseRecords.$inferSelect;

// Alert History table to store past alerts
export const alertHistory = pgTable('alert_history', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),  
    user_id: integer().references(() => users.id, { onDelete: 'cascade' }).notNull(),  // Foreign key to users table
    message: text().notNull(),  // The alert message
    isRead: boolean().default(false),
    timestamp: text().notNull(),  // Timestamp when the alert was sent
});


//actiivity logs
export const logs = pgTable('logs', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),  
    user_id: integer().references(()=>users.id, {onDelete: 'cascade'}).notNull(),
    activity: text().notNull(),
    timestamp: text().notNull(),  // Timestamp when the alert was sent
})


//logins
export const loginStat = pgTable('login_stat', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),  
    date: text('date').notNull(), // Format: YYYY-MM-DD
    logins: integer('logins').notNull().default(0),
}, (t) => [
    unique('unique_date').on(t.date) // New syntax: array, not object
]);

export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  deviceId: varchar("device_id", { length: 255 }).notNull(),
  deviceName: varchar("device_name", { length: 255 }),
  registeredAt: timestamp("registered_at").defaultNow(),
  status: integer("status").default(1).notNull(),
});