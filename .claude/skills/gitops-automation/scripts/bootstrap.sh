#!/bin/bash
# GitOps Bootstrap Script
# Initializes GitOps repository structure

set -e

REPO_ROOT=${1:-.}
CLUSTERS_DIR="$REPO_ROOT/clusters"
APPS_DIR="$REPO_ROOT/apps"
SECRETS_DIR="$REPO_ROOT/secrets"

echo "Creating GitOps repository structure..."

# Create directory structure
mkdir -p "$CLUSTERS_DIR"/{base,dev,staging,production}
mkdir -p "$APPS_DIR"/{frontend,backend,services}
mkdir -p "$SECRETS_DIR"/{dev,staging,production}

# Create base cluster configuration
cat > "$CLUSTERS_DIR/base/kustomization.yaml" << EOF
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - namespace.yaml
EOF

cat > "$CLUSTERS_DIR/base/namespace.yaml" << EOF
apiVersion: v1
kind: Namespace
metadata:
  name: gitops-system
EOF

# Create README
cat > "$REPO_ROOT/README.md" << EOF
# GitOps Infrastructure Repository

## Structure
- \`clusters/\` - Cluster configurations per environment
- \`apps/\` - Application manifests
- \`secrets/\` - Encrypted secrets (Sealed Secrets/SOPS)

## Workflows
1. Make changes to manifests
2. Commit to feature branch
3. Create pull request
4. Merge to deploy

## Environments
- **dev**: Development environment
- **staging**: Staging environment
- **production**: Production environment
EOF

echo "✅ GitOps repository structure created at $REPO_ROOT"
