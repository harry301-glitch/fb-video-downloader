# Facebook Video Downloader

A modern, fast, mobile-first, and SEO-optimized web application built to download publicly accessible Facebook videos and reels in HD (1080p/720p) and SD MP4 formats.

Connected GitHub Repository:  
[https://github.com/harry301-glitch/fb-video-downloader](https://github.com/harry301-glitch/fb-video-downloader)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Local Development](#local-development)
6. [Environment Variables](#environment-variables)
7. [Backend Architecture & API](#backend-architecture--api)
8. [Adsterra Monetization Integration](#adsterra-monetization-integration)
9. [Google Analytics 4 & Search Console](#google-analytics-4--search-console)
10. [Netlify Deployment Guide](#netlify-deployment-guide)
11. [GitHub Workflow](#github-workflow)
12. [Security, Ethics & Compliance](#security-ethics--compliance)

---

## 1. Project Overview

**Facebook Video Downloader** is designed as a SaaS-grade utility for digital archivists, content creators, educators, and social media managers who need reliable offline backups of public Facebook media.

### Ethical & Legal Guardrails
- **Public & Authorized Content Only**: Strictly resolves video URLs that are publicly accessible.
- **No Login Bypass**: Does NOT bypass private accounts, friend-restricted posts, closed groups, logins, DRM, paywalls, or encryption.
- **Zero Credential Collection**: Users are never prompted for Facebook passwords, personal tokens, or session cookies.
- **Transient Memory Processing**: Video URLs submitted by users are processed in-memory and are never stored or logged into permanent databases.

---

## 2. Key Features

- **Responsive & Mobile-First**: Built from the ground up to render flawlessly on iPhone Safari, Android Chrome, tablets, and desktop workstations.
- **High-Definition (HD) & SD MP4 Streams**: Extracts the highest available video bitrate directly from public CDN manifests.
- **Native Attachment Downloader**: Includes a safe download proxy endpoint (`/api/download`) that sets `Content-Disposition: attachment` so files save directly to user devices.
- **Direct Clipboard Integration**: One-click paste and clear controls.
- **SEO & Social Cards**: Comprehensive OpenGraph meta, Twitter large cards, canonical tags, and Schema.org structured data (`WebApplication`, `WebSite`, and `FAQPage`).
- **Pre-configured Adsterra Containers**: Dedicated, non-intrusive reserved ad containers styled to avoid Cumulative Layout Shift (CLS).
- **Comprehensive Knowledge Base**: 10 detailed FAQ items, visual user tutorials, mission page, contact form, and legal documentation.

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, React Router v7
- **Backend / API**: Express 4, Node.js HTTP stream pipeline
- **Serverless Ready**: Native Netlify Function (`netlify/functions/facebook-video.ts`) and `netlify.toml`
- **Build Tool**: Vite 8 with `@tailwindcss/vite`

---

## 4. Project Structure

```text
├── .env.example                     # Environment variables template
├── index.html                       # SEO-optimized HTML entry point with JSON-LD
├── metadata.json                    # AI Studio applet metadata
├── netlify.toml                     # Netlify build and redirect routing configuration
├── package.json                     # Scripts and dependencies
├── server.ts                        # Full-stack Express server with Vite middleware
├── tsconfig.json                    # TypeScript compiler configuration
├── vite.config.ts                   # Vite configuration
│
├── api/
│   └── facebook-video.ts            # Standalone API handler
│
├── netlify/
│   └── functions/
│       └── facebook-video.ts        # Netlify serverless function handler
│
├── public/
│   ├── robots.txt                   # Search crawler directives
│   └── sitemap.xml                  # XML Sitemap for search engines
│
└── src/
    ├── components/
    │   ├── AdContainer.tsx          # Reserved Adsterra advertisement containers
    │   ├── DownloaderCard.tsx       # Primary input & download submission card
    │   ├── FaqAccordion.tsx         # Interactive accessible FAQ accordion
    │   ├── Footer.tsx               # Site footer with disclaimer & links
    │   ├── Navbar.tsx               # Responsive header with mobile drawer
    │   ├── ResultCard.tsx           # Video preview & MP4 download selectors
    │   └── SEOHead.tsx              # Dynamic page title, meta & canonical manager
    ├── data/
    │   └── faqData.ts               # 10 core FAQ questions & Schema.org generator
    ├── pages/
    │   ├── AboutPage.tsx            # Mission, architecture & non-affiliation
    │   ├── ContactPage.tsx          # Support & inquiry form
    │   ├── DisclaimerPage.tsx       # Legal disclaimer & DMCA notice process
    │   ├── FaqPage.tsx              # Searchable FAQ page with category filters
    │   ├── HomePage.tsx             # Main hero, downloader, steps & features
    │   ├── HowItWorksPage.tsx       # Visual guide for iOS, Android, and Desktop
    │   ├── PrivacyPolicyPage.tsx    # Privacy policy (data minimization, cookies, ads)
    │   └── TermsPage.tsx            # Terms of service & responsible use guidelines
    ├── server/
    │   └── extractor.ts             # SSRF defense, rate limiter, and public stream parser
    ├── services/
    │   └── api.ts                   # Client-side API request service & error mapping
    ├── utils/
    │   └── analytics.ts             # Google Analytics 4 event dispatcher
    ├── App.tsx                      # Route declarations
    ├── index.css                    # Tailwind CSS imports
    └── main.tsx                     # React root mount
```

---

## 5. Local Development

### Prerequisites
- Node.js (v18 or v20+)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/harry301-glitch/fb-video-downloader.git
cd fb-video-downloader

# Install dependencies
npm install

# Start local full-stack development server (Port 3000)
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Compile client assets and build bundle
npm run build

# Start production server
npm run start
```

---

## 6. Environment Variables

Copy `.env.example` to `.env` or configure variables in your hosting provider's dashboard:

```env
# Server Port (Default: 3000)
PORT=3000

# Canonical Site URL (Used for SEO, canonical tags, and sitemaps)
VITE_SITE_URL="https://fb-video-downloader.netlify.app"

# Optional: Google Analytics 4 Measurement ID
VITE_GA_MEASUREMENT_ID="G-XXXXXXXXXX"

# Optional: Google Search Console verification meta tag
VITE_GSC_VERIFICATION=""

# Optional: Set to "true" to activate Adsterra script containers
VITE_ADSTERRA_ENABLED="false"
```

---

## 7. Backend Architecture & API

### Endpoint: `POST /api/facebook-video`

Extracts public video details and stream formats.

#### Request Headers
```http
Content-Type: application/json
```

#### Request Payload
```json
{
  "url": "https://www.facebook.com/watch/?v=123456789"
}
```

#### Successful Response (`200 OK`)
```json
{
  "success": true,
  "title": "Example Public Facebook Video",
  "thumbnail": "https://scontent.xx.fbcdn.net/...",
  "duration": "2:45",
  "formats": [
    {
      "quality": "HD",
      "format": "MP4",
      "url": "https://video.xx.fbcdn.net/..."
    },
    {
      "quality": "SD",
      "format": "MP4",
      "url": "https://video.xx.fbcdn.net/..."
    }
  ]
}
```

#### Error Responses
- **400 Bad Request**: `"Please enter a valid public Facebook video URL."`
- **400 Bad Request**: `"This Facebook URL is not currently supported."`
- **403 / 404 Not Found**: `"This video appears to be private or unavailable."`
- **422 Unprocessable**: `"We couldn't process this video right now. Please try again later."`
- **429 Too Many Requests**: `"Too many requests. Please wait a moment and try again."` (Rate limit: 5 requests per IP per minute)

### Endpoint: `GET /api/download`

Streams authorized Facebook CDN videos with `Content-Disposition: attachment` to trigger browser download dialogues.

```http
GET /api/download?url=https%3A%2F%2Fvideo.xx.fbcdn.net%2F...&filename=My_Video_HD.mp4
```

---

## 8. Adsterra Monetization Integration

The layout includes four designated ad containers styled with fixed aspect boxes to prevent layout shifts:

1. `<!-- ADSTERRA_TOP_BANNER -->` (Below Header / Above Hero)
2. `<!-- ADSTERRA_CONTENT_BANNER -->` (Immediately below Downloader Card)
3. `<!-- ADSTERRA_IN_ARTICLE_BANNER -->` (Between content sections)
4. `<!-- ADSTERRA_FOOTER_BANNER -->` (Above Footer)

### How to insert your Adsterra ad tags:
1. Open `src/components/AdContainer.tsx`.
2. Locate the `useEffect` hook or paste your Adsterra JavaScript snippets into the container corresponding to the slot (`TOP`, `CONTENT`, `IN_ARTICLE`, or `FOOTER`).
3. Set `VITE_ADSTERRA_ENABLED="true"` in your environment variables.

---

## 9. Google Analytics 4 & Search Console

### Google Analytics 4 (GA4)
Set your Measurement ID in `.env`:
```env
VITE_GA_MEASUREMENT_ID="G-ABC123XYZ"
```
The application automatically tracks the following non-PII events:
- `download_attempt`: Dispatched when a user submits a URL (records source domain).
- `download_success`: Dispatched when public streams are resolved (records quality and format).
- `download_error`: Dispatched on extraction errors or private videos.
- `quality_selected`: Dispatched when a user clicks "Download HD" or "Download SD".

### Google Search Console
Add your verification code in `index.html` or configure via `VITE_GSC_VERIFICATION`.

---

## 10. Netlify Deployment Guide

This project is pre-configured for instant zero-configuration deployment to Netlify:

1. Log in to [Netlify](https://www.netlify.com).
2. Click **Add new site** > **Import an existing project**.
3. Connect your GitHub account and select:
   `https://github.com/harry301-glitch/fb-video-downloader`
4. Netlify will automatically detect settings from `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
5. Under **Environment variables**, set:
   - `VITE_SITE_URL`: Your production Netlify URL (e.g., `https://fb-video-downloader.netlify.app`)
   - `VITE_GA_MEASUREMENT_ID`: Your GA4 ID (optional)
6. Click **Deploy Site**.

---

## 11. GitHub Workflow

To sync updates to your GitHub repository:

```bash
# Add all files
git add .

# Commit changes
git commit -m "feat: complete production-ready Facebook Video Downloader"

# Set remote if not already configured
git remote add origin https://github.com/harry301-glitch/fb-video-downloader.git

# Push to main branch
git push -u origin main
```

Whenever you push to `main`, Netlify automatically builds and redeploys the site.

---

## 12. Security, Ethics & Compliance

- **SSRF Defense**: The backend verifies hostnames against an allowlist of valid Facebook domains (`facebook.com`, `fb.watch`, etc.) and rejects private IP ranges, loopback addresses (`127.0.0.1`, `localhost`), and internal metadata endpoints.
- **Strict Rate Limiting**: Maximum 5 requests per IP per minute using a memory-efficient sliding-window rate limiter.
- **No Permanent Logging**: We do not store submitted URLs, user IP maps, or extracted video streams.
- **Trademark Notice**: This service is an independent third-party tool and is not affiliated, endorsed, or partnered with Meta Platforms, Inc. or Facebook.
- **Copyright Compliance**: Users are solely responsible for ensuring they have appropriate rights, permissions, or fair-use justification for all downloaded content.
