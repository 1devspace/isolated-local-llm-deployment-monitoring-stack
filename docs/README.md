# LLM Stack Documentation Site

This directory contains the React-based documentation site for the Isolated Local LLM Deployment & Monitoring Stack, built with [Docusaurus](https://docusaurus.io/).

## 🚀 Quick Start

### Installation

```bash
cd docs
npm install
```

### Local Development

```bash
npm start
```
This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```bash
npm run build
```
This command generates static content into the `build` directory and can be served using any static contents hosting service.

## 📁 Project Structure

```
docs/
├── blog/                   # Blog posts
│   ├── 2024-01-01-welcome.md
│   └── authors.yml
├── docs/                   # Documentation pages
│   ├── intro.md           # Getting Started
│   ├── llm-deployment.md  # LLM Deployment Guide
│   ├── monitoring.md      # Monitoring Stack Setup
│   ├── security.md        # Security & Network Isolation
│   └── troubleshooting.md # Troubleshooting Guide
├── src/
│   ├── components/        # React components
│   ├── css/              # Custom styles
│   └── pages/            # Custom pages (homepage)
├── static/               # Static assets
├── docusaurus.config.ts  # Site configuration
├── sidebars.ts          # Sidebar configuration
└── package.json         # Dependencies
```

## 🎨 Customization

### Theme Colors

The site uses a custom AI/tech-focused color scheme defined in `src/css/custom.css`:

- **Primary**: Indigo/Purple gradients (#4f46e5 to #8b5cf6)
- **Hero Background**: Linear gradient from #667eea to #764ba2
- **Dark Mode**: Optimized for readability with lighter primary colors

### Configuration

Key configuration in `docusaurus.config.ts`:

- **Site Info**: Title, tagline, URL, baseUrl
- **GitHub Integration**: Organization, project name, edit URLs
- **Navigation**: Navbar items, footer links
- **Deployment**: GitHub Pages configuration

## 📝 Content Management

### Adding Documentation

1. Create a new `.md` file in the `docs/` directory
2. Add frontmatter with `sidebar_position` to control ordering:
   ```yaml
   ---
   sidebar_position: 6
   ---
   ```
3. The sidebar will automatically update based on the file structure

### Adding Blog Posts

1. Create a new `.md` file in the `blog/` directory
2. Use the naming convention: `YYYY-MM-DD-title.md`
3. Add frontmatter with metadata:
   ```yaml
   ---
   slug: my-blog-post
   title: My Blog Post Title
   authors: [mohamed]
   tags: [llm, docker, monitoring]
   ---
   ```

### Supported Features

- **Markdown**: Standard markdown syntax
- **MDX**: React components in markdown
- **Code Blocks**: Syntax highlighting for multiple languages
- **Admonitions**: Tips, warnings, info boxes (:::tip, :::warning, etc.)
- **Tabs**: Grouped content with tab interface
- **Mermaid Diagrams**: Network diagrams and flowcharts

## 🚀 Deployment

### GitHub Pages (Automatic)

The site automatically deploys to GitHub Pages when changes are pushed to the `main` branch, thanks to the GitHub Actions workflow in `.github/workflows/deploy-docs.yml`.

**Deployment URL**: `https://1devspace.github.io/isolated-local-llm-deployment-monitoring-stack/`

### Manual Deployment

To deploy manually to GitHub Pages:

```bash
GIT_USER=<GITHUB_USERNAME> npm run deploy
```

This command builds the website and pushes to the `gh-pages` branch.

### Other Hosting Platforms

The built site in the `build/` directory can be deployed to any static hosting service:

- **Netlify**: Connect GitHub repo and auto-deploy
- **Vercel**: Import project and deploy
- **AWS S3**: Upload build directory to S3 bucket
- **Docker**: Serve with nginx or Apache

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Serve production build locally
npm run serve

# Clear cache (if needed)
npm run clear

# Type check (TypeScript)
npm run typecheck

# Deploy to GitHub Pages
npm run deploy
```

## 🎯 SEO and Performance

The site is optimized for:

- **SEO**: Meta tags, structured data, sitemap
- **Performance**: Code splitting, lazy loading, optimized images
- **Accessibility**: Semantic HTML, keyboard navigation, screen reader support
- **Mobile**: Responsive design, touch-friendly interface

## 🛠️ Troubleshooting

### Common Issues

**Build fails with dependency errors:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Local development server won't start:**
```bash
npm run clear
npm start
```

**GitHub Pages deployment fails:**
- Check repository settings → Pages → Source is set to "GitHub Actions"
- Verify the workflow file has correct permissions
- Check Actions tab for deployment logs

### Getting Help

- [Docusaurus Documentation](https://docusaurus.io/docs)
- [GitHub Issues](https://github.com/1devspace/isolated-local-llm-deployment-monitoring-stack/issues)
- [Docusaurus Discord](https://discord.gg/docusaurus)

## 📊 Analytics and Monitoring

To add analytics to the site, configure in `docusaurus.config.ts`:

```typescript
// Google Analytics
gtag: {
  trackingID: 'GA_TRACKING_ID',
},

// Google Tag Manager  
googleTagManager: {
  containerId: 'GTM_CONTAINER_ID',
},
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/improve-docs`
3. **Make** your changes in the `docs/` directory
4. **Test** locally: `npm start`
5. **Commit** your changes: `git commit -am 'Improve documentation'`
6. **Push** to the branch: `git push origin feature/improve-docs`
7. **Create** a Pull Request

### Content Guidelines

- Use clear, concise language
- Include code examples where helpful
- Add screenshots for UI-related content
- Test all commands and procedures
- Use consistent formatting and style

---

Built with ❤️ using [Docusaurus](https://docusaurus.io/)