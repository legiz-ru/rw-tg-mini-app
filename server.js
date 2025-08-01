const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const session = require('express-session');

const app = express();
const port = 3020;

// --- Загрузка переменных окружения ---
const {
    REMNAWAVE_TOKEN,
    BUY_LINK,
    AUTH_API_KEY,
    REMNAWAVE_PANEL_URL,
    META_TITLE,
    META_DESCRIPTION,
    CUSTOM_SUB_PREFIX,
    TELEGRAM_BOT_TOKEN,
    SESSION_SECRET // Новый секрет для сессий
} = process.env;

// --- Проверка обязательных переменных ---
if (!REMNAWAVE_TOKEN || !BUY_LINK || !REMNAWAVE_PANEL_URL || !META_TITLE || !META_DESCRIPTION || !TELEGRAM_BOT_TOKEN) {
    console.error("FATAL: Missing required environment variables. Check REMNAWAVE_*, BUY_LINK, META_*, and TELEGRAM_BOT_TOKEN.");
    process.exit(1);
}

// --- Настройка Middleware ---
app.use(express.json());

// Настройка сессий для хранения статуса аутентификации пользователя
app.use(session({
    secret: SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 } // Для production с HTTPS установите 'secure: true'
}));

// --- Middleware для защиты статичных файлов в /assets ---
const protectAssets = (req, res, next) => {
    if (req.session && req.session.userStatus === 'ACTIVE') {
        return next(); // Доступ разрешен
    }
    console.warn(`[ASSET_GUARD] Denied access to ${req.path} for unauthenticated user.`);
    return res.status(403).send('Access Denied');
};

// Применяем middleware защиты только к папке /assets
app.use('/assets', protectAssets, express.static(path.join(__dirname, 'public/assets')));
// Остальные статичные файлы в /public (если они будут) - доступны всем
app.use(express.static(path.join(__dirname, 'public')));


// --- Функция валидации initData ---
const validateInitData = (initData, botToken) => {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return false;
    params.delete('hash');

    const dataCheckString = Array.from(params.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    return calculatedHash === hash;
};

// --- Функция рендеринга шаблона ---
const renderTemplate = (filePath, placeholders) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, html) => {
            if (err) return reject(err);
            let renderedHtml = html;
            for (const key in placeholders) {
                renderedHtml = renderedHtml.replace(new RegExp(`<%= ${key} %>`, 'g'), placeholders[key]);
            }
            resolve(renderedHtml);
        });
    });
};


// --- Маршрут для валидации и отдачи контента ---
app.post('/auth/validate', async (req, res) => {
    const { initData } = req.body;

    if (!initData || !validateInitData(initData, TELEGRAM_BOT_TOKEN)) {
        console.error('[AUTH] Failed to validate initData hash or initData is missing.');
        req.session.destroy();
        return res.status(403).json({ status: 'INVALID', redirectUrl: '/buy' });
    }

    const params = new URLSearchParams(initData);
    const user = JSON.parse(params.get('user'));
    const telegramId = user.id;

    if (!telegramId) {
        console.error('[AUTH] Telegram ID not found in initData.');
        return res.status(400).json({ status: 'ERROR', message: 'Telegram ID not found' });
    }

    try {
        const headers = { 'Authorization': `Bearer ${REMNAWAVE_TOKEN}` };
        if (AUTH_API_KEY) headers['X-Api-Key'] = AUTH_API_KEY;
        if (REMNAWAVE_PANEL_URL.startsWith('http://')) {
            headers['X-Forwarded-For'] = '127.0.0.1';
            headers['X-Forwarded-Proto'] = 'https';
        }

        const userResponse = await axios.get(`${REMNAWAVE_PANEL_URL}/api/users/by-telegram-id/${telegramId}`, { headers });
        const userData = userResponse.data.response?.[0];

        if (userData && userData.status === 'ACTIVE') {
            const subInfoResponse = await axios.get(`${REMNAWAVE_PANEL_URL}/api/sub/${userData.shortUuid}/info`, { headers });
            const panelData = Buffer.from(JSON.stringify(subInfoResponse.data)).toString('base64');

            // Сохраняем статус в сессию - это ключ к /assets
            req.session.userStatus = 'ACTIVE';

            // Рендерим главный шаблон и отправляем его клиенту
            const finalHtml = await renderTemplate(path.join(__dirname, 'views', 'index.html'), {
                metaTitle: META_TITLE,
                metaDescription: META_DESCRIPTION,
                panelData: panelData
            });
            return res.json({ status: 'ACTIVE', html: finalHtml });

        } else {
            req.session.userStatus = 'INACTIVE';
            return res.json({ status: 'INACTIVE', redirectUrl: '/buy' });
        }
    } catch (error) {
        console.error('[API_ERROR]', error.message);
        req.session.userStatus = 'INACTIVE';
        return res.status(500).json({ status: 'ERROR', redirectUrl: '/buy' });
    }
});

// --- Маршруты для страниц ---
const mainRouteHandler = (req, res) => {
    const userAgent = req.headers['user-agent'] || '';
    if (!userAgent.toLowerCase().includes('telegram')) {
        return res.sendFile(path.join(__dirname, 'views', 'nontg.html'));
    }
    // Всегда отдаем `init.html`, который запустит процесс аутентификации
    res.sendFile(path.join(__dirname, 'views', 'init.html'));
};

app.get('/buy', async (req, res) => {
    try {
        const html = await renderTemplate(path.join(__dirname, 'views', 'buyLink.html'), {
            buyLink: BUY_LINK
        });
        res.send(html);
    } catch (error) {
        res.status(500).send('Error loading page');
    }
});

// --- Регистрация основных маршрутов ---
const subPrefix = CUSTOM_SUB_PREFIX ? `/${CUSTOM_SUB_PREFIX}` : null;
app.get('/', mainRouteHandler);
if (subPrefix) {
    app.get(subPrefix, mainRouteHandler);
    console.log(`Custom route prefix registered: ${subPrefix}`);
}

// --- Запуск сервера ---
app.listen(port, () => {
    console.log(`Telegram Mini App server started on http://localhost:${port}`);
});
