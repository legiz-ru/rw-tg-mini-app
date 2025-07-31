const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3020;

// Загрузка переменных окружения
const {
    REMNAWAVE_TOKEN,
    BUY_LINK,
    AUTH_API_KEY,
    REMNAWAVE_PANEL_URL,
    META_TITLE,
    META_DESCRIPTION
} = process.env;

// Проверка обязательных переменных окружения
if (!REMNAWAVE_TOKEN || !BUY_LINK || !REMNAWAVE_PANEL_URL || !META_TITLE || !META_DESCRIPTION) {
    console.error("Error: Missing required environment variables.");
    process.exit(1);
}

// Настройка статических файлов
app.use(express.static(path.join(__dirname, 'public')));

// Middleware для логирования запросов
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Основной маршрут
app.get('/', async (req, res) => {
    const telegramId = req.query.tgid; // Предполагаем, что ID передается как ?tgid=...

    if (!telegramId) {
        return res.status(400).send('Telegram ID is required.');
    }

    try {
        // --- 1. Запрос к Remnawave API для получения данных о пользователе ---
        const headers = {
            'Authorization': `Bearer ${REMNAWAVE_TOKEN}`,
        };

        if (AUTH_API_KEY) {
            headers['X-Api-Key'] = AUTH_API_KEY;
        }

        // Дополнительные заголовки, если URL - это http
        if (REMNAWAVE_PANEL_URL.startsWith('http://')) {
            headers['X-Forwarded-For'] = '127.0.0.1';
            headers['X-Forwarded-Proto'] = 'https';
        }

        const userResponse = await axios.get(`${REMNAWAVE_PANEL_URL}/api/users/by-telegram-id/${telegramId}`, { headers });

        // Проверяем, что пользователь найден и у него есть данные
        if (userResponse.data.response && userResponse.data.response.length > 0) {
            const user = userResponse.data.response[0];

            // --- 2. Проверка статуса пользователя ---
            if (user.status === 'ACTIVE') {
                // --- 3. Запрос информации о подписке ---
                const subInfoResponse = await axios.get(`${REMNAWAVE_PANEL_URL}/api/sub/${user.shortUuid}/info`, { headers });

                // Кодируем ответ в Base64
                const panelData = Buffer.from(JSON.stringify(subInfoResponse.data)).toString('base64');

                // Рендерим главный шаблон
                renderTemplate(res, 'index.html', {
                    metaTitle: META_TITLE,
                    metaDescription: META_DESCRIPTION,
                    panelData: panelData,
                });

            } else {
                // --- 4. Статус не ACTIVE, показываем страницу покупки ---
                renderTemplate(res, 'buyLink.html', {
                    buyLink: BUY_LINK,
                    metaTitle: META_TITLE,
                    metaDescription: META_DESCRIPTION
                });
            }
        } else {
            // Пользователь с таким Telegram ID не найден
             renderTemplate(res, 'buyLink.html', {
                buyLink: BUY_LINK,
                metaTitle: META_TITLE,
                metaDescription: META_DESCRIPTION
            });
        }
    } catch (error) {
        console.error('Error processing request:', error.message);
        // В случае любой ошибки API, показываем страницу покупки
        renderTemplate(res, 'buyLink.html', {
            buyLink: BUY_LINK,
            metaTitle: META_TITLE,
            metaDescription: META_DESCRIPTION
        });
    }
});

// Функция для рендеринга шаблонов
function renderTemplate(res, templateFile, data) {
    const templatePath = path.join(__dirname, 'views', templateFile);
    fs.readFile(templatePath, 'utf8', (err, html) => {
        if (err) {
            console.error(`Could not read template file ${templateFile}:`, err);
            return res.status(500).send('Server error');
        }

        let renderedHtml = html;
        for (const key in data) {
            renderedHtml = renderedHtml.replace(new RegExp(`<%= ${key} %>`, 'g'), data[key]);
        }
        res.send(renderedHtml);
    });
}


app.listen(port, () => {
    console.log(`Telegram Mini App server listening at http://localhost:${port}`);
});