# UAB CAREER LAUNCH 🚀

UAB CAREER LAUNCH is a premium, production-ready career platform and job search engine built with **Next.js 16 (App Router + Turbopack)**, **Prisma**, **MySQL**, and **Gemini AI**. It aggregates, indexes, and verifies job postings directly from corporate portals, eliminating spam and brokers.

---

## 🌟 Key Features

### 1. Job Aggregation & Verification
*   **Official Aggregation**: Search, filter, and view jobs harvested directly from official portals.
*   **Search Filters**: Filter by keywords (title, skills, description), category, contract type (Full-time, Part-time, Contract, Remote), location, and verified source badges.
*   **Anonymous Bookmarking**: Bookmark/save jobs instantly without registering or logging in. Saved jobs are stored locally in the browser's `localStorage` and can be filtered dynamically in the search sidebar.
*   **Outbound Redirection**: Seamlessly redirects candidates to external corporate job portals via a secure confirmation dialog.
*   **Analytics Tracking**: Transparently tracks job details view counts and outbound application click metrics.

### 2. Built-in Gemini AI Career Services
All AI features leverage `gemini-1.5-flash` with local rules-based simulation fallbacks if no API key is present:
*   **Interview Cheat-Sheet Generator**: Creates custom technical and behavioral interview preparation quizzes based on input skills and role.

### 3. Comprehensive Admin Dashboard
Accessible at `/admin` for administrators with secure authentication. Features include:
*   **Overview Panel**: Shows key platform KPIs (Total Jobs, Candidates, Redirect Clicks, Newsletter Subscribers) and dynamic analytical SVG charts detailing company clicks and top-viewed positions.
*   **Admin Audit Trail**: Logs critical actions (job/company edits, ad campaign adjustments) to an activity stream.
*   **Content Management (CMS)**: CRUD control over Jobs, Partner Companies, blogs, newsletter subscriptions, and placement resources.
*   **Ad Delivery Network**: Manages active banner/sidebar advertisement campaigns, tracking impressions and click counts.

---

## 🛠️ Technology Stack

*   **Framework**: Next.js 16 (Turbopack, App Router)
*   **Database ORM**: Prisma Client
*   **Database**: MySQL
*   **AI SDK**: `@google/generative-ai` (`gemini-1.5-flash`)
*   **Styling**: Modern Vanilla CSS with CSS Custom Properties and glassmorphic designs
*   **Testing**: Vitest unit testing framework
*   **Icons**: `lucide-react`

---

## 💾 Database Schema

The database consists of the following Prisma models:
*   **User**: Candidate profiles (skills, resume text) and Admin accounts.
*   **Company**: Partner companies (website, logo, description, verified status).
*   **Category**: Job categories (Software Engineering, Data Science, etc.).
*   **Job**: Postings referencing companies and categories. Tracks views and external apply URLs.
*   **Resource**: Markdown placement papers and interview question guides.
*   **Blog**: Article CMS entries.
*   **Bookmark**: User bookmarks on jobs and placement resources.
*   **Notification**: Real-time user alert notifications.
*   **NewsletterSubscriber**: Email signups.
*   **Advertisement**: Active ad campaigns (impressions, clicks, placement styles).
*   **JobClick**: Analytics tracking database for redirection logs.
*   **ActivityLog**: Audit trail for administrative actions.
*   **SystemSetting**: Key-value settings for global platform customization.

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory:
```env
DATABASE_URL="mysql://root:password@localhost:3306/career_launch"
JWT_SECRET="your-jwt-secret-key-goes-here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GEMINI_API_KEY="your-gemini-api-key"
```

> [!NOTE]
> If the `C:` drive runs out of storage, redirect your environment directories to the `D:` drive prior to executing build commands:
> ```powershell
> $env:TEMP="D:\temp"; $env:TMP="D:\temp"; $env:npm_config_cache="D:\npm-cache"
> ```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Push Database Schema & Generate Client
```bash
npx prisma db push
```

### 3. Seed Database
```bash
node prisma/seed.js
```

### 4. Run Unit Tests
```bash
npx vitest run
```

### 5. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🔐 Credentials

### Admin Account (Admin Panel)
*   **Email**: `admin@careerlaunch.com`
*   **Password**: `adminpassword123`

### Candidate Account
*   **Email**: `candidate@careerlaunch.com`
*   **Password**: `password123`

---

## 🔄 Next.js 16 Proxy Convention

This codebase follows Next.js 16's network boundary guidelines. 
*   The deprecated `src/middleware.ts` file has been migrated to [src/proxy.ts](file:///d:/CareerLaunch/src/proxy.ts).
*   Requests targeting administrative pathways (`/admin/:path*`) are checked using `export async function proxy`.
