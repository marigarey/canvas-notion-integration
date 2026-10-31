# Security Policy

## Supported versions

Security fixes are applied to the latest release and the current `main` branch.

## Reporting a vulnerability

Do not open a public issue containing vulnerability details, credentials, or user data. Use GitHub's private vulnerability reporting flow from the repository's **Security** tab when it is available. Until that feature is enabled, open an issue containing no vulnerability details and ask the maintainer to establish a private reporting channel. In a private report, include reproduction steps, affected versions, and the expected impact, but replace all real tokens and personal information with test values.

If a Canvas or Notion credential was exposed, revoke or rotate it with the provider immediately. Rewriting Git history is not a substitute for rotating a leaked credential.

## Handling credentials

The CLI is designed to read credentials from a local `.env` file or runtime environment variables. Real credentials must never be committed, added to a Docker image, printed in logs, or included in support requests.
