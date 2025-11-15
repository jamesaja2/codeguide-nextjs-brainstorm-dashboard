import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { participants, user } from '@/db/schema';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { desc, eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/security-utils';
import { Formidable } from 'formidable';
import { readFileSync } from 'fs';
import * as xlsx from 'xlsx';
import { nanoid } from 'nanoid';

const participantsCreateSchema = z.object({
  teamName: z.string().min(1, 'Team name is required'),
  school: z.string().min(1, 'School is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  days: z.number().int().min(0).default(0),
  brokers: z.string().default(''),
  settings: z.object({
    notificationsEnabled: z.boolean().default(true),
    riskTolerance: z.string().default('medium'),
    autoInvest: z.boolean().default(false),
  }).optional(),
});

const participantImportSchema = z.object({
  teamName: z.string().min(1, 'Team name is required'),
  school: z.string().min(1, 'School is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  days: z.string().transform((val) => parseInt(val) || 0),
  brokers: z.string().default(''),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    requireAdmin(session?.user);

    const participantsList = await db.query.participants.findMany({
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: [desc(participants.createdAt)],
    });

    return NextResponse.json(participantsList);
  } catch (error) {
    console.error('Error fetching participants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch participants' },
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

    const contentType = request.headers.get('content-type');

    // Handle file upload for CSV/Excel import
    if (contentType?.includes('multipart/form-data')) {
      return await handleFileImport(request);
    }

    // Handle regular JSON POST
    const body = await request.json();
    const validatedData = participantsCreateSchema.parse(body);

    // Create user first
    const [newUser] = await db.insert(user)
      .values({
        id: nanoid(),
        name: validatedData.teamName,
        email: `${validatedData.username}@brainstorm.local`,
        role: 'participant',
      })
      .returning();

    // Then create participant
    const [newParticipant] = await db.insert(participants)
      .values({
        id: nanoid(),
        userId: newUser.id,
        teamName: validatedData.teamName,
        school: validatedData.school,
        days: validatedData.days,
        brokers: validatedData.brokers,
        settings: validatedData.settings,
      })
      .returning();

    // Set password for the user (this would need to be hashed with Better Auth)
    // For now, we'll assume Better Auth handles this properly

    return NextResponse.json({
      participant: newParticipant,
      user: newUser,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating participant:', error);
    return NextResponse.json(
      { error: 'Failed to create participant' },
      { status: 500 }
    );
  }
}

async function handleFileImport(request: NextRequest) {
  return new Promise((resolve) => {
    const form = new Formidable({
      uploadDir: '/tmp',
      keepExtensions: true,
    });

    form.parse(request, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        resolve(NextResponse.json(
          { error: 'Failed to parse uploaded file' },
          { status: 400 }
        ));
        return;
      }

      try {
        const file = Array.isArray(files.file) ? files.file[0] : files.file;
        if (!file) {
          resolve(NextResponse.json(
            { error: 'No file uploaded' },
            { status: 400 }
          ));
          return;
        }

        const fileBuffer = readFileSync(file.filepath);
        const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        const importedParticipants = [];
        const errors = [];

        for (let i = 0; i < data.length; i++) {
          try {
            const rowData = data[i] as any;
            const validatedData = participantImportSchema.parse(rowData);

            // Check if username already exists
            const existingUser = await db.query.user.findFirst({
              where: eq(user.email, `${validatedData.username}@brainstorm.local`),
            });

            if (existingUser) {
              errors.push({
                row: i + 1,
                error: 'Username already exists',
                data: validatedData,
              });
              continue;
            }

            // Create user
            const [newUser] = await db.insert(user)
              .values({
                id: nanoid(),
                name: validatedData.teamName,
                email: `${validatedData.username}@brainstorm.local`,
                role: 'participant',
              })
              .returning();

            // Create participant
            const [newParticipant] = await db.insert(participants)
              .values({
                id: nanoid(),
                userId: newUser.id,
                teamName: validatedData.teamName,
                school: validatedData.school,
                days: validatedData.days,
                brokers: validatedData.brokers,
              })
              .returning();

            importedParticipants.push({
              participant: newParticipant,
              user: newUser,
            });
          } catch (validationError) {
            console.error(`Error importing row ${i + 1}:`, validationError);
            errors.push({
              row: i + 1,
              error: validationError instanceof Error ? validationError.message : 'Unknown error',
              data: data[i],
            });
          }
        }

        resolve(NextResponse.json({
          message: `Successfully imported ${importedParticipants.length} participants`,
          imported: importedParticipants,
          errors: errors,
        }));
      } catch (error) {
        console.error('Error processing file:', error);
        resolve(NextResponse.json(
          { error: 'Failed to process uploaded file' },
          { status: 500 }
        ));
      }
    });
  });
}