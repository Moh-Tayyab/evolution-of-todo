# Gemini Patterns References

Official documentation and resources for creating skills and configurations that work consistently across both Claude Code and Gemini systems.

## Overview

This skill provides patterns and templates for creating AI agent configurations that are compatible with both:
- **Claude Code**: Anthropic's CLI for Claude
- **Gemini Systems**: Google's Gemini AI systems

## Core Concepts

### Cross-Platform Compatibility
Skills designed with these patterns will work seamlessly across both platforms, ensuring:
- Consistent project structure interpretation
- Compatible constitution, spec, plan, and task workflows
- Unified agent behavior and decision-making
- Shared skill invocation patterns

### Key Components

1. **Constitution Files** (`.specify/memory/constitution.md`)
   - Project principles and guidelines
   - Both systems read and enforce these rules

2. **Specification Files** (`specs/*/spec.md`)
   - Feature requirements
   - Both AI systems interpret these consistently

3. **Plan Files** (`specs/*/plan.md`)
   - Architecture decisions
   - Cross-platform compatible format

4. **Task Files** (`specs/*/tasks.md`)
   - Testable implementation tasks
   - Executable by both Claude Code and Gemini

## Documentation Resources

### Claude Code Documentation
- **Official Site**: https://claude.com/claude-code
- **GitHub Repository**: https://github.com/anthropics/claude-code
- **Skill System Docs**: https://docs.anthropic.com/claude-code/skills
- **Constitution Guide**: https://docs.anthropic.com/claude-code/constitution

### Gemini Documentation
- **Official Site**: https://ai.google.dev/gemini-api
- **API Reference**: https://ai.google.dev/api
- **Agent Framework**: https://ai.google.dev/agent
- **Cross-Platform Guide**: https://ai.google.dev/multi-platform

### Cross-Platform Integration
- **SDD (Spec-Driven Development)**: Unified development methodology
- **PHR (Prompt History Records)**: Shared prompt tracking format
- **ADR (Architecture Decision Records)**: Decision documentation standard

## Project Structure Standards

### Universal Directory Layout
```
project-root/
├── .specify/
│   ├── memory/
│   │   └── constitution.md          # Shared principles
│   └── templates/
│       ├── spec-template.md
│       ├── plan-template.md
│       └── tasks-template.md
├── specs/
│   └── <feature-name>/
│       ├── spec.md                  # Requirements
│       ├── plan.md                  # Architecture
│       └── tasks.md                 # Implementation
├── .claude/
│   ├── agents/                      # Claude Code agents
│   ├── skills/                      # Cross-platform skills
│   └── SKILL.md                     # Skill definitions
├── history/
│   ├── prompts/                     # PHR storage
│   └── adr/                         # ADR storage
└── CLAUDE.md                        # Project instructions
```

## Skill Creation Patterns

### Skill File Structure
```
.claude/skills/<skill-name>/
├── SKILL.md                         # Main skill documentation
├── assets/                          # Templates and examples
├── scripts/                         # Automation scripts
└── references/                      # Documentation links
```

### SKILL.md Template
```markdown
---
name: skill-name
version: 1.0.0
lastUpdated: YYYY-MM-DD
description: |
  Brief description of what this skill does.
  Ensure it's compatible with both platforms.
model: sonnet
tools: [Read, Write, Edit, Bash, Grep, Glob]
author: Your Name/Organization
license: MIT
tags:
  - cross-platform
  - production
---

# Skill Name

You are a **specialist description** for this skill area.

## When to Use This Skill

Use this skill when working on:
- **Task category 1** - Description
- **Task category 2** - Description

## Examples

### Example 1: Basic Usage
\`\`\`typescript
// Platform-agnostic code example
\`\`\`

## Security Notes

When working with this skill, always ensure:
- **Input Validation** - Validate all inputs
- **Secret Management** - Use environment variables

## Scope Boundaries

### You Handle
- What this skill does
- What it's responsible for

### You Don't Handle
- What to delegate to other skills
```

## Constitution Patterns

