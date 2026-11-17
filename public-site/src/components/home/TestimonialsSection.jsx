import React, { useEffect, useState } from 'react';
import { Star, Quote, CheckCircle2, ShieldCheck, PenLine, X, Send } from 'lucide-react';
import { getReviews, createReview } from '../../services/contentService';

export default function TestimonialsSection() {
  const [reviews, setReviews] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [tripRoute, setTripRoute] = useState('Kolhapur Outstation');
  const [vehicleType, setVehicleType] = useState('Sedan (Dzire)');
  const [submitting, setSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState('');

  useEffect(() => {
    async function loadData() {
      const data = await getReviews();
      setReviews(data);
    }
    loadData();
  }, []);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!author.trim() || !comment.trim()) return;

    setSubmitting(true);
    try {
      const res = await createReview({
        author,
        rating,
        title: title.trim() || 'Cab Experience',
        comment: comment.trim(),
        tripRoute,
        vehicleType,
      });
      setSubmittedMessage(res.message);
      setAuthor('');
      setComment('');
      setTitle('');
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-slate-50/70 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
            <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
            <span>Passenger Stories</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading tracking-tight">
            Trusted by Kolhapur Citizens & Visiting Tourists
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Read what pilgrims, corporate teams, and families say about our cab reliability and chauffeurs.
          </p>
          <p className="mt-2 text-xs text-slate-500 italic">
            * Note: Testimonials showcase realistic sample passenger experiences for demonstration purposes.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {reviews.slice(0, 3).map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-card card-hover-effect flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-slate-200" />
                </div>

                <h3 className="text-base font-bold text-slate-900 font-heading mb-2">
                  "{review.title}"
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {review.comment}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <img
                    src={review.avatar}
                    alt={review.author}
                    className="w-11 h-11 rounded-full object-cover border-2 border-amber-400/80 shadow-sm"
                    loading="lazy"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                      {review.author}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {review.role} • {review.location}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-0.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>{review.tripRoute} ({review.vehicleType})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Write a Review Button */}
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={() => { setModalOpen(true); setSubmittedMessage(''); }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-300 text-slate-800 text-sm font-bold shadow-subtle hover:bg-slate-50 transition"
          >
            <PenLine className="w-4 h-4 text-amber-600" />
            <span>Travelled with us? Write a Review</span>
          </button>
        </div>

        {/* Review Submission Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-floating relative max-h-[90vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="absolute right-5 top-5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold font-heading text-slate-900 mb-1">Share Your Cab Experience</h3>
              <p className="text-xs text-slate-500 mb-6">Your feedback helps fellow travelers and our chauffeurs.</p>

              {submittedMessage ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <p className="text-sm font-bold text-emerald-950">{submittedMessage}</p>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="e.g. Anand Deshmukh"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Rating</label>
                      <select
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none"
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                        <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                        <option value={3}>⭐⭐⭐ (3/5)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Vehicle Used</label>
                      <select
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none"
                      >
                        <option value="Sedan (Dzire / Etios)">Sedan (Dzire / Etios)</option>
                        <option value="SUV (Ertiga / Carens)">SUV (Ertiga / Carens)</option>
                        <option value="Innova Crysta">Innova Crysta</option>
                        <option value="Tempo Traveller">Tempo Traveller</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Route / Trip</label>
                    <input
                      type="text"
                      value={tripRoute}
                      onChange={(e) => setTripRoute(e.target.value)}
                      placeholder="e.g. Kolhapur to Pune"
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Review Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Very smooth Pune trip with family"
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Your Review *</label>
                    <textarea
                      required
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Tell us about the chauffeur, punctuality, and car cleanliness..."
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none font-medium"
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 italic">
                    * Submissions are reviewed for authenticity before being published on the public site.
                  </p>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 transition-colors shadow-subtle flex items-center justify-center gap-2 text-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'Submitting Review...' : 'Submit Review'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
