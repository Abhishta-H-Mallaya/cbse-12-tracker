# CBSE Class 12 Detailed Question Tracker — Deployment & Database Guide

This guide explains how to deploy your application online for **100% free**, how the **database** works so anyone can use it, and how students can **download the app** to their mobile phones or laptops.

---

## 1. How the Database Works When Deployed

When you deploy this app on the web:
- **Local-First Isolated Database**: Every student who visits your web link gets their own **private, zero-latency database** automatically stored in their browser and device container (`localStorage` / `IndexedDB`).
- **Data Privacy**: Student A will never see or overwrite Student B's progress.
- **Zero Hosting Costs**: Because student records are stored on the user's device, you **do not pay any monthly database server fees**.
- **Offline Capable**: Students can study and track questions on planes, trains, or coaching without an internet connection.
- **Multi-Profile Support**: Students sharing the same computer can click the **Profile Switcher** in the top bar to create isolated profiles (e.g. *Anju*, *Brother*, *Friend*).
- **Cloud Backup & Restore**: Students can click **Backup** at any time to download their entire database as a JSON file, or click **Restore** to sync it across their phone and laptop.

---

## 2. How Anyone Can Download the App (PWA)

This application is built as a **Progressive Web App (PWA)**:
- **On Android & Chrome**: When users open the link, an automatic **"Download App"** button appears in the navigation bar. Clicking it installs the app as an Android app on their home screen!
- **On iPhone / iPad (Safari)**: Tap the **Share** button in Safari → Select **"Add to Home Screen"**. It opens in full-screen standalone mode without browser bars.
- **On Windows & Mac**: In Chrome or Edge, click the **"Download App"** button or the install icon in the address bar to install it as a native desktop program with its own dock/desktop icon.

---

## 3. How to Deploy Online for Free (Choose Any Option)

### Option A: Deploy to Vercel (Recommended — 2 Minutes)
1. Push your code to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "CBSE Class 12 Planner with Biology & PWA"
   # Create a repository on github.com and run:
   git remote add origin https://github.com/YOUR_USERNAME/cbse12-planner.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account.
3. Click **"Add New..."** → **"Project"**.
4. Import your `cbse12-planner` repository.
5. Vercel will automatically detect `vite` and the pre-configured `vercel.json`.
6. Click **"Deploy"**.
7. In ~30 seconds, Vercel gives you a free live URL (e.g., `https://cbse12-planner.vercel.app`) that anyone can open and install!

---

### Option B: Deploy to Netlify (Drag & Drop or Git)
1. Build the production folder locally:
   ```bash
   npm run build
   ```
2. Go to [netlify.com](https://www.netlify.com/) and log in.
3. Drag and drop the `dist` folder into the Netlify dashboard.
4. Netlify will instantly host your app on a free `.netlify.app` domain.

---

### Option C: Run Locally on Your Network (Wi-Fi Sharing)
To test or use on your phone right now while on the same Wi-Fi network:
```bash
npm run dev -- --host
```
Vite will show a network URL (e.g., `http://192.168.1.X:3000`). Open that URL on your mobile phone's browser to use and install the app immediately!

---

## 4. Optional: Connecting a Cloud Database (Supabase / Firebase)

If you ever want students to log in with Google accounts and sync data across all devices automatically:
1. Create a free project at [supabase.com](https://supabase.com).
2. Create a table:
   ```sql
   create table user_planner_state (
     user_id uuid references auth.users not null primary key,
     profile_data jsonb not null,
     updated_at timestamp with time zone default timezone('utc'::text, now()) not null
   );
   ```
3. In `PlannerContext.tsx`, you can sync the exported JSON object to this table upon login.
