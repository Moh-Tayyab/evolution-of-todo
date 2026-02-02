# OpenAI ChatKit Frontend Embed References

Official documentation and resources for embedding OpenAI ChatKit UI into TypeScript/JavaScript web applications.

## Official Resources

### OpenAI ChatKit Documentation
- **ChatKit Overview**: https://platform.openai.com/docs/chatkit
- **Embed Guide**: https://platform.openai.com/docs/chatkit/embedding
- **Configuration Reference**: https://platform.openai.com/docs/chatkit/config
- **Widget API**: https://platform.openai.com/docs/chatkit/widget-api

### ChatKit UI Components
- **Component Library**: https://platform.openai.com/docs/chatkit/components
- **Theme Customization**: https://platform.openai.com/docs/chatkit/theming
- **Styling Guide**: https://platform.openai.com/docs/chatkit/styling

## Installation

### npm/yarn/pnpm
```bash
npm install @openai/chatkit
# or
yarn add @openai/chatkit
# or
pnpm add @openai/chatkit
```

### CDN
```html
<script src="https://cdn.openai.com/chatkit/latest.js"></script>
```

## Quick Start

### Basic Embedding
```tsx
import { ChatKit } from '@openai/chatkit';

function App() {
  return (
    <ChatKit
      config={{
        api: {
          url: 'https://your-backend.com/chatkit/api',
          fetch: (url, options) => fetch(url, {
            ...options,
            headers: {
              ...options?.headers,
              'Authorization': `Bearer ${getToken()}`
            }
          })
        }
      }}
    />
  );
}
```

## Configuration

### API Configuration
```typescript
{
  api: {
    url: string;              // Backend ChatKit endpoint
    fetch?: (url, init) => Promise<Response>;  // Custom fetch
    domainKey?: string;       // Domain validation key
  }
}
```

### Upload Configuration
```typescript
{
  upload: {
    strategy: 'direct' | 'attachment';  // Upload strategy
    maxFileSize: number;                // Bytes (default: 10MB)
    allowedTypes: string[];             // MIME types
  }
}
```

### Theme Configuration
```typescript
{
  theme: {
    mode: 'light' | 'dark' | 'auto';
    accentColor: string;      // CSS color
    borderRadius: string;     // CSS border-radius
    fontFamily: string;       // CSS font-family
  }
}
```

### Behavior Configuration
```typescript
{
  behavior: {
    welcomeMessage: string;
    placeholder: string;
    submitOnEnter: boolean;
    autoScroll: boolean;
  }
}
```

## Integration Guides

### Next.js Integration
```tsx
// app/page.tsx
'use client';

import { ChatKit } from '@openai/chatkit';

export default function ChatPage() {
  return (
    <ChatKit config={{
      api: {
        url: process.env.NEXT_PUBLIC_CHATKIT_URL!,
        fetch: authenticatedFetch
      }
    }} />
  );
}
```

### React Integration
```tsx
import { ChatKit } from '@openai/chatkit';

function ChatApp() {
  return (
    <ChatKit config={{
      api: {
        url: '/api/chatkit',
        fetch: fetchWithAuth
      },
      theme: { mode: 'dark' }
    }} />
  );
}
```

### Vanilla JavaScript Integration
```html
<div id="chatkit-container"></div>

<script>
  const { ChatKit } = window.OpenAIChatKit;

  const chatkit = new ChatKit({
    target: document.getElementById('chatkit-container'),
    config: {
      api: { url: '/chatkit/api' }
    }
  });
</script>
```

## Authentication

### JWT Token Injection
```typescript
function authenticatedFetch(url: string, options?: RequestInit) {
  const token = localStorage.getItem('auth_token');

  return fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      'Authorization': `Bearer ${token}`,
      'X-Domain-Key': process.env.NEXT_PUBLIC_DOMAIN_KEY
    }
  });
}
```

### Session Management
```typescript
import { useEffect, useState } from 'react';

function ChatWithAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth().then(setIsAuthenticated);
  }, []);

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  return <ChatKit config={{ api: { url: '/chatkit/api' } }} />;
}
```

## Theming

### Custom Theme Example
```typescript
<ChatKit
  config={{
    theme: {
      mode: 'dark',
      accentColor: '#6366f1',
      borderRadius: '12px',
      fontFamily: 'Inter, system-ui, sans-serif',
      customStyles: {
        '--ck-background': '#0f172a',
        '--ck-surface': '#1e293b',
        '--ck-text': '#f1f5f9',
        '--ck-border': '#334155'
      }
    }
  }}
/>
```

### CSS Variables
```css
:root {
  --ck-background: #ffffff;
  --ck-surface: #f8fafc;
  --ck-text: #0f172a;
  --ck-border: #e2e8f0;
  --ck-primary: #6366f1;
  --ck-primary-foreground: #ffffff;
}

.dark {
  --ck-background: #0f172a;
  --ck-surface: #1e293b;
  --ck-text: #f1f5f9;
  --ck-border: #334155;
}
```

## File Uploads

### Direct Upload Strategy
```typescript
<ChatKit
  config={{
    upload: {
      strategy: 'direct',
      maxFileSize: 10 * 1024 * 1024,  // 10MB
      allowedTypes: ['image/*', 'application/pdf'],
      uploadUrl: '/api/upload'
    }
  }}
/>
```

### Custom Upload Handler
```typescript
<ChatKit
  config={{
    upload: {
      strategy: 'attachment',
      async handleFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        return response.json();
      }
    }
  }}
/>
```

