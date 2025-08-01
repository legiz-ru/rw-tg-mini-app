'use client';

import { useEffect, type PropsWithChildren } from 'react';
import { init } from '@telegram-apps/sdk-react';

export function TelegramProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    // Initialize Telegram Mini Apps SDK
    try {
      init();
    } catch (error) {
      console.error('Failed to initialize Telegram SDK:', error);
    }
  }, []);

  return <>{children}</>;
}