import { useState, FormEvent } from 'react';
import { Mail, Send, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { SEOHead } from '../components/SEOHead.tsx';
import { AdContainer } from '../components/AdContainer.tsx';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'general',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill out all required fields before submitting.');
      return;
    }

    setError(null);
    setSubmitting(true);

    // Simulate sending message
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <SEOHead
        title="Contact Us – Facebook Video Downloader Support"
        description="Have a question, feedback, or DMCA inquiry? Contact the Facebook Video Downloader team for prompt assistance."
      />

      {/* Header */}
      <section className="bg-slate-50 border-b border-slate-200/80 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-3 py-1 rounded-full">
            Get In Touch
          </span>
          <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Contact Support
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-xl mx-auto">
            Have questions regarding our service, copyright inquiries, or technical feedback? Send us a message below.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
        <AdContainer slot="TOP" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        {submitted ? (
          <div className="p-8 sm:p-12 text-center bg-slate-50 border border-slate-200 rounded-2xl shadow-sm animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Message Received
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
              Thank you for contacting us, <strong>{formData.name}</strong>. Our team reviews all inquiries and will respond to <strong>{formData.email}</strong> within 1–2 business days.
            </p>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setFormData({ name: '', email: '', category: 'general', subject: '', message: '' });
              }}
              className="mt-6 px-5 py-2.5 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-lg shadow-slate-200/50 p-6 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-3 text-sm">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-semibold text-slate-800 mb-2">
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-sm font-semibold text-slate-800 mb-2">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jane@example.com"
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contact-category" className="block text-sm font-semibold text-slate-800 mb-2">
                    Topic / Category
                  </label>
                  <select
                    id="contact-category"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-sm"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="bug">Technical Issue / Bug</option>
                    <option value="dmca">Copyright / DMCA Notice</option>
                    <option value="feedback">Product Feedback</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block text-sm font-semibold text-slate-800 mb-2">
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Short summary of inquiry..."
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-sm font-semibold text-slate-800 mb-2">
                  Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Please provide details regarding your inquiry..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-sm leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 h-12 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Sending...' : 'Send Message'}</span>
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8">
        <AdContainer slot="FOOTER" />
      </div>
    </div>
  );
}
