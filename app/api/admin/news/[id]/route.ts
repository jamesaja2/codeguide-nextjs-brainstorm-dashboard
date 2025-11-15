import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { news } from '@/db/schema/news';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/security-utils';

const newsUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  type: z.enum(['free', 'paid']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    requireAdmin(session?.user);

    const newsItem = await db.query.news.findFirst({
      where: eq(news.id, params.id),
    });

    if (!newsItem) {
      return NextResponse.json(
        { error: 'News not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(newsItem);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    requireAdmin(session?.user);

    const body = await request.json();
    const validatedData = newsUpdateSchema.parse(body);

    const [updatedNews] = await db.update(news)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(news.id, params.id))
      .returning();

    if (!updatedNews) {
      return NextResponse.json(
        { error: 'News not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedNews);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating news:', error);
    return NextResponse.json(
      { error: 'Failed to update news' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    requireAdmin(session?.user);

    const [deletedNews] = await db.delete(news)
      .where(eq(news.id, params.id))
      .returning();

    if (!deletedNews) {
      return NextResponse.json(
        { error: 'News not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'News deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting news:', error);
    return NextResponse.json(
      { error: 'Failed to delete news' },
      { status: 500 }
    );
  }
}