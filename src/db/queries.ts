import { and, asc, desc, eq, gt, gte, ilike, lte, or, sql } from 'drizzle-orm';
import { db } from './index.ts';
import { categories, orders, products, reviews, users } from './schema.ts';

export async function getCategories() {
  try {
    const cats = await db.select().from(categories).orderBy(categories.id);
    return cats;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    throw new Error('Impossible de charger les catégories.', { cause: error });
  }
}

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number; // cents
  maxPrice?: number; // cents
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
  inStock?: boolean;
}

export async function getProducts(filters: ProductFilters = {}) {
  try {
    const conditions = [];

    // Category filter by slug
    if (filters.category && filters.category !== 'all') {
      const cat = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, filters.category))
        .limit(1);

      if (cat.length > 0) {
        conditions.push(eq(products.categoryId, cat[0].id));
      }
    }

    // Search query filter
    if (filters.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      conditions.push(
        or(
          ilike(products.name, term),
          ilike(products.description, term),
          ilike(products.tags, term)
        )
      );
    }

    // Price range filters
    if (typeof filters.minPrice === 'number' && !isNaN(filters.minPrice)) {
      conditions.push(gte(products.price, filters.minPrice));
    }
    if (typeof filters.maxPrice === 'number' && !isNaN(filters.maxPrice)) {
      conditions.push(lte(products.price, filters.maxPrice));
    }

    // In stock filter
    if (filters.inStock) {
      conditions.push(gt(products.stock, 0));
    }

    let query = db
      .select({
        id: products.id,
        slug: products.slug,
        name: products.name,
        description: products.description,
        price: products.price,
        originalPrice: products.originalPrice,
        categoryId: products.categoryId,
        categoryName: categories.name,
        categorySlug: categories.slug,
        imageUrl: products.imageUrl,
        images: products.images,
        rating: products.rating,
        reviewCount: products.reviewCount,
        stock: products.stock,
        tags: products.tags,
        isFeatured: products.isFeatured,
        isNew: products.isNew,
        specs: products.specs,
        createdAt: products.createdAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let orderedQuery;
    switch (filters.sortBy) {
      case 'price-asc':
        orderedQuery = query.where(whereClause).orderBy(asc(products.price));
        break;
      case 'price-desc':
        orderedQuery = query.where(whereClause).orderBy(desc(products.price));
        break;
      case 'rating':
        orderedQuery = query.where(whereClause).orderBy(desc(products.rating), desc(products.reviewCount));
        break;
      case 'newest':
        orderedQuery = query.where(whereClause).orderBy(desc(products.createdAt));
        break;
      case 'featured':
      default:
        orderedQuery = query.where(whereClause).orderBy(desc(products.isFeatured), desc(products.createdAt));
        break;
    }

    return await orderedQuery;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw new Error('Impossible de charger les produits.', { cause: error });
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const res = await db
      .select({
        id: products.id,
        slug: products.slug,
        name: products.name,
        description: products.description,
        price: products.price,
        originalPrice: products.originalPrice,
        categoryId: products.categoryId,
        categoryName: categories.name,
        categorySlug: categories.slug,
        imageUrl: products.imageUrl,
        images: products.images,
        rating: products.rating,
        reviewCount: products.reviewCount,
        stock: products.stock,
        tags: products.tags,
        isFeatured: products.isFeatured,
        isNew: products.isNew,
        specs: products.specs,
        createdAt: products.createdAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.slug, slug))
      .limit(1);

    if (res.length === 0) return null;

    const prod = res[0];
    const prodReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, prod.id))
      .orderBy(desc(reviews.createdAt));

    return {
      ...prod,
      reviewsList: prodReviews,
    };
  } catch (error) {
    console.error('Failed to get product by slug:', error);
    throw new Error('Erreur lors de la récupération du produit.', { cause: error });
  }
}

export async function addReview(
  productId: number,
  authorName: string,
  authorEmail: string | undefined,
  rating: number,
  title: string,
  comment: string,
  userId?: number
) {
  try {
    const newReview = await db
      .insert(reviews)
      .values({
        productId,
        authorName,
        authorEmail,
        rating,
        title,
        comment,
        userId: userId || null,
        verified: true,
      })
      .returning();

    // Recalculate average rating & review count for product
    const allReviews = await db
      .select({ rating: reviews.rating })
      .from(reviews)
      .where(eq(reviews.productId, productId));

    const totalCount = allReviews.length;
    const avg =
      totalCount > 0
        ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1)
        : '5.0';

    await db
      .update(products)
      .set({
        rating: avg,
        reviewCount: totalCount,
      })
      .where(eq(products.id, productId));

    return newReview[0];
  } catch (error) {
    console.error('Failed to add review:', error);
    throw new Error('Impossible d’enregistrer votre avis.', { cause: error });
  }
}

export async function voteHelpfulReview(reviewId: number) {
  try {
    const updated = await db
      .update(reviews)
      .set({
        helpfulCount: sql`${reviews.helpfulCount} + 1`,
      })
      .where(eq(reviews.id, reviewId))
      .returning();

    return updated[0];
  } catch (error) {
    console.error('Failed to vote review:', error);
    throw new Error('Erreur lors du vote d’utilité.', { cause: error });
  }
}

export async function createOrder(data: {
  orderNumber: string;
  userId?: number;
  customerEmail: string;
  customerName: string;
  shippingAddress: string;
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  items: string;
}) {
  try {
    const newOrder = await db.insert(orders).values(data).returning();
    return newOrder[0];
  } catch (error) {
    console.error('Failed to create order:', error);
    throw new Error('Impossible d’enregistrer la commande.', { cause: error });
  }
}

export async function getUserOrders(uid: string) {
  try {
    const userRes = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.uid, uid))
      .limit(1);

    if (userRes.length === 0) return [];

    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userRes[0].id))
      .orderBy(desc(orders.createdAt));
  } catch (error) {
    console.error('Failed to fetch user orders:', error);
    throw new Error('Erreur lors du chargement des commandes.', { cause: error });
  }
}
