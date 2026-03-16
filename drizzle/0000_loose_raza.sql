CREATE TABLE "alert_history" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "alert_history_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"message" text NOT NULL,
	"isRead" boolean DEFAULT false,
	"timestamp" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bp_records_table" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "bp_records_table_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"systolic" integer NOT NULL,
	"diastolic" integer NOT NULL,
	"bpStatus" text NOT NULL,
	"pulse" integer NOT NULL,
	"pulseStatus" text NOT NULL,
	"clinicalBpLabel" text NOT NULL,
	"timestamp" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "devices" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"device_id" varchar(255) NOT NULL,
	"device_name" varchar(255),
	"registered_at" timestamp DEFAULT now(),
	"status" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_stat" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "login_stat_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"date" text NOT NULL,
	"logins" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "unique_date" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"activity" text NOT NULL,
	"timestamp" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resetToken" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "resetToken_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"token" text NOT NULL,
	"userId" integer,
	"tokenExpires" timestamp NOT NULL,
	CONSTRAINT "resetToken_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users_table" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_table_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"birthday" varchar(255) NOT NULL,
	"sex" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"contact" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" text DEFAULT 'general' NOT NULL,
	"isVerified" boolean DEFAULT false,
	"status" boolean DEFAULT false,
	"created_At" timestamp DEFAULT '2026-03-01 14:32:19.166',
	CONSTRAINT "users_table_email_unique" UNIQUE("email"),
	CONSTRAINT "users_table_contact_unique" UNIQUE("contact")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "verificationToken_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"token" text NOT NULL,
	"userId" integer,
	"tokenExpires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "alert_history" ADD CONSTRAINT "alert_history_user_id_users_table_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bp_records_table" ADD CONSTRAINT "bp_records_table_user_id_users_table_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_user_id_users_table_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "logs" ADD CONSTRAINT "logs_user_id_users_table_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resetToken" ADD CONSTRAINT "resetToken_userId_users_table_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users_table"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verificationToken" ADD CONSTRAINT "verificationToken_userId_users_table_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users_table"("id") ON DELETE cascade ON UPDATE no action;