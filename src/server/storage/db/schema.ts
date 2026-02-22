import { pgTable, text, uuid, timestamp, varchar, index, unique, integer, decimal, boolean } from 'drizzle-orm/pg-core';


export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }).notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  role: varchar('role', { length: 50 }).notNull().default('admin'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
},
  (table) => ([
    index('users_email_idx').on(table.email),
  ])
);

export const files = pgTable('files', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  description: text('description'),
  public_id: text('public_id').notNull().unique(),
  media_url: text('media_url').notNull(),
  resource_type: varchar('resource_type', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ([
  index('files_user_id_idx').on(table.userId),
  index('files_public_id_idx').on(table.public_id),
]));


export const carMakes = pgTable('car_makes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 120 }).notNull().unique(),
  slug: varchar('slug', { length: 160 }).notNull().unique(),
  logoId: uuid('logo_id').notNull().references(() => files.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ([
  index('car_makes_name_idx').on(table.name),
  index('car_makes_slug_idx').on(table.slug),
]));

export const carModels = pgTable('car_models', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 120 }).notNull(),
  slug: varchar('slug', { length: 160 }).notNull(),
  makeId: uuid('make_id').notNull().references(() => carMakes.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ([
  index('car_models_make_id_idx').on(table.makeId),
  index('car_models_name_idx').on(table.name),
  index('car_models_slug_idx').on(table.slug),
  index('car_models_make_name_idx').on(table.makeId, table.name),
  unique('car_models_make_name_unique_idx').on(table.makeId, table.name),
  unique('car_models_make_slug_unique_idx').on(table.makeId, table.slug),
]));

export const carBodyTypes = pgTable('car_body_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 120 }).notNull().unique(),
  slug: varchar('slug', { length: 160 }).notNull().unique(),
  iconId: uuid('icon_id').notNull().references(() => files.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ([
  index('car_body_types_name_idx').on(table.name),
  index('car_body_types_slug_idx').on(table.slug),
]));

export const carFeatureTypes = pgTable('car_feature_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 120 }).notNull().unique(),
  slug: varchar('slug', { length: 160 }).notNull().unique(),
  icon: varchar('icon', { length: 64 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ([
  index('car_feature_types_name_idx').on(table.name),
  index('car_feature_types_slug_idx').on(table.slug),
]));

export const cars = pgTable('cars', {
  id: uuid('id').primaryKey().defaultRandom(),
  year: integer('year').notNull(),
  modelId: uuid('model_id').notNull().references(() => carModels.id),
  price: decimal('price', { precision: 12, scale: 2 }).notNull(),
  bodyTypeId: uuid('body_type_id').notNull().references(() => carBodyTypes.id),
  mileage: integer('mileage').notNull(),
  condition: varchar('condition', { length: 50 }).notNull(),
  color: varchar('color', { length: 50 }).notNull(),
  transmission: varchar('transmission', { length: 50 }).notNull().default('Automatic'),
  fuelType: varchar('fuel_type', { length: 50 }).notNull().default('Diesel'),
  sku: varchar('sku', { length: 20 }).notNull().unique(),
  listed: boolean('listed').notNull().default(false),
  sold: boolean('sold').notNull().default(false),
  isFeatured: boolean('is_featured').notNull().default(false),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ([
  index('cars_model_id_idx').on(table.modelId),
  index('cars_listed_idx').on(table.listed),
  index('cars_featured_idx').on(table.isFeatured),
  index('cars_sold_idx').on(table.sold),
  index('cars_sku_idx').on(table.sku),
]));

export const carPhotos = pgTable('car_photos', {
  id: uuid('id').primaryKey().defaultRandom(),
  carId: uuid('car_id').notNull().references(() => cars.id, { onDelete: 'cascade' }),
  photoId: uuid('photo_id').notNull().references(() => files.id),
  description: text('description'),
  isPrimary: boolean('is_primary').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ([
  index('car_photos_car_id_idx').on(table.carId),
  index('car_photos_photo_id_idx').on(table.photoId),
  index('car_photos_is_primary_idx').on(table.carId, table.isPrimary),
]));

export const carHistoryChecklist = pgTable('car_history_checklist', {
  id: uuid('id').primaryKey().defaultRandom(),
  description: text('description').notNull(),
  iconSvg: varchar('icon_svg', { length: 64 }).notNull(),
  displayIndex: integer('display_index').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ([
  index('car_history_checklist_display_idx').on(table.displayIndex),
]));

export const carFeatures = pgTable('car_features', {
  carId: uuid('car_id').notNull().references(() => cars.id, { onDelete: 'cascade' }),
  featureTypeId: uuid('feature_type_id').notNull().references(() => carFeatureTypes.id, { onDelete: 'cascade' }),
}, (table) => ([
  index('car_features_car_id_idx').on(table.carId),
  index('car_features_feature_type_id_idx').on(table.featureTypeId),
  unique('car_features_unique_idx').on(table.carId, table.featureTypeId),
]));

export const carHistory = pgTable('car_history', {
  carId: uuid('car_id').notNull().references(() => cars.id, { onDelete: 'cascade' }),
  checklistId: uuid('checklist_id').notNull().references(() => carHistoryChecklist.id, { onDelete: 'cascade' }),
}, (table) => ([
  index('car_history_car_id_idx').on(table.carId),
  index('car_history_checklist_id_idx').on(table.checklistId),
  unique('car_history_unique_idx').on(table.carId, table.checklistId),
]));