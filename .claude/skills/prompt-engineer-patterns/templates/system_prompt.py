# System Prompt Template

SYSTEM_PROMPT_TEMPLATE = """
You are a {role} specializing in {domain}.

## Context
{context}

## Task
{task}

## Constraints
{constraints}

## Output Format
{output_format}

## Examples
{examples}

## Instructions
- Follow the output format exactly
- Be concise and accurate
- Ask clarifying questions if information is missing
- Think step-by-step before answering
"""


class PromptEngineer:
    """Prompt engineering patterns and templates"""

    @staticmethod
    def create_system_prompt(
        role: str,
        domain: str,
        task: str,
        context: str = "",
        constraints: str = "",
        output_format: str = "",
        examples: str = ""
    ) -> str:
        """Create a structured system prompt"""

        return SYSTEM_PROMPT_TEMPLATE.format(
            role=role,
            domain=domain,
            task=task,
            context=context or "No additional context provided",
            constraints=constraints or "None specified",
            output_format=output_format or "Free form response",
            examples=examples or "None provided"
        )

    @staticmethod
    def few_shot_prompt(base_prompt: str, examples: list[dict]) -> str:
        """Add few-shot examples to prompt"""

        examples_section = "\n\n## Examples\n\n"
        for i, example in enumerate(examples, 1):
            examples_section += f"### Example {i}\n"
            examples_section += f"Input: {example['input']}\n"
            examples_section += f"Output: {example['output']}\n\n"

        return f"{base_prompt}{examples_section}"

    @staticmethod
    def chain_of_thought_prompt(task: str) -> str:
        """Prompt with chain-of-thought guidance"""

        return f"""
Think step-by-step to solve this problem:

{task}

## Instructions
1. Break down the problem into steps
2. Show your reasoning
3. Provide the final answer

Your response should include:
- Step-by-step reasoning
- Final answer clearly marked
"""

    @staticmethod
    def self_consistency_prompt(task: str, num_solutions: int = 3) -> str:
        """Prompt for self-consistency verification"""

        return f"""
Generate {num_solutions} different solutions to this problem, then select the best one:

{task}

## Instructions
1. Generate {num_solutions} independent solutions
2. Compare the solutions
3. Select the best solution
4. Explain your reasoning

Your response should include:
- Solution 1
- Solution 2
- Solution 3
- Comparison
- Best solution with reasoning
"""


# Usage examples
def main():
    # Example 1: Create system prompt
    prompt = PromptEngineer.create_system_prompt(
        role="Python developer",
        domain="web APIs",
        task="Create a FastAPI endpoint for todos",
        context="Using PostgreSQL database",
        constraints="Use async/await, proper error handling",
        output_format="Python code with docstrings"
    )
    print(prompt)

    print("\n" + "=" * 50 + "\n")

    # Example 2: Few-shot learning
    examples = [
        {"input": "2 + 2", "output": "4"},
        {"input": "5 + 3", "output": "8"},
    ]
    few_shot = PromptEngineer.few_shot_prompt("Solve this:", examples)
    print(few_shot)

    print("\n" + "=" * 50 + "\n")

    # Example 3: Chain of thought
    cot = PromptEngineer.chain_of_thought_prompt(
        "What is 15% of 240?"
    )
    print(cot)


if __name__ == "__main__":
    main()
