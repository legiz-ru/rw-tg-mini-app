import { NextRequest, NextResponse } from 'next/server';
import { validateInitData } from '@/lib/telegram';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { initData } = await request.json();

    if (!initData || !validateInitData(initData, process.env.TELEGRAM_BOT_TOKEN!)) {
      console.error('[AUTH] Failed to validate initData hash or initData is missing.');
      return NextResponse.json(
        { status: 'INVALID', redirectUrl: '/buy' },
        { status: 403 }
      );
    }

    const params = new URLSearchParams(initData);
    const user = JSON.parse(params.get('user') || '{}');
    const telegramId = user.id;

    if (!telegramId) {
      console.error('[AUTH] Telegram ID not found in initData.');
      return NextResponse.json(
        { status: 'ERROR', message: 'Telegram ID not found' },
        { status: 400 }
      );
    }

    try {
      const headers: Record<string, string> = { 
        'Authorization': `Bearer ${process.env.REMNAWAVE_TOKEN}` 
      };
      
      if (process.env.AUTH_API_KEY) {
        headers['X-Api-Key'] = process.env.AUTH_API_KEY;
      }
      
      if (process.env.REMNAWAVE_PANEL_URL?.startsWith('http://')) {
        headers['X-Forwarded-For'] = '127.0.0.1';
        headers['X-Forwarded-Proto'] = 'https';
      }

      const userResponse = await axios.get(
        `${process.env.REMNAWAVE_PANEL_URL}/api/users/by-telegram-id/${telegramId}`,
        { headers }
      );
      
      const userData = userResponse.data.response?.[0];

      if (userData && userData.status === 'ACTIVE') {
        const subInfoResponse = await axios.get(
          `${process.env.REMNAWAVE_PANEL_URL}/api/sub/${userData.shortUuid}/info`,
          { headers }
        );
        
        return NextResponse.json({
          status: 'ACTIVE',
          data: subInfoResponse.data
        });
      } else {
        return NextResponse.json({
          status: 'INACTIVE',
          redirectUrl: '/buy'
        });
      }
    } catch (error: any) {
      console.error('[API_ERROR]', error.message);
      
      // If user not found (404), show buy page
      if (error.response && error.response.status === 404) {
        console.log('[AUTH] User not found in Remnawave, redirecting to buy page');
        return NextResponse.json({
          status: 'INACTIVE',
          redirectUrl: '/buy'
        });
      }
      
      // For other errors - redirect to buy page
      return NextResponse.json(
        { status: 'ERROR', redirectUrl: '/buy' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[VALIDATION_ERROR]', error);
    return NextResponse.json(
      { status: 'ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}