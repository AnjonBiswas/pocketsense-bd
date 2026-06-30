# PocketSense Auth Setup Guide

This guide explains how to set up the new free authentication system for PocketSense.

The app now uses:

- `Email + password` with Supabase Auth
- Optional `Google sign-in` with Supabase OAuth

It no longer depends on paid SMS OTP providers like Twilio.

## What Is Already Implemented

These routes and flows are already built in the app:

- Login page: `/auth/login`
- Signup page: `/auth/signup`
- OAuth callback: `/auth/callback`
- Protected app area: `/dashboard`
- First-time user flow: `/onboarding`

Relevant files:

- [components/auth/AuthShell.tsx](D:/pocketsense-bd/components/auth/AuthShell.tsx)
- [lib/auth/actions.ts](D:/pocketsense-bd/lib/auth/actions.ts)
- [app/auth/callback/route.ts](D:/pocketsense-bd/app/auth/callback/route.ts)
- [middleware.ts](D:/pocketsense-bd/middleware.ts)

## 1. Supabase Project Requirements

Make sure your `.env.local` contains these values:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

If you only have the REST URL like:

```text
https://your-project-ref.supabase.co/rest/v1/
```

then your `NEXT_PUBLIC_SUPABASE_URL` should be:

```text
https://your-project-ref.supabase.co
```

Do not include `/rest/v1/` in the main Supabase URL.

## 2. Enable Email/Password Login

In your Supabase dashboard:

1. Open `Authentication`
2. Open `Providers`
3. Find `Email`
4. Enable `Email provider`

Recommended settings:

- Enable email/password sign-in
- Disable magic link if you do not want it
- Keep signup enabled

### Optional: Disable Email Confirmation

If you want the easiest flow for yourself:

1. Go to `Authentication`
2. Open `Providers`
3. Open `Email`
4. Turn off `Confirm email`

Result:

- User signs up
- User is logged in immediately
- User goes straight to onboarding

If email confirmation stays enabled:

- User signs up
- Supabase sends a confirmation email
- User must click the email link first
- Then user can log in

For your personal project, disabling email confirmation is usually the simplest option.

## 3. Database Expectations

The current code expects a `profiles` row for each authenticated user.

This is already handled by the app in these cases:

- Email signup
- Email login
- Google login callback

The app upserts a `profiles` row automatically if needed.

Fields especially important for auth flow:

- `id`
- `name`
- `phone` as optional profile/contact field
- `onboarding_completed`
- `onboarding_step`

## 4. Run the App Locally

Use:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000/auth/signup
```

or:

```text
http://localhost:3000/auth/login
```

## 5. Email/Password Flow

### Signup flow

1. Go to `/auth/signup`
2. Enter:
   - Name
   - Email
   - Password
   - Confirm password
3. Submit

Then:

- If email confirmation is off: user goes to onboarding directly
- If email confirmation is on: user must confirm email first

### Login flow

1. Go to `/auth/login`
2. Enter email and password
3. Submit

Then:

- If onboarding is incomplete, middleware sends user to `/onboarding`
- If onboarding is complete, middleware sends user to `/dashboard`

## 6. Google Sign-In Setup

Google sign-in is implemented in the app, but you must configure it in Supabase and Google Cloud.

### Step A: Enable Google in Supabase

In Supabase:

1. Open `Authentication`
2. Open `Providers`
3. Select `Google`
4. Enable it

Supabase will ask for:

- Google Client ID
- Google Client Secret

You will get these from Google Cloud Console.

### Step B: Create Google OAuth Credentials

In Google Cloud Console:

1. Create or open a project
2. Open `APIs & Services`
3. Open `Credentials`
4. Click `Create Credentials`
5. Choose `OAuth client ID`
6. If asked, configure the OAuth consent screen first
7. Choose application type:
   - `Web application`

Add an authorized redirect URI:

```text
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

Example:

```text
https://cbztxyrputjhhlznufqg.supabase.co/auth/v1/callback
```

After saving, Google gives you:

- Client ID
- Client Secret

Paste both into the Supabase Google provider settings.

### Step C: Save Provider Settings in Supabase

Back in Supabase Google provider settings:

1. Paste Client ID
2. Paste Client Secret
3. Save

That is enough for the app-side Google login button to work.

## 7. App Callback Flow for Google

The app uses:

```text
/auth/callback
```