## Advanced Features

### Context Injection
```typescript
<ChatKit
  config={{
    context: {
      userId: 'user-123',
      userName: 'John Doe',
      metadata: {
        plan: 'premium',
        locale: 'en-US'
      }
    }
  }}
/>
```

### Custom Messages
```typescript
<ChatKit
  config={{
    behavior: {
      welcomeMessage: 'Hello! How can I help you today?',
      suggestions: [
        'Tell me about pricing',
        'Show me documentation',
        'Contact support'
      ]
    }
  }}
/>
```

### Event Handling
```typescript
import { useChatKitEvents } from '@openai/chatkit';

function ChatWithEvents() {
  useChatKitEvents({
    onMessageSent: (message) => console.log('Sent:', message),
    onMessageReceived: (message) => console.log('Received:', message),
    onError: (error) => console.error('Error:', error),
    onUploadComplete: (file) => console.log('Uploaded:', file)
  });

  return <ChatKit config={{ api: { url: '/chatkit/api' } }} />;
}
```

## Mobile Support

### Responsive Design
```css
.chatkit-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .chatkit-container {
    height: 100vh;
    height: 100dvh;  /* Dynamic viewport height */
  }
}
```

### Touch Interactions
```typescript
<ChatKit
  config={{
    behavior: {
      submitOnEnter: false,  // Better for mobile keyboards
      autoScroll: true,
      hapticFeedback: true
    }
  }}
/>
```

## Accessibility

### ARIA Labels
The ChatKit widget includes:
- Proper ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader announcements for new messages
- Focus management for message input

### Keyboard Shortcuts
- `Enter`: Send message (when `submitOnEnter` is true)
- `Shift+Enter`: Insert newline
- `Escape`: Close suggestions
- `Tab`: Navigate through interactive elements

## Error Handling

### Error Boundary (React)
```tsx
class ChatKitErrorBoundary extends React.Component {
  componentDidCatch(error: Error) {
    console.error('ChatKit error:', error);
    reportError(error);
  }

  render() {
    return this.props.children;
  }
}

<ChatKitErrorBoundary>
  <ChatKit config={{ api: { url: '/chatkit/api' } }} />
</ChatKitErrorBoundary>
```

### Connection Status
```typescript
import { useChatKitConnection } from '@openai/chatkit';

function ConnectionStatus() {
  const { status, reconnect } = useChatKitConnection();

  return (
    <div>
      Status: {status}
      {status === 'disconnected' && (
        <button onClick={reconnect}>Reconnect</button>
      )}
    </div>
  );
}
```

## Testing

### Unit Testing
```typescript
import { render, screen } from '@testing-library/react';
import { ChatKit } from '@openai/chatkit';

test('renders chat widget', () => {
  render(
    <ChatKit
      config={{ api: { url: '/chatkit/api' } }}
    />
  );
  expect(screen.getByRole('textbox')).toBeInTheDocument();
});
```

### E2E Testing
```typescript
import { test, expect } from '@playwright/test';

test('send message', async ({ page }) => {
  await page.goto('/chat');
  await page.fill('[data-testid="message-input"]', 'Hello');
  await page.click('[data-testid="send-button"]');
  await expect(page.locator('text=Hello')).toBeVisible();
});
```

## Troubleshooting

### Common Issues

**Issue: Blank widget**
- Verify `api.url` is correct
- Check browser console for errors
- Ensure CORS is configured on backend
- Verify authentication headers are set

**Issue: Messages not appearing**
- Check SSE streaming is working
- Verify response format matches ChatKit protocol
- Inspect Network tab for failed requests

**Issue: Uploads failing**
- Verify `uploadUrl` endpoint exists
- Check file size limits
- Ensure `FormData` is handled correctly
- Verify CORS headers for uploads

**Issue: Styling issues**
- Check CSS variables are applied
- Verify z-index conflicts
- Ensure container has defined height
- Check for conflicting global styles

## Performance Optimization

### Lazy Loading
```tsx
import dynamic from 'next/dynamic';

const ChatKit = dynamic(() => import('@openai/chatkit').then(m => m.ChatKit), {
  loading: () => <ChatSkeleton />,
  ssr: false
});
```

### Message Caching
```typescript
<ChatKit
  config={{
    cache: {
      enabled: true,
      maxSize: 100,  // Max messages to cache
      ttl: 3600000   // 1 hour
    }
  }}
/>
```

## Browser Support

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 90+ | Full support |
| Firefox | 88+ | Full support |
| Safari | 14+ | Full support |
| Edge | 90+ | Full support |
| Mobile Safari | 14+ | Full support |
| Chrome Mobile | 90+ | Full support |

## TypeScript Types

### Type Definitions
```typescript
import type {
  ChatKitConfig,
  ChatKitApiConfig,
  ChatKitThemeConfig,
  ChatKitUploadConfig,
  ChatKitBehaviorConfig
} from '@openai/chatkit';

const config: ChatKitConfig = {
  api: { url: '/chatkit/api' },
  theme: { mode: 'dark' }
};
```

## Related Resources

### Backend Integration
- **ChatKit Backend Python**: `/skills/openai-chatkit-backend-python/`
- **FastAPI Chat Server**: https://fastapi.tiangolo.com/tutorial/
- **SSE Implementation**: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events

### Frontend Frameworks
- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **Vue Integration**: https://vuejs.org/guide/
