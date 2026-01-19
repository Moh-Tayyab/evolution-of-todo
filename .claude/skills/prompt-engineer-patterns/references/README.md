# Prompt Engineer Patterns References

Documentation and resources for effective prompt engineering with AI systems.

## Official Resources

### Anthropic Documentation
- **Claude Documentation**: https://docs.anthropic.com/
- **Prompt Engineering Guide**: https://docs.anthropic.com/claude/prompt-engineering
- **API Reference**: https://docs.anthropic.com/claude/reference/

### OpenAI Documentation
- **Prompt Engineering Guide**: https://platform.openai.com/docs/guides/prompt-engineering
- **API Reference**: https://platform.openai.com/docs/api-reference/

## Core Principles

### Be Specific
```
❌ "Write code"
✅ "Write a Python function that validates email addresses using regex"
```

### Provide Context
```
❌ "Fix this bug"
✅ "This React component is not updating when props change. The component uses useEffect with the prop as a dependency."
```

### Set Format
```
✅ "Respond in JSON format with keys: 'error', 'suggestion', 'fixed_code'"
```

## Prompt Patterns

### Chain of Thought
```
Solve this step by step:
1. Understand the problem
2. Break it into sub-problems
3. Solve each sub-problem
4. Combine solutions
```

### Few-Shot Learning
```
Example 1:
Input: "cat sat on mat"
Output: {"animal": "cat", "action": "sat", "location": "mat"}

Example 2:
Input: "dog ran in park"
Output: {"animal": "dog", "action": "ran", "location": "park"}

Input: "bird flew to tree"
Output:
```

### Self-Consistency
```
Solve this problem 3 different ways, then choose the most common answer.
```

### Tree of Thoughts
```
Explore multiple solution paths:
1. Try approach A
2. If A fails, try approach B
3. If B fails, try approach C
4. Compare results
```

## Structured Prompts

### Role-Based
```
You are a senior Python developer with 10 years of experience.
Review this code for security vulnerabilities:
```

### Task-Based
```
Task: Refactor this function
Context: This is part of a web API that processes user input
Requirements:
- Must validate all inputs
- Must handle errors gracefully
- Must include type hints
```

### Constraint-Based
```
Write a function to sort a list with these constraints:
- Time complexity: O(n log n)
- Space complexity: O(1)
- Must be stable
- Must handle empty lists
```

## Code Generation Prompts

### Function Specification
```
Write a Python function that:
1. Takes a list of integers as input
2. Returns the sum of all even numbers
3. Raises ValueError if list is empty
4. Includes docstring with examples
5. Has type hints
```

### Refactoring
```
Refactor this code to:
- Improve readability
- Reduce complexity
- Add error handling
- Follow PEP 8 guidelines

Code to refactor:
[paste code]
```

### Debugging
```
Debug this code:
- Identify the bug
- Explain why it occurs
- Provide the fix
- Suggest how to prevent similar bugs

Code:
[paste code]
```

## System Messages

### Claude
```text
You are an expert software engineer specializing in web development.
Your responses should:
- Include code examples
- Explain trade-offs
- Follow best practices
- Consider security implications
```

### OpenAI
```text
You are a helpful assistant with expertise in Python and TypeScript.
Always provide clear explanations and working code examples.
```

## Iterative Refinement

### First Prompt
```
Create a REST API using FastAPI
```

### Follow-up
```
Now add:
- JWT authentication
- Rate limiting
- Input validation with Pydantic
- PostgreSQL database integration
```

### Another Refinement
```
Add unit tests for all endpoints using pytest.
Include tests for:
- Success cases
- Error cases
- Edge cases
```

## Common Patterns

### Code Review
```
Review this code for:
1. Security vulnerabilities
2. Performance issues
3. Code style violations
4. Missing error handling
5. Potential bugs

Provide:
- Severity rating for each issue
- Suggested fix
- Explanation
```

### Documentation
```
Generate documentation for this code:
- Function descriptions
- Parameter explanations
- Return value descriptions
- Usage examples
- Edge cases
```

### Testing
```
Write unit tests for this function using pytest.
Include tests for:
- Normal cases
- Boundary cases
- Error cases
- Edge cases
```

## Best Practices

### DO ✅
- Be explicit and specific
- Provide relevant context
- Set clear expectations
- Use examples
- Specify output format
- Include constraints
- Iterate and refine

### DON'T ❌
- Be vague or ambiguous
- Assume context
- Over-constrain
- Use jargon unnecessarily
- Skip important details

## Prompt Templates

### Code Generation
```
Generate {language} code that:
- {requirement_1}
- {requirement_2}
- {requirement_3}

Include:
- Type hints
- Error handling
- Documentation
- Tests
```

### Code Review
```
Review this {language} code for:
- Security issues
- Performance problems
- Style violations
- Bugs

Code:
{code}

Provide:
- Issue list with severity
- Fixes for each issue
- Refactored version
```

### Explanation
```
Explain this code:
{code}

Include:
- What it does
- How it works
- Why each approach was chosen
- Potential improvements
```

## Advanced Techniques

### Chain Prompts
```
Step 1: Analyze requirements
Step 2: Design architecture
Step 3: Implement core features
Step 4: Add error handling
Step 5: Write tests
Step 6: Create documentation
```

### Recursive Refinement
```
1. Generate initial solution
2. Review for issues
3. Refine based on review
4. Test edge cases
5. Final optimization
```

### Multi-Persona
```
Act as:
1. Security expert: Review for vulnerabilities
2. Performance expert: Optimize for speed
3. UX expert: Improve usability
4. QA expert: Add comprehensive tests
```

## Evaluation

### Quality Metrics
- Does it follow instructions?
- Is the output accurate?
- Is it complete?
- Is it well-structured?
- Is it maintainable?

### Testing Prompts
```
Test this prompt:
[prompt]

Evaluate:
- Clarity
- Specificity
- Completeness
- Potential issues
```

## Resources

- **Anthropic Prompt Engineering**: https://docs.anthropic.com/claude/prompt-engineering
- **OpenAI Prompt Guide**: https://platform.openai.com/docs/guides/prompt-engineering
- **Prompt Engineering Guide**: https://www.promptingguide.ai/
