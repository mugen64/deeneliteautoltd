CREATE TABLE IF NOT EXISTS "contact_forms" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "first_name" varchar(120) NOT NULL,
  "last_name" varchar(120) NOT NULL,
  "email" varchar(255) NOT NULL,
  "phone" varchar(50),
  "subject" varchar(255) NOT NULL,
  "message" text NOT NULL,
  "interested_in_vehicles" boolean NOT NULL DEFAULT false,
  "selected_cars" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "status" varchar(24) NOT NULL DEFAULT 'incoming',
  "read_at" timestamp,
  "responded_at" timestamp,
  "closed_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "contact_forms_status_idx" ON "contact_forms" USING btree ("status");
CREATE INDEX IF NOT EXISTS "contact_forms_email_idx" ON "contact_forms" USING btree ("email");
CREATE INDEX IF NOT EXISTS "contact_forms_created_at_idx" ON "contact_forms" USING btree ("created_at");
