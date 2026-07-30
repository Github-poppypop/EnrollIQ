import { NextResponse } from 'next/server';
import { parseAndValidateUpload, persistUploadResult, type PersistCallback } from '@/lib/services/upload-service';
import { uploadFileToStorage } from '@/lib/services/upload-service';

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

    const extension = file.name.includes('.')
      ? '.' + file.name.split('.').pop()!.toLowerCase()
      : '';

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

    return NextResponse.json(
      { ok: true, data: { path: storageResult.path, filename: file.name }, error: null },
      { status: 201 },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unexpected server error';
    return NextResponse.json({ ok: false, data: null, error: message }, { status: 500 });
  }
}
