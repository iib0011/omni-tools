# Intelligence Brief: Cloudflare Google OAuth for Production omni-tools

## Summary

The production omni-tools deployment at `omni-tools.eaglepass.io` can be protected with Cloudflare Zero Trust Access using Google OAuth and an email allowlist. The homelab already uses Cloudflare Zero Trust — `pages.eaglepass.io` redirects to Google OAuth via the team domain `brimdor.cloudflareaccess.com`. This means the Google IdP integration is already configured in Cloudflare, and the implementation task reduces to: (1) creating a Cloudflare Access Application for `omni-tools.eaglepass.io`, and (2) attaching an Allow policy with the 5 specified email addresses. No new Google Cloud Console project or OAuth client is needed — the existing one covers the entire `*.eaglepass.io` domain via the wildcard callback URL.

## Evidence

| Claim | Source | Confidence |
|---|---|---|
| Team domain is `brimdor.cloudflareaccess.com` | Direct observation: navigating to `pages.eaglepass.io` redirects to `https://accounts.google.com/...` with `client_id=412707333630-tf21nl42vo8k3rjlhqd5a7b2dlmfso6r.apps.googleusercontent.com` and `redirect_uri=https://brimdor.cloudflareaccess.com/cdn-cgi/access/callback` and `authDomain=brimdor.cloudflareaccess.com` | Certain |
| Google OAuth IdP is already configured in Cloudflare Zero Trust | The redirect to Google sign-in with a valid `client_id` and `authDomain=brimdor.cloudflareaccess.com` proves an active Google IdP integration exists in the Cloudflare Zero Trust dashboard | Certain |
| Production omni-tools values.yaml exists at `apps/omni-tools/values.yaml` in the homelab repo | Direct file inspection | Certain |
| The homelab uses Cloudflare tunnel (`cloudflared`) with wildcard `*.eaglepass.io` ingress to the nginx ingress controller | `system/cloudflared/values.yaml` line 33 | Certain |
| Production omni-tools ingress uses `external-dns` with Cloudflare-proxied DNS, targeting `homelab-tunnel.eaglepass.io` | `apps/omni-tools/values.yaml` lines 55-57 | Certain |
| Cloudflare Access policies support the "Emails" selector with individual addresses (not just domains) | Cloudflare Access policies documentation — selector "Emails" accepts `you@company.com` | Certain |
| Cloudflare Access policies support the "Emails ending in" selector for domain-wide access | Cloudflare Access policies documentation | Certain |
| Google IdP integration does NOT require Google Workspace — personal Gmail accounts work | Cloudflare docs: "You can integrate Google authentication with Cloudflare Access without a Google Workspace account" | Certain |
| Google OAuth consent screen must be set to "External" audience type when not using Google Workspace | Cloudflare Google IdP docs step 4 | Certain |
| Authorized JavaScript origins must include `https://<team-name>.cloudflareaccess.com` | Cloudflare Google IdP docs step 7 | Certain |
| Authorized redirect URIs must include `https://<team-name>.cloudflareaccess.com/cdn-cgi/access/callback` | Cloudflare Google IdP docs step 8 | Certain |

## Implementation Steps

### Prerequisites (Already Met)

1. **Cloudflare Zero Trust account** — Already active with team name `brimdor`
2. **Google OAuth IdP configured** — Already integrated (observed on `pages.eaglepass.io`)
3. **Google Cloud Console project** — Already exists with OAuth client ID `412707333630-tf21nl42vo8k3rjlhqd5a7b2dlmfso6r.apps.googleusercontent.com`
4. **Cloudflare tunnel** — Already running (`cloudflared` in homelab, wildcard `*.eaglepass.io` route)
5. **Production ingress** — Already deployed at `omni-tools.eaglepass.io` via nginx ingress + cert-manager + external-dns

### Step 1: Create a Cloudflare Access Application for omni-tools.eaglepass.io

In the Cloudflare Zero Trust dashboard (`https://one.dash.cloudflare.com`):

