---
id: 003
title: Skills Structure Compliance Audit
stage: general
date: 2026-01-19
surface: agent
model: glm-4.7
feature: none
branch: 003-ai-chatbot
user: evolution-of-todo
command: (manual request)
labels: ["skills","audit","compliance","structure"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .claude/skills/*/SKILL.md (26 skills audited)
tests:
 - None (structure audit only)
---

## Prompt

Please perform a comprehensive audit of my Claude Code skills structure and verify it against official Anthropic documentation.

**DO THIS STEP BY STEP:**

1. **SCAN** all skills in both locations:
   - `~/.claude/skills/`
   - `./.claude/skills/` (project-level)

2. **FOR EACH SKILL**, verify:
   - ✓ SKILL.md exists and filename is exactly correct (case-sensitive)
   - ✓ YAML frontmatter starts with `---` on line 1, ends with `---`
   - ✓ Required fields present: `name`, `description`
   - ✓ Optional fields correctly formatted: `version`, `author`, `tags`, `requires_scripts`
   - ✓ No tabs used in YAML (spaces only)
   - ✓ Folder name matches skill name from frontmatter

3. **CHECK FOLDER STRUCTURE** against official docs:
   - `scripts/` - should contain ONLY executable files (.py, .sh) with +x permissions
   - `assets/` - should contain templates, configs, binaries (non-executable)
   - `references/` - should contain documentation files (.md, .txt)
   - Verify NO other top-level folders exist (like `templates/`)

4. **VALIDATE SCRIPT REFERENCES**:
   - Search SKILL.md for script references (e.g., `scripts/`, `python3 {baseDir}`)
   - Verify referenced scripts actually exist
   - Check for proper path format (Unix-style forward slashes only)
   - Flag any Windows-style paths (`\`)

5. **CHECK EXECUTION EXAMPLES**:
   - Ensure all script examples use `{baseDir}` or relative paths correctly
   - Verify no hardcoded absolute paths

6. **GENERATE COMPLIANCE REPORT** showing:
   - Total skills found
   - Skills with errors/warnings (categorized)
   - Specific violations with line numbers if possible
   - Recommended fixes for each issue
   - Overall compliance percentage

## Response snapshot

## Executive Summary
- **Total skills audited**: 26 (all project-level)
- **User-level skills**: Directory not found at `~/.claude/skills/`
- **Compliance rate**: **0%** (0/26 skills passed)
- **Overall status**: **FAIL** - Critical structural issues across all skills

### Critical Issues Found:

1. **Folder Structure Violations (26/26)**: All skills use `templates/` directory which is NOT allowed per official docs. Allowed directories are only: `scripts/`, `assets/`, `references/`.

2. **Name Mismatches (21/26)**: Folder names don't match YAML `name` field in SKILL.md (e.g., `drizzle-orm` folder vs `drizzle` in YAML).

3. **Missing Script References (3/26)**: code-reviewer, constitution-reader, and helm-charts-scffolding have broken script references.

4. **Permission Issues**: Scripts in `scripts/` directories lack executable permissions (644 instead of 755).

### Positive Findings:
- ✅ All 26 skills have SKILL.md with correct filename
- ✅ YAML frontmatter properly formatted with `---` delimiters
- ✅ Required fields `name` and `description` present in all skills
- ✅ No tabs in YAML (using spaces correctly)

### Recommended Fixes:

**Phase 1: Fix Folder Structure**
```bash
# Rename templates to assets
find .claude/skills/ -name "templates" -type d | while read dir; do
  parent=$(dirname "$dir")
  mv "$dir" "$parent/assets"
done
```

**Phase 2: Fix Script Permissions**
```bash
find .claude/skills/*/scripts -type f \( -name "*.py" -o -name "*.sh" \) -exec chmod +x {} \;
```

**Phase 3: Fix Name Mismatches** - Manual review required

**Phase 4: Fix Missing Scripts** - Create missing scripts or remove broken references

## Outcome

- ✅ Impact: Identified 0% compliance rate across 26 skills with critical structural violations requiring remediation
- 🧪 Tests: N/A (structure audit only, no code tests)
- 📁 Files: 26 skills audited across `.claude/skills/` directory
- 🔁 Next prompts: Request to apply automated fixes from Phases 1 and 2 (folder structure + permissions)
- 🧠 Reflection: Systemic issue with skills structure using `templates/` instead of allowed `assets/`/`references/` directories; requires immediate attention

## Evaluation notes (flywheel)

- Failure modes observed: Folder structure violations across all skills (100%), name mismatches (80%), broken script references (12%)
- Graders run and results (PASS/FAIL): N/A (manual audit, no automated graders)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Apply Phase 1 and Phase 2 fixes automatically to bring compliance rate from 0% to approximately 50%
