# Prompt Engineer Patterns Skill

## Overview
Expertise for crafting effective AI prompts and system messages.

## Usage
Use for writing agent instructions, designing prompts, improving AI responses.

## Core Concepts
- System Messages: Define role, tools, constraints
- Few-Shot Learning: Provide examples to guide the model
- Chain-of-Thought: Step-by-step reasoning for complex tasks
- Negative Constraints: What NOT to do
- Output Format: Define expected structure

## Examples

### Agent Template
```markdown
---
name: my-agent
description: A specialized agent for X
tools: Read, Write, Edit, Bash
---

You are an expert in X.

Your task: Help developers with specific goal.

You handle: Specific concerns.

You're successful when: Success criteria defined here.
```

### Few-Shot Example
```
You are a SQL generator. Generate queries based on natural language.

Example 1:
User: "Get all completed todos for user 5"
Response:
```sql
SELECT * FROM todos WHERE user_id = 5 AND completed = true;
```

Example 2:
User: "Count todos by completion status"
Response:
```sql
SELECT completed, COUNT(*) as count FROM todos GROUP BY completed;
```
```

### Chain-of-Thought
```
When debugging code issues, follow this thought process:
1. Identify error message and stack trace
2. Analyze code around error location
3. Consider common causes
4. Suggest 2-3 potential fixes
5. Recommend most likely fix
```

### Negative Constraints
```
When generating code:
- DO NOT use external libraries beyond what's specified
- DO NOT create files unless requested
- DO NOT skip error handling

You MUST:
- Include type annotations
- Provide complete, runnable code
- Handle edge cases
```

## Best Practices
1. Be specific and clear in instructions
2. Provide examples to demonstrate expected output
3. Use personas for domain expertise
4. Define output format explicitly
5. Include constraints to guide behavior
6. Provide context for relevant information
7. Test prompts with diverse inputs
8. Iterate and refine based on results
9. Document prompt patterns for reuse
10. Monitor performance and adjust token usage

## Common Pitfalls
- Too vague: "Write code for a todo app" vs specific requirements
- Missing constraints: Not specifying what to avoid
- No examples: Providing system message without guidance
- Inconsistent format: Mixing conventions
- Too much context: Overwhelming the model with irrelevant details
- No output structure: Leaving response format ambiguous

## Tools Used
- **Read/Grep Tools:** Examine code, find patterns, read existing implementations
- **Write/Edit Tools:** Create new code/commands, modify existing files
- **Bash:** Run scripts, execute commands, install dependencies

## Verification Process
After implementing changes:
1. **Syntax Check:** Verify code syntax (Python/TypeScript)
2. **Function Check:** Run commands/tests to verify they work
3. **Output Check:** Verify expected output matches actual
4. **Integration Check:** Test with existing codebase

## Error Patterns
Common errors to recognize:
- **Syntax errors:** Missing imports, incorrect syntax
- **Logic errors:** Wrong control flow, incorrect conditions
- **Integration errors:** Incompatible versions, missing dependencies
- **Runtime errors:** Exceptions during execution
- **Configuration errors:** Missing required files/settings
