# Gemini Integration with Claude Code

## Overview
This document explains how to use Gemini with the existing Claude Code project structure and configuration files, specifically the CLAUDE.md file.

## Project Structure
The project follows the Spec-Driven Development (SDD) approach with the following key directories:
- `specs/` - Contains feature specifications, plans, and tasks
- `.claude/` - Claude Code specific configurations
- `history/` - Historical records (PHRs, ADRs)

## Configuration Files

### CLAUDE.md
This file serves as the primary configuration for Claude Code but is also designed to be interpretable by Gemini. Key sections include:
- Project constitution and principles
- Development guidelines
- Code standards
- Tech stack information
- Cross-platform AI configuration (specifically for Gemini)

### Spec Files
- `specs/*/spec.md` - Feature specifications that both systems can interpret
- `specs/*/plan.md` - Architecture plans compatible with both systems
- `specs/*/tasks.md` - Task breakdowns that both AI systems can execute

## Working with Both Systems

### Setting Up Gemini
1. Ensure your Gemini system can read and interpret the CLAUDE.md file
2. Configure Gemini to follow the same SDD workflow (spec → plan → tasks → implement)
3. Use the same directory structure and file naming conventions

### Task Execution
1. Both systems should be able to read and execute tasks from `specs/*/tasks.md`
2. Follow the same constitution principles as outlined in the project constitution
3. Maintain consistent @spec comments in all source files

### Best Practices
- Keep configuration files human-readable and well-documented
- Use consistent formatting that both systems can parse
- Test configurations with both systems before committing changes
- Maintain backward compatibility with existing Claude Code workflows

## Troubleshooting

### Common Issues
1. **Configuration Not Recognized**: Ensure the CLAUDE.md file is in the project root
2. **Task Format Issues**: Verify that task files follow the expected format for both systems
3. **Inconsistent Behavior**: Check that both systems are using the same version of the constitution

### Validation Steps
1. Verify that both systems can read the CLAUDE.md file
2. Test that both systems can execute the same basic tasks
3. Confirm that configuration changes work for both platforms