# GitOps Automation References

Official documentation and resources for GitOps, a methodology for continuous deployment using Git as the single source of truth.

## Official Resources

### GitOps Documentation
- **OpenGitOps**: https://www.opengitops.org/
- **ArgoCD**: https://argo-cd.readthedocs.io/
- **FluxCD**: https://fluxcd.io/docs/
- **Weave GitOps**: https://www.weave.works/technologies/gitops/

## Overview

GitOps is a modern approach to continuous deployment that uses Git as the single source of truth for infrastructure and application configurations. Changes are made via pull requests and automatically deployed to production.

### Key Principles
1. **Declarative** - System state declared in Git
2. **Versioned** - All changes tracked and versioned
3. **Automated** - Changes automatically applied
4. **Continuous** - Constant reconciliation

## ArgoCD

### Installation

```bash
# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Access ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Login (default password: admin)
argocd login localhost:8080
```

### Application Manifest

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: guestbook
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/argoproj/argocd-example-apps.git
    targetRevision: HEAD
    path: guestbook
  destination:
    server: https://kubernetes.default.svc
    namespace: guestbook
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

### CLI Usage

```bash
# Login
argocd login <argocd-server>

# Create application
argocd app create guestbook \
  --repo https://github.com/argoproj/argocd-example-apps.git \
  --path guestbook \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace guestbook

# Sync application
argocd app sync guestbook

# Get application status
argocd app get guestbook

# List applications
argocd app list

# Delete application
argocd app delete guestbook
```