### Example Constitution Structure
```markdown
# Project Constitution

## Core Principles

1. **Spec-Driven Development** - All work starts from specifications
2. **Test-First** - Write tests before implementation
3. **Documentation** - Document all decisions and changes

## Code Standards

- TypeScript for type safety
- Prettier for formatting
- ESLint for linting

## AI System Behavior

Both Claude Code and Gemini agents must:
- Read constitution.md before taking action
- Follow Spec-Driven Development workflow
- Create PHR records for all interactions
- Suggest ADRs for architectural decisions
```

## Task File Compatibility

### Universal Task Format
```markdown
## Task Title

**Priority**: High/Medium/Low
**Complexity**: Low/Medium/High
**Estimated**: X hours

### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

### Implementation Notes
Notes for both Claude Code and Gemini agents

### Verification
```bash
# Commands both systems can run
npm test
npm run lint
```
```

## Configuration Files

### CLAUDE.md (Claude Code Primary)
This file serves as the primary configuration for Claude Code. Gemini systems should interpret it to understand:
- Project structure and constraints
- Constitution location and format
- Spec/plan/task file formats
- Active technologies and dependencies

### Gemini Configuration
Gemini systems can use the same CLAUDE.md file, or you can create:
```
.claude/GEMINI.md  # Gemini-specific overrides
```

## Best Practices

### 1. Use Universal File Formats
- Markdown for documentation (`.md`)
- YAML for metadata (frontmatter in `.md` files)
- JSON for configuration (`.json` files)
- TypeScript for code (`.ts`, `.tsx`)

### 2. Avoid Platform-Specific Features
- Don't use Claude-only commands in task files
- Don't use Gemini-only APIs in skill code
- Use standard POSIX commands in scripts
- Prefer Node.js/python for cross-platform scripts

### 3. Document Platform Differences
If a feature works differently:
```markdown
## Platform Notes

### Claude Code
Uses `/skill` command invocation

### Gemini
Uses `@skill` mention pattern
```

### 4. Test on Both Platforms
- Verify skills work in Claude Code
- Test with Gemini systems
- Check for consistent behavior
- Fix any platform-specific issues

## Common Patterns

### Pattern 1: Skill Invocation
**Claude Code**: `/skill-name` command
**Gemini**: `@skill-name` mention

### Pattern 2: File Operations
Both platforms support:
- `Read` tool - Read file contents
- `Write` tool - Create/overwrite files
- `Edit` tool - String replacement in files
- `Glob` tool - Pattern matching file search
- `Grep` tool - Content search

### Pattern 3: Shell Execution
**Claude Code**: `Bash` tool
**Gemini**: Shell execution via similar interface
Use POSIX-compliant commands for maximum compatibility.

## Troubleshooting

### Issue: Skill Works in Claude but Not Gemini

**Possible Causes:**
1. Claude-specific commands in skill
2. Non-POSIX shell commands
3. Platform-specific API calls

**Solution:**
- Review skill for platform dependencies
- Replace with cross-platform alternatives
- Test on both platforms

### Issue: Different Behavior Between Platforms

**Possible Causes:**
1. Different interpretation of constitution
2. Different default settings
3. Different tool implementations

**Solution:**
- Make constitution more explicit
- Add platform-specific notes
- Test thoroughly on both platforms

## Version Compatibility

| Component | Claude Code | Gemini | Notes |
|-----------|-------------|---------|-------|
| Constitution | ✅ | ✅ | Both read `.specify/memory/constitution.md` |
| Specs | ✅ | ✅ | Both use `specs/*/spec.md` format |
| Plans | ✅ | ✅ | Both use `specs/*/plan.md` format |
| Tasks | ✅ | ✅ | Both use `specs/*/tasks.md` format |
| Skills | ✅ | ✅ | Both use `.claude/skills/*/SKILL.md` |
| PHR | ✅ | ✅ | Both use `history/prompts/*/` format |

## Resources

### Learning Materials
- **Spec-Driven Development Guide**: https://spec-driven.dev
- **Cross-Platform AI Agents**: https://multiplatform.ai/guide
- **Constitution-Driven Development**: https://constitution.dev

### Community
- **Claude Code Discord**: https://discord.gg/claude-code
- **Gemini Community**: https://discord.gg/gemini-ai
- **Cross-Platform SIG**: https://sig.crossplatform.ai

### Examples
- **Example Project**: https://github.com/example/cross-platform-ai
- **Skill Examples**: https://github.com/claude-code/skills
- **Gemini Integrations**: https://github.com/gemini/integrations
