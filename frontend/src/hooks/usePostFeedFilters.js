'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import useDebouncedValue from '@/hooks/useDebouncedValue';

export default function usePostFeedFilters(setParams) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const activeSearch = searchParams.get('search') || '';
  const activeTag = searchParams.get('tag') || '';
  const activeCategory = searchParams.get('category') || '';
  const [searchInput, setSearchInput] = useState(activeSearch);
  const debouncedSearch = useDebouncedValue(searchInput, 350);

  useEffect(() => {
    setSearchInput(activeSearch);
  }, [activeSearch]);

  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      page: 1,
      search: debouncedSearch,
      tag: activeTag,
      category: activeCategory,
    }));
  }, [activeCategory, activeTag, debouncedSearch, setParams]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParamsString);

    if (debouncedSearch) {
      nextParams.set('search', debouncedSearch);
    } else {
      nextParams.delete('search');
    }

    const nextQuery = nextParams.toString();
    if (nextQuery !== searchParamsString) {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    }
  }, [debouncedSearch, pathname, router, searchParamsString]);

  const updateRouteFilters = useCallback(
    (nextValues) => {
      const nextParams = new URLSearchParams(searchParamsString);

      Object.entries(nextValues).forEach(([key, value]) => {
        if (value) {
          nextParams.set(key, value);
        } else {
          nextParams.delete(key);
        }
      });

      const nextQuery = nextParams.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    },
    [pathname, router, searchParamsString]
  );

  const clearFilters = useCallback(() => {
    setSearchInput('');
    updateRouteFilters({ search: '', tag: '', category: '' });
    setParams((prev) => ({ ...prev, page: 1, search: '', tag: '', category: '' }));
  }, [setParams, updateRouteFilters]);

  const hasActiveFilters = Boolean(debouncedSearch || activeTag || activeCategory);

  const filterSummary = useMemo(() => {
    return [debouncedSearch, activeCategory, activeTag].filter(Boolean).join(' / ');
  }, [activeCategory, activeTag, debouncedSearch]);

  return {
    activeSearch,
    activeTag,
    activeCategory,
    searchInput,
    setSearchInput,
    updateRouteFilters,
    clearFilters,
    hasActiveFilters,
    filterSummary,
  };
}
