CREATE TABLE "calendar_integrations" (
	"calendar_id" bigserial NOT NULL,
	"provider" text NOT NULL,
	"external_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_integrations" (
	"event_id" bigserial NOT NULL,
	"provider" text NOT NULL,
	"external_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_integrations" (
	"user_id" bigserial NOT NULL,
	"provider" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"app_password" text,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_settings" DROP CONSTRAINT "user_settings_user_id_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
ALTER TABLE "calendars" ALTER COLUMN "id" SET DATA TYPE bigserial;--> statement-breakpoint
ALTER TABLE "calendars" ALTER COLUMN "color" SET DATA TYPE char(7);--> statement-breakpoint
ALTER TABLE "calendars" ALTER COLUMN "color" SET DEFAULT '#3b82f6';--> statement-breakpoint
ALTER TABLE "calendars" ALTER COLUMN "color" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "calendars" ALTER COLUMN "user_id" SET DATA TYPE bigserial;--> statement-breakpoint
ALTER TABLE "default_calendar_templates" ALTER COLUMN "id" SET DATA TYPE bigserial;--> statement-breakpoint
ALTER TABLE "default_calendar_templates" ALTER COLUMN "color" SET DATA TYPE char(7);--> statement-breakpoint
ALTER TABLE "default_calendar_templates" ALTER COLUMN "color" SET DEFAULT '#3b82f6';--> statement-breakpoint
ALTER TABLE "event_reminders" ALTER COLUMN "id" SET DATA TYPE bigserial;--> statement-breakpoint
ALTER TABLE "event_reminders" ALTER COLUMN "event_id" SET DATA TYPE bigserial;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "id" SET DATA TYPE bigserial;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "calendar_id" SET DATA TYPE bigserial;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "user_id" SET DATA TYPE bigserial;--> statement-breakpoint
ALTER TABLE "user_settings" ADD PRIMARY KEY ("user_id");--> statement-breakpoint
ALTER TABLE "user_settings" ALTER COLUMN "user_id" SET DATA TYPE bigserial;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE bigserial;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "recurrence_rule" text;--> statement-breakpoint
ALTER TABLE "calendar_integrations" ADD CONSTRAINT "calendar_integrations_calendar_id_calendars_id_fk" FOREIGN KEY ("calendar_id") REFERENCES "public"."calendars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_integrations" ADD CONSTRAINT "event_integrations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_integrations" ADD CONSTRAINT "user_integrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "calendar_integrations_calendar_provider_idx" ON "calendar_integrations" USING btree ("calendar_id","provider");--> statement-breakpoint
CREATE INDEX "calendar_integrations_provider_external_idx" ON "calendar_integrations" USING btree ("provider","external_id");--> statement-breakpoint
CREATE INDEX "event_integrations_event_provider_idx" ON "event_integrations" USING btree ("event_id","provider");--> statement-breakpoint
CREATE INDEX "event_integrations_provider_external_idx" ON "event_integrations" USING btree ("provider","external_id");--> statement-breakpoint
CREATE INDEX "user_integrations_user_provider_idx" ON "user_integrations" USING btree ("user_id","provider");--> statement-breakpoint
CREATE INDEX "calendars_user_idx" ON "calendars" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "default_calendar_templates_sort_idx" ON "default_calendar_templates" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "event_reminders_event_idx" ON "event_reminders" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "events_calendar_idx" ON "events" USING btree ("calendar_id");--> statement-breakpoint
CREATE INDEX "events_user_idx" ON "events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "events_time_idx" ON "events" USING btree ("start_time","end_time");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
ALTER TABLE "user_settings" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "end_time_after_start_time" CHECK ("events"."end_time" > "events"."start_time");