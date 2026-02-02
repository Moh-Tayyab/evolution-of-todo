# OpenAI ChatKit Backend (Python) References

Official documentation and resources for building custom ChatKit backends using Python and the OpenAI Agents SDK.

## Official Resources

### OpenAI Documentation
- **OpenAI Agents SDK**: https://platform.openai.com/docs/agents
- **Agents API Reference**: https://platform.openai.com/docs/api-reference/agents
- **Python SDK**: https://github.com/openai/openai-python
- **ChatKit Protocol**: https://platform.openai.com/docs/chatkit

### OpenAI Agents SDK
- **Quick Start**: https://platform.openai.com/docs/agents/quickstart
- **Agent Creation**: https://platform.openai.com/docs/agents/creation
- **Tools & Functions**: https://platform.openai.com/docs/agents/tools
- **Streaming Responses**: https://platform.openai.com/docs/agents/streaming
- **Multi-Agent Systems**: https://platform.openai.com/docs/agents/multi-agent

## FastAPI Integration

### FastAPI Documentation
- **Official Docs**: https://fastapi.tiangolo.com/
- **User Guide**: https://fastapi.tiangolo.com/tutorial/
- **Advanced User Guide**: https://fastapi.tiangolo.com/advanced/
- **Async Operations**: https://fastapi.tiangolo.com/async/

### Server-Sent Events (SSE)
- **SSE with FastAPI**: https://fastapi.tiangolo.com/advanced/server-sent-events/
- **StreamingResponse**: https://fastapi.tiangolo.com/api-reference/#fastapi.responses.StreamingResponse

## ChatKit Protocol

### Event Types
```javascript
// Request event from ChatKit UI
{
  "type": "conversation.item.create",
  "conversation_id": "string",
  "item": {
    "type": "message",
    "role": "user",
    "content": [{"type": "input_text", "text": "message"}]
  }
}

// Response event to ChatKit UI
{
  "type": "conversation.item.created",
  "item": {
    "id": "string",
    "type": "message",
    "role": "assistant",
    "content": [{"type": "output_text", "text": "response"}]
  }
}
```

### Streaming Format
```
data: {"type":"response.delta","data":{"content":"Hello","done":false}}

data: {"type":"response.done","data":{}}
```

## Authentication

### JWT Token Validation
- **PyJWT Library**: https://pyjwt.readthedocs.io/
- **FastAPI Security**: https://fastapi.tiangolo.com/tutorial/security/
- **OAuth2 Flows**: https://fastapi.tiangolo.com/advanced/security/oauth2-scopes/

### Session Management
- **Sessions in FastAPI**: https://fastapi.tiangolo.com/advanced/async-sql-databases/
- **Cookie Management**: https://fastapi.tiangolo.com/tutorial/security/cookies/

## Provider Configuration

### OpenAI API
- **API Reference**: https://platform.openai.com/docs/api-reference
- **Models**: https://platform.openai.com/docs/models
- **Pricing**: https://openai.com/pricing
- **Rate Limits**: https://platform.openai.com/docs/guides/rate-limits

### Gemini via OpenAI-Compatible Endpoint
- **Gemini API**: https://ai.google.dev/gemini-api/docs
- **OpenAI-Compatible Format**: https://ai.google.dev/gemini-api/docs/openai
- **Authentication**: https://ai.google.dev/gemini-api/docs/authentication

## Deployment

### Docker
- **Dockerfile Best Practices**: https://docs.docker.com/develop/develop-files/dockerfile-recommendations/
- **FastAPI Docker Deployment**: https://fastapi.tiangolo.com/deployment/docker/
- **Multi-stage Builds**: https://docs.docker.com/build/building/multi-stage/

### Cloud Platforms
- **AWS Deployment**: https://fastapi.tiangolo.com/deployment/aws/
- **Google Cloud**: https://fastapi.tiangolo.com/deployment/google-cloud/
- **Azure**: https://fastapi.tiangolo.com/deployment/azure/
- **Render**: https://fastapi.tiangolo.com/deployment/render/

## Testing

