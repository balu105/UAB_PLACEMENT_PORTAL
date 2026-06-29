'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Briefcase, Search, Sun, Moon,
  ChevronDown, Shield, LogOut 
} from 'lucide-react';
import styles from './Navbar.module.css';

interface SuggestionItem {
  id: string;
  title: string;
  type: 'job' | 'category' | 'company';
  url: string;
  subtitle: string;
}

interface UserSession {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch session on load
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/v1/auth/me');
        const data = await res.json();
        if (data.user && data.user.role === 'ADMIN') {
          setUser(data.user);
        }
      } catch (err) {
        console.error('Session retrieval failure', err);
      }
    }
    checkSession();

    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Handle clicking outside autocomplete popup
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/v1/auth/logout', { method: 'POST' });
      if (res.ok) {
        setUser(null);
        router.refresh();
        router.push('/');
      }
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  // Autocomplete suggestion queries
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data.suggestions) {
          setSuggestions(data.suggestions);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error('Search suggestions lookup failure', err);
      }
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/jobs?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSuggestionClick = (url: string) => {
    setShowSuggestions(false);
    setSearchQuery('');
    router.push(url);
  };

  return (
    <nav className={`${styles.navbar} glass`}>
      <div className={styles.container}>
        {/* Brand Logo */}
        <Link href="/" className={styles.brand}>
          <span className={styles.logoIcon}><Briefcase size={26} strokeWidth={2.5} /></span>
          <span>UAB <span className="gradient-text">CAREER LAUNCH</span></span>
        </Link>

        {/* Global Search */}
        <div className={styles.searchContainer} ref={searchRef}>
          <form onSubmit={handleSearchSubmit}>
            <span className={styles.searchIcon}><Search size={18} /></span>
            <input
              type="text"
              placeholder="Search jobs, skills, locations..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
            />
          </form>
          {showSuggestions && suggestions.length > 0 && (
            <div className={styles.suggestionsDropdown}>
              {suggestions.map((item) => (
                <div 
                  key={`${item.type}-${item.id}`} 
                  className={styles.suggestionItem}
                  onClick={() => handleSuggestionClick(item.url)}
                >
                  <Briefcase size={16} className={styles.logoIcon} />
                  <div className={styles.suggestionText}>
                    <span className={styles.suggestionTitle}>{item.title}</span>
                    <span className={styles.suggestionSubtitle}>{item.subtitle}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <ul className={styles.navLinks}>
          <li className={styles.navItem}>
            <Link href="/jobs" className={styles.navLink}>Find Jobs</Link>
          </li>
          
          <li className={styles.navItem}>
            <span className={styles.navLink}>
              Categories <ChevronDown size={14} />
            </span>
            <div className={styles.megaMenu}>
              <Link href="/jobs?category=software-engineering" className={styles.megaItem}>
                <span className={styles.megaTitle}>Software Engineering</span>
                <span className={styles.megaDesc}>Frontend, Backend, DevOps & Cloud Roles</span>
              </Link>
              <Link href="/jobs?category=product-management" className={styles.megaItem}>
                <span className={styles.megaTitle}>Product Management</span>
                <span className={styles.megaDesc}>Technical PMs, Product Owners & Leads</span>
              </Link>
              <Link href="/jobs?category=design-ux" className={styles.megaItem}>
                <span className={styles.megaTitle}>Design & UX</span>
                <span className={styles.megaDesc}>Product Designers, UX Researchers, Animators</span>
              </Link>
              <Link href="/jobs?category=data-science-ai" className={styles.megaItem}>
                <span className={styles.megaTitle}>Data Science & AI</span>
                <span className={styles.megaDesc}>ML Engineers, Data Analysts, AI Researchers</span>
              </Link>
            </div>
          </li>

          <li className={styles.navItem}>
            <span className={styles.navLink}>
              Resources <ChevronDown size={14} />
            </span>
            <div className={styles.megaMenu}>
              <Link href="/resources?type=INTERVIEW_QUESTION" className={styles.megaItem}>
                <span className={styles.megaTitle}>Interview Questions</span>
                <span className={styles.megaDesc}>DSA, System Design, behavioral cheat-sheets</span>
              </Link>
              <Link href="/resources?type=PLACEMENT_PAPER" className={styles.megaItem}>
                <span className={styles.megaTitle}>Placement Papers</span>
                <span className={styles.megaDesc}>Curated papers from tech companies</span>
              </Link>
              <Link href="/blogs" className={styles.megaItem}>
                <span className={styles.megaTitle}>Career Blog</span>
                <span className={styles.megaDesc}>Job searching hacks & career building advice</span>
              </Link>
            </div>
          </li>
        </ul>

        {/* Global actions */}
        <div className={styles.actions}>
          {user ? (
            <div className={styles.userProfileMenu}>
              <div className={styles.profileAvatar}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className={styles.profileDropdown}>
                {!pathname.startsWith('/admin') && (
                  <>
                    <Link href="/admin" className={styles.profileLink}>
                      <Shield size={16} /> Admin Panel
                    </Link>
                    <div className={styles.divider} />
                  </>
                )}
                <button className={styles.profileLink} onClick={handleLogout}>
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          ) : (
            pathname !== '/' && !pathname.startsWith('/admin') && pathname !== '/login' && (
              <Link href="/admin" className={styles.signupBtn} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={16} /> Admin Portal
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
