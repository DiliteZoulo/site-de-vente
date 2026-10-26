import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table (linked to Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Categories table
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  icon: text('icon'),
});

// Products table
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: integer('price').notNull(), // in cents (e.g. 14900 = 149.00 €)
  originalPrice: integer('original_price'), // optional discount comparison
  categoryId: integer('category_id')
    .references(() => categories.id)
    .notNull(),
  imageUrl: text('image_url').notNull(),
  images: text('images').default('[]'), // JSON array of extra photo URLs
  rating: text('rating').default('4.8'),
  reviewCount: integer('review_count').default(0),
  stock: integer('stock').default(50),
  tags: text('tags').default('[]'), // JSON array of string tags
  isFeatured: boolean('is_featured').default(false),
  isNew: boolean('is_new').default(false),
  specs: text('specs').default('{}'), // JSON object of technical attributes
  createdAt: timestamp('created_at').defaultNow(),
});

// Reviews table
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .references(() => products.id)
    .notNull(),
  userId: integer('user_id').references(() => users.id),
  authorName: text('author_name').notNull(),
  authorEmail: text('author_email'),
  rating: integer('rating').notNull(),
  title: text('title').notNull(),
  comment: text('comment').notNull(),
  verified: boolean('verified').default(true),
  helpfulCount: integer('helpful_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Orders table
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  userId: integer('user_id').references(() => users.id),
  customerEmail: text('customer_email').notNull(),
  customerName: text('customer_name').notNull(),
  shippingAddress: text('shipping_address').notNull(), // JSON string
  paymentMethod: text('payment_method').notNull(),
  subtotal: integer('subtotal').notNull(),
  shipping: integer('shipping').notNull(),
  discount: integer('discount').default(0),
  total: integer('total').notNull(),
  status: text('status').default('confirmed'),
  items: text('items').notNull(), // JSON string
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  reviews: many(reviews),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}));
