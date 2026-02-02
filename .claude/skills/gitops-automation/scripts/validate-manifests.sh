#!/bin/bash
# Kubernetes Manifest Validator
# Validates Kubernetes manifests before applying

set -e

MANIFEST_DIR=${1:-.}
KUBE_VERSION=${2:-1.28.0}

echo "Validating Kubernetes manifests in $MANIFEST_DIR..."

# Install kubeval if not present
if ! command -v kubeval &> /dev/null; then
  echo "Installing kubeval..."
  curl -s https://raw.githubusercontent.com/instrumenta/kubeval/master/scripts/install-kubeval.sh | bash
fi

# Find and validate all YAML files
find "$MANIFEST_DIR" -name "*.yaml" -o -name "*.yml" | while read -r file; do
  echo "Validating: $file"
  kubeval "$file" --kubernetes-version="$KUBE_VERSION" || {
    echo "❌ Validation failed for: $file"
    exit 1
  }
done

echo "✅ All manifests validated successfully"
