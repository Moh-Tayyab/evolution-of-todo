# Helm Charts Scaffolding Skill

## Overview
Expertise for creating and managing Helm charts for Kubernetes deployments.

## Usage
Use for scaffolding new charts, writing templates, managing values.yaml.

## Core Concepts
- Chart Structure: Chart.yaml, values.yaml, templates/
- Templates: Deployment, Service, Ingress, ConfigMap, Secret
- Helpers: _helpers.tpl for reusable template logic

## Examples

### Chart.yaml
```yaml
apiVersion: v2
name: my-app
description: Helm chart for My Application
type: application
version: 1.0.0
appVersion: "1.0.0"
```

### values.yaml
```yaml
replicaCount: 3
image:
  repository: myapp
  tag: "1.0.0"
service:
  port: 80
```

### Deployment Template
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}
spec:
  replicas: {{ .Values.replicaCount }}
```

## Best Practices
1. Use templates with Sprig functions
2. Define values.schema.json for validation
3. Include standard labels on all resources
4. Use _helpers.tpl for reusable template logic
5. Set resource limits (requests/limits)
6. Add liveness and readiness probes
7. Test with helm template --dry-run
8. Use ConfigMaps for configuration
9. Never commit secrets in charts
10. Follow semantic versioning

## Common Pitfalls
- Hardcoding values in templates instead of using .Values
- Missing labels on resources
- No health checks defined
- Incorrect indentation in YAML templates
- Using secrets directly instead of Secret references

## Tools Used
- **Read/Grep Tools:** Examine code, find patterns, read existing implementations
- **Write/Edit Tools:** Create new schemas/endpoints, modify existing code
- **Bash:** Run servers, execute migrations, install dependencies
- **Context7 MCP:** Semantic search in PostgreSQL/Python/Helm documentation

## Verification Process
After implementing changes:
1. **Health Check:** Verify application is running (`/health` endpoint or similar)
2. **Database Check:** Run query to verify database connection
3. **Migration Check:** Confirm migrations applied successfully
4. **Integration Check:** Test API calls work end-to-end
5. **Log Review:** Check for errors in application logs

## Error Patterns
Common errors to recognize:
- **Connection errors:** Database/API unreachable, network timeouts
- **Schema errors:** Invalid table/column names, constraint violations
- **Type errors:** Invalid data types, missing fields
- **Authentication errors:** Invalid tokens, expired sessions
- **Configuration errors:** Missing environment variables, invalid config
