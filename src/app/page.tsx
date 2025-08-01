'use client';

import { useState, useEffect } from 'react';
import { Container, Center, Stack, Title, Loader, Text, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';

interface UserData {
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
  data?: any;
  redirectUrl?: string;
  html?: string;
}

export default function HomePage() {
  const router = useRouter();
  const [initDataState, setInitDataState] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Use effect to get initData on client side only
  useEffect(() => {
    setMounted(true);
    try {
      // Get initData from the Telegram SDK
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        setInitDataState(window.Telegram.WebApp.initData);
      }
    } catch (error) {
      console.error('Error getting initData:', error);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const validateUser = async () => {
      try {
        setIsLoading(true);
        
        // Check if running in Telegram
        if (!initDataState) {
          setError('Приложение должно быть открыто в Telegram');
          return;
        }

        // Validate user with API
        const response = await fetch('/api/auth/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            initData: initDataState,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Validation failed');
        }

        setUserData(result);

        // Handle redirects
        if (result.redirectUrl) {
          router.push(result.redirectUrl);
        }

      } catch (err) {
        console.error('Validation error:', err);
        setError(err instanceof Error ? err.message : 'Произошла ошибка');
        notifications.show({
          title: 'Ошибка',
          message: 'Не удалось проверить данные пользователя',
          color: 'red',
        });
      } finally {
        setIsLoading(false);
      }
    };

    validateUser();
  }, [mounted, initDataState, router]);

  // Show loading until mounted on client
  if (!mounted || isLoading) {
    return (
      <Container size="sm" py="xl">
        <Center>
          <Stack align="center" gap="md">
            <Loader size="md" />
            <Text>Проверка данных...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="sm" py="xl">
        <Center>
          <Stack align="center" gap="md">
            <Title order={3} c="red">Ошибка</Title>
            <Text>{error}</Text>
            <Button onClick={() => window.location.reload()}>
              Попробовать снова
            </Button>
          </Stack>
        </Center>
      </Container>
    );
  }

  if (userData?.status === 'ACTIVE') {
    return (
      <Container size="sm" py="xl">
        <Stack gap="md">
          <Title order={2}>Ваши подписки</Title>
          <Text>У вас есть активная подписка</Text>
          {userData.data && (
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '1rem', 
              borderRadius: '5px',
              fontSize: '12px',
              overflow: 'scroll'
            }}>
              {JSON.stringify(userData.data, null, 2)}
            </pre>
          )}
        </Stack>
      </Container>
    );
  }

  if (userData?.status === 'INACTIVE') {
    return (
      <Container size="sm" py="xl">
        <Center>
          <Stack align="center" gap="md">
            <Title order={3}>У вас нет активной подписки</Title>
            <Text>Для продолжения, пожалуйста, приобретите подписку.</Text>
            <Button 
              component="a" 
              href={process.env.NEXT_PUBLIC_BUY_LINK || '#'} 
              target="_blank"
              size="lg"
            >
              Купить подписку
            </Button>
          </Stack>
        </Center>
      </Container>
    );
  }

  return null;
}