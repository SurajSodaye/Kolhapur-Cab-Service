import React, { useState } from 'react';
import SEO from '../components/common/SEO';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Sparkles 
} from 'lucide-react';
import { mockSettings } from '../data/mockContent';
import { createEnquiry, createCallbackRequest } from '../services/contentService';

export default function Contact() {
  const [activeTab, setActiveTab] = useState('enquiry'); // 'enquiry' | 'callback'
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [callbackData, setCallbackData] = useState({
    name: '',
    phone: '',
    service: 'Outstation One Way',
    callbackDate: new Date().toISOString().split('T')[0],
    callbackTime: '10:00',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (activeTab === 'enquiry') {
      if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
        setError('Please fill in your name, contact phone, and message.');
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await createEnquiry(formData);
        if (res.success) {
          setSubmitted(true);
          setSuccessMessage(res.message);
          setFormData({ name: '', phone: '', email: '', subject: 'General Inquiry', message: '' });
        }
      } catch (err) {
        setError('Failed to send enquiry. Please contact us directly via phone or WhatsApp.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!callbackData.name.trim() || !callbackData.phone.trim()) {
        setError('Please provide your name and phone number for the callback.');
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await createCallbackRequest(callbackData);
        if (res.success) {
          setSubmitted(true);
          setSuccessMessage(res.message);
          setCallbackData({
            name: '',
            phone: '',
            service: 'Outstation One Way',
            callbackDate: new Date().toISOString().split('T')[0],
            callbackTime: '10:00',
            message: ''
          });
        }
      } catch (err) {
        setError('Failed to register callback request. Please call our 24/7 desk directly.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <>
      <SEO
        title="Contact Us — Kolhapur Cab Service"
        description="Visit our 24/7 travel desk opposite Kolhapur Central Bus Stand or call our helpline +91 9529998320 for rapid cab bookings."
      />

      <main className="bg-slate-50 min-h-screen pb-20">
        {/* Header */}
        <div className="bg-navy-950 text-white py-14 sm:py-20 relative overflow-hidden border-b border-slate-800">
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 text-amber-300 border border-slate-700 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Station Road Central Office</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-heading">
              Contact Kolhapur Cab Service
            </h1>
            <p className="mt-3 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              We are available round the clock at our Station Road desk or via phone and WhatsApp.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Contact Details & Cards (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card space-y-6">
                <h2 className="text-xl font-extrabold text-slate-900 font-heading">
                  Head Office & Dispatch Desk
                </h2>

                <div className="space-y-4 text-sm text-slate-600">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="block text-slate-900">Physical Address:</strong>
                      <span className="leading-snug">{mockSettings.contact.officeAddress}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="block text-slate-900">24/7 Official Helpline:</strong>
                      <p>
                        <a href={`tel:${mockSettings.contact.primaryPhone.replace(/\s+/g, '')}`} className="text-amber-800 hover:underline font-bold text-base">
                          {mockSettings.contact.primaryPhone}
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="block text-slate-900">Email Inquiries:</strong>
                      <a href={`mailto:${mockSettings.contact.email}`} className="text-blue-700 hover:underline">
                        {mockSettings.contact.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="block text-slate-900">Operational Hours:</strong>
                      <span>24 Hours / 7 Days a Week (Dispatch & Support)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
                  <a
                    href={`https://wa.me/${mockSettings.contact.whatsappNumber}?text=Hello%20Kolhapur%20Cab%20Desk`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Instant WhatsApp Chat</span>
                  </a>

                  <a
                    href={mockSettings.contact.googleMapsEmbed}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-500" />
                    <span>Open in Google Maps</span>
                  </a>
                </div>
              </div>
            </div>

            {/* General Enquiry & Callback Forms (7 Cols) */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-card">
                {/* Form Selection Tabs */}
                <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('enquiry'); setError(''); setSubmitted(false); }}
                    className={`flex-1 py-2.5 px-4 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                      activeTab === 'enquiry'
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Send Enquiry Message
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('callback'); setError(''); setSubmitted(false); }}
                    className={`flex-1 py-2.5 px-4 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                      activeTab === 'callback'
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Request Phone Callback
                  </button>
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading mb-2">
                  {activeTab === 'enquiry' ? 'Send an Enquiry or Special Requirement' : 'Request an Instant Phone Callback'}
                </h2>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                  {activeTab === 'enquiry'
                    ? 'Have a question about a customized temple circuit, corporate partnership, or group travel? Send us a message and our coordinator will respond promptly.'
                    : 'Share your phone number and preferred time. Our Kolhapur dispatch coordinator will call you back to answer questions and plan your route.'}
                </p>

                {submitted ? (
                  <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                    <h3 className="text-lg font-bold text-emerald-950 font-heading">
                      {activeTab === 'enquiry' ? 'Enquiry Received!' : 'Callback Request Registered!'}
                    </h3>
                    <p className="text-xs text-emerald-800 max-w-sm mx-auto leading-relaxed">
                      {successMessage || 'Thank you for reaching out to Kolhapur Cab Service. Our travel desk team will reach out to you shortly.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      Submit Another Request
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    {activeTab === 'enquiry' ? (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="Your Name"
                              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-medium"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Phone Number *
                            </label>
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              placeholder="e.g. 98220 12345"
                              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-medium"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Email Address
                            </label>
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              placeholder="name@example.com"
                              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-medium"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Subject / Inquiry Type
                            </label>
                            <select
                              value={formData.subject}
                              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-medium"
                            >
                              <option value="General Inquiry">General Inquiry</option>
                              <option value="Temple Darshan Tour">Mahalaxmi / Jyotiba Temple Tour</option>
                              <option value="Outstation Quote">Outstation Highway Travel</option>
                              <option value="Airport Transfer">Airport Drop / Pickup</option>
                              <option value="Corporate Fleet">Corporate / MIDC Account</option>
                              <option value="Wedding / Tempo Traveller">Wedding & Event Fleet</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Your Message / Travel Requirements *
                          </label>
                          <textarea
                            rows={4}
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            placeholder="Please describe your destination, number of travelers, tentative travel dates or any questions..."
                            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-medium"
                            required
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Your Name *
                            </label>
                            <input
                              type="text"
                              value={callbackData.name}
                              onChange={(e) => setCallbackData({ ...callbackData, name: e.target.value })}
                              placeholder="e.g. Ramesh Patil"
                              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-medium"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Phone Number for Callback *
                            </label>
                            <input
                              type="tel"
                              value={callbackData.phone}
                              onChange={(e) => setCallbackData({ ...callbackData, phone: e.target.value })}
                              placeholder="e.g. 98220 12345"
                              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-medium"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Service / Trip of Interest
                            </label>
                            <select
                              value={callbackData.service}
                              onChange={(e) => setCallbackData({ ...callbackData, service: e.target.value })}
                              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-medium"
                            >
                              <option value="Outstation One Way">Outstation One Way</option>
                              <option value="Outstation Round Trip">Outstation Round Trip</option>
                              <option value="Airport Transfer">Airport Transfer (Pune / Goa / Mumbai)</option>
                              <option value="Local City Taxi">Local Kolhapur City Taxi</option>
                              <option value="Corporate Travel">Corporate Travel</option>
                              <option value="Wedding Car Rental">Wedding Car Rental</option>
                              <option value="Tempo Traveller Rental">Tempo Traveller Group Rental</option>
                              <option value="Fare Enquiry">Fare Enquiry</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Preferred Callback Time
                            </label>
                            <input
                              type="time"
                              value={callbackData.callbackTime}
                              onChange={(e) => setCallbackData({ ...callbackData, callbackTime: e.target.value })}
                              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-medium"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Brief Note or Question (Optional)
                          </label>
                          <textarea
                            rows={3}
                            value={callbackData.message}
                            onChange={(e) => setCallbackData({ ...callbackData, message: e.target.value })}
                            placeholder="e.g. Need cab for 4 people from Station to Ganpatipule tomorrow morning..."
                            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-amber-500 font-medium"
                          />
                        </div>
                      </>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 transition-colors shadow-subtle flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>
                        {isSubmitting
                          ? 'Submitting...'
                          : activeTab === 'enquiry'
                          ? 'Submit Enquiry'
                          : 'Request Phone Callback'}
                      </span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
