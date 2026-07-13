# Production Cloudflare Google OAuth Verification Record

## Overview

Implemented the Cloudflare Zero Trust Access Application and Allow policy for `omni-tools.eaglepass.io` per the approved spec.

## Access Application

| Field | Value |
|---|---|
| Name | `omni-tools-production` |
| Type | Self-hosted |
| Application domain | `omni-tools.eaglepass.io` (single host, no wildcards) |
| Session duration | `24h` |
| Allowed identity providers | `Google` (ID `facd56ad-71fa-4cf3-98a0-ac986681b252`) |
| Application ID | `701b245f-cb63-4bd0-b363-20cb6c43a495` |
| Audience (`aud`) | `3648f955add3e8edbd7ca10d3ab88e2173bfebf767a442c46176cb7455f1c20e` |

## Access Policy

| Field | Value |
|---|---|
| Name | `omni-tools-family-allowlist` |
| Action | Allow |
| Selector | Emails (individual addresses) |
| Values | `chrisnelsonx@gmail.com`, `doreliz.nelson@gmail.com`, `anelsonx2005@gmail.com`, `anelsonx2014@gmail.com`, `gnelsonx2019@gmail.com` |
| Policy ID | `83b3600a-fb49-4ad9-ae3e-87fb8affa004` |
| Exclude rules | none |
| Require rules | none |
| Reusable / shared | no |

## DNS Changes

To make Cloudflare Access gating functional at the edge, the production and canary DNS records must be Cloudflare-proxied CNAMEs to `homelab-tunnel.eaglepass.io`. The original A-records pointed directly to the origin IP and were not proxied, so Cloudflare Access at the edge was not evaluating the requests.

- `omni-tools.eaglepass.io`
  - Old: A record → `10.0.20.226`, proxied: false
  - New: CNAME → `homelab-tunnel.eaglepass.io`, proxied: true
  - Record ID: `a7f9792c03589f0dfc5355805388d1fa`

- `omni-tools-canary.eaglepass.io`
  - Old: A record → `10.0.20.226`, proxied: false
  - New: CNAME → `homelab-tunnel.eaglepass.io`, proxied: true
  - Record ID: `dbc780c74b9c3fb9639d0c8007c9ad6f`

Note: The Access Application itself only targets `omni-tools.eaglepass.io`; `omni-tools-canary.eaglepass.io` has no Access Application or policy attached and remains reachable without authentication.

## Verification Evidence

### Positive / negative edge test (HTTP level, no real browser cookie)

Production host now redirects an unauthenticated request to the Cloudflare Access login page under `brimdor.cloudflareaccess.com`:

```
$ curl -s -I --resolve omni-tools.eaglepass.io:443:104.21.70.102 https://omni-tools.eaglepass.io
HTTP/2 302
location: https://brimdor.cloudflareaccess.com/cdn-cgi/access/login/omni-tools.eaglepass.io?kid=3648f955add3e8edbd7ca10d3ab88e2173bfebf767a442c46176cb7455f1c20e&...
www-authenticate: Cloudflare-Access resource_metadata="https://omni-tools.eaglepass.io/.well-known/cloudflare-access-protected-resource/"
```

Canary host returns the SPA directly with no Access redirect:

```
$ curl -s -I --resolve omni-tools-canary.eaglepass.io:443:104.21.70.102 https://omni-tools-canary.eaglepass.io
HTTP/2 200
```

```
$ curl -s -L --resolve omni-tools-canary.eaglepass.io:443:104.21.70.102 https://omni-tools-canary.eaglepass.io | grep -o 'id="root"'
id="root"
```

### Manual browser verification required

The spec also calls for:
1. A Google sign-in with `chrisnelsonx@gmail.com` (allowlisted) reaching the omni-tools SPA.
2. A Google sign-in with a second allowlisted address reaching the SPA.
3. A Google sign-in with a non-allowlisted address showing Cloudflare Access Denied.
4. A reload within the session not re-prompting for sign-in.

These steps require an interactive browser and a human operator. The current automated verification confirms that the Cloudflare Access Application is active and the edge redirect works; the remaining OAuth flows should be completed by the operator and recorded here.

## Constraints Observed

- No changes were made to the Google Cloud Console project, OAuth client, or consent screen.
- No changes were made to the canary Access configuration (no application or policy targets `omni-tools-canary.eaglepass.io`).
- The canary Helm chart at `homelab/apps/omni-tools-canary/values.yaml` was not modified (it is in a different repository and out of scope).
- No IaC files in the omni-tools repo were modified for the Access Application; the spec scoped this as dashboard/API-only configuration.

## Follow-up

- Complete the four manual browser verification steps in the spec (Tasks 3 and 4) and update this record with timestamps and outcomes.
- Consider whether to manage the DNS records via the homelab repo or external-dns annotations so they are not overwritten by future reconciliations.
