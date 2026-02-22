CREATE TABLE "car_body_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"slug" varchar(160) NOT NULL,
	"icon_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "car_body_types_name_unique" UNIQUE("name"),
	CONSTRAINT "car_body_types_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "car_feature_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"slug" varchar(160) NOT NULL,
	"icon" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "car_feature_types_name_unique" UNIQUE("name"),
	CONSTRAINT "car_feature_types_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "car_makes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"slug" varchar(160) NOT NULL,
	"logo_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "car_makes_name_unique" UNIQUE("name"),
	CONSTRAINT "car_makes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "car_models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"slug" varchar(160) NOT NULL,
	"make_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "car_models_make_name_unique_idx" UNIQUE("make_id","name"),
	CONSTRAINT "car_models_make_slug_unique_idx" UNIQUE("make_id","slug")
);
--> statement-breakpoint
CREATE TABLE "car_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"car_id" uuid NOT NULL,
	"photo_id" uuid NOT NULL,
	"description" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"year" integer NOT NULL,
	"make_id" uuid NOT NULL,
	"model_id" uuid NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"body_type_id" uuid NOT NULL,
	"mileage" integer NOT NULL,
	"condition" varchar(50) NOT NULL,
	"color" varchar(50) NOT NULL,
	"sku" varchar(20) NOT NULL,
	"sold" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "cars_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"description" text,
	"public_id" text NOT NULL,
	"media_url" text NOT NULL,
	"resource_type" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "files_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
ALTER TABLE "car_body_types" ADD CONSTRAINT "car_body_types_icon_id_files_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "car_makes" ADD CONSTRAINT "car_makes_logo_id_files_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "car_models" ADD CONSTRAINT "car_models_make_id_car_makes_id_fk" FOREIGN KEY ("make_id") REFERENCES "public"."car_makes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "car_photos" ADD CONSTRAINT "car_photos_car_id_cars_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "car_photos" ADD CONSTRAINT "car_photos_photo_id_files_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cars" ADD CONSTRAINT "cars_make_id_car_makes_id_fk" FOREIGN KEY ("make_id") REFERENCES "public"."car_makes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cars" ADD CONSTRAINT "cars_model_id_car_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."car_models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cars" ADD CONSTRAINT "cars_body_type_id_car_body_types_id_fk" FOREIGN KEY ("body_type_id") REFERENCES "public"."car_body_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "car_body_types_name_idx" ON "car_body_types" USING btree ("name");--> statement-breakpoint
CREATE INDEX "car_body_types_slug_idx" ON "car_body_types" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "car_feature_types_name_idx" ON "car_feature_types" USING btree ("name");--> statement-breakpoint
CREATE INDEX "car_feature_types_slug_idx" ON "car_feature_types" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "car_makes_name_idx" ON "car_makes" USING btree ("name");--> statement-breakpoint
CREATE INDEX "car_makes_slug_idx" ON "car_makes" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "car_models_make_id_idx" ON "car_models" USING btree ("make_id");--> statement-breakpoint
CREATE INDEX "car_models_name_idx" ON "car_models" USING btree ("name");--> statement-breakpoint
CREATE INDEX "car_models_slug_idx" ON "car_models" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "car_models_make_name_idx" ON "car_models" USING btree ("make_id","name");--> statement-breakpoint
CREATE INDEX "car_photos_car_id_idx" ON "car_photos" USING btree ("car_id");--> statement-breakpoint
CREATE INDEX "car_photos_photo_id_idx" ON "car_photos" USING btree ("photo_id");--> statement-breakpoint
CREATE INDEX "car_photos_is_primary_idx" ON "car_photos" USING btree ("car_id","is_primary");--> statement-breakpoint
CREATE INDEX "cars_make_id_idx" ON "cars" USING btree ("make_id");--> statement-breakpoint
CREATE INDEX "cars_model_id_idx" ON "cars" USING btree ("model_id");--> statement-breakpoint
CREATE INDEX "cars_featured_idx" ON "cars" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "cars_sold_idx" ON "cars" USING btree ("sold");--> statement-breakpoint
CREATE INDEX "cars_sku_idx" ON "cars" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "files_user_id_idx" ON "files" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "files_public_id_idx" ON "files" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");