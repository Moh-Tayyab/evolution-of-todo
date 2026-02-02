# Claude Code Skills Catalog

**Version:** 1.2.0
**Last Updated:** 2025-02-02

This directory contains specialized production-grade skills for the Evolution of Todo project. Skills provide detailed implementation guidance, patterns, and best practices for specific technologies, frameworks, and development methodologies. Unlike agents which orchestrate tasks, skills serve as authoritative references for implementation details.

## Table of Contents

- [Skill Overview](#skill-overview)
- [Skill Categories](#skill-categories)
- [Skill Structure](#skill-structure)
- [Skill vs Agent Distinction](#skill-vs-agent-distinction)
- [Quick Reference by Technology](#quick-reference-by-technology)
- [Using Skills](#using-skills)
- [Creating New Skills](#creating-new-skills)
- [Maintenance](#maintenance)
- [See Also](#see-also)

## Skill Overview

| Skill | Purpose | Used By Agents |
|-------|---------|----------------|
| [acternity-ui](./acternity-ui/SKILL.md) | Acternity UI component library patterns | ui-ux-designer |
| [better-auth-python](./better-auth-python/SKILL.md) | BetterAuth authentication for Python backends | fastapi-pro, chatkit-backend-engineer, security-specialist |
| [better-auth-ts](./better-auth-ts/SKILL.md) | BetterAuth authentication for TypeScript frontends | betterauth-engineer |
| [cli-builder](./cli-builder/SKILL.md) | CLI application building patterns | All agents (for tooling) |
| [code-reviewer](./code-reviewer/SKILL.md) | Code review patterns and checklists | All agents |
| [console-ui](./console-ui/SKILL.md) | Console/terminal UI patterns | Phase I console apps |
| [constitution-reader](./constitution-reader/SKILL.md) | Constitution compliance validation and spec traceability | All agents (via skill invocation) |
| [drizzle-orm](./drizzle-orm/SKILL.md) | Drizzle ORM schema, relations, and migrations | database-expert, fullstack-engineer, performance-optimization |
| [fastapi](./fastapi/SKILL.md) | FastAPI async REST API patterns | fastapi-pro, fullstack-engineer, security-specialist |
| [framer-motion](./framer-motion/SKILL.md) | Framer Motion animation patterns | ui-ux-designer |
| [gemini-patterns](./gemini-patterns/SKILL.md) | Cross-platform Claude/Gemini configuration | gemini-integration, prompt-engineer |
| [git-workflow](./git-workflow/SKILL.md) | Git branching and PR workflow patterns | monorepo-architect, all agents |
| [gitops-automation](./gitops-automation/SKILL.md) | GitOps automation for infrastructure deployment | kubernetes-architect |
| [gsap-animations](./gsap-animations/SKILL.md) | GSAP animation library patterns | ui-ux-designer |
| [helm-charts-scffolding](./helm-charts-scffolding/SKILL.md) | Helm chart creation and templating | kubernetes-architect |
| [k8s-manifest-generator](./k8s-manifest-generator/SKILL.md) | Kubernetes YAML manifest generation | kubernetes-architect |
| [neon-postgres](./neon-postgres/SKILL.md) | Neon serverless PostgreSQL integration | database-expert, fullstack-engineer, performance-optimization |
| [nextjs-expert](./nextjs-expert/SKILL.md) | Next.js 15+ App Router and React patterns | nextjs-engineer, fullstack-engineer, performance-optimization |
| [openai-chatkit-backend-python](./openai-chatkit-backend-python/SKILL.md) | Custom ChatKit backend with OpenAI Agents SDK | chatkit-backend-engineer |
| [openai-chatkit-frontend-embed-skill](./openai-chatkit-frontend-embed-skill/SKILL.md) | ChatKit UI embedding and configuration | chatkit-frontend-engineer |
| [prompt-engineer-patterns](./prompt-engineer-patterns/SKILL.md) | AI prompt design and optimization | prompt-engineer, all agents |
| [playwright-testing](./playwright-testing/SKILL.md) | Playwright E2E testing for modern web applications | testing-qa-specialist |
| [playwright-mcp](./playwright-mcp/SKILL.md) | Playwright MCP server for browser automation & monitoring | playwright-automation-engineer |
| [shadcn](./shadcn/SKILL.md) | shadcn/ui component patterns | ui-ux-designer |
| [spec-driven-development](./spec-driven-development/SKILL.md) | Spec-Driven Development for requirements analysis | All agents (via skill invocation) |
| [sql-optimization-patterns](./sql-optimization-patterns/SKILL.md) | SQL query optimization techniques | database-expert, performance-optimization |
| [tailwind-ccs](./tailwind-ccs/SKILL.md) | Tailwind CSS utility framework | ui-ux-designer |
| [tdd-workflow](./tdd-workflow/SKILL.md) | Test-driven development workflow | testing-qa-specialist |
| [tech-stack-constraints](./tech-stack-constraints/SKILL.md) | Project technology constraints and standards | Most agents |
| [vitest-expert](./vitest-expert/SKILL.md) | Vitest testing framework for TypeScript/JavaScript projects | testing-qa-specialist |
| [voice-task](./voice-task/SKILL.md) | Voice interface and TTS patterns | voice-task |
| [vercel-deployment](./vercel-deployment/SKILL.md) | Vercel platform deployment automation | fullstack-engineer, nextjs-engineer |

## Skill Categories

### Frontend Skills

Component libraries, styling frameworks, and UI patterns for web development.

| Skill | Description | Key Patterns |
|-------|-------------|--------------|
| [nextjs-expert](./nextjs-expert/SKILL.md) | Next.js 15+ App Router, Server Components | Server/Client architecture, data fetching |
| [shadcn](./shadcn/SKILL.md) | shadcn/ui component library | Component composition, theming |
| [framer-motion](./framer-motion/SKILL.md) | React animation library | Gesture animations, transitions |
| [gsap-animations](./gsap-animations/SKILL.md) | GSAP animation library | Timeline animations, scroll triggers |
| [tailwind-ccs](./tailwind-ccs/SKILL.md) | Tailwind CSS utility framework | Responsive design, custom utilities |
| [acternity-ui](./acternity-ui/SKILL.md) | Acternity UI component collection | Animated components, effects |
| [openai-chatkit-frontend-embed-skill](./openai-chatkit-frontend-embed-skill/SKILL.md) | ChatKit UI integration | Widget configuration, authentication |

### Backend Skills

Server-side frameworks, ORMs, databases, and API patterns.

| Skill | Description | Key Patterns |
|-------|-------------|--------------|
| [fastapi](./fastapi/SKILL.md) | FastAPI async REST framework | Dependency injection, validation |
| [drizzle-orm](./drizzle-orm/SKILL.md) | Drizzle ORM for TypeScript | Schema definitions, relations |
| [neon-postgres](./neon-postgres/SKILL.md) | Neon serverless PostgreSQL | Connection pooling, migrations |
| [sql-optimization-patterns](./sql-optimization-patterns/SKILL.md) | Database query optimization | Indexing strategies, execution plans |
| [better-auth-python](./better-auth-python/SKILL.md) | BetterAuth for Python backends | Session management, OAuth |
| [better-auth-ts](./better-auth-ts/SKILL.md) | BetterAuth for TypeScript frontends | JWT handling, providers |
| [openai-chatkit-backend-python](./openai-chatkit-backend-python/SKILL.md) | Custom ChatKit backend | Agents SDK, streaming responses |

### Infrastructure Skills

Deployment, containerization, and orchestration patterns.

| Skill | Description | Key Patterns |
|-------|-------------|--------------|
| [vercel-deployment](./vercel-deployment/SKILL.md) | Vercel platform deployment | CI/CD, environment variables, rollback |
| [helm-charts-scffolding](./helm-charts-scffolding/SKILL.md) | Helm chart templates | Chart structure, values.yaml |
| [k8s-manifest-generator](./k8s-manifest-generator/SKILL.md) | Kubernetes YAML manifests | Deployment specs, services |

### Development Workflow Skills

Git, testing, code review, and development methodologies.

| Skill | Description | Key Patterns |
|-------|-------------|--------------|
| [git-workflow](./git-workflow/SKILL.md) | Git branching and PR workflows | Feature branches, commit conventions |
| [tdd-workflow](./tdd-workflow/SKILL.md) | Test-driven development | Red-green-refactor cycle |
| [playwright-testing](./playwright-testing/SKILL.md) | Playwright E2E testing | Browser automation, visual regression |
| [playwright-mcp](./playwright-mcp/SKILL.md) | Playwright MCP server | Console monitoring, network inspection, screenshots |
| [code-reviewer](./code-reviewer/SKILL.md) | Code review patterns | Review checklist, feedback |
| [cli-builder](./cli-builder/SKILL.md) | CLI application building | Command patterns, argument parsing |
| [console-ui](./console-ui/SKILL.md) | Terminal user interfaces | Progress bars, menus |

### Specialized Skills

Cross-cutting concerns, AI integration, and project standards.

| Skill | Description | Key Patterns |
|-------|-------------|--------------|
| [tech-stack-constraints](./tech-stack-constraints/SKILL.md) | Project technology constraints | Allowed libraries, patterns |
| [prompt-engineer-patterns](./prompt-engineer-patterns/SKILL.md) | AI prompt engineering | System messages, examples |
| [constitution-reader](./constitution-reader/SKILL.md) | Constitution compliance | Spec traceability, validation |
| [gemini-patterns](./gemini-patterns/SKILL.md) | Cross-platform AI configuration | Claude/Gemini compatibility |
| [voice-task](./voice-task/SKILL.md) | Voice interface integration | Speech recognition, TTS |

## Skill Structure

### Standard Format

Each enhanced skill file follows this comprehensive structure:

```yaml
---
name: skill-name
version: 1.1.0
lastUpdated: 2025-01-18
description: >
  Detailed description of what this skill provides,
  when to use it, and what value it delivers.
model: sonnet | opus | haiku | inherit
tools: [list of available tools]
---

# Professional Skill Title

You are a **production-grade [specialization] specialist** with deep expertise in [core domain].

## Core Expertise Areas

1. **Expertise Area One** - Description
2. **Expertise Area Two** - Description
...
(Typically 10 areas for comprehensive coverage)

## When to Use This Skill

Use this skill whenever the user asks to:

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

### You Don't Handle

- **Deferred Domain** - Defer to [other-skill] for [specific concerns]

## Core Concepts

### Concept One

[Explanation with production-grade code examples]

### Concept Two

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

### Legacy Format

Some skills may use the simpler format:

```markdown
# Skill Name

## Overview
Brief description of what this skill provides.

## Usage
When to invoke this skill and how to use it.

## Core Concepts
### Concept Name
[Detailed explanation with code examples]

## Examples
### Example Scenario
[Practical implementation example]

## Best Practices
1. **Best practice one**
2. **Best practice two**
...

## Common Pitfalls
### Pitfall: Description
- What goes wrong
- How to avoid it

## Anti-Patterns to Avoid
**Never:**
- Things to avoid
- More things to avoid

**Always:**
- Things to always do
- More things to always do
```

## Skill vs Agent Distinction

### Agents

| Aspect | Description |
|--------|-------------|
| **Purpose** | Orchestrate complex tasks, make decisions, coordinate work |
| **Scope** | Broad domain expertise (e.g., "database design") |
| **Tools** | Read, Write, Edit, Bash, Grep, Glob (file operations) |
| **Model** | sonnet, opus, or haiku (configured per agent) |
| **Usage** | Invoke for tasks requiring decision-making |
| **Output** | Complete implementations, decisions, coordinated work |

### Skills

| Aspect | Description |
|--------|-------------|
| **Purpose** | Provide detailed implementation patterns for specific technologies |
| **Scope** | Focused technical patterns (e.g., "Drizzle ORM relations") |
| **Tools** | None (documentation and patterns only) |
| **Model** | inherit (uses invoking context's model) |
| **Usage** | Reference for implementation details |
| **Output** | Patterns, examples, best practices, guidance |

### Interaction Example

**User Request:** "Design a database schema for todos with foreign keys"

**Flow:**
1. Invoke: `database-expert` agent (orchestrator)
2. Agent references: `drizzle-orm` skill (relation patterns)
3. Agent references: `neon-postgres` skill (connection patterns)
4. Agent produces: Complete schema implementation with proper relations

**Benefit:** Agent makes decisions, skills provide patterns.

## Quick Reference by Technology

### PostgreSQL & Drizzle

| Skill | Focus |
|-------|-------|
| [drizzle-orm](./drizzle-orm/SKILL.md) | Schema definitions, relations, migrations |
| [neon-postgres](./neon-postgres/SKILL.md) | Neon serverless connection pooling |
| [sql-optimization-patterns](./sql-optimization-patterns/SKILL.md) | Query optimization and indexing |

### Next.js & React

| Skill | Focus |
|-------|-------|
| [nextjs-expert](./nextjs-expert/SKILL.md) | App Router, Server Components, data fetching |
| [framer-motion](./framer-motion/SKILL.md) | Declarative animations |
| [shadcn](./shadcn/SKILL.md) | Accessible component primitives |
| [tailwind-ccs](./tailwind-ccs/SKILL.md) | Utility-first CSS framework |

### FastAPI & Python

| Skill | Focus |
|-------|-------|
| [fastapi](./fastapi/SKILL.md) | Async endpoints, dependency injection |
| [better-auth-python](./better-auth-python/SKILL.md) | Python session authentication |
| [openai-chatkit-backend-python](./openai-chatkit-backend-python/SKILL.md) | ChatKit backend with Agents SDK |

### Authentication

| Skill | Focus | Platform |
|-------|-------|----------|
| [better-auth-python](./better-auth-python/SKILL.md) | Backend auth | Python |
| [better-auth-ts](./better-auth-ts/SKILL.md) | Frontend auth | TypeScript |

### Kubernetes

| Skill | Focus |
|-------|-------|
| [helm-charts-scffolding](./helm-charts-scffolding/SKILL.md) | Helm templates and packaging |
| [k8s-manifest-generator](./k8s-manifest-generator/SKILL.md) | Kubernetes YAML manifests |

### Development Practices

| Skill | Focus |
|-------|-------|
| [git-workflow](./git-workflow/SKILL.md) | Branching, commits, PRs |
| [tdd-workflow](./tdd-workflow/SKILL.md) | Test-driven development cycle |
| [code-reviewer](./code-reviewer/SKILL.md) | Review patterns and checklists |

### AI & Integration

| Skill | Focus |
|-------|-------|
| [prompt-engineer-patterns](./prompt-engineer-patterns/SKILL.md) | AI prompt design and optimization |
| [constitution-reader](./constitution-reader/SKILL.md) | Spec compliance validation |
| [gemini-patterns](./gemini-patterns/SKILL.md) | Cross-platform AI configuration |
| [openai-chatkit-frontend-embed-skill](./openai-chatkit-frontend-embed-skill/SKILL.md) | ChatKit frontend integration |
| [tech-stack-constraints](./tech-stack-constraints/SKILL.md) | Project technology standards |

## Using Skills

### Direct Reference

Agents can reference skills for implementation details:

```
database-expert: "I'll use the drizzle-orm skill to implement these relations."
```

### Skill Invocation

Skills are automatically referenced when agents need specialized patterns:

```
User: "Create a database schema with foreign keys"
→ Invokes: database-expert agent
→ References: drizzle-orm skill (relation patterns)
→ References: neon-postgres skill (connection patterns)
→ Produces: Complete schema implementation
```

### Manual Consultation

Developers can consult skills directly for implementation guidance:

```bash
# View a specific skill
cat .claude/skills/drizzle-orm/SKILL.md

# Search for pattern examples
grep -r "relation" .claude/skills/
```

## Creating New Skills

### When to Create a Skill

Create a new skill when:

1. **Repeatable Pattern** - A technical pattern appears frequently
2. **Complex Implementation** - Requires detailed explanation
3. **Multiple Agents** - Used by more than one agent
4. **Evolution Likely** - Technology will change and need updates
5. **Best Practices** - Industry standards to document

### Skill Creation Process

1. **Choose the Right Category**
   - Frontend, Backend, Infrastructure, Workflow, or Specialized

2. **Follow the Enhanced Skill Structure**
   - Include YAML frontmatter with version metadata
   - Add core expertise areas (typically 10)
   - Provide comprehensive code examples
   - Include best practices (5-10 DO/DON'T)
   - Add common mistakes (3-5 wrong/correct)

3. **Provide Production-Grade Examples**
   - Real, runnable code
   - Error handling
   - Type annotations where applicable
   - Comments explaining key decisions

4. **Include Anti-Patterns**
   - Common mistakes to avoid
   - Wrong vs correct examples
   - Rationale for best practices

5. **Update This Catalog**
   - Add to overview table
   - Add to appropriate category section
   - Update quick reference

6. **Link from Relevant Agents**
   - Add to agent's skills list
   - Update agent's scope boundaries
   - Test agent-skill interaction

### Skill Creation Checklist

Before finalizing a new skill:

- [ ] Valid YAML frontmatter
- [ ] Version and lastUpdated fields
- [ ] Comprehensive description
- [ ] Core expertise areas (10 items)
- [ ] Production code examples
- [ ] Best practices (5+ items)
- [ ] Common mistakes (3+ items)
- [ ] Package manager instructions
- [ ] Verification process
- [ ] Success criteria
- [ ] Added to README overview
- [ ] Linked from relevant agents

### Skill File Naming

- **Skills:** Use `skill.md` or `SKILL.md`
- **Directories:** Use kebab-case (e.g., `drizzle-orm/`)
- **Consistency:** Match skill name to directory name

### Skill Update Template

```yaml
---
name: skill-name
version: 1.1.0
lastUpdated: 2025-01-18
description: >
  Detailed description of skill purpose and value.
model: inherit
tools: [list of tools if needed]
---
```

## Maintenance

### Version Management

When updating skills:

1. **Increment Version** - Follow SemVer (1.0.0 → 1.1.0)
2. **Update Date** - Set lastUpdated to current date
3. **Document Changes** - Note significant updates
4. **Maintain Compatibility** - Avoid breaking changes

### Regular Maintenance Tasks

1. **Keep Examples Current** - Update for latest library versions
2. **Add New Patterns** - Include emerging best practices
3. **Fix Bugs** - Correct errors in example code
4. **Improve Clarity** - Enhance based on usage feedback
5. **Test Patterns** - Verify in real development scenarios

### Quality Assurance

Before deploying skill updates:

1. **Validate YAML** - Ensure frontmatter parses correctly
2. **Test Examples** - Verify code is runnable
3. **Check Links** - Ensure references resolve
4. **Review Coverage** - Confirm all key patterns included
5. **Update Dependencies** - Note any library version changes

### Skill Effectiveness Metrics

Evaluate skill quality:

1. **Usage Frequency** - How often agents reference it
2. **Code Quality** - Are examples production-ready?
3. **Completeness** - Does it cover all key patterns?
4. **Clarity** - Is guidance easy to follow?
5. **Accuracy** - Are examples technically correct?

## See Also

### Related Documentation

- [Agents Catalog](../agents/README.md) - Agent documentation and overview
- [Project Constitution](../../.specify/memory/constitution.md) - Project principles and standards
- [CLAUDE.md](../../CLAUDE.md) - Main project configuration

### External Resources

- [Claude Code Documentation](https://docs.anthropic.com/claude-code)
- [Claude Skills Reference](https://docs.anthropic.com/claude/docs/skills)
- [MCP Specification](https://modelcontextprotocol.io/)

### Project-Specific

- [Phase I Console App](../../Phase-I-Console-App/README.md) - Completed console implementation
- [Phase II Web App](../../Phase-II-fullstack-web-app/README.md) - Full-stack web application
- [Specs Directory](../../specs/) - Feature specifications and plans
