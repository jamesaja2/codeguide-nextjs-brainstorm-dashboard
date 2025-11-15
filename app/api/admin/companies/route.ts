import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { companies } from '@/db/schema/companies';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/security-utils';

const companiesCreateSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  currentPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Valid price is required'),
  marketCap: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Valid market cap is required'),
  financials: z.object({
    revenue: z.string(),
    profit: z.string(),
    growth: z.string(),
    marketShare: z.string(),
  }).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    requireAdmin(session?.user);

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

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    requireAdmin(session?.user);

    const body = await request.json();
    const validatedData = companiesCreateSchema.parse(body);

    const [newCompany] = await db.insert(companies)
      .values({
        ...validatedData,
        previousPrice: validatedData.currentPrice, // Set previous price equal to current price initially
      })
      .returning();

    return NextResponse.json(newCompany, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating company:', error);
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    );
  }
}