export interface Category {
  id: number;
  slug: string;
  name: string;
  description?: string | null;
  icon?: string | null;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: number; // in cents (e.g. 14900 = 149,00 €)
  originalPrice?: number | null;
  categoryId: number;
  categoryName?: string | null;
  categorySlug?: string | null;
  imageUrl: string;
  images?: string | null; // JSON string array
  rating: string;
  reviewCount: number;
  stock: number;
  tags?: string | null; // JSON string array
  isFeatured?: boolean | null;
  isNew?: boolean | null;
  specs?: string | null; // JSON string object
  createdAt?: string | null;
  reviewsList?: Review[];
}

export interface Review {
  id: number;
  productId: number;
  userId?: number | null;
  authorName: string;
  authorEmail?: string | null;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  helpfulCount: number;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId?: number | null;
  customerEmail: string;
  customerName: string;
  shippingAddress: string;
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  status: string;
  items: string;
  createdAt: string;
}

export interface FilterState {
  category: string;
  search: string;
  minPrice: number;
  maxPrice: number;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
  inStock: boolean;
}
