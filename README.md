# Sarthi InvestMart - WhatsApp Live Dashboard

A modern, responsive WhatsApp Web-style dashboard built with **Next.js 14 (App Router)**, **Tailwind CSS**, and **TypeScript**, connected directly to the Sarthi InvestMart Cloudflare Workers backend.

---

## Features

- **Live WhatsApp Chat Inbox (`/`)**:
  - WhatsApp Web interface with familiar styling, message bubbles, and real-time polling (conversations every 5s, active chat messages every 3s).
  - Search conversation threads by name, phone number, or message text.
  - Delivery ticks: single grey check (sent), double grey check (delivered), double blue check (read), red error alert (failed).
  - Quick Canned Responses for financial advisors (e.g., greetings, request for portfolio details, advisor call confirmation).
  - Direct Human Advisor Messaging: send text messages directly through Meta's WhatsApp Cloud API.
  - **Resume Bot Button**: seamlessly switch between human advisor intervention and the automated Sarthi InvestMart AI conversational flow.
  - **Start New Chat**: initiate a chat directly to any WhatsApp number with country code.

- **Leads Board (`/leads`)**:
  - Filterable CRM board for all prospects gathered via the automated WhatsApp bot.
  - Filter by Service (Mutual Funds, Insurance, Loans, Tax Planning) and Status (New, Contacted, Qualified, Closed).
  - Inline status update dropdown connected to Cloudflare D1.
  - One-click "Open Chat" button to jump immediately into a live chat session with that lead.

---

## Setup & Running Locally

1. **Install Dependencies** (already installed):
   ```bash
   cd dashboard
   npm install
   ```

2. **Environment Variables**:
   Created in `.env.local`:
   ```env
   NEXT_PUBLIC_WORKER_URL=https://meta-whatsapp-webhook.dhruvangg.workers.dev
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Production Build**:
   ```bash
   npm run build
   npm run start
   ```

---

## Deployment

### Deploy to Vercel (Recommended)
1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Set the Root Directory to `dashboard`.
4. Add the Environment Variable `NEXT_PUBLIC_WORKER_URL = https://meta-whatsapp-webhook.dhruvangg.workers.dev`.
5. Deploy!

### Deploy to Cloudflare Pages
1. In Cloudflare Dashboard, go to **Workers & Pages** -> **Create application** -> **Pages**.
2. Connect Git repository, set build directory to `dashboard`, framework preset to `Next.js`.
3. Add `NEXT_PUBLIC_WORKER_URL = https://meta-whatsapp-webhook.dhruvangg.workers.dev`.