1. Navigate to **Access > Applications**
2. Click **Add an application**
3. Choose **Self-hosted** as the application type
4. Configure:
   - **Application name**: `omni-tools-production` (or similar descriptive name)
   - **Session Duration**: Choose appropriate duration (e.g., 24 hours)
   - **Application domain**: `omni-tools.eaglepass.io`
5. Click **Next** to proceed to policy creation

### Step 2: Create an Access Policy with Email Allowlist

After creating the application, you'll be prompted to create a policy:

1. **Policy name**: `omni-tools-family-allowlist`
2. **Action**: **Allow**
3. **Configure rules**:
   - **Include** rule:
     - Selector: **Emails**
     - Value: `chrisnelsonx@gmail.com`, `doreliz.nelson@gmail.com`, `anelsonx2005@gmail.com`, `anelsonx2014@gmail.com`, `gnelsonx2019@gmail.com`
4. Click **Save**

**Alternative approach using "Emails ending in"** (NOT recommended for this use case since the allowlist contains specific individuals, not a domain):

If all allowlisted emails shared a domain (they don't — all 5 are @gmail.com but we want specific people, not all of gmail), you could use "Emails ending in @gmail.com" but that would be too permissive. The individual "Emails" selector is correct here.

### Step 3: Verify the Application Works

1. Open an incognito/private browser window
2. Navigate to `https://omni-tools.eaglepass.io`
3. You should be redirected to the Cloudflare Access login page (`brimdor.cloudflareaccess.com`)
4. Click "Sign in with Google"
5. Authenticate with one of the 5 allowlisted Gmail accounts
6. You should be redirected back to `omni-tools.eaglepass.io` with access
7. Test with a non-allowlisted email — should be denied access

### Step 4: (Optional) Configure CORS Headers for SPA

Since omni-tools is a single-page application (React/Vite), consider whether the Access authentication cookie interferes with any API calls or static asset fetching. Cloudflare Access sets a `CF_Authorization` cookie, and the SPA typically doesn't make cross-origin API calls (it's a client-side-only app with no backend), so this should be a non-issue. No additional CORS configuration is expected to be needed.

## Email Allowlist Configuration Detail

The 5 email addresses to be allowlisted:

| Email | Notes |
|---|---|
| `chrisnelsonx@gmail.com` | Primary owner |
| `doreliz.nelson@gmail.com` | Family member |
| `anelsonx2005@gmail.com` | Family member |
| `anelsonx2014@gmail.com` | Family member |
| `gnelsonx2019@gmail.com` | Family member |

**Important**: All 5 are `@gmail.com` addresses. The correct selector is **Emails** (individual addresses), NOT **Emails ending in** @gmail.com (which would allow all Gmail users).

## Architecture Diagram

```
User Browser
    |
    v
omni-tools.eaglepass.io (Cloudflare-proxied DNS)
    |
    v
Cloudflare Edge (Access Policy Check)
    |
    +-- Not authenticated? --> Redirect to brimdor.cloudflareaccess.com
    |                           --> Google OAuth sign-in
    |                           --> Redirect back with CF_Authorization cookie
    |
    +-- Authenticated but not in allowlist? --> Access Denied page
    |
    +-- Authenticated and in allowlist? --> Pass through to origin
    |
    v
Cloudflare Tunnel (cloudflared)
    |
    v
nginx ingress controller (ingress-nginx)
    |
    v
omni-tools pod (nginx:alpine serving SPA on port 80)
```

## Google Cloud Console Prerequisites

Since the Google OAuth IdP is **already configured** in Cloudflare Zero Trust (confirmed by the existing integration serving `pages.eaglepass.io`), the following is provided for reference only — no new Google Cloud Console project is needed.

If a **new** Google OAuth integration were required from scratch:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use an existing one)
3. Go to **APIs & Services > Credentials**
4. Click **Configure Consent Screen**
   - Select **External** audience type (for personal Gmail accounts)
   - Fill in app name and support email
   - Add test users if the app is in "Testing" status