### ApplicationSet

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: cluster-addons
spec:
  generators:
    - git:
        repoURL: https://github.com/argoproj/argocd-example-apps.git
        revision: HEAD
        directories:
          - path: addons/*
  template:
    metadata:
      name: '{{path.basename}}'
    spec:
      project: default
      source:
        repoURL: https://github.com/argoproj/argocd-example-apps.git
        targetRevision: HEAD
        path: '{{path}}'
      destination:
        server: https://kubernetes.default.svc
        namespace: '{{path.basename}}'
      syncPolicy:
        automated:
          prune: true
```

## FluxCD

### Installation

```bash
# Install Flux CLI
curl -s https://fluxcd.io/install.sh | sudo bash

# Export GitHub token
export GITHUB_TOKEN=<your-token>

# Bootstrap Flux
flux bootstrap github \
  --owner=myorg \
  --repository=infrastructure \
  --path=clusters/production \
  --personal=false
```

### GitRepository

```yaml
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: GitRepository
metadata:
  name: podinfo
  namespace: flux-system
spec:
  interval: 5m
  url: https://github.com/stefanprodan/podinfo
  ref:
    branch: master
  ignore: |
    # exclude all
    /*
    # include deploy dir
    !/deploy
  secretRef:
    name: https-credentials
```

### Kustomization

```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1beta2
kind: Kustomization
metadata:
  name: webapp
  namespace: flux-system
spec:
  interval: 10m
  sourceRef:
    kind: GitRepository
    name: webapp-repo
  path: ./deploy/webapp
  prune: true
  validation: client
  healthChecks:
    - apiVersion: apps/v1
      kind: Deployment
      name: webapp
      namespace: webapp
```

### HelmRelease

```yaml
apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  name: podinfo
  namespace: default
spec:
  interval: 5m
  chart:
    spec:
      chart: podinfo
      version: '>=6.0.0 <7.0.0'
      sourceRef:
        kind: HelmRepository
        name: podinfo
        namespace: flux-system
  values:
    replicaCount: 2
    resources:
      requests:
        cpu: 100m
        memory: 64Mi
```

## Secret Management

### Sealed Secrets

```bash
# Install Sealed Secrets
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml

# Create sealed secret
kubectl create secret generic my-secret \
  --dry-run=client \
  --from-literal=password=secret123 \
  -o yaml | kubeseal -o yaml > sealed-secret.yaml

# Apply sealed secret
kubectl apply -f sealed-secret.yaml
```

### SOPS

```bash
# Install SOPS
go install github.com/mozilla/sops/v3/cmd/sops@latest

# Encrypt file
sops --encrypt --kms "arn:aws:kms:..." secrets.yaml > secrets.yaml.encrypted

# Decrypt file
sops --decrypt secrets.yaml.encrypted > secrets.yaml

# Edit encrypted file
sops secrets.yaml.encrypted
```

## Best Practices

### Repository Structure

```
infrastructure/
├── clusters/
│   ├── base/
│   │   └── flux-system/
│   ├── dev/
│   │   └── apps.yaml
│   ├── staging/
│   │   └── apps.yaml
│   └── production/
│       └── apps.yaml
├── apps/
│   ├── frontend/
│   │   ├── base/
│   │   ├── dev/
│   │   ├── staging/
│   │   └── production/
│   └── backend/
│       ├── base/
│       ├── dev/
│       ├── staging/
│       └── production/
└── secrets/
    ├── dev/
    ├── staging/
    └── production/
```

### Branch Strategy

```
main         → Production
staging      → Staging
develop      → Development
feature/*    → Feature branches
```

### Pull Request Workflow

```bash
# 1. Create feature branch
git checkout -b feature/add-new-app

# 2. Add application manifests
vim apps/new-app/base/deployment.yaml

# 3. Commit and push
git add apps/new-app
git commit -m "Add new application"
git push origin feature/add-new-app

# 4. Create pull request
# Review and merge to develop

# 5. Monitor sync
kubectl get kustomization -n flux-system
```

## Progressive Delivery

### Canary Deployment

```yaml
apiVersion: flagger.app/v1beta1
kind: Canary
metadata:
  name: podinfo
  namespace: default
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: podinfo
  service:
    port: 9898
  analysis:
    interval: 1m
    threshold: 5
    maxWeight: 50
    stepWeight: 10
    metrics:
    - name: request-success-rate
      thresholdRange:
        min: 99
      interval: 1m
```

### Blue-Green Deployment

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: blue-green-demo
spec:
  replicas: 2
  selector:
    matchLabels:
      app: rollouts-demo
  template:
    metadata:
      labels:
        app: rollouts-demo
    spec:
      containers:
      - name: rollouts-demo
        image: argoproj/rollouts-demo:blue
  strategy:
    blueGreen:
      activeService: rollouts-demo-active
      previewService: rollouts-demo-preview
      autoPromotionEnabled: false
```

## Monitoring and Observability

### ArgoCD Notifications

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-notifications-cm
data:
  service.slack: |
    token: $slack-token
  trigger.on-degraded: |
    - when: app.status.operationState.phase in ['Error', 'Failed']
      send: [degraded]
  template.degraded: |
    message: |
      Application {{.app.metadata.name}} has degraded.
      Deployment status: {{.app.status.operationState.phase}}
```

### Prometheus Metrics

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus
data:
  prometheus.yml: |
    scrape_configs:
      - job_name: 'argocd-metrics'
        static_configs:
          - targets: ['argocd-metrics:8082']
      - job_name: 'flux-metrics'
        static_configs:
          - targets: ['flux-controller:9090']
```

## Troubleshooting

### ArgoCD

```bash
# Check sync status
argocd app get <app-name>

# View application logs
argocd app logs <app-name>

# Force sync
argocd app sync <app-name> --force

# Retry sync
argocd app retry <app-name>

# Check controller logs
kubectl logs -n argocd deployment/argocd-application-controller
```

### FluxCD

```bash
# Check reconciliation status
flux get kustomizations

# View reconciliation logs
flux logs -f

# Reconcile manually
flux reconcile kustomization <name>

# Check sources
flux get sources git
flux get sources helm

# Suspend reconciliation
flux suspend kustomization <name>
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Update Manifests
on:
  push:
    branches: [main]
jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Update image tag
        run: |
          yq e '.spec.template.spec.containers[0].image = "${{ github.sha }}"' -i deployment.yaml
      - name: Commit changes
        run: |
          git config user.name github-actions
          git config user.email github-actions@github.com
          git commit -am "Update image tag"
          git push
```

## Resources

- **OpenGitOps Principles**: https://www.opengitops.org/
- **ArgoCD Documentation**: https://argo-cd.readthedocs.io/
- **FluxCD Documentation**: https://fluxcd.io/docs/
- **GitOps Best Practices**: https://www.weave.works/blog/gitops/
- **Progressive Delivery**: https://flagger.app/
