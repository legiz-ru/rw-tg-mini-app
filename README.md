# Remnawave Telegram Mini App - Next.js Migration

This project has been migrated from Express.js to Next.js 14 with modern Telegram Mini Apps SDK (@telegram-apps/sdk-react).

## 🚀 Key Features

- **Next.js 14 with App Router** - Modern React framework with server-side rendering
- **Modern Telegram SDK** - Uses @telegram-apps/sdk-react instead of direct telegram-web-app.js
- **Mantine UI** - Modern React components library
- **TypeScript** - Full type safety
- **No User-Agent Detection** - Authentication only through Telegram initData validation
- **Protected Assets** - API-based asset protection for authenticated users
- **Environment Variables** - Same configuration as Express version
- **Docker Support** - Multi-stage Docker build for production

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   └── assets/        # Protected asset serving
│   ├── buy/               # Buy subscription page
│   ├── nontg/             # Non-Telegram browser page
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Main application page
├── components/            # React components
│   └── TelegramProvider/  # Telegram SDK initialization
├── lib/                   # Utility functions
│   └── telegram.ts        # Telegram initData validation
├── styles/                # Global styles
├── types/                 # TypeScript definitions
└── ...
```

## 🔧 Installation & Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment file:
   ```bash
   cp .env-mini-app.example .env.local
   ```

3. Configure environment variables in `.env.local`:
   ```
   REMNAWAVE_PANEL_URL=https://panel.example.com
   REMNAWAVE_TOKEN=your_remnawave_api_token
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   BUY_LINK=https://t.me/your_channel
   META_TITLE=Your App Title
   META_DESCRIPTION=Your App Description
   AUTH_API_KEY=optional_api_key
   CUSTOM_SUB_PREFIX=optional_custom_prefix
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000

## 🐳 Docker Deployment

### Build & Run
```bash
# Build the image
docker build -t rw-tg-mini-app .

# Run with docker-compose
docker-compose up -d
```

### Environment File
Create `.env-mini-app` with your production values:
```
REMNAWAVE_PANEL_URL=https://your-panel.com
REMNAWAVE_TOKEN=your_production_token
TELEGRAM_BOT_TOKEN=your_bot_token
BUY_LINK=https://t.me/your_channel
META_TITLE=Production Title
META_DESCRIPTION=Production Description
AUTH_API_KEY=your_api_key
CUSTOM_SUB_PREFIX=your_prefix
```

## 🔄 Migration Changes

### From Express.js to Next.js
- **Routing**: Express routes → Next.js App Router
- **Templates**: EJS templates → React components
- **Middleware**: Express middleware → API route handlers
- **Static Files**: Express static → Next.js public + API routes
- **Sessions**: Express sessions → Stateless authentication

### Key Differences
1. **No User-Agent Detection**: Only uses Telegram initData for authentication
2. **Protected Assets**: Served via `/api/assets/[...path]` instead of middleware
3. **Modern UI**: Mantine components instead of basic HTML
4. **TypeScript**: Full type safety throughout the application
5. **SSR**: Server-side rendering with client-side hydration

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/validate` - Validate Telegram initData and get user status

### Protected Assets
- `GET /api/assets/[...path]` - Serve protected assets to authenticated users

## 🔐 Security

- **initData Validation**: Cryptographic validation of Telegram WebApp data
- **No User-Agent Reliance**: Secure Telegram detection via SDK only
- **Environment Variables**: Sensitive data in environment variables
- **Protected Assets**: API-controlled access to sensitive files

## 📱 Telegram Integration

The app uses modern Telegram Mini Apps SDK:
- Automatic SDK initialization
- Proper error handling for non-Telegram browsers
- Dark/light theme support
- Responsive design for all Telegram platforms

## 🚀 Deployment

1. **Build for production**:
   ```bash
   npm run build
   ```

2. **Start production server**:
   ```bash
   npm start
   ```

3. **Docker deployment**:
   ```bash
   docker-compose up -d
   ```

## 🐛 Troubleshooting

### Common Issues
1. **Build errors**: Ensure all dependencies are installed
2. **Telegram SDK errors**: Check that the app is accessed through Telegram
3. **Environment variables**: Verify all required variables are set
4. **API errors**: Check Remnawave panel connectivity and tokens

### Development Tips
- Use browser dev tools to debug Telegram WebApp integration
- Check server logs for API authentication issues
- Test with actual Telegram bot for full functionality

## 📝 TODO

- [ ] Add internationalization (i18n)
- [ ] Implement QR code generation
- [ ] Add installation guides
- [ ] Enhanced error handling
- [ ] Add tests
- [ ] Performance optimizations

## 🤝 Contributing

This is a migration of the existing Express.js application. The core functionality has been preserved while modernizing the tech stack.

## 📄 License

Same as the original project.