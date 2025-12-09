# Telegram Channel Finder - Mini Web App

A modern, responsive Telegram Mini App for discovering channels and groups with advanced search and filtering capabilities.

## 🌟 Features

- **Advanced Search**: Search thousands of Telegram channels and groups
- **Smart Filters**: Filter by type (channels/groups), category, and language
- **Real-time Results**: Fast, responsive search with beautiful UI
- **Category Browse**: Explore channels by categories (Tech, News, Crypto, etc.)
- **Direct Integration**: Open channels directly in Telegram
- **Share Functionality**: Easily share discovered channels
- **Responsive Design**: Works perfectly on all devices
- **Telegram Theme**: Automatically adapts to user's Telegram theme

## 📁 Project Structure

```
web app/
├── index.html          # Main HTML structure
├── styles.css          # Advanced styling with Telegram theme support
├── app.js             # Application logic and Telegram WebApp integration
└── README.md          # This file
```

## 🚀 Deployment Options

### Option 1: GitHub Pages (Recommended for Testing)

1. Create a new GitHub repository
2. Upload the `web app` folder contents
3. Go to Settings → Pages
4. Select main branch as source
5. Your app will be available at: `https://yourusername.github.io/repo-name/`

### Option 2: Vercel (Free & Fast)

1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to the `web app` folder
3. Run: `vercel`
4. Follow the prompts
5. Get your deployment URL

### Option 3: Netlify

1. Go to [netlify.com](https://netlify.com)
2. Drag and drop the `web app` folder
3. Get your deployment URL instantly

### Option 4: Your Own Server

1. Upload files to your web server
2. Ensure HTTPS is enabled (required by Telegram)
3. Set proper CORS headers:
   ```
   Access-Control-Allow-Origin: https://web.telegram.org
   Content-Disposition: inline
   ```

## ⚙️ Bot Integration

### Step 1: Update Bot Configuration

Add to your bot's `settings.py` or configuration file:

```python
# Web App Configuration
WEB_APP_URL = "https://your-deployment-url.com"
```

### Step 2: Import and Setup Handlers

In your `main_modular.py`, add:

```python
from handlers.web_app_handlers import setup_web_app_handlers

# After creating the application
setup_web_app_handlers(application, Settings.WEB_APP_URL)
```

### Step 3: Update BotFather (Optional)

For the menu button feature:

1. Open [@BotFather](https://t.me/botfather)
2. Send `/setmenubutton`
3. Select your bot
4. Send button text: "🔍 Search Channels"
5. Send your web app URL

## 🔧 Configuration

### Environment Variables

Create a `.env` file in your bot directory:

```env
WEB_APP_URL=https://your-web-app-url.com
```

### Customize Search Sources

Edit `bot/services/web_app_search.py` to add more search sources:

```python
self.search_sources = [
    'https://telemetr.io/en/channels',
    'https://tgstat.com/search',
    'https://combot.org/telegram/top/chats',
    # Add more sources here
]
```

## 🎨 Customization

### Colors and Theme

Edit `styles.css` CSS variables:

```css
:root {
    --tg-theme-button-color: #2481cc;
    --tg-theme-link-color: #2481cc;
    /* Customize other colors */
}
```

### Categories

Edit `index.html` to add/remove categories:

```html
<select id="categorySelect" class="category-select">
    <option value="">All Categories</option>
    <option value="your-category">Your Category</option>
</select>
```

## 📱 Usage

### User Commands

- `/webapp` - Open the mini app
- `/search <query>` - Search channels (shows preview + web app link)
- `/trending` - View trending channels

### Web App Features

1. **Search Bar**: Enter keywords to search
2. **Type Filters**: Filter by All/Channels/Groups
3. **Category Filter**: Select specific categories
4. **Language Filter**: Filter by language
5. **Results**: Click cards to view details
6. **Actions**: Open in Telegram or Share

## 🔍 Search Algorithm

The search service uses multiple data sources:

1. **Telemetr.io**: Channel statistics and search
2. **TGStat.com**: Comprehensive channel database
3. **Combot.org**: Group and channel directory

Results are:
- Deduplicated by username
- Sorted by member count
- Filtered by user criteria
- Limited to prevent overload

## 🛡️ Security

### Data Validation

The bot validates all incoming web app data using Telegram's signature:

```python
# Automatic validation by python-telegram-bot
web_app_data = update.effective_message.web_app_data
data = json.loads(web_app_data.data)
```

### HTTPS Required

Telegram requires all web apps to be served over HTTPS. Free options:
- GitHub Pages (automatic HTTPS)
- Vercel (automatic HTTPS)
- Netlify (automatic HTTPS)
- Let's Encrypt (for custom servers)

## 🐛 Troubleshooting

### Web App Not Opening

1. Check HTTPS is enabled
2. Verify URL in bot configuration
3. Check browser console for errors
4. Ensure `telegram-web-app.js` is loading

### Search Not Working

1. Check backend service is running
2. Verify aiohttp is installed: `pip install aiohttp beautifulsoup4`
3. Check logs: `logs/bot.log`
4. Test search sources are accessible

### Theme Not Applying

1. Ensure `telegram-web-app.js` is loaded first
2. Check `tg.ready()` is called
3. Verify theme params in console: `console.log(tg.themeParams)`

## 📦 Dependencies

### Frontend (CDN)
- Telegram Web App JS (via CDN)

### Backend (Python)
```bash
pip install aiohttp beautifulsoup4 python-telegram-bot
```

## 🔄 Updates and Maintenance

### Update Search Sources

Regularly check if search source websites have changed their structure:

```python
# Test individual sources
python -c "
from bot.services.web_app_search import get_search_service
import asyncio

async def test():
    service = await get_search_service()
    results = await service.search_channels('test', limit=5)
    print(results)

asyncio.run(test())
"
```

### Monitor Performance

Check bot logs for errors:
```bash
tail -f logs/bot.log | grep "web_app"
```

## 📊 Analytics

Track usage by adding to your bot:

```python
# In web_app_handlers.py
async def web_app_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    # Log usage
    logger.info(f"User {user_id} opened web app")
    # Your analytics code here
```

## 🤝 Contributing

To improve the web app:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of your Telegram bot and follows your bot's license.

## 🆘 Support

For issues:
1. Check the troubleshooting section
2. Review bot logs
3. Test with Telegram's debug mode (Settings → Advanced → Debug)
4. Check Telegram WebApp documentation: https://core.telegram.org/bots/webapps

## 🎯 Roadmap

Future enhancements:
- [ ] Advanced filters (verification status, activity level)
- [ ] Channel recommendations based on user interests
- [ ] Bookmarking favorite channels
- [ ] Historical search data
- [ ] Multi-language interface
- [ ] Dark/Light theme toggle
- [ ] Export search results
- [ ] Channel comparison feature

## 📝 Notes

- The web app works entirely within Telegram - no external browser needed
- All data is processed through your bot's backend for security
- Search results are aggregated from multiple public sources
- No authentication required - uses Telegram's built-in auth

---

**Built with ❤️ for Telegram**
