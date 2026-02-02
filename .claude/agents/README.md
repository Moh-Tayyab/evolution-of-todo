# Claude Code Agents Catalog

**Version:** 1.2.0
**Last Updated:** 2025-02-02

This directory contains 19 specialized production-grade agents for the Evolution of Todo project. Each agent is designed to handle specific development tasks with deep domain expertise, following industry best practices and maintaining consistency with the project constitution.

## Table of Contents

- [Agent Overview](#agent-overview)
- [Agent Architecture](#agent-architecture)
- [Quick Reference Guide](#quick-reference-guide)
- [Usage Guidelines](#usage-guidelines)
- [Agent Collaboration Patterns](#agent-collaboration-patterns)
- [Agent File Conventions](#agent-file-conventions)
- [Maintenance](#maintenance)
- [Contributing](#contributing)
- [See Also](#see-also)

## Agent Overview

| Agent | Purpose | Model | Skills |
|-------|---------|-------|--------|
| [betterauth-engineer](./betterauth-engineer.md) | BetterAuth authentication system with 2FA, OAuth, and session management | sonnet | tech-stack-constraints |
| [chatkit-backend-engineer](./chatkit-backend-engineer.md) | Custom ChatKit backend using OpenAI Agents SDK for Python | sonnet | openai-chatkit-backend-python |
| [chatkit-frontend-engineer](./chatkit-frontend-engineer.md) | ChatKit UI embedding, configuration, and frontend integration | sonnet | openai-chatkit-frontend-embed-skill |
| [constitution-reader](./constitution-reader.md) | Validates project compliance with constitution requirements and spec traceability | sonnet | - |
| [database-expert](./database-expert.md) | PostgreSQL schema design, Drizzle ORM, migrations, and query optimization | sonnet | drizzle-orm, neon-postgres, sql-optimization-patterns |
| [fastapi-pro](./fastapi-pro.md) | Production-grade FastAPI async APIs with Pydantic validation and OpenAPI documentation | sonnet | fastapi, better-auth-python |
| [fullstack-engineer](./fullstack-engineer.md) | End-to-end Next.js frontend + FastAPI backend integration | sonnet | nextjs-expert, fastapi, drizzle-orm |
| [gemini-integration](./gemini-integration.md) | Cross-platform compatibility between Claude Code and Gemini systems | sonnet | tech-stack-constraints, gemini-patterns |
| [kubernetes-architect](./kubernetes-architect.md) | Kubernetes infrastructure, Helm charts, GitOps, and production deployment | sonnet | helm-charts-scffolding, k8s-manifest-generator |
| [monorepo-architect](./monorepo-architect.md) | Multi-package workspace management with pnpm and Turborepo | sonnet | tech-stack-constraints, git-workflow |
| [nextjs-engineer](./nextjs-engineer.md) | Next.js 16+ App Router, Server Components, and React best practices | sonnet | nextjs-expert |
| [performance-optimization](./performance-optimization.md) | Core Web Vitals, bundle optimization, caching strategies, and query performance | sonnet | nextjs-expert, drizzle-orm, sql-optimization-patterns |
| [prompt-engineer](./prompt-engineer.md) | AI prompt design, system messages, and optimization techniques | sonnet | prompt-engineer-patterns |
| [security-specialist](./security-specialist.md) | OWASP Top 10 mitigation, authentication security, and vulnerability scanning | sonnet | fastapi, better-auth-python, tech-stack-constraints |
| [testing-qa-specialist](./testing-qa-specialist.md) | Unit, integration, E2E, and visual regression testing with TDD workflows | sonnet | vitest-expert, playwright-testing, cypress-testing, tdd-workflow |
| [ui-ux-designer](./ui-ux-designer.md) | Component design, accessibility, shadcn/ui integration, and animations | sonnet | shadcn, framer-motion, tailwind-ccs, acternity-ui, gsap-animations |
| [vercel-deployment](./vercel-deployment.md) | Vercel platform deployment, environment management, health checks, and rollback operations | sonnet | vercel-deployment |
| [voice-task](./voice-task.md) | Speech recognition, voice commands, and text-to-speech integration | sonnet | tech-stack-constraints |
| [playwright-automation-engineer](./playwright-automation-engineer.md) | Playwright browser automation, console monitoring, network inspection, and debugging via MCP | sonnet | playwright-mcp |

## Agent Architecture

### System Message Structure

Each agent follows a standardized structure for consistency and maintainability:

```yaml
---
name: agent-name
version: 1.1.0
lastUpdated: 2025-01-18
description: Brief description of when to use this agent
tools: [list of available tools]
model: sonnet | opus | haiku
skills: [list of related skills]
---

# Professional Title

You are a **production-grade [specialization] specialist** with deep expertise in [core domain].

## Core Expertise Areas

1. **Expertise Area One** - Description
2. **Expertise Area Two** - Description
...
```

### Agent Components

1. **YAML Frontmatter** - Metadata for agent discovery and configuration
2. **Role Definition** - Clear specialist identity and expertise
3. **Scope Boundaries** - What the agent handles and what it defers
4. **Core Concepts** - Fundamental knowledge with production examples
5. **Best Practices** - Industry-standard patterns and conventions
6. **Common Mistakes** - Anti-patterns to avoid with examples
7. **Success Criteria** - Clear definition of successful outcomes

## Quick Reference Guide

### Frontend Development

| Need | Agent | Description |
|------|-------|-------------|
| Component Design | [ui-ux-designer](./ui-ux-designer.md) | shadcn/ui, accessibility, animations |
| Next.js Features | [nextjs-engineer](./nextjs-engineer.md) | App Router, Server Components |
| Performance | [performance-optimization](./performance-optimization.md) | Core Web Vitals, optimization |
| ChatKit Frontend | [chatkit-frontend-engineer](./chatkit-frontend-engineer.md) | UI embedding and configuration |

### Backend Development

| Need | Agent | Description |
|------|-------|-------------|
| FastAPI APIs | [fastapi-pro](./fastapi-pro.md) | Async endpoints, validation |
| Database Design | [database-expert](./database-expert.md) | PostgreSQL, Drizzle ORM |
| Authentication | [betterauth-engineer](./betterauth-engineer.md) | BetterAuth, OAuth, 2FA |
| ChatKit Backend | [chatkit-backend-engineer](./chatkit-backend-engineer.md) | Agents SDK, Python |

### Full Stack

| Need | Agent | Description |
|------|-------|-------------|
| End-to-End Features | [fullstack-engineer](./fullstack-engineer.md) | Frontend + Backend integration |
| Security Review | [security-specialist](./security-specialist.md) | OWASP mitigation |
| Compliance Check | [constitution-reader](./constitution-reader.md) | Spec traceability validation |

### Infrastructure

| Need | Agent | Description |
|------|-------|-------------|
| Kubernetes | [kubernetes-architect](./kubernetes-architect.md) | Helm, manifests, GitOps |
| Vercel Deployment | [vercel-deployment](./vercel-deployment.md) | Vercel deployments, env management, health checks |
| Monorepo | [monorepo-architect](./monorepo-architect.md) | pnpm workspaces, Turborepo |
| Git Workflow | Use git-workflow skill | Branching, PRs, commits |

### Quality & Testing

| Need | Agent | Description |
|------|-------|-------------|
| Testing Strategy | [testing-qa-specialist](./testing-qa-specialist.md) | Unit, integration, E2E |
| Browser Automation | [playwright-automation-engineer](./playwright-automation-engineer.md) | Console monitoring, network inspection, screenshots |
| Performance | [performance-optimization](./performance-optimization.md) | Bundle size, caching |
| Security | [security-specialist](./security-specialist.md) | Vulnerability scanning |

### AI & Integration

| Need | Agent | Description |
|------|-------|-------------|
| Prompt Design | [prompt-engineer](./prompt-engineer.md) | System messages, optimization |
| Cross-Platform | [gemini-integration](./gemini-integration.md) | Claude/Gemini compatibility |
| Constitution | [constitution-reader](./constitution-reader.md) | Compliance validation |

### Special Features

| Need | Agent | Description |
|------|-------|-------------|
| Voice Interface | [voice-task](./voice-task.md) | Speech recognition, TTS |

## Usage Guidelines

### When to Use Agents

Agents are designed for specific scenarios:

**Use agents when:**
1. **Specialized Knowledge Required** - Task demands deep domain expertise
2. **Multi-Step Coordination** - Work involves multiple coordinated steps
3. **Architecture Decisions** - Significant technical decisions need consideration
4. **Production Standards** - Code must meet professional quality standards
5. **Complex Debugging** - Issues require systematic troubleshooting

**Consider direct implementation for:**
- Simple, straightforward tasks
- Single-line or small changes
- Well-understood patterns
- Quick prototyping

### Agent Selection Process

1. **Identify Primary Domain**
   - Frontend (UI, components, frameworks)
   - Backend (APIs, database, business logic)
   - Infrastructure (deployment, DevOps, architecture)
   - Quality (testing, security, performance)
   - Integration (authentication, AI, cross-platform)

2. **Check for Multi-Domain Tasks**
   - Full stack tasks may need multiple agents
   - Consider starting with a generalist (fullstack-engineer)
   - Delegate to specialists as needed

3. **Review Agent Scope**
   - Verify the agent handles your specific concerns
   - Check scope boundaries for what it doesn't handle
   - Identify related agents for collaboration

4. **Consider Complementary Skills**
   - Skills provide detailed implementation guidance
   - Agents may invoke skills for specific patterns
   - Skills are reusable across multiple agents

### Agent Collaboration Patterns

Some tasks require multiple agents working together:

**Full Stack Application:**
```
fullstack-engineer (lead)
├── nextjs-engineer (frontend details)
├── fastapi-pro (backend API)
├── database-expert (schema design)
└── ui-ux-designer (component styling)
```

**Authentication System:**
```
betterauth-engineer (frontend auth)
├── security-specialist (security review)
└── fastapi-pro (backend session management)
```

**Performance Optimization:**
```
performance-optimization (lead)
├── database-expert (query optimization)
├── nextjs-engineer (frontend optimization)
└── fullstack-engineer (caching strategies)
```

**Production Deployment:**
```
kubernetes-architect (K8s infrastructure)
├── security-specialist (security hardening)
├── monorepo-architect (build optimization)
└── testing-qa-specialist (pre-deployment tests)

vercel-deployment (Vercel infrastructure)
├── nextjs-engineer (frontend build config)
├── security-specialist (security headers)
└── testing-qa-specialist (pre-deployment E2E tests)
```

### Agent Skills Reference

Agents leverage skills for detailed implementation patterns:

| Skill | Purpose | Used By Agents |
|-------|---------|----------------|
| constitution-reader | Spec compliance validation | All agents (via skill invocation) |
| nextjs-expert | Next.js App Router patterns | nextjs-engineer, fullstack-engineer, performance-optimization |
| fastapi | FastAPI best practices | fastapi-pro, fullstack-engineer, security-specialist |
| drizzle-orm | Drizzle ORM patterns | database-expert, fullstack-engineer, performance-optimization |
| neon-postgres | Neon PostgreSQL integration | database-expert, fullstack-engineer, performance-optimization |
| openai-chatkit-frontend-embed-skill | ChatKit frontend integration | chatkit-frontend-engineer |
| openai-chatkit-backend-python | ChatKit backend Python | chatkit-backend-engineer |
| gemini-patterns | Cross-platform AI configuration | gemini-integration, prompt-engineer |
| better-auth-python | Python auth patterns | fastapi-pro, chatkit-backend-engineer, security-specialist |
| sql-optimization-patterns | Query optimization | database-expert, performance-optimization |
| prompt-engineer-patterns | Prompt design techniques | prompt-engineer, all agents (system messages) |
| shadcn | shadcn/ui components | ui-ux-designer |
| helm-charts-scffolding | Helm chart creation | kubernetes-architect |
| k8s-manifest-generator | Kubernetes manifests | kubernetes-architect |
| vercel-deployment | Vercel platform deployment automation | vercel-deployment |

## Agent File Conventions

### Required Structure

Every agent must follow this structure:

```yaml
---
name: agent-name
version: 1.1.0
lastUpdated: 2025-01-18
description: >
  Detailed description of when to use this agent,
  what expertise it provides, and what value it delivers.
model: sonnet
tools: [list of tools]
skills: [list of related skills]
---

# Professional Agent Title

You are a **production-grade [specialization] specialist** with deep expertise in [core domain]. You help teams [value proposition].

## Core Expertise Areas

1. **Area One** - Description
2. **Area Two** - Description
...
(Typically 10 areas for comprehensive coverage)

## When to Use This Agent

Use this agent whenever the user asks to:

**Category One:**
- "Example request 1"
- "Example request 2"

**Category Two:**
- "Example request 3"
- "Example request 4"

## Scope Boundaries

### You Handle

**Primary Responsibilities:**
- Specific responsibility one
- Specific responsibility two

**What You Handle:**
- Detailed handling areas

### You Don't Handle

- **Deferred Domain** - Defer to [other-agent] for [specific concerns]
- **Outside Scope** - [What's not included]

## [Domain] Fundamentals

### Core Concept One

[Explanation with production-grade code examples]

### Core Concept Two

[Explanation with production-grade code examples]

## Best Practices

### 1. Best Practice Title

**DO** - Correct approach:
```language
[Code example]
```

**DON'T** - Wrong approach:
```language
[Code example]
```

[Additional best practices - typically 5-10]

## Common Mistakes to Avoid

### Mistake 1: Mistake Title

**Wrong:**
```language
[Incorrect code]
```

**Correct:**
```language
[Correct code]
```

[Additional mistakes - typically 3-5]

## Package Manager: [pnpm|uv|npm]

This project uses [package manager] for dependency management.

**Installation:**
```bash
[Install command]
```

**Install dependencies:**
```bash
[Dependency installation command]
```

**Never use [alternative] - always use [recommended].**

## Troubleshooting

### Issue 1: Issue Title

**Symptoms:** [What goes wrong]

**Diagnosis:**
1. [Check item]
2. [Check item]

**Solution:**
```language
[Fix code]
```

[Additional issues]

## Verification Process

After implementing [feature]:

1. **Check One:** [Description]
2. **Check Two:** [Description]
3. **Check Three:** [Description]

You're successful when [clear success criteria].
```

### Required Frontmatter Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Unique identifier (kebab-case) |
| `version` | string | Yes | SemVer version (1.1.0) |
| `lastUpdated` | date | Yes | ISO date (YYYY-MM-DD) |
| `description` | string | Yes | Detailed description of agent purpose |
| `model` | string | Yes | Preferred model (sonnet, opus, haiku) |
| `tools` | array | Yes | Available tools for the agent |
| `skills` | array | No | Related skills for reference |

### Content Requirements

1. **Professional Tone** - Production-grade language and examples
2. **Code Examples** - Practical, runnable code snippets
3. **Best Practices** - At least 5 DO/DON'T comparisons
4. **Common Mistakes** - At least 3 wrong/correct examples
5. **Success Criteria** - Clear definition of successful outcomes
6. **Scope Clarity** - Explicit boundaries and delegation guidance

## Maintenance

### Version Management

When updating agents:
1. Increment `version` following SemVer
2. Update `lastUpdated` to current date
3. Document significant changes in agent content
4. Maintain backward compatibility when possible

### Content Updates

Regular maintenance tasks:
1. **Add New Examples** - Include emerging patterns and use cases
2. **Update Skills** - Add new skills as they're developed
3. **Refresh Code** - Ensure examples use current library versions
4. **Improve Clarity** - Enhance explanations based on usage feedback
5. **Fix Issues** - Address bugs or inaccuracies discovered

### Quality Assurance

Before deploying agent updates:
1. **Validate YAML** - Ensure frontmatter parses correctly
2. **Test Examples** - Verify code examples are runnable
3. **Check Links** - Ensure all references resolve correctly
4. **Review Scope** - Confirm boundaries remain accurate
5. **Verify Skills** - Check that referenced skills exist

### Testing Agent Effectiveness

Evaluate agent performance:
1. **Real Task Testing** - Use agent for actual development work
2. **User Feedback** - Gather input from team members
3. **Success Metrics** - Measure task completion rates
4. **Quality Assessment** - Review code quality and adherence to standards
5. **Iteration** - Continuously improve based on results

## Contributing

### Adding New Agents

When creating a new agent:

1. **Follow Structure** - Use the standardized template
2. **Define Scope** - Clear boundaries and delegation points
3. **Provide Examples** - Comprehensive, runnable code samples
4. **Include Best Practices** - At least 5 DO/DON'T comparisons
5. **Add Success Criteria** - Clear definition of successful outcomes
6. **Update README** - Add to the overview table
7. **Document Skills** - Create or reference relevant skills
8. **Test Thoroughly** - Verify agent handles intended tasks

### Agent Review Process

Before merging a new agent:

1. **Structure Review** - Confirms all required sections present
2. **Content Quality** - Professional tone and accurate information
3. **Code Validation** - Examples are correct and runnable
4. **Scope Clarity** - Boundaries are well-defined
5. **Cross-Reference** - Skills and related agents are properly linked
6. **Documentation** - README is updated with new agent
7. **Testing** - Agent is tested with real scenarios

### Style Guidelines

Follow these conventions:
1. **YAML Frontmatter** - Use double quotes for strings with special characters
2. **Markdown** - Use ATX-style headings (#, ##, ###)
3. **Code Blocks** - Specify language for syntax highlighting
4. **Links** - Use relative paths for agent references
5. **Formatting** - Consistent spacing and indentation
6. **Tone** - Professional, concise, and actionable

## See Also

### Related Documentation

- [Skills Catalog](../skills/README.md) - Detailed skill documentation
- [Project Constitution](../../.specify/memory/constitution.md) - Project principles and standards
- [CLAUDE.md](../../CLAUDE.md) - Main project configuration

### External Resources

- [Claude Code Documentation](https://docs.anthropic.com/claude-code)
- [Claude Agents Reference](https://docs.anthropic.com/claude/docs/agents)
- [MCP Specification](https://modelcontextprotocol.io/)

### Project-Specific

- [Phase I Console App](../../Phase-I-Console-App/README.md) - Completed console implementation
- [Phase II Web App](../../Phase-II-fullstack-web-app/README.md) - Full-stack web application
- [Specs Directory](../../specs/) - Feature specifications and plans
