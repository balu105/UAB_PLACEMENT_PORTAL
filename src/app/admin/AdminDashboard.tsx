'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Briefcase, Building, FileText, BookOpen, Megaphone, 
  Users, Plus, Trash2, Edit, ShieldAlert, LogOut, CheckCircle, XCircle 
} from 'lucide-react';
import styles from './page.module.css';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Company {
  id: string;
  name: string;
  slug: string;
  website: string;
  logoUrl?: string | null;
  verified: boolean;
  description?: string | null;
}

interface Job {
  id: string;
  title: string;
  slug: string;
  type: string;
  location: string;
  salaryRange?: string | null;
  skills?: string | null;
  verifiedSource: boolean;
  status: string;
  companyId: string;
  categoryId: string;
  company: Company;
  category: Category;
}

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  coverImage?: string | null;
  status: string;
  publishedAt?: string | null;
}

interface Resource {
  id: string;
  title: string;
  slug: string;
  type: string;
  content: string;
  category?: string | null;
}

interface Ad {
  id: string;
  title: string;
  placement: string;
  imageUrl: string;
  targetUrl: string;
  active: boolean;
  impressions: number;
  clicks: number;
}

interface ActivityLog {
  id: string;
  action: string;
  details: string;
  createdAt: string;
  userName: string;
}

interface Subscriber {
  id: string;
  email: string;
  active: boolean;
  createdAt: string;
}

interface KPIMetrics {
  jobs: number;
  companies: number;
  candidates: number;
  clicks: number;
  subscribers: number;
  ads: number;
}

interface AdminDashboardProps {
  categories: Category[];
  companies: Company[];
  initialActivityLogs: ActivityLog[];
  initialSubscribers: Subscriber[];
}

type TabType = 'overview' | 'jobs' | 'companies' | 'blogs' | 'resources' | 'ads' | 'subscribers';