### Pytest
- **Pytest Documentation**: https://docs.pytest.org/
- **Async Testing**: https://docs.pytest.org/en/stable/how-to/async.html
- **Fixtures**: https://docs.pytest.org/en/stable/fixture.html

### HTTP Testing
- **httpx Documentation**: https://www.python-httpx.org/
- **TestClient**: https://fastapi.tiangolo.com/testing/
- **Mocking**: https://docs.python.org/3/library/unittest.mock.html

## Environment Variables

### Python-dotenv
- **Documentation**: https://pypi.org/project/python-dotenv/
- **FastAPI Settings**: https://fastapi.tiangolo.com/advanced/settings/

### Configuration Pattern
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str
    gemini_api_key: str | None = None
    llm_provider: str = "openai"
    chatkit_domain_key: str
    jwt_secret: str

    class Config:
        env_file = ".env"
```

## Error Handling

### OpenAI Errors
- **Error Handling**: https://platform.openai.com/docs/guides/error-codes
- **Rate Limits**: https://platform.openai.com/docs/guides/rate-limits/error-handling

### FastAPI Exception Handlers
- **Exception Handling**: https://fastapi.tiangolo.com/tutorial/handling-errors/

## Monitoring & Observability

### Logging
- **Python Logging**: https://docs.python.org/3/library/logging.html
- **Structlog**: https://structlog.org/

### Metrics
- **Prometheus**: https://prometheus.io/
- **FastAPI Integration**: https://github.com/trallnag/prometheus-fastapi-instrumentator

## Security Best Practices

### OWASP Top 10
- **OWASP Guidelines**: https://owasp.org/www-project-top-ten/
- **Input Validation**: https://platform.openai.com/docs/guides/safety-validation

### API Security
- **API Key Management**: https://platform.openai.com/docs/guides/production-best-practices
- **Rate Limiting**: https://fastapi.tiangolo.com/tutorial/dependencies/#rate-limiting
- **CORS Configuration**: https://fastapi.tiangolo.com/tutorial/cors/

## Related Libraries

### Python Libraries
- **uv**: Fast Python package installer - https://github.com/astral-sh/uv
- **Pydantic**: Data validation - https://docs.pydantic.dev/
- **httpx**: Async HTTP client - https://www.python-httpx.org/
- **python-multipart**: Multipart form data - https://github.com/andrew-d/python-multipart

### Alternatives
- **LangChain**: https://python.langchain.com/
- **LlamaIndex**: https://www.llamaindex.ai/

## Example Projects

### Official Examples
- **FastAPI Chat Example**: https://github.com/openai/openai-quickstart-python
- **Agents SDK Examples**: https://github.com/openai/agents-examples

### Community Projects
- **ChatKit Backend Template**: https://github.com/example/chatkit-backend
- **Multi-Agent System**: https://github.com/example/multi-agent-fastapi

## Troubleshooting

### Common Issues

**Issue: Authentication failures**
- Verify JWT secret matches frontend
- Check token expiration
- Ensure CORS headers are correct

**Issue: Streaming not working**
- Check `text/event-stream` media type
- Verify SSE format with `data:` prefix
- Disable nginx buffering: `X-Accel-Buffering: no`

**Issue: Agent not responding**
- Verify API key is valid
- Check provider configuration
- Review agent instructions

**Issue: Rate limiting**
- Implement exponential backoff
- Use queue for concurrent requests
- Consider upgrading API tier

## Community Resources

- **OpenAI Developer Forum**: https://community.openai.com/
- **FastAPI GitHub Discussions**: https://github.com/tiangolo/fastapi/discussions
- **Python Discord**: https://discord.gg/python
- **Stack Overflow**: Tag questions with `openai` `fastapi` `python`

## Version Compatibility

| Component | Minimum Version | Recommended |
|-----------|----------------|-------------|
| Python | 3.11 | 3.13 |
| FastAPI | 0.100 | 0.115 |
| OpenAI SDK | 1.0 | Latest |
| Pydantic | 2.0 | 2.10 |

## Package Manager: uv

This project uses `uv` for fast Python package management.

### Installation
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Usage
```bash
# Install dependencies
uv pip install -r requirements.txt

# Run with uv
uvicorn app.main:app --reload
```
