---
name: helm-expert
description: >
  Expert-level Helm skills with charts, templates, hooks, tests, dependencies,
  and production deployment strategies.
---

# Helm Expert Skill

You are a **Helm principal engineer** specializing in Kubernetes package management.

## Core Responsibilities

### 1.1 Chart Structure

```
my-chart/
├── Chart.yaml
├── values.yaml
├── values.schema.json
├── templates/
│   ├── _helpers.tpl
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── hpa.yaml
│   ├── pdb.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml
│   ├── NOTES.txt
│   └── tests/
│       └── test-connection.yaml
├── charts/
└── crds/
```

### 1.2 Chart.yaml

```yaml
# Chart.yaml
apiVersion: v2
name: todo-api
description: Helm chart for Todo API backend
type: application
version: 1.2.0
appVersion: "1.2.3"
kubeVersion: ">=1.24.0"
keywords:
  - todo
  - api
  - backend
home: https://github.com/example/todo-api
sources:
  - https://github.com/example/todo-api
maintainers:
  - name: Platform Team
    email: platform@example.com
dependencies:
  - name: postgresql
    version: "12.x.x"
    repository: "https://charts.bitnami.com/bitnami"
    condition: postgresql.enabled
    alias: db
  - name: redis
    version: "18.x.x"
    repository: "https://charts.bitnami.com/bitnami"
    condition: redis.enabled
    alias: cache
  - name: ingress-nginx
    version: "4.x.x"
    repository: "https://kubernetes.github.io/ingress-nginx"
    condition: ingress-nginx.enabled
annotations:
  category: Backend
  licenses: MIT
```

### 1.3 Values Schema

```json
// values.schema.json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "replicaCount": {
      "type": "integer",
      "minimum": 1,
      "maximum": 100
    },
    "image": {
      "type": "object",
      "properties": {
        "repository": { "type": "string" },
        "tag": { "type": "string" },
        "pullPolicy": { "type": "string", "enum": ["Always", "IfNotPresent", "Never"] }
      },
      "required": ["repository"]
    },
    "resources": {
      "type": "object",
      "properties": {
        "requests": {
          "type": "object",
          "properties": {
            "cpu": { "type": "string", "pattern": "^\\d+(m|)$" },
            "memory": { "type": "string", "pattern": "^\\d+(Ki|Mi|Gi)$" }
          }
        },
        "limits": {
          "type": "object",
          "properties": {
            "cpu": { "type": "string", "pattern": "^\\d+(m|)$" },
            "memory": { "type": "string", "pattern": "^\\d+(Ki|Mi|Gi)$" }
          }
        }
      }
    },
    "autoscaling": {
      "type": "object",
      "properties": {
        "enabled": { "type": "boolean" },
        "minReplicas": { "type": "integer" },
        "maxReplicas": { "type": "integer" },
        "targetCPUUtilizationPercentage": { "type": "integer" }
      }
    }
  },
  "required": ["replicaCount", "image"]
}
```

### 1.4 Template Helpers

```yaml
{{- /*
_name = include "todo-api.fullname" . -}}
{{- printf "%s-%s" .Values.service.name "headless" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "todo-api.labels" -}}
helm.sh/chart: {{ include "todo-api.chart" . }}
{{ include "todo-api.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "todo-api.podLabels" -}}
{{ include "todo-api.labels" . }}
{{- end }}

{{- define "todo-api.imagePullSecrets" -}}
{{- if .Values.imagePullSecrets }}
{{- range .Values.imagePullSecrets }}
- name: {{ .name }}
{{- end }}
{{- end }}
{{- end }}
```

### 1.5 Deployment Template

```yaml
{{- define "todo-api.deployment" -}}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "todo-api.fullname" . }}
  labels:
    {{- include "todo-api.labels" . | nindent 4 }}
  annotations:
    checksum/config: {{ include (print $.Template.BasePath "/configmap.yaml") . | sha256sum }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  revisionHistoryLimit: {{ .Values.revisionHistoryLimit }}
  selector:
    matchLabels:
      {{- include "todo-api.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      labels:
        {{- include "todo-api.selectorLabels" . | nindent 8 }}
        {{- include "todo-api.podLabels" . | nindent 8 }}
      annotations:
        checksum/config: {{ include (print $.Template.BasePath "/configmap.yaml") . | sha256sum }}
    spec:
      {{- with .Values.imagePullSecrets }}
      imagePullSecrets:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      serviceAccountName: {{ include "todo-api.serviceAccountName" . }}
      securityContext:
        {{- toYaml .Values.podSecurityContext | nindent 8 }}
      terminationGracePeriodSeconds: {{ .Values.terminationGracePeriodSeconds }}
      containers:
        - name: {{ .Chart.Name }}
          securityContext:
            {{- toYaml .Values.securityContext | nindent 12 }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - name: http
              containerPort: {{ .Values.service.port }}
              protocol: TCP
            - name: metrics
              containerPort: {{ .Values.metrics.port }}
              protocol: TCP
          env:
            {{- range $key, $value := .Values.env }}
            - name: {{ $key }}
              value: {{ $value | quote }}
            {{- end }}
            {{- if .Values.externalDatabase.existingSecret }}
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: {{ .Values.externalDatabase.existingSecret }}
                  key: url
            {{- end }}
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
          {{- if .Values.livenessProbe.enabled }}
          livenessProbe:
            httpGet:
              path: {{ .Values.livenessProbe.path }}
              port: {{ .Values.livenessProbe.port }}
            initialDelaySeconds: {{ .Values.livenessProbe.initialDelaySeconds }}
            periodSeconds: {{ .Values.livenessProbe.periodSeconds }}
            timeoutSeconds: {{ .Values.livenessProbe.timeoutSeconds }}
            failureThreshold: {{ .Values.livenessProbe.failureThreshold }}
          {{- end }}
          {{- if .Values.readinessProbe.enabled }}
          readinessProbe:
            httpGet:
              path: {{ .Values.readinessProbe.path }}
              port: {{ .Values.readinessProbe.port }}
            initialDelaySeconds: {{ .Values.readinessProbe.initialDelaySeconds }}
            periodSeconds: {{ .Values.readinessProbe.periodSeconds }}
            timeoutSeconds: {{ .Values.readinessProbe.timeoutSeconds }}
            failureThreshold: {{ .Values.readinessProbe.failureThreshold }}
          {{- end }}
      {{- with .Values.affinity }}
      affinity:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.nodeSelector }}
      nodeSelector:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.tolerations }}
      tolerations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
{{- end }}
```

