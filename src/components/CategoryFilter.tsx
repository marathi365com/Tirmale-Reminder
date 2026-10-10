import React from 'react';
import { ReminderCategory } from '../types/reminder';
import { CATEGORIES } from '../utils/constants';
import { Layers } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: ReminderCategory | 'all';
  onSelectCategory: (cat: ReminderCategory | 'all') => void;
  categoryCounts: Record<string, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
      {/* "All" chip */}
      <button
        onClick={() => onSelectCategory('all')}
        className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
          selectedCategory === 'all'
            ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-900/30'
            : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <Layers className="w-3.5 h-3.5" />
        <span>सर्व (All)</span>
        <span
          className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
            selectedCategory === 'all' ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-700 text-slate-300'
          }`}
        >
          {categoryCounts['all'] || 0}
        </span>
      </button>

      {/* Category chips */}
      {(Object.keys(CATEGORIES) as ReminderCategory[]).map((catKey) => {
        const meta = CATEGORIES[catKey];
        const IconComponent = meta.icon;
        const count = categoryCounts[catKey] || 0;
        const isSelected = selectedCategory === catKey;

        return (
          <button
            key={catKey}
            onClick={() => onSelectCategory(catKey)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              isSelected
                ? `${meta.colorClass} border-indigo-500 text-white bg-indigo-600/30 shadow-sm`
                : 'bg-slate-800/70 border-slate-700/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <IconComponent className={`w-3.5 h-3.5 ${isSelected ? meta.textClass : 'text-slate-400'}`} />
            <span>{meta.labelMr}</span>
            {count > 0 && (
              <span
                className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                  isSelected ? 'bg-indigo-900/80 text-indigo-200' : 'bg-slate-700/80 text-slate-400'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
