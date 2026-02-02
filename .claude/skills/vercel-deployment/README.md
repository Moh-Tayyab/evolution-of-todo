# Vercel Deployment Skill

## Description

Professional Vercel deployment automation skill for deploying Next.js, React, and static applications to Vercel platform.

## Usage

Invoke this skill when you need to:
- Deploy applications to Vercel (production or preview)
- Manage environment variables
- Handle rollback operations
- Set up CI/CD integration with Vercel
- Troubleshoot deployment issues

## Commands

```bash
# Deploy to preview (default)
/vercel-deploy

# Deploy to production
/vercel-deploy prod

# Deploy prebuilt artifacts (faster)
/vercel-deploy prebuilt

# Rollback to previous deployment
/vercel-deploy rollback

# List recent deployments
/vercel-deploy list

# Show environment variables
/vercel-deploy env

# Setup environment variables guide
/vercel-deploy setup-env
```

## Features

- ✅ **Automated Deployment**: One-command deployment to Vercel
- ✅ **Production & Preview**: Support for both environments
- ✅ **Prebuilt Artifacts**: Deploy locally built artifacts for speed
- ✅ **Rollback Support**: Quick rollback to previous deployments
- ✅ **Environment Management**: List and manage environment variables
- ✅ **CI/CD Ready**: Can be integrated into GitHub Actions, GitLab CI
- ✅ **Team Deployment**: Support for team/scope-based deployments

## Requirements

- Vercel CLI installed globally
- Valid Vercel account with authentication
- Project with valid package.json and build scripts
- Node.js 18+ installed

## Prerequisites Check

The script automatically checks for:
1. Vercel CLI installation
2. Valid authentication status
3. Project configuration (vercel.json)

## Examples

### Deploy Frontend to Production
```bash
cd evolution-of-todo
/.claude/skills/vercel-deployment/scripts/deploy.sh prod
```

### Deploy with Custom Project Directory
```bash
PROJECT_DIR=frontend/.claude/skills/vercel-deployment/scripts/deploy.sh prod
```

### Build and Deploy Prebuilt Artifacts
```bash
/.claude/skills/vercel-deployment/scripts/deploy.sh prebuilt
```

## Files Structure

```
.claude/skills/vercel-deployment/
├── SKILL.md                 # Main skill documentation
├── README.md                # This file
└── scripts/
    └── deploy.sh            # Deployment script
```

## Vercel Configuration

Create `vercel.json` in your project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

## Environment Variables

Required environment variables for deployments:

| Variable | Description | Required |
|----------|-------------|----------|
| `PROJECT_DIR` | Project directory path | No (default: frontend) |
| `PROJECT_NAME` | Vercel project name | No (default: evolution-of-todo) |

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        run: ./.claude/skills/vercel-deployment/scripts/deploy.sh prod
```

## Troubleshooting

### Authentication Failed
```bash
# Login again
vercel login

# Or use token
export VERCEL_TOKEN=your_token
```

### Build Failed
```bash
# Check build locally
vercel build

# View build logs
vercel logs <deployment-url>
```

### Environment Variables Missing
```bash
# List environment variables
./scripts/deploy.sh env

# Add missing variable
vercel env add KEY_NAME value production
```

## Related Skills

- `git-workflow`: For Git operations before deployment
- `fastapi`: For backend deployment to other platforms

## Version History

- **1.0.0**: Initial release with production, preview, prebuilt, and rollback support