Supabase completes the OAuth session, then sends the user back through the app callback route.

The callback route:

- exchanges the auth code for a session
- creates or updates the profile
- redirects to `/dashboard`

File:

- [app/auth/callback/route.ts](D:/pocketsense-bd/app/auth/callback/route.ts)

## 8. Recommended Supabase Auth URL Settings

Check your Supabase Auth URL configuration too.

In Supabase:

1. Open `Authentication`
2. Open URL/site settings

Set:

- `Site URL`
- `Redirect URLs`

For local development, include:

```text
http://localhost:3000
http://localhost:3000/auth/callback
```

For production, include your deployed domain, for example:

```text
https://yourdomain.com
https://yourdomain.com/auth/callback
```

## 9. Middleware Behavior

Current middleware rules:

- Unauthenticated users trying to open `/dashboard` are redirected to `/auth/login`
- Unauthenticated users trying to open `/onboarding` are redirected to `/auth/login`
- Logged-in users with incomplete onboarding are redirected to `/onboarding`
- Logged-in users visiting `/auth/login` or `/auth/signup` are redirected to `/dashboard`

File:

- [middleware.ts](D:/pocketsense-bd/middleware.ts)

## 10. Account Settings Behavior

The app now uses:

- email update
- password update

It no longer uses:

- phone OTP verification

Phone remains available only as an optional profile/contact field.

Files:

- [components/settings/AccountSettingsClient.tsx](D:/pocketsense-bd/components/settings/AccountSettingsClient.tsx)
- [components/settings/ProfileSettingsClient.tsx](D:/pocketsense-bd/components/settings/ProfileSettingsClient.tsx)

## 11. How To Test

### Test email signup

1. Start app with `npm run dev`
2. Open `/auth/signup`
3. Create a user
4. Confirm behavior:
   - direct onboarding if confirmation is off
   - email confirmation if confirmation is on

### Test email login

1. Open `/auth/login`
2. Login with the same email/password
3. Confirm redirect works

### Test Google sign-in

1. Confirm Google provider is enabled in Supabase
2. Confirm redirect URI in Google Console is exact
3. Open `/auth/login`
4. Click `Continue with Google`

If working correctly:

- Google popup/redirect appears
- Supabase creates session
- App returns to `/auth/callback`
- User lands in dashboard or onboarding

## 12. Common Problems

### Problem: `Invalid login credentials`

Cause:

- wrong email/password

Fix:

- retry with correct credentials
- create a fresh account if needed

### Problem: Signup works but login does not

Cause:

- email confirmation still enabled
- user did not confirm email yet

Fix:

- confirm the email
- or disable confirm email in Supabase

### Problem: Google button does nothing useful

Cause:

- Google provider not enabled in Supabase
- wrong redirect URI in Google Console
- missing Site URL / Redirect URLs in Supabase

Fix:

- recheck all three settings carefully

### Problem: `redirect_uri_mismatch`

Cause:

- Google redirect URI is not exactly the Supabase callback URI

Fix:

- make sure it is exactly:

```text
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

### Problem: User logs in but profile data is missing

Cause:

- profile row was not inserted previously

Fix:

- current code auto-upserts profile on login/signup/callback
- logging in again usually repairs it

## 13. Suggested Setup For You

For your case, the easiest low-cost setup is:

1. Keep `Email` auth enabled
2. Disable `Confirm email` for easier testing
3. Use email/password as the main login
4. Enable Google sign-in only if you want a smoother personal login
5. Ignore SMS auth completely

This gives you:

- no Twilio cost
- no OTP provider setup
- simple testing
- free auth path for development

## 14. Quick Checklist

- `NEXT_PUBLIC_SUPABASE_URL` is correct
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Email provider enabled in Supabase
- Confirm email disabled if you want instant signup
- Site URL configured in Supabase
- Redirect URLs configured in Supabase
- Google provider enabled in Supabase if using Google sign-in
- Google OAuth redirect URI points to Supabase callback
- App runs with `npm run dev`
- Login works at `/auth/login`
- Signup works at `/auth/signup`

## 15. Useful Links

- Supabase Auth docs: https://supabase.com/docs/guides/auth
- Supabase Google Auth docs: https://supabase.com/docs/guides/auth/social-login/auth-google
- Supabase pricing: https://supabase.com/pricing
- Google Cloud Console: https://console.cloud.google.com/
