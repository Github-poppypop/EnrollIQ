import { NextResponse } from 'next/server';
import { parseAndValidateUpload, persistUploadResult, type PersistCallback } from '@/lib/services/upload-service';
import { uploadFileToStorage } from '@/lib/services/upload-service';
import { listEnrollmentsByCourse, createEnrollment } from '@/lib/services/enrollment-service';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const ACCEPTED_EXTENSIONS = ['.csv', '.xlsx', '.xls'];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, data: null, error: 'file field is required and must be a File' },
        { status: 400 },
      );
    }

    const extension = file.name.includes('.') ? '.' + file.name.split('.').pop()!.toLowerCase() : '';
    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        { ok: false, data: null, error: 'Unsupported file type. Use CSV or Excel.' },
        { status: 400 },
      );
    }

    const bucket = (formData.get('bucket') as string) || 'uploads';
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `incoming/${Date.now()}-${safeName}`;
    const storageResult = await uploadFileToStorage(bucket, storagePath, file);

    let parsed;
    try {
      const text = await file.text();
      parsed = parseAndValidateUpload(text);
    } catch (e) {
      return NextResponse.json(
        { ok: false, data: null, error: 'Failed to parse uploaded file' },
        { status: 400 },
      );
    }

    const supabase = await createSupabaseServerClient();
    let persisted = 0;
    const errors = parsed.errors.slice(0, 10);

    await persistUploadResult(
      parsed,
      async (row) => {
        const { data: courses } = await supabase
          .from('courses')
          .select('id, institution_id')
          .eq('subject', row.subject)
          .eq('course_number', row.course_number)
          .eq('section', row.section)
          .limit(1);

        const course = courses?.[0];
        if (!course) {
          throw new Error(`Course not found: ${row.subject} ${row.course_number} ${row.section}`);
        }

        await createEnrollment(
          {
            course_id: course.id,
            enrolled: Number(row.enrolled),
            waitlist: Number(row.waitlist),
            capacity: Number(row.capacity),
            snapshot_at: row.snapshot_at,
            student_count: Number(row.student_count),
          },
          supabase,
        );
        persisted++;
      },
    );

    return NextResponse.json(
      {
        ok: true,
        data: {
          path: storageResult.path,
          filename: file.name,
          valid_count: parsed.valid.length,
          error_count: parsed.errors.length,
          persisted_count: persisted,
          errors,
        },
        error: null,
      },
      { status: 201 },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unexpected server error';
    return NextResponse.json({ ok: false, data: null, error: message }, { status: 500 });
  }
}
