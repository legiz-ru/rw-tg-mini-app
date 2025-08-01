import type { PropsWithChildren } from 'react';
import type { Metadata } from 'next';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { TelegramProvider } from '@/components/TelegramProvider/TelegramProvider';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_META_TITLE || 'Telegram Mini App',
  description: process.env.NEXT_PUBLIC_META_DESCRIPTION || 'Secure Telegram Subscription Mini App',
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
        <script src="https://telegram.org/js/telegram-web-app.js" async />
      </head>
      <body>
        <MantineProvider>
          <Notifications />
          <TelegramProvider>
            {children}
          </TelegramProvider>
        </MantineProvider>
      </body>
    </html>
  );
}