5. Create an **OAuth client ID** (Web application type)
6. Add **Authorized JavaScript origins**: `https://<team-name>.cloudflareaccess.com`
   - For this homelab: `https://brimdor.cloudflareaccess.com`
7. Add **Authorized redirect URIs**: `https://<team-name>.cloudflareaccess.com/cdn-cgi/access/callback`
   - For this homelab: `https://brimdor.cloudflareaccess.com/cdn-cgi/access/callback`
8. Copy the **Client ID** and **Client Secret**
9. In Cloudflare Zero Trust dashboard: **Zero Trust > Settings > Identity providers > Add new > Google**
   - Paste the Client ID and Client Secret
   - Optionally enable PKCE
   - Click **Save**
10. Test the connection

**Consent screen publishing**: If the Google OAuth consent screen is in "Testing" mode, only test users explicitly listed can authenticate. For production, the consent screen should be moved to "In production" status, or all 5 allowlisted emails must be added as test users. Since the existing integration is already serving `pages.eaglepass.io`, the consent screen is likely already in "In production" status.

## Gaps

- **No programmatic/Infrastructure-as-Code management observed**: The Cloudflare Access configuration for `pages.eaglepass.io` was not found in the homelab repo. It may be managed manually via the Cloudflare dashboard, or it may be managed via Terraform/CLI that isn't tracked in this repo. **Cartographer should investigate** whether the homelab uses Cloudflare Terraform provider or `cloudflared` CLI for Access configuration, and whether the omni-tools production Access Application should be IaC-managed.
- **No Access Application for `omni-tools.eaglepass.io` exists yet** — this is the main implementation task.
- **Session duration is an implementation decision** — the task spec doesn't specify how long authenticated sessions should last. Common choices: 24 hours, 7 days, or "persistent" (re-auth on cookie expiry). Cartographer should confirm with the owner.
- **Whether to also protect `omni-tools-canary.eaglepass.io`** is explicitly out of scope per the task ("DO NOT DO THIS FOR CANARY"), but the same Cloudflare Access Application pattern could be applied later.

## Risks

- **R1 — Existing Google OAuth client may need consent screen update**: If the Google Cloud project has the consent screen in "Testing" mode with only certain test users, the 5 allowlisted emails must all be added as test users. If it's already "In production," no change needed.
- **R2 — Wildcard tunnel catches all `*.eaglepass.io` traffic**: The Cloudflare Access Application must match `omni-tools.eaglepass.io` specifically, not `*.eaglepass.io`, to avoid locking out other services that shouldn't require authentication (like `citadel.eaglepass.io`, `hermes-webhook.eaglepass.io`, etc.).
- **R3 — Cloudflare Access cookie and SPA compatibility**: Cloudflare Access sets a `CF_Authorization` JWT cookie on the domain. For a pure client-side SPA with no backend API, this is transparent. But if omni-tools ever adds API calls to a different domain, those calls would need to include the cookie or be added as a separate Access application with Service Auth.
- **R4 — Google OAuth consent screen "Testing" vs "In production"**: If in Testing, Google limits to 100 test users and the app shows an "unverified app" warning. Production status removes this but requires Google verification if sensitive scopes are requested. Cloudflare Access only requests `email`, `profile`, and `openid` scopes — these are non-sensitive, so verification should not be required.

## Recommendations for Cartographer

1. **Confirm the Google Cloud Console project status** — check whether the consent screen is "In production" or "Testing." If "Testing," add the 5 emails as test users.
2. **Create the Access Application in the Cloudflare Zero Trust dashboard** — Self-hosted type, domain `omni-tools.eaglepass.io`.
3. **Create the Allow policy** with the 5 specific email addresses using the "Emails" selector.
4. **Set session duration** — recommend 24 hours for production, configurable later.
5. **Do NOT protect `omni-tools-canary.eaglepass.io`** — explicitly out of scope per the task.
6. **Consider IaC management** — if the homelab uses Terraform for Cloudflare, add the Access Application and Policy as Terraform resources. If not, manual dashboard configuration is acceptable.
7. **Verify** by testing with both an allowlisted email and a non-allowlisted email after configuration.