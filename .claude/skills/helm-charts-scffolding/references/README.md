# Helm Charts References

Official documentation and resources for Helm, the package manager for Kubernetes.

## Official Resources

### Helm Documentation
- **Official Website**: https://helm.sh/
- **GitHub**: https://github.com/helm/helm
- **Documentation**: https://helm.sh/docs/
- **Charts Repository**: https://artifacthub.io/

## Quick Start

### Installation
```bash
# macOS
brew install helm

# Linux
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Windows
choco install kubernetes-helm
```

### Create a Chart
```bash
helm create mychart
```

## Chart Structure

```
mychart/
├── Chart.yaml          # Chart metadata
├── values.yaml        # Default configuration values
├── values.schema.json # Values schema (optional)
├── charts/            # Chart dependencies
├── templates/         # Template files
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── _helpers.tpl   # Template helpers
│   └── NOTES.txt      # Post-install notes
└── templates/tests/   # Tests
```

## Chart.yaml

```yaml
apiVersion: v2
name: mychart
description: A Helm chart for Kubernetes
type: application
version: 0.1.0
appVersion: "1.0"
keywords:
  - application
maintainers:
  - name: Your Name
    email: you@example.com
```

## Templates

### Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "mychart.fullname" . }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: {{ include "mychart.name" . }}
  template:
    metadata:
      labels:
        app: {{ include "mychart.name" . }}
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          ports:
            - containerPort: {{ .Values.service.port }}
```

### Service
```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ include "mychart.fullname" . }}
spec:
  type: {{ .Values.service.type }}
  ports:
    - port: {{ .Values.service.port }}
      targetPort: {{ .Values.service.targetPort }}
      protocol: TCP
  selector:
    app: {{ include "mychart.name" . }}
```

### ConfigMap
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ include "mychart.fullname" . }}-config
data:
{{- range $key, $value := .Values.config }}
  {{ $key }}: {{ $value | quote }}
{{- end }}
```

## Values.yaml

```yaml
replicaCount: 1

image:
  repository: nginx
  pullPolicy: IfNotPresent
  tag: "1.25"

service:
  type: ClusterIP
  port: 80
  targetPort: 80

config:
  ENV: production
  DEBUG: "false"

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

autoscaling:
  enabled: false
  minReplicas: 1
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80
```

## Built-in Objects

### Release
- `Release.Name` - Release name
- `Release.Namespace` - Release namespace
- `Release.IsUpgrade` - True if upgrade
- `Release.IsInstall` - True if install

### Values
- `Values` - Values from values.yaml

### Chart
- `Chart.Name` - Chart name
- `Chart.Version` - Chart version
- `Chart.AppVersion` - App version

### Template
- `Template.BasePath` - Template directory path

## Template Functions

### Text
```yaml
{{ quote "value" }}  # "value"
{{ upper "value" }}  # VALUE
{{ lower "VALUE" }}  # value
{{ title "value" }}  # Value
```

### Lists
```yaml
{{ list "a" "b" "c" }}  # [a b c]
{{ first list }}       # a
{{ last list }}        # c
{{ rest list }}        # [b c]
```

### Math
```yaml
{{ add 1 2 }}    # 3
{{ sub 3 1 }}    # 2
{{ mul 2 3 }}    # 6
{{ div 6 2 }}    # 3
```

### Default Values
```yaml
{{ .Values.foo | default "bar" }}
```

## Control Flow

### If/Else
```yaml
{{ if .Values.enabled }}
enabled: true
{{ else }}
enabled: false
{{ end }}
```

### Range
```yaml
{{ range .Values.items }}
- name: {{ .name }}
  value: {{ .value }}
{{ end }}
```

### With
```yaml
{{ with .Values.config }}
ENV: {{ .ENV }}
{{ end }}
```

## Named Templates

### Define Template
```yaml
{{- define "mychart.labels" -}}
app: {{ template "mychart.name" . }}
chart: {{ .Chart.Name }}
version: {{ .Chart.Version }}
{{- end -}}
```

### Use Template
```yaml
labels:
  {{- include "mychart.labels" . | nindent 4 }}
```

## Hooks

```yaml
annotations:
  "helm.sh/hook": post-install
  "helm.sh/hook-weight": "-5"
  "helm.sh/hook-delete-policy": before-hook-creation
```

### Hook Types
- `pre-install` - Before install
- `post-install` - After install
- `pre-delete` - Before delete
- `post-delete` - After delete
- `pre-upgrade` - Before upgrade
- `post-upgrade` - After upgrade
- `pre-rollback` - Before rollback
- `post-rollback` - After rollback

## Dependencies

### requirements.yaml (Helm 2)
```yaml
dependencies:
  - name: redis
    version: "15.x.x"
    repository: https://charts.bitnami.com/bitnami
```

### Chart.yaml (Helm 3)
```yaml
dependencies:
  - name: redis
    version: "15.x.x"
    repository: https://charts.bitnami.com/bitnami
```

### Update Dependencies
```bash
helm dependency update
```

## Commands

### Install
```bash
helm install myrelease ./mychart
helm install myrelease ./mychart --set image.tag=1.25
helm install myrelease ./mychart -f custom-values.yaml
```

### Upgrade
```bash
helm upgrade myrelease ./mychart
helm upgrade myrelease ./mychart --reuse-values
```

### Rollback
```bash
helm rollback myrelease 2
```

### Uninstall
```bash
helm uninstall myrelease
```

### List Releases
```bash
helm list
helm list --namespace kube-system
```

### Get Values
```bash
helm get values myrelease
helm get values myrelease --all
```

## Best Practices

- Use semantic versioning
- Provide sensible defaults
- Document all values
- Use charts for dependencies
- Implement resource limits
- Add health checks
- Use labels and selectors
- Support multiple replicas
- Enable autoscaling
- Provide tests

## Resources

- **Helm Docs**: https://helm.sh/docs/
- **Helm Charts Best Practices**: https://helm.sh/docs/chart_best_practices/
- **Artifact Hub**: https://artifacthub.io/
