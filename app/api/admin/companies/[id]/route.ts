import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { companies } from '@/db/schema/companies';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/security-utils';

const companiesUpdateSchema = z.object({
  name: z.string().min(1, 'Company name is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  location: z.string().min(1, 'Location is required').optional(),
  currentPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Valid price is required').optional(),
  marketCap: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Valid market cap is required').optional(),
  financials: z.object({
    revenue: z.string(),
    profit: z.string(),
    growth: z.string(),
    marketShare: z.string(),
  }).optional(),
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

    const company = await db.query.companies.findFirst({
      where: eq(companies.id, params.id),
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company' },
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
    const validatedData = companiesUpdateSchema.parse(body);

    // Get current company to preserve previous price if not updating current price
    const currentCompany = await db.query.companies.findFirst({
      where: eq(companies.id, params.id),
    });

    if (!currentCompany) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    const [updatedCompany] = await db.update(companies)
      .set({
        ...validatedData,
        // Update previous price only if current price is being changed
        previousPrice: validatedData.currentPrice
          ? currentCompany.currentPrice
          : currentCompany.previousPrice,
        updatedAt: new Date(),
      })
      .where(eq(companies.id, params.id))
      .returning();

    return NextResponse.json(updatedCompany);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating company:', error);
    return NextResponse.json(
      { error: 'Failed to update company' },
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

    const [deletedCompany] = await db.delete(companies)
      .where(eq(companies.id, params.id))
      .returning();

    if (!deletedCompany) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Company deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: 500 }
    );
  }
}