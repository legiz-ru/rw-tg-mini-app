import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { validateInitData } from '@/lib/telegram';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Get initData from headers or query params for validation
    const authHeader = request.headers.get('authorization');
    const initDataParam = request.nextUrl.searchParams.get('initData');
    
    let initData: string | null = null;
    if (authHeader?.startsWith('Bearer ')) {
      initData = authHeader.slice(7);
    } else if (initDataParam) {
      initData = initDataParam;
    }

    // For now, serve assets without strict authentication in development
    // In production, you might want to implement session-based auth
    // or require initData validation for each request
    
    const filePath = params.path.join('/');
    const fullPath = join(process.cwd(), 'public', 'assets-protected', filePath);
    
    try {
      const fileContent = await readFile(fullPath);
      
      // Determine content type based on file extension
      const ext = filePath.split('.').pop()?.toLowerCase();
      let contentType = 'application/octet-stream';
      
      switch (ext) {
        case 'json':
          contentType = 'application/json';
          break;
        case 'js':
          contentType = 'application/javascript';
          break;
        case 'css':
          contentType = 'text/css';
          break;
        case 'html':
          contentType = 'text/html';
          break;
        case 'png':
          contentType = 'image/png';
          break;
        case 'jpg':
        case 'jpeg':
          contentType = 'image/jpeg';
          break;
        case 'svg':
          contentType = 'image/svg+xml';
          break;
      }

      return new Response(new Uint8Array(fileContent), {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    } catch (fileError) {
      console.error(`[ASSET_ERROR] File not found: ${fullPath}`);
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('[ASSET_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}