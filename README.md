# Edge Proxy

A self-hosted nginx configuration manager with a web UI. Create and manage HTTP proxies, load balancers, redirects, static hosts, SSL certificates, and reusable snippets — all without touching config files directly.

## Features

- **HTTP Hosts** — manage virtual host configurations
- **HTTP Proxies** — reverse proxy with optional SSL and role-based access control
- **Load Balancers** — distribute traffic across upstream servers
- **Redirects** — define HTTP redirects
- **Static Hosts** — serve static files or single-page applications
- **SSL Certificates** — manage TLS certificates
- **Snippets** — reusable nginx config fragments
- **Roles** — access control roles for proxied services
- **Authentication** — single admin account with session-based login

## Requirements

- Node.js 18+
- nginx installed on the host

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env` to `.env.local` and adjust as needed:

```bash
cp .env .env.local
```

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_PORT` | `8080` | Port the app listens on |
| `NEXT_PUBLIC_NGINX_PATH` | `/etc/nginx` | Root directory of your nginx installation |

### 3. Start the server

```bash
# Development
npm run dev

# Production
npm run build && npm start
```

### 4. First-time setup

Navigate to `http://localhost:8080` in your browser. On first run you will be redirected to `/setup` to create an admin account. After that you are logged in automatically.

## Data

All configuration is stored in the `data/` directory at the project root:

```
data/
  auth.json       # hashed admin credentials
  session.txt     # active session token
  http-hosts/     # nginx host configs
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) — password hashing
- [Lucide](https://lucide.dev/) — icons
