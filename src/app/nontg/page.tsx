'use client';

import { Container, Center, Stack, Title, Text } from '@mantine/core';

export default function NonTelegramPage() {
  return (
    <Container size="sm" py="xl">
      <Center>
        <Stack align="center" gap="xl">
          <Title order={2} c="red">Доступ запрещен</Title>
          <Text size="lg" ta="center">
            Пожалуйста, откройте это приложение внутри Telegram.
          </Text>
        </Stack>
      </Center>
    </Container>
  );
}