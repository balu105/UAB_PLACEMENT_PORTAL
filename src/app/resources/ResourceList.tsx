'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Layers } from 'lucide-react';
import styles from './page.module.css';

interface Resource {
  id: string;
  title: string;
  slug: string;
  type: string;
  content: string;
  category?: string | null;
  createdAt: Date | string;
}

interface ResourceListProps {
  resources: Resource[];
}

export default function ResourceList({ resources }: ResourceListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (resources.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h3>No resources found</h3>
        <p>Try switching tabs or check back later.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {resources.map((res) => {
        const isExpanded = expandedId === res.id;

        return (
          <div key={res.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>{res.title}</h3>
                
                <div className={styles.metaRow} style={{ marginTop: '8px' }}>
                  <div className={styles.metaItem}>
                    <Layers size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                    <span>{res.category || 'General'}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span>{res.type === 'INTERVIEW_QUESTION' ? 'Interview Q&A' : 'Placement Paper'}</span>
                  </div>
                </div>
              </div>

              <span className={styles.badge}>
                {res.type === 'INTERVIEW_QUESTION' ? 'Interview' : 'Papers'}
              </span>
            </div>

            {/* Expandable Preview */}
            {isExpanded && (
              <div className={styles.previewContent}>
                {res.content}
              </div>
            )}

            {/* Actions */}
            <div className={styles.actions} style={{ justifyContent: 'flex-end' }}>
              <button
                className={styles.viewBtn}
                onClick={() => setExpandedId(isExpanded ? null : res.id)}
              >
                {isExpanded ? (
                  <>
                    <EyeOff size={16} /> Hide Content
                  </>
                ) : (
                  <>
                    <Eye size={16} /> View Content
                  </>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
