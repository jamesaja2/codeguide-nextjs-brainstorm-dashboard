import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { news } from '@/db/schema/news';
import { auth } from '@/lib/auth';
import { desc, eq } from 'drizzle-orm';
import { requireParticipant } from '@/lib/security-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    requireParticipant(session?.user);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'free' or 'paid'
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    let query = db.select().from(news).orderBy(desc(news.createdAt));

    // Filter by type if specified
    if (type && ['free', 'paid'].includes(type)) {
      query = query.where(eq(news.type, type as 'free' | 'paid'));
    }

    // Apply pagination
    if (offset) {
      query = query.limit(parseInt(limit || '10')).offset(parseInt(offset));
    }

    const newsList = await query;

    return NextResponse.json(newsList);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}