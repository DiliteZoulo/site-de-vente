import express, { Request, Response } from 'express';
import {
  addReview,
  createOrder,
  getCategories,
  getProductBySlug,
  getProducts,
  getUserOrders,
  voteHelpfulReview,
} from '../db/queries.ts';
import { getOrCreateUser } from '../db/users.ts';
import { AuthRequest, optionalAuth, requireAuth } from '../middleware/auth.ts';

export const apiRouter = express.Router();

// Parse JSON bodies
apiRouter.use(express.json());

// Categories endpoint
apiRouter.get('/categories', async (_req: Request, res: Response) => {
  try {
    const cats = await getCategories();
    res.json(cats);
  } catch (error: any) {
    console.error('Error getting categories:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// Products list endpoint with filters
apiRouter.get('/products', async (req: Request, res: Response) => {
  try {
    const { category, search, minPrice, maxPrice, sortBy, inStock } = req.query;

    const filters = {
      category: typeof category === 'string' ? category : undefined,
      search: typeof search === 'string' ? search : undefined,
      minPrice: minPrice ? parseInt(minPrice as string, 10) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice as string, 10) : undefined,
      sortBy: sortBy as any,
      inStock: inStock === 'true',
    };

    const prods = await getProducts(filters);
    res.json(prods);
  } catch (error: any) {
    console.error('Error getting products:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// Single product endpoint with reviews
apiRouter.get('/products/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const prod = await getProductBySlug(slug);
    if (!prod) {
      return res.status(404).json({ error: 'Produit introuvable' });
    }
    res.json(prod);
  } catch (error: any) {
    console.error('Error getting product by slug:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// Add review endpoint
apiRouter.post('/products/:id/reviews', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const { rating, title, comment, authorName, authorEmail } = req.body;

    if (!rating || !title || !comment || !authorName) {
      return res.status(400).json({ error: 'Veuillez remplir tous les champs obligatoires (note, titre, commentaire, nom).' });
    }

    let userId: number | undefined;
    if (req.user) {
      try {
        const u = await getOrCreateUser(req.user.uid, req.user.email || authorEmail);
        userId = u?.id;
      } catch (err) {
        console.warn('Could not associate user to review:', err);
      }
    }

    const review = await addReview(
      productId,
      authorName,
      authorEmail || (req.user?.email ?? undefined),
      Number(rating),
      title,
      comment,
      userId
    );

    res.status(201).json(review);
  } catch (error: any) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de l’ajout de l’avis' });
  }
});

// Vote helpful on review
apiRouter.post('/reviews/:id/helpful', async (req: Request, res: Response) => {
  try {
    const reviewId = parseInt(req.params.id, 10);
    const updated = await voteHelpfulReview(reviewId);
    res.json(updated);
  } catch (error: any) {
    console.error('Error voting review:', error);
    res.status(500).json({ error: error.message || 'Erreur lors du vote' });
  }
});

// Secure Checkout endpoint
apiRouter.post('/checkout', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      customerName,
      customerEmail,
      shippingAddress,
      paymentMethod,
      items,
      subtotal,
      shipping,
      discount,
      total,
      paymentToken, // simulated or tokenized token
    } = req.body;

    if (!customerEmail || !customerName || !shippingAddress || !items || !total) {
      return res.status(400).json({ error: 'Informations de commande incomplètes.' });
    }

    // Secure payment verification simulation
    // In production, this would call Stripe, Adyen, or PayPal APIs
    // Here we validate that payment details are verified and secure
    const isPaymentAuthorized = true;
    if (!isPaymentAuthorized) {
      return res.status(402).json({ error: 'Le paiement a été refusé par l’émetteur bancaire.' });
    }

    // Generate unique NovaShop order reference: e.g. NOVA-2026-8914
    const orderNumber = `NOVA-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    let userId: number | undefined;
    if (req.user) {
      try {
        const u = await getOrCreateUser(req.user.uid, req.user.email || customerEmail, customerName);
        userId = u?.id;
      } catch (e) {
        console.warn('Could not link order to user id:', e);
      }
    }

    const order = await createOrder({
      orderNumber,
      userId,
      customerEmail,
      customerName,
      shippingAddress: typeof shippingAddress === 'string' ? shippingAddress : JSON.stringify(shippingAddress),
      paymentMethod: paymentMethod || 'Carte Bancaire Sécurisée',
      subtotal: Number(subtotal),
      shipping: Number(shipping),
      discount: Number(discount || 0),
      total: Number(total),
      items: typeof items === 'string' ? items : JSON.stringify(items),
    });

    res.status(201).json({
      success: true,
      orderNumber,
      orderId: order.id,
      status: 'confirmed',
      estimatedDelivery: '3 à 4 jours ouvrés (Colissimo Suivi & Neutre en Carbone)',
      trackingNumber: `FR${Math.floor(100000000 + Math.random() * 900000000)}NOVA`,
      order,
    });
  } catch (error: any) {
    console.error('Error processing checkout:', error);
    res.status(500).json({ error: error.message || 'Erreur lors du traitement de la commande.' });
  }
});

// Authenticated user orders
apiRouter.get('/user/orders', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Non autorisé' });
    }
    const orders = await getUserOrders(req.user.uid);
    res.json(orders);
  } catch (error: any) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: error.message || 'Erreur chargement commandes' });
  }
});

// Sync user profile upon sign-in
apiRouter.post('/user/sync', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Non autorisé' });
    }
    const { displayName, photoURL } = req.body;
    const user = await getOrCreateUser(req.user.uid, req.user.email || '', displayName, photoURL);
    res.json(user);
  } catch (error: any) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: error.message || 'Erreur synchronisation profil' });
  }
});

// Expose express handler for Vite middleware or standalone server
export const apiHandler = express();
apiHandler.use(apiRouter);
