# Sablia Vox - Email Templates

Branded HTML email templates for Supabase Auth. Apply in **Supabase Dashboard > Authentication > Email Templates**.

## Templates & Subjects

| Template | File | Subject |
|----------|------|---------|
| Confirm signup | `confirm-signup.html` | `Confirmez votre inscription - Sablia Vox` |
| Reset password | `reset-password.html` | `Réinitialisez votre mot de passe - Sablia Vox` |
| Magic link | `magic-link.html` | `Votre lien de connexion - Sablia Vox` |
| Invite user | `invite-user.html` | `Vous êtes invité(e) sur Sablia Vox` |

## How to Apply

1. Go to Supabase Dashboard > Authentication > Email Templates
2. For each template type:
   - Update the **Subject** field
   - Replace the **Body** with the HTML from the corresponding file
3. Save each template

## Design Decisions

- **Light body background** (`#f4f4f5`) — avoids Outlook/Gmail dark mode rendering issues
- **Dark header** (`#0a0a0a`) with violet accent (`#8B5CF6`) — matches Sablia Vox branding
- **`{{ .TokenHash }}`** links — eliminates suspicious `supabase.co` URLs from emails
- **`type=email`** for signup/magic-link (current Supabase standard, replaces deprecated `type=signup`/`type=magiclink`)
- **`type=recovery`** and **`type=invite`** — current and unchanged
- **Inline CSS** + `bgcolor` attributes — maximum email client compatibility
- **Responsive** — max-width 600px, mobile-friendly
- **French content** — target audience
