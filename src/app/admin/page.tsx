import React from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import AdminDashboard from './AdminDashboard';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    redirect('/login?callbackUrl=/admin');
  }

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'ADMIN') {
    redirect('/');
  }

  const [categories, companies, activityLogs, subscribers] = await prisma.$transaction([
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.company.findMany({ orderBy: { name: 'asc' } }),
    prisma.activityLog.findMany({
      take: 15,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return (
    <AdminDashboard
      categories={categories}
      companies={companies}
      initialActivityLogs={activityLogs.map((l) => ({
        id: l.id,
        action: l.action,
        details: l.details || '',
        createdAt: l.createdAt.toISOString(),
        userName: l.user ? (l.user.name || l.user.email) : 'System Admin',
      }))}
      initialSubscribers={subscribers.map((s) => ({
        id: s.id,
        email: s.email,
        active: s.active,
        createdAt: s.createdAt.toISOString(),
      }))}
    />
  );
}
