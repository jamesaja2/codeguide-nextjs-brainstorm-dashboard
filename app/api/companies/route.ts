import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { companies } from '@/db/schema/companies';
import { auth } from '@/lib/auth';
import { desc } from 'drizzle-orm';
import { requireParticipant } from '@/lib/security-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    requireParticipant(session?.user);

    const companiesList = await db.query.companies.findMany({
      orderBy: [desc(companies.createdAt)],
    });

    return NextResponse.json(companiesList);
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}