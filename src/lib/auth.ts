import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/db';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export async function getCurrentUser(req: NextRequest): Promise<AuthUser | null> {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  return prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });
}
