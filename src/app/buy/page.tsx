'use client';

import { Container, Center, Stack, Title, Text, Button } from '@mantine/core';

export default function BuyPage() {
  const buyLink = process.env.NEXT_PUBLIC_BUY_LINK || process.env.BUY_LINK;

  return (
    <Container size="sm" py="xl">
      <Center>
        <Stack align="center" gap="xl">
          <Title order={2}>У вас нет активной подписки</Title>
          <Text size="lg" ta="center">
            Для продолжения, пожалуйста, приобретите подписку.
          </Text>
          <Button 
            component="a" 
            href={buyLink} 
            target="_blank"
            size="lg"
            color="blue"
          >
            Купить подписку
          </Button>
        </Stack>
      </Center>
    </Container>
  );
}