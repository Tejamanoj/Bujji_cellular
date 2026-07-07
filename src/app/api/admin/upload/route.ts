import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Try Cloudinary if config is present
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      try {
        console.log('[upload-api] Attempting Cloudinary upload...');
        const cloudinary = require('cloudinary').v2;
        cloudinary.config({
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret,
        });

        const uploadPromise = new Promise<{ secure_url: string }>((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'bujji_cellulars' },
            (error: any, result: any) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(buffer);
        });

        const cloudinaryResult = await uploadPromise;
        console.log('[upload-api] Cloudinary upload successful:', cloudinaryResult.secure_url);
        return NextResponse.json({ url: cloudinaryResult.secure_url });
      } catch (cloudinaryErr: any) {
        console.warn('[upload-api] Cloudinary upload failed, falling back to local storage:', cloudinaryErr.message);
      }
    }

    // 2. Fallback: Save file to local public/uploads directory
    console.log('[upload-api] Storing file locally in public/uploads...');
    const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, new Uint8Array(buffer));
    
    const localUrl = `/uploads/${filename}`;
    console.log('[upload-api] Local file saved:', localUrl);
    return NextResponse.json({ url: localUrl });

  } catch (err: any) {
    console.error('[upload-api] Upload error:', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
