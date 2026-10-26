import React, { useState } from 'react';
import { Star, ThumbsUp, ShieldCheck, MessageSquarePlus, Check, AlertCircle } from 'lucide-react';
import { Review } from '../types.ts';
import { formatDate } from '../utils/formatters.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface ReviewsSectionProps {
  productId: number;
  productName: string;
  initialRating: string;
  initialReviewCount: number;
  reviews: Review[];
  onReviewAdded: (newReview: Review) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  productId,
  productName,
  initialRating,
  initialReviewCount,
  reviews,
  onReviewAdded,
}) => {
  const { user, getAuthHeaders } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [votedReviews, setVotedReviews] = useState<Record<number, boolean>>({});

  // Form states
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [authorName, setAuthorName] = useState(user?.displayName || '');
  const [authorEmail, setAuthorEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Calculate rating breakdown
  const ratingCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    if (ratingCounts[r.rating] !== undefined) {
      ratingCounts[r.rating]++;
    }
  });

  const totalReviews = reviews.length;

  const handleVoteHelpful = async (reviewId: number) => {
    if (votedReviews[reviewId]) return;

    try {
      setVotedReviews((prev) => ({ ...prev, [reviewId]: true }));
      await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
      });
    } catch (e) {
      console.warn('Failed to vote review:', e);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !comment.trim() || !authorName.trim()) {
      setErrorMessage('Veuillez renseigner un nom, un titre et votre commentaire.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          rating,
          title,
          comment,
          authorName,
          authorEmail: authorEmail || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur lors de l’envoi de l’avis.');
      }

      const createdReview = await res.json();
      onReviewAdded(createdReview);
      setSuccessMessage('Merci ! Votre avis a été publié avec succès.');
      setShowAddForm(false);
      setTitle('');
      setComment('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Impossible d’enregistrer votre avis.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-8 border-t border-stone-200 space-y-8">
      {/* Header & Global Stats */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 bg-stone-50/70 p-6 rounded-2xl border border-stone-200/80">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-stone-900 tracking-tight">
            Avis des clients
          </h3>
          <p className="text-xs text-stone-500">
            Retours authentiques d'acheteurs vérifiés pour {productName}.
          </p>

          <div className="flex items-baseline gap-3 pt-2">
            <span className="text-4xl font-extrabold text-stone-900 font-sans">
              {initialRating}
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(Number(initialRating))
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-stone-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-stone-500 font-medium">
                Basé sur {initialReviewCount || reviews.length} évaluation
                {(initialReviewCount || reviews.length) > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="flex-1 max-w-xs space-y-1.5 text-xs">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingCounts[stars] || 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-2">
                <span className="w-6 text-stone-500 font-medium">{stars} ★</span>
                <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="w-8 text-right text-stone-400 font-mono text-[11px]">
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Write a review button */}
        <div className="flex items-center justify-end">
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setSuccessMessage(null);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-full text-xs font-semibold transition shadow-xs cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>{showAddForm ? 'Fermer le formulaire' : 'Rédiger un avis'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Add Review Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmitReview}
          className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4 animate-in fade-in zoom-in-95"
        >
          <h4 className="font-semibold text-stone-900 text-sm">
            Partagez votre expérience avec la communauté NovaShop
          </h4>

          {errorMessage && (
            <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Star selector */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Votre note globale *
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 hover:scale-110 transition cursor-pointer"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-stone-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-semibold text-stone-600 ml-2">
                {rating === 5 && 'Exceptionnel'}
                {rating === 4 && 'Très bien'}
                {rating === 3 && 'Correct'}
                {rating === 2 && 'Moyen'}
                {rating === 1 && 'Décevant'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Votre nom ou prénom *
              </label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Ex. Alexandre B."
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Adresse email (non publiée)
              </label>
              <input
                type="email"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                placeholder="Ex. alexandre@example.com"
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Titre de votre avis *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex. Qualité de finition bluffante, je recommande !"
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Votre commentaire détaillé *
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Décrivez ce que vous avez aimé : son design, ses matériaux, son utilisation au quotidien..."
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 border border-stone-200 rounded-full"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 rounded-full transition shadow-xs cursor-pointer"
            >
              {isSubmitting ? 'Publication en cours...' : 'Publier mon avis'}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="p-8 text-center bg-stone-50/50 rounded-2xl border border-dashed border-stone-200 text-stone-400 text-xs">
            Soyez le premier à donner votre avis sur cet article !
          </div>
        ) : (
          reviews.map((rev) => {
            const hasVoted = votedReviews[rev.id];
            const helpfulCount = rev.helpfulCount + (hasVoted ? 1 : 0);

            return (
              <div
                key={rev.id}
                className="p-5 bg-white rounded-2xl border border-stone-200/80 shadow-2xs space-y-2.5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= rev.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-stone-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-xs text-stone-900">
                      {rev.authorName}
                    </span>
                    {rev.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Achat vérifié
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-stone-400">
                    {formatDate(rev.createdAt)}
                  </span>
                </div>

                <h5 className="font-semibold text-stone-900 text-sm leading-snug">
                  {rev.title}
                </h5>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {rev.comment}
                </p>

                {/* Helpful voting */}
                <div className="pt-2 flex items-center justify-between text-[11px] text-stone-400">
                  <button
                    onClick={() => handleVoteHelpful(rev.id)}
                    disabled={hasVoted}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition cursor-pointer ${
                      hasVoted
                        ? 'bg-stone-100 text-stone-700 border-stone-300 font-medium'
                        : 'text-stone-500 border-stone-200 hover:bg-stone-50 hover:text-stone-800'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>Utile ({helpfulCount})</span>
                  </button>
                  <span>Avis vérifié par NovaShop</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
