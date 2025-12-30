# Configuration Directory

This directory contains cross-platform AI configuration files for both Claude Code and Gemini.

## Files

### `gemini-settings.json`
Core Gemini configuration file that references the primary `CLAUDE.md` file and defines the project workflow.

**Key Features:**
- References `CLAUDE.md` as the primary configuration source
- Defines Spec-Driven Development (SDD) workflow
- Maps artifact locations (specs, plans, tasks, history)
- Ensures cross-platform compatibility with Claude Code

### `gemini-mcp.json`
MCP (Model Context Protocol) server configuration for Gemini, mirroring the Claude Code setup in `.mcp.json`.

**Configured MCP Servers:**

1. **context7** - `@upstash/context7-mcp`
   - Purpose: Documentation retrieval for libraries and frameworks
   - Usage: Get up-to-date API docs, code examples, and best practices

2. **github** - `github-mcp`
   - Purpose: GitHub integration
   - Usage: Manage issues, PRs, repositories, and code reviews

3. **shadcn** - `shadcn@latest mcp`
   - Purpose: shadcn/ui component library
   - Usage: Access UI components, examples, and installation commands

4. **aceternityui** - `aceternityui-mcp`
   - Purpose: Aceternity UI component library
   - Usage: Advanced UI components with animations and effects

## Integration with Claude Code

Both Gemini and Claude Code reference the same:
- **Constitution**: `.specify/memory/constitution.md`
- **Primary Config**: `CLAUDE.md`
- **Specs**: `specs/*/spec.md`
- **Plans**: `specs/*/plan.md`
- **Tasks**: `specs/*/tasks.md`
- **History**: `history/prompts/`

## Usage

### For Gemini Users
Point your Gemini configuration to:
```
config/gemini-settings.json
config/gemini-mcp.json
```

### For Claude Code Users
Claude Code uses:
```
CLAUDE.md (primary)
.mcp.json (MCP servers)
```

Both systems maintain full compatibility through shared artifact directories and the `CLAUDE.md` file.

## MCP Server Setup

To enable MCP servers in your AI system:

1. Ensure Node.js and npm/npx are installed
2. Configure your AI system to load the appropriate MCP config file
3. The servers will be automatically started via `npx` when needed

All MCP servers use `npx -y` for zero-install, on-demand execution.

## Syncing Changes

When updating MCP server configurations:
1. Update `.mcp.json` (Claude Code) OR `config/gemini-mcp.json` (Gemini)
2. Sync changes between both files to maintain cross-platform compatibility
3. Update the `lastUpdated` metadata field

## Directory Structure

```
evolution-of-todo/
├── .gemini/
│   └── settings.json          # Gemini primary settings (references config/)
├── config/
│   ├── gemini-settings.json   # Detailed Gemini configuration
│   ├── gemini-mcp.json        # Gemini MCP servers (mirrors .mcp.json)
│   └── README.md              # This file
├── .mcp.json                  # Claude Code MCP servers
└── CLAUDE.md                  # Primary config for both systems
```
