import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, HelpCircle, ArrowRight, Download, Filter } from 'lucide-react';
import { SEOHead } from '../components/SEOHead.tsx';
import { FaqAccordion } from '../components/FaqAccordion.tsx';
import { AdContainer } from '../components/AdContainer.tsx';
import { FAQ_DATA, getFaqSchema } from '../data/faqData.ts';

type CategoryFilter = 'all' | 'general' | 'usage' | 'technical' | 'legal';

export function FaqPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter(item => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <SEOHead
        title="Frequently Asked Questions – Facebook Video Downloader"
        description="Comprehensive answers to all your questions about downloading public Facebook videos, video resolutions, mobile compatibility, and copyright policies."
        schema={getFaqSchema(FAQ_DATA)}
      />

      {/* Hero Header */}
      <section className="bg-slate-50 border-b border-slate-200/80 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-3 py-1 rounded-full">
            Knowledge Base
          </span>
          <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Everything you need to know about our Facebook Video Downloader, formats, device compatibility, and responsible usage.
          </p>

          {/* Search Bar */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search questions or keywords..."
              className="w-full h-12 pl-12 pr-4 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm sm:text-base"
            />
          </div>

          {/* Category Tabs */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {[
              { id: 'all', label: 'All Questions' },
              { id: 'general', label: 'General' },
              { id: 'usage', label: 'How to Use' },
              { id: 'technical', label: 'Technical & Quality' },
              { id: 'legal', label: 'Legal & Privacy' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id as CategoryFilter)}
                className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                  selectedCategory === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
        <AdContainer slot="TOP" />
      </div>

      {/* Questions List */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        {filteredFaqs.length > 0 ? (
          <FaqAccordion items={filteredFaqs} />
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 p-8">
            <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">
              No matching questions found
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              We couldn't find an answer matching "{searchQuery}". Try a different keyword or contact our support.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              Reset Search Filter
            </button>
          </div>
        )}

        {/* In-Article Ad */}
        <div className="my-10">
          <AdContainer slot="IN_ARTICLE" />
        </div>

        {/* Contact referral */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Still have questions?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Our team is happy to assist with technical or DMCA inquiry questions.
            </p>
          </div>
          <Link
            to="/contact"
            className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-black rounded-lg transition-colors whitespace-nowrap"
          >
            Contact Support
          </Link>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8">
        <AdContainer slot="FOOTER" />
      </div>
    </div>
  );
}
