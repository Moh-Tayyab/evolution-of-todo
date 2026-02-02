# Kubernetes Manifest Generator References

Official documentation and resources for Kubernetes manifests and deployment configurations.

## Official Resources

### Kubernetes Documentation
- **Official Website**: https://kubernetes.io/
- **Documentation**: https://kubernetes.io/docs/
- **API Reference**: https://kubernetes.io/docs/reference/
- **GitHub**: https://github.com/kubernetes/kubernetes

## Core Resources

### Pod
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
  labels:
    app: myapp
spec:
  containers:
    - name: mycontainer
      image: nginx:1.25
      ports:
        - containerPort: 80
      resources:
        limits:
          memory: "128Mi"
          cpu: "500m"
```

### Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
        - name: myapp
          image: myapp:1.0
          ports:
            - containerPort: 8080
          readinessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 15
            periodSeconds: 20
```

### Service
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  type: LoadBalancer
  selector:
    app: myapp
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
```

### ConfigMap
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-config
data:
  config.yaml: |
    key: value
    another-key: another-value
  ENV: production
```

### Secret
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: my-secret
type: Opaque
stringData:
  password: my-password
  api-key: abc123
```

## Advanced Resources

### HorizontalPodAutoscaler
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: my-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-deployment
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 80
```

### Ingress
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
    - host: myapp.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: my-service
                port:
                  number: 80
```

### PersistentVolume
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: my-pv
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  hostPath:
    path: /mnt/data
```

### PersistentVolumeClaim
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

### StatefulSet
```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: my-statefulset
spec:
  serviceName: my-service
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
        - name: myapp
          image: myapp:1.0
          volumeMounts:
            - name: data
              mountPath: /data
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 10Gi
```

## Best Practices

### Resource Limits
```yaml
resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "256Mi"
    cpu: "500m"
```

### Health Checks
```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5

livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 15
  periodSeconds: 20
```

### Security
```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  fsGroup: 1000
  allowPrivilegeEscalation: false
  capabilities:
    drop:
      - ALL
```

### Labels and Annotations
```yaml
metadata:
  labels:
    app: myapp
    version: "1.0"
    environment: production
  annotations:
    description: "My application"
    maintainer: "team@example.com"
```

## kubectl Commands

### Apply
```bash
kubectl apply -f deployment.yaml
kubectl apply -f k8s/
```

### Get
```bash
kubectl get pods
kubectl get deployments
kubectl get services
kubectl get all -n namespace
```

### Describe
```bash
kubectl describe pod my-pod
kubectl describe deployment my-deployment
```

### Logs
```bash
kubectl logs my-pod
kubectl logs -f my-pod  # Follow logs
kubectl logs my-pod -c my-container
```

### Exec
```bash
kubectl exec -it my-pod -- /bin/bash
kubectl exec -it my-pod -c my-container -- sh
```

### Port Forward
```bash
kubectl port-forward my-pod 8080:80
kubectl port-forward service/my-service 8080:80
```

### Delete
```bash
kubectl delete pod my-pod
kubectl delete -f deployment.yaml
kubectl delete all -l app=myapp
```

## Namespaces

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: my-namespace
```

```bash
kubectl create namespace my-namespace
kubectl config set-context --current --namespace=my-namespace
```

## ConfigMaps and Secrets

### Using ConfigMap
```yaml
envFrom:
  - configMapRef:
      name: my-config
```

### Using Secret
```yaml
env:
  - name: PASSWORD
    valueFrom:
      secretKeyRef:
        name: my-secret
        key: password
```

### Volume Mount
```yaml
volumes:
  - name: config
    configMap:
      name: my-config
volumeMounts:
  - name: config
    mountPath: /etc/config
```

## Multi-Container Pods

### Sidecar Pattern
```yaml
spec:
  containers:
    - name: app
      image: myapp:1.0
    - name: sidecar
      image: log-collector:1.0
```

### Init Containers
```yaml
spec:
  initContainers:
    - name: init
      image: busybox
      command: ['sh', '-c', 'echo init']
  containers:
    - name: app
      image: myapp:1.0
```

## Networking

### Service Types
- **ClusterIP** - Internal cluster access (default)
- **NodePort** - External access via node IP
- **LoadBalancer** - External load balancer
- **ExternalName** - DNS alias

### Network Policies
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: my-network-policy
spec:
  podSelector:
    matchLabels:
      app: myapp
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: database
```

## Resources

- **Kubernetes Docs**: https://kubernetes.io/docs/
- **Kubernetes API**: https://kubernetes.io/docs/reference/
- **kubectl Cheatsheet**: https://kubernetes.io/docs/reference/kubectl/cheatsheet/
