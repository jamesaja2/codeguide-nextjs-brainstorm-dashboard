import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { news } from '@/db/schema/news';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/security-utils';

const newsCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['free', 'paid']).default('free'),
});

const newsUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  type: z.enum(['free', 'paid']).optional(),
});

// GET all news
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    requireAdmin(session?.user);

    const newsList = await db.query.news.findMany({
      orderBy: [desc(news.createdAt)],
    });

    return NextResponse.json(newsList);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

// POST create news
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    requireAdmin(session?.user);

    const body = await request.json();
    const validatedData = newsCreateSchema.parse(body);

    const [newNews] = await db.insert(news)
      .values(validatedData)
      .returning();

    return NextResponse.json(newNews, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating news:', error);
    return NextResponse.json(
      { error: 'Failed to create news' },
      { status: 500 }
    );
  }
}