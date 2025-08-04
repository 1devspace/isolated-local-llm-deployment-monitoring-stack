import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: '🧠 Isolated Local LLM Stack',
  tagline: 'Fully automated solution for deploying LLMs locally with Docker, network isolation and real-time monitoring',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://mohamedaminehamdi.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/Isolated-Local-LLM-Deployment-Monitoring-Stack/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'mohamedaminehamdi', // Usually your GitHub org/user name.
  projectName: 'Isolated-Local-LLM-Deployment-Monitoring-Stack', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/mohamedaminehamdi/Isolated-Local-LLM-Deployment-Monitoring-Stack/tree/main/docs/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/mohamedaminehamdi/Isolated-Local-LLM-Deployment-Monitoring-Stack/tree/main/docs/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: '🧠 LLM Stack',
      logo: {
        alt: 'LLM Stack Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/mohamedaminehamdi/Isolated-Local-LLM-Deployment-Monitoring-Stack',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/intro',
            },
            {
              label: 'LLM Deployment',
              to: '/docs/llm-deployment',
            },
            {
              label: 'Monitoring Stack',
              to: '/docs/monitoring',
            },
          ],
        },
        {
          title: 'Project',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/mohamedaminehamdi/Isolated-Local-LLM-Deployment-Monitoring-Stack',
            },
            {
              label: 'Issues',
              href: 'https://github.com/mohamedaminehamdi/Isolated-Local-LLM-Deployment-Monitoring-Stack/issues',
            },
            {
              label: 'Contributing',
              href: 'https://github.com/mohamedaminehamdi/Isolated-Local-LLM-Deployment-Monitoring-Stack/blob/main/CONTRIBUTING.md',
            },
          ],
        },
        {
          title: 'Stack Components',
          items: [
            {
              label: 'Ollama',
              href: 'https://ollama.ai/',
            },
            {
              label: 'Open WebUI',
              href: 'https://github.com/open-webui/open-webui',
            },
            {
              label: 'Prometheus',
              href: 'https://prometheus.io/',
            },
            {
              label: 'Grafana',
              href: 'https://grafana.com/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Isolated Local LLM Stack. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
