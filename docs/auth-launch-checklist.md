# Auth launch checklist

Use this checklist before enabling passwordless authentication in production.

## Email delivery

- [ ] Custom SMTP configured in Supabase Auth
- [ ] Sender domain authenticated (SPF, DKIM, DMARC as required)
- [ ] From address configured (for example `hello@levitaeo.com`)
- [ ] Magic Link email template branded
- [ ] Recommended subject: **Access your Levitaeo collection**
- [ ] Recommended body concept: *Use this secure link to access your Levitaeo account and purchased editions.*

Supabase’s default email service is suitable only for development and testing.

## Supabase Auth settings

- [ ] Email authentication enabled
- [ ] Production Site URL configured: `https://levitaeo.com`
- [ ] Production redirect URL configured: `https://levitaeo.com/auth/callback`
- [ ] Local redirect URL configured for development: `http://localhost:3000/auth/callback`
- [ ] Rate limits reviewed in Supabase Auth settings

## Application verification

- [ ] Magic Link request succeeds from `/login`
- [ ] Callback URL preserves the PKCE code flow
- [ ] Expired-link behaviour tested
- [ ] Replayed-link behaviour tested
- [ ] Login from mobile email client tested
- [ ] Logout tested via POST `/auth/signout`
- [ ] Auth cookies cleared after sign-out

## Access control

- [ ] RLS policies tested for `orders`, `order_items`, and `entitlements`
- [ ] Authenticated user can read only their own rows
- [ ] Different authenticated user cannot read another customer’s orders or entitlements
- [ ] `stripe_events` remains server-only with no browser policies

## Purchase linking

- [ ] Guest purchase linking tested (checkout email matches Magic Link email)
- [ ] Linking is idempotent on repeated sign-in
- [ ] Records already owned by another user are not reassigned
- [ ] Different-email linking rejection tested

## Remaining product work

- [ ] Customer library UI
- [ ] Secure artwork downloads
- [ ] Refund webhook handling and entitlement revocation

Do not choose or install an SMTP provider in application code. Configure SMTP in the Supabase Dashboard.