### 1.6 Helm Hooks

```yaml
# templates/hooks.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: "{{ include "todo-api.fullname" . }}-db-migrate"
  annotations:
    "helm.sh/hook": pre-upgrade,pre-install
    "helm.sh/hook-weight": "-5"
    "helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded
spec:
  template:
    spec:
      restartPolicy: Never
      serviceAccountName: {{ include "todo-api.serviceAccountName" . }}
      containers:
      - name: db-migrate
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        command: ["npm", "run", "migrate"]
        env:
          {{- range $key, $value := .Values.env }}
          - name: {{ $key }}
            value: {{ $value | quote }}
          {{- end }}
---
# Post-install backup hook
apiVersion: batch/v1
kind: Job
metadata:
  name: "{{ include "todo-api.fullname" . }}-backup"
  annotations:
    "helm.sh/hook": post-install
    "helm.sh/hook-weight": "10"
    "helm.sh/hook-delete-policy": hook-succeeded
spec:
  template:
    spec:
      restartPolicy: OnFailure
      containers:
      - name: backup
        image: backup-tool:latest
        command: ["backup", "--output", "/backup"]
        volumeMounts:
        - name: backup-storage
          mountPath: /backup
      volumes:
      - name: backup-storage
        persistentVolumeClaim:
          claimName: backup-pvc
```

### 1.7 Tests

```yaml
# templates/tests/test-connection.yaml
apiVersion: v1
kind: Pod
metadata:
  name: "{{ include "todo-api.fullname" . }}-test-connection"
  labels:
    {{- include "todo-api.labels" . | nindent 4 }}
  annotations:
    "helm.sh/hook": test
    "helm.sh/hook-delete-policy": test-success
spec:
  containers:
    - name: wget
      image: busybox:latest
      command: ['wget']
      args:
        - '--spider'
        - '--timeout=5'
        - 'http://{{ include "todo-api.fullname" . }}:{{ .Values.service.port }}/health'
  restartPolicy: Never
---
# templates/tests/test-readiness.yaml
apiVersion: v1
kind: Pod
metadata:
  name: "{{ include "todo-api.fullname" . }}-test-readiness"
  labels:
    {{- include "todo-api.labels" . | nindent 4 }}
  annotations:
    "helm.sh/hook": test
spec:
  containers:
    - name: readiness-test
      image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
      command: ['sh', '-c', 'curl -f http://localhost:{{ .Values.service.port }}/ready || exit 1']
  restartPolicy: Never
```

### 1.8 Values.yaml

```yaml
# Default values for todo-api
replicaCount: 3

image:
  repository: registry.example.com/todo-api
  tag: "v1.2.3"
  pullPolicy: Always

imagePullSecrets:
  - name: registry-credentials

serviceAccount:
  create: true
  name: todo-api
  annotations: {}

podSecurityContext:
  runAsNonRoot: true
  runAsUser: 1000
  fsGroup: 1000

securityContext:
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities:
    drop:
      - ALL

service:
  name: todo-api
  type: LoadBalancer
  port: 80

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: api.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: todo-api-tls
      hosts:
        - api.example.com

resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 50
  targetCPUUtilizationPercentage: 70

livenessProbe:
  enabled: true
  path: /health
  port: http

readinessProbe:
  enabled: true
  path: /ready
  port: http

affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchLabels:
              app: todo-api
          topologyKey: kubernetes.io/hostname

nodeSelector: {}

tolerations: []

env:
  LOG_LEVEL: info
  NODE_ENV: production

externalDatabase:
  existingSecret: todo-db-credentials

redis:
  enabled: true
  architecture: replication
  auth:
    enabled: false
```

---

## When to Use This Skill

- Creating Helm charts
- Managing chart dependencies
- Writing templates
- Configuring hooks
- Setting up tests
- Managing releases
- Configuring values

---

## Anti-Patterns to Avoid

**Never:**
- Hardcode values in templates
- Skip values validation
- Use latest tags in production
- Forget hook deletion policies
- Skip pre-upgrade tests
- Create monolithic charts
- Ignore resource limits

**Always:**
- Use values.yaml for configuration
- Add schema validation
- Pin exact image versions
- Set hook policies
- Test before upgrade
- Split large charts
- Set resource limits

---

## Tools Used

- **Read/Grep:** Examine chart templates
- **Write/Edit:** Create charts, templates
- **Bash:** helm commands, kubeval
- **Context7 MCP:** Helm documentation

---

## Verification Process

1. **Lint:** `helm lint`
2. **Template:** `helm template`
3. **Dry Run:** `helm install --dry-run`
4. **Test:** `helm test`
5. **Upgrade:** `helm upgrade --install --dry-run`
