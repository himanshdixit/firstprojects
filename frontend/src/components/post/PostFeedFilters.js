'use client';

import { Search, SlidersHorizontal, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function PostFeedFilters({
  searchInput,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  activeTag,
  onTagChange,
  tags,
  categories,
  hasActiveFilters,
  filterSummary,
  onClear,
}) {
  return (
    <div className="card-surface space-y-5 p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow inline-flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Discover
          </p>
          <h3 className="mt-3 text-2xl sm:text-3xl">Search, filter, and refine the feed</h3>
          <p className="editorial-copy mt-2 max-w-2xl">
            Search is debounced for a smoother experience, while tag and category filters keep results focused.
          </p>
        </div>

        {hasActiveFilters ? (
          <Button variant="secondary" onClick={onClear}>
            <X className="h-4 w-4" />
            Clear filters
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_220px]">
        <div className="relative">
          <Input
            label="Search posts"
            placeholder="Search by title, content, or tag"
            value={searchInput}
            onChange={(event) => onSearchChange(event.target.value)}
            className="pl-11"
          />
          <Search className="pointer-events-none absolute left-4 top-[2.7rem] h-4 w-4 text-slate-400" />
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Category</span>
          <select
            value={activeCategory}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm transition-colors duration-200 dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Popular tags</p>
          {filterSummary ? (
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              {filterSummary}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onTagChange('')}
            className={`rounded-full px-3 py-2 text-sm font-medium transition-[background-color,box-shadow,color,border-color] duration-200 ${
              !activeTag
                ? 'bg-[linear-gradient(135deg,#0f766e,#14b8a6)] text-white shadow-[0_12px_30px_rgba(15,118,110,0.22)]'
                : 'border border-slate-200/80 bg-white/80 text-slate-700 hover:bg-white dark:border-slate-700/80 dark:bg-slate-950/50 dark:text-slate-200'
            }`}
          >
            All tags
          </button>

          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagChange(tag)}
              className={`rounded-full px-3 py-2 text-sm font-medium transition-[background-color,box-shadow,color,border-color] duration-200 ${
                activeTag === tag
                  ? 'bg-[linear-gradient(135deg,#0f766e,#14b8a6)] text-white shadow-[0_12px_30px_rgba(15,118,110,0.22)]'
                  : 'border border-slate-200/80 bg-white/80 text-slate-700 hover:bg-white dark:border-slate-700/80 dark:bg-slate-950/50 dark:text-slate-200'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