export default function AdminDashboard({
  categories,
  companies,
  initialActivityLogs,
  initialSubscribers,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [mounted, setMounted] = useState(false);

  // KPIs & Chart Data
  const [kpis, setKpis] = useState<KPIMetrics>({ jobs: 0, companies: 0, candidates: 0, clicks: 0, subscribers: 0, ads: 0 });
  const [topJobs, setTopJobs] = useState<{ title: string; company: string; views: number }[]>([]);
  const [clickSummary, setClickSummary] = useState<{ title: string; company: string; count: number }[]>([]);
  
  // Lists
  const [dbJobs, setDbJobs] = useState<Job[]>([]);
  const [dbCompanies, setDbCompanies] = useState<Company[]>(companies);
  const [dbBlogs, setDbBlogs] = useState<Blog[]>([]);
  const [dbResources, setDbResources] = useState<Resource[]>([]);
  const [dbAds, setDbAds] = useState<Ad[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(initialActivityLogs);
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers);

  // Form states
  const [showFormModal, setShowFormModal] = useState(false);
  const [formType, setFormType] = useState<'job' | 'company' | 'blog' | 'resource' | 'ad' | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  // Dynamic values
  const [jobForm, setJobForm] = useState({ title: '', description: '', requirements: '', applyUrl: '', type: 'Full-time', location: '', salaryRange: '', skills: '', companyId: '', categoryId: '', verifiedSource: false, status: 'PUBLISHED' });
  const [companyForm, setCompanyForm] = useState({ name: '', website: '', logoUrl: '', description: '', verified: false });
  const [blogForm, setBlogForm] = useState({ title: '', content: '', excerpt: '', coverImage: '', status: 'PUBLISHED' });
  const [resourceForm, setResourceForm] = useState({ title: '', type: 'INTERVIEW_QUESTION', content: '', category: '' });
  const [adForm, setAdForm] = useState({ title: '', placement: 'SIDEBAR', imageUrl: '', targetUrl: '', active: true });

  // 1. Fetch Analytics on load
  useEffect(() => {
    setMounted(true);
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/v1/analytics');
        if (res.ok) {
          const data = await res.json();
          setKpis(data.kpis);
          setTopJobs(data.topJobs);
          setClickSummary(data.clickSummary);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchAnalytics();
    fetchTabList('jobs');
  }, []);

  // Fetch individual tab listings on selection
  const fetchTabList = async (tab: TabType) => {
    try {
      const urlMap: Record<string, string> = {
        jobs: '/api/v1/admin/jobs',
        companies: '/api/v1/admin/companies',
        blogs: '/api/v1/admin/blogs',
        resources: '/api/v1/admin/resources',
        ads: '/api/v1/admin/ads',
      };
      
      const endpoint = urlMap[tab];
      if (!endpoint) return;

      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        if (tab === 'jobs') setDbJobs(data.jobs);
        if (tab === 'companies') setDbCompanies(data.companies);
        if (tab === 'blogs') setDbBlogs(data.blogs);
        if (tab === 'resources') setDbResources(data.resources);
        if (tab === 'ads') setDbAds(data.ads);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    fetchTabList(tab);
  };

  // 2. Submit Create/Edit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formType) return;

    let payload: any = {};
    if (formType === 'job') payload = jobForm;
    if (formType === 'company') payload = companyForm;
    if (formType === 'blog') payload = blogForm;
    if (formType === 'resource') payload = resourceForm;
    if (formType === 'ad') payload = adForm;

    const method = editId ? 'PUT' : 'POST';
    const endpoint = editId 
      ? `/api/v1/admin/${formType}s/${editId}` 
      : `/api/v1/admin/${formType}s`;

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowFormModal(false);
        setEditId(null);
        fetchTabList(formType === 'job' ? 'jobs' : `${formType}s` as TabType);
      } else {
        const data = await res.json();
        alert(data.error || 'Operation failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Delete Operation
  const handleDelete = async (type: string, id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      const res = await fetch(`/api/v1/admin/${type}s/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchTabList(type === 'job' ? 'jobs' : `${type}s` as TabType);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger forms
  const openCreateForm = (type: 'job' | 'company' | 'blog' | 'resource' | 'ad') => {
    setFormType(type);
    setEditId(null);
    if (type === 'job') setJobForm({ title: '', description: '', requirements: '', applyUrl: '', type: 'Full-time', location: '', salaryRange: '', skills: '', companyId: companies[0]?.id || '', categoryId: categories[0]?.id || '', verifiedSource: false, status: 'PUBLISHED' });
    if (type === 'company') setCompanyForm({ name: '', website: '', logoUrl: '', description: '', verified: false });
    if (type === 'blog') setBlogForm({ title: '', content: '', excerpt: '', coverImage: '', status: 'PUBLISHED' });
    if (type === 'resource') setResourceForm({ title: '', type: 'INTERVIEW_QUESTION', content: '', category: '' });
    if (type === 'ad') setAdForm({ title: '', placement: 'SIDEBAR', imageUrl: '', targetUrl: '', active: true });
    setShowFormModal(true);
  };

  const openEditForm = (type: 'job' | 'company' | 'blog' | 'resource' | 'ad', item: any) => {
    setFormType(type);
    setEditId(item.id);
    if (type === 'job') setJobForm({ title: item.title, description: item.description, requirements: item.requirements || '', applyUrl: item.applyUrl, type: item.type, location: item.location, salaryRange: item.salaryRange || '', skills: item.skills || '', companyId: item.companyId, categoryId: item.categoryId, verifiedSource: item.verifiedSource, status: item.status });
    if (type === 'company') setCompanyForm({ name: item.name, website: item.website, logoUrl: item.logoUrl || '', description: item.description || '', verified: item.verified });
    if (type === 'blog') setBlogForm({ title: item.title, content: item.content, excerpt: item.excerpt || '', coverImage: item.coverImage || '', status: item.status });
    if (type === 'resource') setResourceForm({ title: item.title, type: item.type, content: item.content, category: item.category || '' });
    if (type === 'ad') setAdForm({ title: item.title, placement: item.placement, imageUrl: item.imageUrl, targetUrl: item.targetUrl, active: item.active });
    setShowFormModal(true);
  };

  return (
    <main className={styles.main}>
      <div className="container">
        <h1 className={styles.title}>Super Admin Panel</h1>
        
        <div className={styles.layout}>
          {/* Tabs Menu */}
          <nav className={styles.tabsNav}>
            <button className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabBtnActive : ''}`} onClick={() => handleTabChange('overview')}>
              <BarChart size={18} /> Overview
            </button>
            <button className={`${styles.tabBtn} ${activeTab === 'jobs' ? styles.tabBtnActive : ''}`} onClick={() => handleTabChange('jobs')}>
              <Briefcase size={18} /> Manage Jobs
            </button>
            <button className={`${styles.tabBtn} ${activeTab === 'companies' ? styles.tabBtnActive : ''}`} onClick={() => handleTabChange('companies')}>
              <Building size={18} /> Companies
            </button>
            <button className={`${styles.tabBtn} ${activeTab === 'blogs' ? styles.tabBtnActive : ''}`} onClick={() => handleTabChange('blogs')}>
              <FileText size={18} /> Blog CMS
            </button>
            <button className={`${styles.tabBtn} ${activeTab === 'resources' ? styles.tabBtnActive : ''}`} onClick={() => handleTabChange('resources')}>
              <BookOpen size={18} /> Career Resources
            </button>
            <button className={`${styles.tabBtn} ${activeTab === 'ads' ? styles.tabBtnActive : ''}`} onClick={() => handleTabChange('ads')}>
              <Megaphone size={18} /> Ad Delivery
            </button>
            <button className={`${styles.tabBtn} ${activeTab === 'subscribers' ? styles.tabBtnActive : ''}`} onClick={() => handleTabChange('subscribers')}>
              <Users size={18} /> Subscribers
            </button>
          </nav>

          {/* Main Dashboard Section */}
          <div className={styles.content}>
            
            {/* OVERVIEW PANEL */}
            {activeTab === 'overview' && (
              <>
                {/* KPI Metrics */}
                <div className={styles.kpiGrid}>
                  <div className={styles.kpiCard}>
                    <span className={styles.kpiLabel}>Total Jobs</span>
                    <span className={styles.kpiVal}>{kpis.jobs}</span>
                  </div>
                  <div className={styles.kpiCard}>
                    <span className={styles.kpiLabel}>Partners</span>
                    <span className={styles.kpiVal}>{kpis.companies}</span>
                  </div>
                  <div className={styles.kpiCard}>
                    <span className={styles.kpiLabel}>Candidates</span>
                    <span className={styles.kpiVal}>{kpis.candidates}</span>
                  </div>
                  <div className={styles.kpiCard}>
                    <span className={styles.kpiLabel}>Redirect Clicks</span>
                    <span className={styles.kpiVal}>{kpis.clicks}</span>
                  </div>
                  <div className={styles.kpiCard}>
                    <span className={styles.kpiLabel}>Active Subscribers</span>
                    <span className={styles.kpiVal}>{kpis.subscribers}</span>
                  </div>
                </div>

                {/* SVG Analytical Charts */}
                <div className={styles.chartsGrid}>
                  {/* Chart 1: Outbound Redirect Clicks */}
                  <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Outbound Clicks Analysis</h3>
                    {clickSummary.length === 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-muted)' }}>No clicks recorded yet</div>
                    ) : (
                      <svg className={styles.svgChart} viewBox="0 0 400 200">
                        {clickSummary.map((item, idx) => {
                          const maxCount = Math.max(...clickSummary.map(c => c.count), 1);
                          const barWidth = (item.count / maxCount) * 220;
                          return (
                            <g key={idx}>
                              <text x={10} y={idx * 35 + 22} className={styles.barText} style={{ fontWeight: 600 }}>{item.company}</text>
                              <rect x={120} y={idx * 35 + 10} width={barWidth} height={16} fill="var(--primary)" rx={4} />
                              <text x={130 + barWidth} y={idx * 35 + 22} className={styles.barText}>{item.count} clicks</text>
                            </g>
                          );
                        })}
                      </svg>
                    )}
                  </div>

                  {/* Chart 2: Popular Job Views */}
                  <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Top Viewed Job Opportunities</h3>
                    {topJobs.length === 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-muted)' }}>No views logged yet</div>
                    ) : (
                      <svg className={styles.svgChart} viewBox="0 0 400 200">
                        {topJobs.map((item, idx) => {
                          const maxViews = Math.max(...topJobs.map(c => c.views), 1);
                          const barWidth = (item.views / maxViews) * 220;
                          return (
                            <g key={idx}>
                              <text x={10} y={idx * 35 + 22} className={styles.barText} style={{ fontWeight: 600 }}>{item.company}</text>
                              <rect x={120} y={idx * 35 + 10} width={barWidth} height={16} fill="var(--secondary)" rx={4} />
                              <text x={130 + barWidth} y={idx * 35 + 22} className={styles.barText}>{item.views} views</text>
                            </g>
                          );
                        })}
                      </svg>
                    )}
                  </div>
                </div>

                {/* Administrative Audit logs */}
                <div className={styles.card}>
                  <h3 className={styles.chartTitle}>Recent Admin Action Audit Trail</h3>
                  <ul className={styles.activityLog}>
                    {activityLogs.length === 0 ? (
                      <li className={styles.logItem} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No audit events logged yet</li>
                    ) : (
                      activityLogs.map((log) => (
                        <li key={log.id} className={styles.logItem}>
                          <strong>{log.userName}</strong> ({log.action}) — {log.details}
                          <span className={styles.logTime}>{mounted ? new Date(log.createdAt).toLocaleString() : ''}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </>
            )}

            {/* JOBS CMS PANEL */}
            {activeTab === 'jobs' && (
              <div className={styles.card}>
                <div className={styles.headerRow}>
                  <h2 className={styles.chartTitle}>Manage Job Listings</h2>
                  <button className={styles.addBtn} onClick={() => openCreateForm('job')}>
                    <Plus size={16} /> Add Job Update
                  </button>
                </div>

                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th className={styles.th}>Job Title</th>
                        <th className={styles.th}>Company</th>
                        <th className={styles.th}>Type</th>
                        <th className={styles.th}>Verified</th>
                        <th className={styles.th}>Status</th>
                        <th className={styles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dbJobs.map((job) => (
                        <tr key={job.id} className={styles.tr}>
                          <td className={styles.td} style={{ fontWeight: 600 }}>{job.title}</td>
                          <td className={styles.td}>{job.company.name}</td>
                          <td className={styles.td}>{job.type}</td>
                          <td className={styles.td}>
                            {job.verifiedSource ? (
                              <span className={`${styles.badge} ${styles.badgeGreen}`}>Verified</span>
                            ) : (
                              <span className={`${styles.badge} ${styles.badgeGray}`}>Unverified</span>
                            )}
                          </td>
                          <td className={styles.td}>
                            {job.status === 'PUBLISHED' ? (
                              <span className={`${styles.badge} ${styles.badgeGreen}`}>Published</span>
                            ) : (
                              <span className={`${styles.badge} ${styles.badgeGray}`}>Draft</span>
                            )}
                          </td>
                          <td className={styles.td}>
                            <div className={styles.actionCell}>
                              <button className={styles.editBtn} onClick={() => openEditForm('job', job)}>
                                <Edit size={16} />
                              </button>
                              <button className={styles.deleteBtn} onClick={() => handleDelete('job', job.id)}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* COMPANIES CMS PANEL */}
            {activeTab === 'companies' && (
              <div className={styles.card}>
                <div className={styles.headerRow}>
                  <h2 className={styles.chartTitle}>Manage Partner Companies</h2>
                  <button className={styles.addBtn} onClick={() => openCreateForm('company')}>
                    <Plus size={16} /> Add Company
                  </button>
                </div>

                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th className={styles.th}>Company Name</th>
                        <th className={styles.th}>Official Website</th>
                        <th className={styles.th}>Verified Partner</th>
                        <th className={styles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dbCompanies.map((comp) => (
                        <tr key={comp.id} className={styles.tr}>
                          <td className={styles.td} style={{ fontWeight: 600 }}>{comp.name}</td>
                          <td className={styles.td}>{comp.website}</td>
                          <td className={styles.td}>
                            {comp.verified ? (
                              <span className={`${styles.badge} ${styles.badgeGreen}`}>Verified</span>
                            ) : (
                              <span className={`${styles.badge} ${styles.badgeGray}`}>Standard</span>
                            )}
                          </td>
                          <td className={styles.td}>
                            <div className={styles.actionCell}>
                              <button className={styles.editBtn} onClick={() => openEditForm('company', comp)}>
                                <Edit size={16} />
                              </button>
                              <button className={styles.deleteBtn} onClick={() => handleDelete('company', comp.id)}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* BLOG CMS PANEL */}
            {activeTab === 'blogs' && (
              <div className={styles.card}>
                <div className={styles.headerRow}>
                  <h2 className={styles.chartTitle}>Manage Blogs</h2>
                  <button className={styles.addBtn} onClick={() => openCreateForm('blog')}>
                    <Plus size={16} /> Write Blog Post
                  </button>
                </div>

                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th className={styles.th}>Article Title</th>
                        <th className={styles.th}>Status</th>
                        <th className={styles.th}>Publish Date</th>
                        <th className={styles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dbBlogs.map((blog) => (
                        <tr key={blog.id} className={styles.tr}>
                          <td className={styles.td} style={{ fontWeight: 600 }}>{blog.title}</td>
                          <td className={styles.td}>
                            {blog.status === 'PUBLISHED' ? (
                              <span className={`${styles.badge} ${styles.badgeGreen}`}>Published</span>
                            ) : (
                              <span className={`${styles.badge} ${styles.badgeGray}`}>Draft</span>
                            )}
                          </td>
                          <td className={styles.td}>
                            {mounted && blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className={styles.td}>
                            <div className={styles.actionCell}>
                              <button className={styles.editBtn} onClick={() => openEditForm('blog', blog)}>
                                <Edit size={16} />
                              </button>
                              <button className={styles.deleteBtn} onClick={() => handleDelete('blog', blog.id)}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CAREER RESOURCES CMS PANEL */}
            {activeTab === 'resources' && (
              <div className={styles.card}>
                <div className={styles.headerRow}>
                  <h2 className={styles.chartTitle}>Manage Placement Papers & Cheat-sheets</h2>
                  <button className={styles.addBtn} onClick={() => openCreateForm('resource')}>
                    <Plus size={16} /> Add Resource
                  </button>
                </div>

                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th className={styles.th}>Resource Title</th>
                        <th className={styles.th}>Type</th>
                        <th className={styles.th}>Category</th>
                        <th className={styles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dbResources.map((res) => (
                        <tr key={res.id} className={styles.tr}>
                          <td className={styles.td} style={{ fontWeight: 600 }}>{res.title}</td>
                          <td className={styles.td}>{res.type === 'PLACEMENT_PAPER' ? 'Placement Paper' : 'Interview Q&A'}</td>
                          <td className={styles.td}>{res.category || 'General'}</td>
                          <td className={styles.td}>
                            <div className={styles.actionCell}>
                              <button className={styles.editBtn} onClick={() => openEditForm('resource', res)}>
                                <Edit size={16} />
                              </button>
                              <button className={styles.deleteBtn} onClick={() => handleDelete('resource', res.id)}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* AD DELIVERY PANEL */}
            {activeTab === 'ads' && (
              <div className={styles.card}>
                <div className={styles.headerRow}>
                  <h2 className={styles.chartTitle}>Manage Advertisement Delivery</h2>
                  <button className={styles.addBtn} onClick={() => openCreateForm('ad')}>
                    <Plus size={16} /> Schedule Ad campaign
                  </button>
                </div>

                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th className={styles.th}>Ad Title</th>
                        <th className={styles.th}>Placement</th>
                        <th className={styles.th}>Impressions</th>
                        <th className={styles.th}>Status</th>
                        <th className={styles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dbAds.map((ad) => (
                        <tr key={ad.id} className={styles.tr}>
                          <td className={styles.td} style={{ fontWeight: 600 }}>{ad.title}</td>
                          <td className={styles.td}>{ad.placement}</td>
                          <td className={styles.td}>{ad.impressions}</td>
                          <td className={styles.td}>
                            {ad.active ? (
                              <span className={`${styles.badge} ${styles.badgeGreen}`}>Active</span>
                            ) : (
                              <span className={`${styles.badge} ${styles.badgeGray}`}>Paused</span>
                            )}
                          </td>
                          <td className={styles.td}>
                            <div className={styles.actionCell}>
                              <button className={styles.editBtn} onClick={() => openEditForm('ad', ad)}>
                                <Edit size={16} />
                              </button>
                              <button className={styles.deleteBtn} onClick={() => handleDelete('ad', ad.id)}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUBSCRIBERS PANEL */}
            {activeTab === 'subscribers' && (
              <div className={styles.card}>
                <h2 className={styles.chartTitle}>Active Newsletter Subscribers</h2>
                
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th className={styles.th}>Email Address</th>
                        <th className={styles.th}>Subscription Date</th>
                        <th className={styles.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map((sub) => (
                        <tr key={sub.id} className={styles.tr}>
                          <td className={styles.td} style={{ fontWeight: 600 }}>{sub.email}</td>
                          <td className={styles.td}>{mounted ? new Date(sub.createdAt).toLocaleDateString() : ''}</td>
                          <td className={styles.td}>
                            {sub.active ? (
                              <span className={`${styles.badge} ${styles.badgeGreen}`}>Subscribed</span>
                            ) : (
                              <span className={`${styles.badge} ${styles.badgeGray}`}>Inactive</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* POPUP FORM DRAWER MODAL */}
      {showFormModal && (
        <div className={styles.overlay} onClick={() => setShowFormModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <div className={styles.content} onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '24px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <h3 className={styles.chartTitle} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
              {editId ? 'Edit' : 'Create'} {formType?.toUpperCase()}
            </h3>

            <form onSubmit={handleFormSubmit} className={styles.formGrid}>
              
              {/* JOB CRUD FORM FIELDS */}
              {formType === 'job' && (
                <>
                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Job Title</label>
                    <input type="text" required className={styles.input} value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Job Type</label>
                    <select className={styles.select} value={jobForm.type} onChange={e => setJobForm({...jobForm, type: e.target.value})}>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Location</label>
                    <input type="text" required className={styles.input} value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Company</label>
                    <select className={styles.select} value={jobForm.companyId} onChange={e => setJobForm({...jobForm, companyId: e.target.value})}>
                      {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Category</label>
                    <select className={styles.select} value={jobForm.categoryId} onChange={e => setJobForm({...jobForm, categoryId: e.target.value})}>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Salary Range</label>
                    <input type="text" placeholder="e.g. $120,000 - $140,000" className={styles.input} value={jobForm.salaryRange} onChange={e => setJobForm({...jobForm, salaryRange: e.target.value})} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Skills (Comma-separated)</label>
                    <input type="text" placeholder="React, TypeScript, CSS" className={styles.input} value={jobForm.skills} onChange={e => setJobForm({...jobForm, skills: e.target.value})} />
                  </div>
                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Apply URL (External Link only)</label>
                    <input type="url" required className={styles.input} value={jobForm.applyUrl} onChange={e => setJobForm({...jobForm, applyUrl: e.target.value})} />
                  </div>
                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Job Description</label>
                    <textarea required className={styles.textarea} value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} />
                  </div>
                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Requirements</label>
                    <textarea className={styles.textarea} value={jobForm.requirements} onChange={e => setJobForm({...jobForm, requirements: e.target.value})} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.checkboxLabel}>
                      <input type="checkbox" className={styles.checkbox} checked={jobForm.verifiedSource} onChange={e => setJobForm({...jobForm, verifiedSource: e.target.checked})} />
                      <span>Verified Source URL</span>
                    </label>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Status</label>
                    <select className={styles.select} value={jobForm.status} onChange={e => setJobForm({...jobForm, status: e.target.value})}>
                      <option value="PUBLISHED">Published</option>
                      <option value="DRAFT">Draft</option>
                    </select>
                  </div>
                </>
              )}

              {/* COMPANY CRUD FORM FIELDS */}
              {formType === 'company' && (
                <>
                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Company Name</label>
                    <input type="text" required className={styles.input} value={companyForm.name} onChange={e => setCompanyForm({...companyForm, name: e.target.value})} />
                  </div>
                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Official Careers URL</label>
                    <input type="url" required className={styles.input} value={companyForm.website} onChange={e => setCompanyForm({...companyForm, website: e.target.value})} />
                  </div>
                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Logo URL</label>
                    <input type="url" className={styles.input} value={companyForm.logoUrl} onChange={e => setCompanyForm({...companyForm, logoUrl: e.target.value})} />
                  </div>
                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Description</label>
                    <textarea className={styles.textarea} value={companyForm.description} onChange={e => setCompanyForm({...companyForm, description: e.target.value})} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.checkboxLabel}>
                      <input type="checkbox" className={styles.checkbox} checked={companyForm.verified} onChange={e => setCompanyForm({...companyForm, verified: e.target.checked})} />
                      <span>Verified Partner Badge</span>
                    </label>
                  </div>
                </>
              )}

              {/* BLOG CRUD FORM FIELDS */}
              {formType === 'blog' && (
                <>
                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Article Title</label>
                    <input type="text" required className={styles.input} value={blogForm.title} onChange={e => setBlogForm({...blogForm, title: e.target.value})} />
                  </div>
                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Excerpt</label>
                    <input type="text" className={styles.input} value={blogForm.excerpt} onChange={e => setBlogForm({...blogForm, excerpt: e.target.value})} />
                  </div>
                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Cover Image URL</label>
                    <input type="url" className={styles.input} value={blogForm.coverImage} onChange={e => setBlogForm({...blogForm, coverImage: e.target.value})} />
                  </div>
                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Markdown Content</label>
                    <textarea required className={styles.textarea} style={{ minHeight: '160px' }} value={blogForm.content} onChange={e => setBlogForm({...blogForm, content: e.target.value})} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Status</label>
                    <select className={styles.select} value={blogForm.status} onChange={e => setBlogForm({...blogForm, status: e.target.value})}>
                      <option value="PUBLISHED">Published</option>
                      <option value="DRAFT">Draft</option>
                    </select>
                  </div>
                </>
              )}

              {/* CAREER RESOURCES CRUD FIELDS */}
              {formType === 'resource' && (
                <>
                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Resource Title</label>
                    <input type="text" required className={styles.input} value={resourceForm.title} onChange={e => setResourceForm({...resourceForm, title: e.target.value})} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Resource Type</label>
                    <select className={styles.select} value={resourceForm.type} onChange={e => setResourceForm({...resourceForm, type: e.target.value})}>
                      <option value="INTERVIEW_QUESTION">Interview Questions</option>
                      <option value="PLACEMENT_PAPER">Placement Paper</option>
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Category</label>
                    <input type="text" placeholder="e.g. JavaScript, System Design" className={styles.input} value={resourceForm.category} onChange={e => setResourceForm({...resourceForm, category: e.target.value})} />
                  </div>
                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Markdown Content</label>
                    <textarea required className={styles.textarea} style={{ minHeight: '160px' }} value={resourceForm.content} onChange={e => setResourceForm({...resourceForm, content: e.target.value})} />
                  </div>
                </>
              )}

              {/* ADVERTISING CRUD FORM FIELDS */}
              {formType === 'ad' && (
                <>
                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Ad Campaign Name</label>
                    <input type="text" required className={styles.input} value={adForm.title} onChange={e => setAdForm({...adForm, title: e.target.value})} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Ad Placement Slot</label>
                    <select className={styles.select} value={adForm.placement} onChange={e => setAdForm({...adForm, placement: e.target.value})}>
                      <option value="SIDEBAR">Sidebar Ad</option>
                      <option value="BANNER">Banner Ad (Leaderboard)</option>
                      <option value="INLINE">Native Inline Sponsor Ad</option>
                    </select>
                  </div>
                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Banner Image URL</label>
                    <input type="url" required className={styles.input} value={adForm.imageUrl} onChange={e => setAdForm({...adForm, imageUrl: e.target.value})} />
                  </div>
                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Landing Target URL</label>
                    <input type="url" required className={styles.input} value={adForm.targetUrl} onChange={e => setAdForm({...adForm, targetUrl: e.target.value})} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.checkboxLabel}>
                      <input type="checkbox" className={styles.checkbox} checked={adForm.active} onChange={e => setAdForm({...adForm, active: e.target.checked})} />
                      <span>Deliver Immediately (Active)</span>
                    </label>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className={`${styles.inputGroup} ${styles.fullWidth}`} style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '10px' }}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowFormModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Save
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </main>
  );
}
