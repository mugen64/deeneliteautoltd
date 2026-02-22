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

export const cars = pgTable('cars', {
  id: uuid('id').primaryKey().defaultRandom(),
  year: integer('year').notNull(),
  makeId: uuid('make_id').notNull().references(() => carMakes.id),
  modelId: uuid('model_id').notNull().references(() => carModels.id),
  price: decimal('price', { precision: 12, scale: 2 }).notNull(),
  bodyType: varchar('body_type', { length: 50 }).notNull(),
  mileage: integer('mileage').notNull(),
  condition: varchar('condition', { length: 50 }).notNull(),
  isFeatured: boolean('is_featured').notNull().default(false),
  rating: decimal('rating', { precision: 2, scale: 1 }).default('0'),
  photoId: uuid('photo_id').references(() => files.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ([
  index('cars_make_id_idx').on(table.makeId),
  index('cars_model_id_idx').on(table.modelId),
  index('cars_featured_idx').on(table.isFeatured),
]));