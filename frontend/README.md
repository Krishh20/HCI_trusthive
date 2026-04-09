## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create your local environment file:

```bash
cp .env.example .env.local
```

If you are on Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

3. Fill these values in `.env.local`:

```env
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=replace-with-a-long-random-secret
GOOGLE_CLIENT_ID=replace-with-google-client-id
GOOGLE_CLIENT_SECRET=replace-with-google-client-secret
```

4. Start the frontend:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

## Google OAuth Setup

In Google Cloud Console:

- Create an OAuth 2.0 Client ID (Web application).
- Add authorized origin: `http://localhost:3001`
- Add authorized redirect URI: `http://localhost:3001/api/auth/callback/google`

These values must match your local setup exactly.

## NextAuth (App Router)

- Route handler: `app/api/auth/[...nextauth]/route.js`
- Global provider wrapper: `app/providers.jsx`
- Root integration: `app/layout.js`
- Login UI button: `app/login/page.js`

Use `useSession()` from `next-auth/react` anywhere in client components to access Google session data.
