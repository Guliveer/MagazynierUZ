# MagazynierUZ - Warehouse Management System

A modern, full-featured warehouse management system built with Next.js 16, React 19, and TypeScript.

## 🚀 Features

- **User Authentication & Authorization** - Secure JWT-based authentication with role-based access control
- **Internationalization (i18n)** - Multi-language support (English, Polish) with easy extensibility
- **Light/Dark Theme** - System-aware theme switching with persistent preferences
- **hCaptcha Integration** - Bot protection on login and registration
- **Remember Me** - Encrypted credential storage for persistent login
- **Admin Panel** - Comprehensive admin interface for managing users and organisations
- **Warehouse Management** - Create, edit, and manage warehouses with interactive maps
- **Warehouse Caching** - Optimized performance with data caching
- **Location Management** - Organize warehouse storage with flexible location types
- **Product Management** - Advanced product search, filtering, and CRUD operations
- **Search History** - Track and display recent product searches
- **Token Refresh** - Proactive session management with user-friendly warnings
- **Statistics & Reporting** - Real-time dashboards and PDF export capabilities
- **CSV Export** - Export statistics data to CSV format
- **Auto-Refresh Statistics** - Real-time data updates every 30 seconds
- **Multiple Chart Views** - Bar and pie chart visualizations
- **Responsive Design** - Mobile-friendly interface with modern UI components

## 🛠️ Technology Stack

### Frontend

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **Internationalization**: next-intl
- **Theme System**: next-themes
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Maps**: Leaflet
- **Security**: @hcaptcha/react-hcaptcha
- **Date Handling**: date-fns
- **Notifications**: Sonner (toast notifications)

### Backend API

- RESTful API with JWT authentication
- Comprehensive Swagger documentation
- 45 endpoints (30 implemented in UI)

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running at the URL specified in NEXT_PUBLIC_BACKEND_HOST environment variable

### Installation

1. Clone the repository:

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
cp .env.example .env.local
```

4. Configure environment variables:

```env
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=your_hcaptcha_site_key_here
HCAPTCHA_SECRET_KEY=your_hcaptcha_secret_key_here
NEXT_PUBLIC_BACKEND_HOST=http://localhost:8080
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm run start
```

## 📖 Usage

### Key Features

#### For Regular Users

- Search and filter products across warehouses
- View warehouse details and locations
- Manage products within assigned warehouses
- Export inventory reports to PDF
- View statistics and top products

#### For Administrators

- Manage users (create, edit, delete, assign roles)
- Manage organisations (create, edit, delete with dependency checking)
- View system-wide statistics
- Access all user features

### Quick Test

```bash
npm run build
```

All tests should pass with no TypeScript errors.

## 🌍 Internationalization & Theming

MagazynierUZ supports multiple languages and theme modes:

- **Languages**: English (default), Polish
- **Themes**: Light, Dark, System (auto-detect)
- **Locale Switcher**: Available on all pages
- **Theme Switcher**: Accessible in the dashboard navigation

For detailed information on how to use, customize, and extend the i18n and theme systems, see the [**Internationalization and Theme System Guide**](docs/I18N_AND_THEME_GUIDE.md).

### Quick Links

- [How to add new translations](docs/I18N_AND_THEME_GUIDE.md#adding-new-translations)
- [How to add a new language](docs/I18N_AND_THEME_GUIDE.md#adding-a-new-language)
- [How to customize theme colors](docs/I18N_AND_THEME_GUIDE.md#customizing-theme-colors)
- [Troubleshooting guide](docs/I18N_AND_THEME_GUIDE.md#troubleshooting)

## � UI Components

Built with [shadcn/ui](https://ui.shadcn.com/) components:

- Forms, Dialogs, Tables
- Cards, Badges, Buttons
- Alerts, Toasts, Skeletons
- Charts, Maps, Navigation
