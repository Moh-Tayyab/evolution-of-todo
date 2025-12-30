# Kubernetes Manifest Generator Skill

## Overview
Expertise for generating Kubernetes manifests (YAML) for deployments.

## Usage
Use for creating Deployments, Services, Ingress, ConfigMaps, Secrets, etc.

## Core Concepts
- YAML Structure: apiVersion, kind, metadata, spec
- Labels/Selectors: Match resources appropriately
- Probes: livenessProbe, readinessProbe for health checks
- Resources: Set requests and limits

## Examples

### Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  labels:
    app: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-app
        image: myapp:1.0.0
        ports:
        - containerPort: 8000
```

### Service
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app-service
spec:
  selector:
    app: my-app
  ports:
  - port: 80
    targetPort: 8000
```

### Ingress
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app-ingress
spec:
  ingressClassName: nginx
  rules:
  - host: api.example.com
    http:
      paths:
        - path: /
          pathType: Prefix
          backend:
            service:
              name: my-app-service
              port:
                number: 80
```

## Best Practices
1. Always include labels on resources
2. Add resource limits (requests/limits)
3. Implement health checks (liveness/readiness probes)
4. Use ConfigMaps for configuration, not environment variables in containers
5. Use Secrets for sensitive data
6. Set appropriate restartPolicy (Always/OnFailure)
7. Use namespaces for isolation
8. Define PodDisruptionBudgets for availability
9. Use appropriate Service types (ClusterIP, NodePort, LoadBalancer)
10. Test with kubectl apply --dry-run

## Common Pitfalls
- Missing labels on resources
- No health checks leading to restart loops
- No resource limits causing noisy neighbor problems
- Hardcoded values instead of using ConfigMaps/Secrets
- Incorrect selector/label matching
- Inappropriate Service type for use case

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
