# Vercel deployment storage

Last reviewed: October 12, 2026

## Why this exists

The Vercel Hobby team reached 7.52 GB of its 10 GB deployment-storage allowance after 88 builds in 30 days. Expressly contains a large set of communication-card images, so retaining a compiled copy of every preview deployment uses storage quickly.

The source code and change history remain in GitHub. Deployment retention removes old compiled preview copies, not Git commits or source files.

## Current retention policy

| Deployment type | Retention |
| --- | --- |
| Canceled | 1 day |
| Errored | 1 day |
| Pre-production previews | 1 day |
| Production | 30 days |

Vercel still protects deployments that are required by its retention exceptions, including the current production deployment and active aliases.

## Safety decisions

- Production retention remains at 30 days so recent rollback points are available.
- Only redundant previews, canceled builds, and failed builds receive short retention.
- No production deployment, project, domain, environment variable, database, image source file, or Git history was manually deleted.
- Vercel may take time to update the usage total after expired deployments are removed.

## Developer workflow

- Use a feature branch for grouped work rather than pushing every tiny edit.
- Test locally before pushing to reduce unnecessary preview deployments.
- Do not manually delete the current production deployment or any deployment carrying the production domain.
- Check **Vercel > Team > Usage > Deployment Storage** if storage approaches 75% again.
- Record future retention-policy changes in this file.

## Recovery

The application can be rebuilt from any retained Git commit. Vercel also provides a Recently Deleted area for deployments during its recovery window, subject to Vercel's current retention rules.
