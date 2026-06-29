'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, SlidersHorizontal, Bookmark } from 'lucide-react';
import styles from './SearchFilters.module.css';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State matching search parameters
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [verified, setVerified] = useState(searchParams.get('verified') === 'true');
  const [saved, setSaved] = useState(searchParams.get('saved') === 'true');

  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch categories on load
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/v1/categories');
        const data = await res.json();
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error('Failed fetching categories', err);
      }
    }
    fetchCategories();
  }, []);

  // Update query state if URL search parameters change externally
  useEffect(() => {
    setQ(searchParams.get('q') || '');
    setCategory(searchParams.get('category') || '');
    setType(searchParams.get('type') || '');
    setLocation(searchParams.get('location') || '');
    setVerified(searchParams.get('verified') === 'true');
    setSaved(searchParams.get('saved') === 'true');
  }, [searchParams]);

  // Synchronize state changes to URL search params
  const updateUrl = (updates: Record<string, string | boolean | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Reset page to 1 on any filter change
    params.set('page', '1');

    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === '' || val === false) {
        params.delete(key);
      } else {
        params.set(key, String(val));
      }
    });

    router.push(`/jobs?${params.toString()}`);
  };

  // Debounced query and location inputs
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (q !== (searchParams.get('q') || '')) {
        updateUrl({ q });
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [q]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (location !== (searchParams.get('location') || '')) {
        updateUrl({ location });
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [location]);

  // Listen to bookmarks-updated event to update URL filter dynamically
  useEffect(() => {
    const handleBookmarksUpdate = () => {
      if (saved) {
        try {
          const stored = localStorage.getItem('saved_jobs');
          const parsed = stored ? JSON.parse(stored) as string[] : [];
          updateUrl({ saved: true, ids: parsed.join(',') || 'none' });
        } catch (e) {
          console.error(e);
        }
      }
    };
    window.addEventListener('bookmarks-updated', handleBookmarksUpdate);
    return () => window.removeEventListener('bookmarks-updated', handleBookmarksUpdate);
  }, [saved]);

  const handleSavedChange = (checked: boolean) => {
    setSaved(checked);
    if (checked) {
      try {
        const stored = localStorage.getItem('saved_jobs');
        const parsed = stored ? JSON.parse(stored) as string[] : [];
        updateUrl({ saved: true, ids: parsed.join(',') || 'none' });
      } catch (e) {
        console.error(e);
        updateUrl({ saved: true, ids: 'none' });
      }
    } else {
      updateUrl({ saved: null, ids: null });
    }
  };

  const handleClearAll = () => {
    setQ('');
    setCategory('');
    setType('');
    setLocation('');
    setVerified(false);
    setSaved(false);
    router.push('/jobs');
  };

  return (
    <aside className={styles.filtersPanel}>
      <div className={styles.section} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SlidersHorizontal size={16} /> Filters
        </h3>
        <button className={styles.clearBtn} onClick={handleClearAll}>
          Clear All
        </button>
      </div>

      {/* Keywords */}
      <div className={styles.section}>
        <label className={styles.title} htmlFor="filter-q">Search Keywords</label>
        <div className={styles.inputWrapper}>
          <span className={styles.inputIcon}><Search size={16} /></span>
          <input
            id="filter-q"
            type="text"
            placeholder="Job title, skills..."
            className={styles.input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {/* Category */}
      <div className={styles.section}>
        <label className={styles.title} htmlFor="filter-category">Category</label>
        <select
          id="filter-category"
          className={styles.select}
          value={category}
          onChange={(e) => updateUrl({ category: e.target.value })}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div className={styles.section}>
        <label className={styles.title} htmlFor="filter-location">Location</label>
        <div className={styles.inputWrapper}>
          <span className={styles.inputIcon}><MapPin size={16} /></span>
          <input
            id="filter-location"
            type="text"
            placeholder="City, country or Remote..."
            className={styles.input}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>

      {/* Job Type */}
      <div className={styles.section}>
        <label className={styles.title} htmlFor="filter-type">Job Type</label>
        <select
          id="filter-type"
          className={styles.select}
          value={type}
          onChange={(e) => updateUrl({ type: e.target.value })}
        >
          <option value="">All Job Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Remote">Remote</option>
        </select>
      </div>

      {/* Verified Source */}
      <div className={styles.section}>
        <label className={styles.checkboxLabel} htmlFor="filter-verified">
          <input
            id="filter-verified"
            type="checkbox"
            className={styles.checkbox}
            checked={verified}
            onChange={(e) => updateUrl({ verified: e.target.checked })}
          />
          <span>Verified Sources Only</span>
        </label>
      </div>

      {/* Saved Jobs */}
      <div className={styles.section}>
        <label className={styles.checkboxLabel} htmlFor="filter-saved">
          <input
            id="filter-saved"
            type="checkbox"
            className={styles.checkbox}
            checked={saved}
            onChange={(e) => handleSavedChange(e.target.checked)}
          />
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Bookmark size={14} fill={saved ? "currentColor" : "none"} /> Saved Jobs Only
          </span>
        </label>
      </div>
    </aside>
  );
}
