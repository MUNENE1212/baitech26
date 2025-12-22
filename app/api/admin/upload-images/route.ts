import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Simple admin check - in production you'd want proper JWT verification
async function isAdmin(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.substring(7);
  // For now, we'll skip strict token validation and just check if token exists
  // In production, verify the JWT token here
  return token.length > 0;
}

// POST /api/admin/upload-images - Upload multiple images to Cloudinary
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    if (!formData) {
      return NextResponse.json(
        { success: false, error: 'No form data provided' },
        { status: 400 }
      );
    }

    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    // Validate file types and sizes
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: `File type ${file.type} is not allowed. Only JPEG, PNG, WebP, and AVIF images are allowed.` },
          { status: 400 }
        );
      }

      if (file.size > maxSize) {
        return NextResponse.json(
          { success: false, error: `File ${file.name} is too large. Maximum size is 5MB.` },
          { status: 400 }
        );
      }
    }

    // Upload files to Cloudinary
    const uploadPromises = files.map(async (file, index) => {
      const buffer = await file.arrayBuffer();

      return new Promise((resolve, reject) => {
        // Add timeout to prevent hanging
        const timeout = setTimeout(() => {
          reject(new Error('Upload timeout after 30 seconds'));
        }, 30000);

        console.log(`Starting upload for file ${index}: ${file.name}, size: ${file.size}, type: ${file.type}`);

        cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: 'baitech/products',
            public_id: `${Date.now()}-${index}-${file.name.replace(/\.[^/.]+$/, '')}`,
            transformation: [
              { quality: 'auto:good' },
              { fetch_format: 'auto' },
              { width: 1200, crop: 'limit' }
            ],
            timeout: 25000 // Cloudinary timeout
          },
          (error, result) => {
            clearTimeout(timeout);
            console.log(`Upload result for file ${index}:`, error ? error : 'Success');

            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              console.log('Cloudinary upload successful:', result?.secure_url);
              resolve({
                url: result?.secure_url,
                public_id: result?.public_id,
                original_filename: file.name,
                format: file.type.split('/')[1],
                size: file.size,
              });
            }
          }
        ).end(Buffer.from(buffer));
      });
    });

    const results = await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      data: results,
      message: `Successfully uploaded ${results.length} image(s)`,
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload images'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/upload-images/[publicId] - Delete image from Cloudinary
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    // Check if user is admin
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { publicId } = await params;

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'Public ID is required' },
        { status: 400 }
      );
    }

    // Delete image from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    });

  } catch (error) {
    console.error('Image deletion error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete image'
      },
      { status: 500 }
    );
  }
}