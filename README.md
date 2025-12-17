# SkreenPro

A powerful, beautiful screenshot editor built with Electron, React, and Konva. Edit your screenshots with professional tools including backgrounds, shadows, borders, and more.

[![SkreenPro Demo](https://img.youtube.com/vi/X2Qh-8EOp80/maxresdefault.jpg)](https://youtu.be/X2Qh-8EOp80)

> Click the image above to watch the demo video

## Features

- **Professional Editing Tools**
  - Custom backgrounds (solid colors or beautiful images)
  - Shadow effects with customizable blur and offset
  - Border styles and thickness control
  - Rounded corners
  - Padding and spacing adjustments

- **Cloud Integration**
  - Save and sync your edits with Supabase
  - OAuth authentication (GitHub & Google)
  - Access your work from anywhere

- **Native Desktop Experience**
  - Fast, native macOS application
  - Drag and drop support
  - System file dialogs
  - Smooth performance

## Download

Download the latest release for macOS:
- [SkreenPro-1.0.1-arm64.dmg](https://github.com/yourusername/skreenpro/releases) (Apple Silicon)
- [SkreenPro-1.0.1-arm64-mac.zip](https://github.com/yourusername/skreenpro/releases) (Apple Silicon - ZIP)

## Installation

### For Users

1. Download the `.dmg` file from the releases page
2. Open the DMG file
3. Drag SkreenPro to your Applications folder
4. Launch SkreenPro from Applications

**Note:** On first launch, you may need to right-click the app and select "Open" to bypass macOS Gatekeeper (unsigned app warning).

### For Developers

#### Prerequisites

- Node.js 18+ and npm
- macOS (for building macOS apps)
- Supabase account (for authentication features)

#### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/SkreenPro/SkreenPro.git
   cd skreenpro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run in development mode**
   ```bash
   npm run dev
   ```

   This will start both Vite dev server and Electron in development mode.

## Building

### Development Build

```bash
npm run build
```

This builds the React app to `dist/renderer/` and copies necessary files.

### Production Build

```bash
npm run dist
```

This creates distributable files:
- `dist/SkreenPro-1.0.1-arm64.dmg` - DMG installer
- `dist/SkreenPro-1.0.1-arm64-mac.zip` - ZIP archive

## Project Structure

```
skreenpro/
├── electron.js              # Electron main process
├── src/
│   ├── preload/
│   │   └── preload.js      # Preload script for IPC
│   └── renderer/
│       ├── components/      # React components
│       ├── contexts/        # React contexts (Auth, Plan)
│       ├── lib/            # Utilities and libraries
│       └── main.tsx        # React entry point
├── public/
│   ├── icons/              # App icons
│   ├── bgs/                # Background images
│   └── *.JPG               # Login background
├── dist/
│   ├── renderer/           # Built React app
│   └── preload/            # Built preload script
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## Technology Stack

- **Electron** - Desktop application framework
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Konva & React-Konva** - Canvas manipulation
- **Supabase** - Backend and authentication
- **Radix UI** - Accessible UI components

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build React app
- `npm run dist` - Build production app with electron-builder
- `npm run electron` - Run Electron (after building)

## OAuth Setup

For authentication to work, you need to:

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Enable OAuth providers** (GitHub and Google) in your Supabase dashboard

3. **Configure redirect URLs** in Supabase:
   - For development: `http://localhost:5173`
   - For production: `skreenpro://auth/callback`

4. **Update environment variables** with your Supabase credentials

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines

1. **Code Style**
   - Use TypeScript for new files
   - Follow existing code conventions
   - Use Tailwind CSS for styling

2. **Commit Messages**
   - Use clear, descriptive commit messages
   - Follow conventional commits format

3. **Testing**
   - Test in both development and production builds
   - Verify OAuth flows work correctly
   - Check file size of production builds

### Areas for Contribution

- Windows and Linux support
- Additional export formats
- More background templates
- Performance optimizations
- UI/UX improvements
- Documentation improvements

## Known Issues

- Currently only supports macOS (Apple Silicon)
- Large background images may affect performance
- First-time OAuth requires system browser

## Roadmap

- [ ] Windows support
- [ ] Linux support
- [ ] Intel Mac support
- [ ] More editing tools (text, shapes)
- [ ] Batch processing
- [ ] Custom background uploads
- [ ] Keyboard shortcuts
- [ ] Auto-update functionality

## License

MIT License - see the [LICENSE](LICENSE) file for details

## Credits

Built with love using amazing open-source tools and libraries.

## Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Contribute fixes via Pull Requests

---

Made with ❤️ by the SkreenPro team
