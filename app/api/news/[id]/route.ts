import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { news } from '@/db/schema/news';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { requireParticipant } from '@/lib/security-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    requireParticipant(session?.user);

    const newsItem = await db.query.news.findFirst({
      where: eq(news.id, params.id),
    });

    if (!newsItem) {
      return NextResponse.json(
        { error: 'News not found' },
        { status: 404 }
      );
    }

    // For paid content, check if user has access
    if (newsItem.type === 'paid') {
      // TODO: Implement paid content access logic
      // For now, we'll allow all participants to access paid content
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