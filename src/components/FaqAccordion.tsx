import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FAQ_DATA, FaqItem } from '../data/faqData.ts';

interface FaqAccordionProps {
  items?: FaqItem[];
  limit?: number;
}

export function FaqAccordion({ items = FAQ_DATA, limit }: FaqAccordionProps) {
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]); // Open first item by default

  const displayItems = limit ? items.slice(0, limit) : items;

  const toggleIndex = (index: number) => {
    setOpenIndexes(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="w-full space-y-3">
      {displayItems.map((item, index) => {
        const isOpen = openIndexes.includes(index);

        return (
          <div
            key={index}
            className={`border rounded-xl transition-all duration-200 ${
              isOpen
                ? 'border-blue-300 bg-white shadow-sm'
                : 'border-slate-200 bg-white/70 hover:border-slate-300'
            }`}
          >
            <button
              type="button"
              onClick={() => toggleIndex(index)}
              className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-semibold text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-xl"
              aria-expanded={isOpen}
            >
              <span className="flex items-center gap-3 text-base sm:text-lg">
                <HelpCircle className={`w-5 h-5 shrink-0 ${isOpen ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.question}</span>
              </span>
              <ChevronDown
                className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-blue-600' : ''
                }`}
              />
            </button>

            {isOpen && (
              <div className="px-5 pb-5 pt-1 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-100 animate-in fade-in duration-200">
                <p>{item.answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
