# Constitution Reader - Read and parse project constitution

from pathlib import Path
import json


class ConstitutionReader:
    """Read and access project constitution from memory"""

    def __init__(self, constitution_path: Path = Path(".specify/memory/constitution.md")):
        self.constitution_path = constitution_path
        self.content = None
        self.sections = {}

    def load(self) -> str:
        """Load constitution from file"""

        if not self.constitution_path.exists():
            raise FileNotFoundError(f"Constitution not found at {self.constitution_path}")

        with open(self.constitution_path) as f:
            self.content = f.read()

        return self.content

    def parse_sections(self) -> dict:
        """Parse constitution into sections"""

        if not self.content:
            self.load()

        sections = {}
        current_section = "General"
        current_lines = []

        for line in self.content.split("\n"):
            if line.startswith("## "):
                if current_lines:
                    sections[current_section] = "\n".join(current_lines)
                current_section = line[3:].strip()
                current_lines = []
            else:
                current_lines.append(line)

        if current_lines:
            sections[current_section] = "\n".join(current_lines)

        self.sections = sections
        return sections

    def get_section(self, section_name: str) -> str:
        """Get specific section from constitution"""

        if not self.sections:
            self.parse_sections()

        for key in self.sections:
            if section_name.lower() in key.lower():
                return self.sections[key]

        raise ValueError(f"Section '{section_name}' not found in constitution")

    def get_principles(self) -> list:
        """Extract all principles from constitution"""

        content = self.load() if not self.content else self.content

        principles = []
        in_principles = False

        for line in content.split("\n"):
            if "### III." in line or "## Principles" in line:
                in_principles = True
            elif in_principles and line.strip() and line.startswith(("###", "##")):
                break
            elif in_principles and line.strip() and not line.startswith("#"):
                principles.append(line.strip())

        return principles

    def get_tech_stack(self) -> dict:
        """Get tech stack requirements"""

        section = self.get_section("Technical Stack")
        stack = {
            "python": None,
            "typescript": None,
            "frameworks": [],
            "databases": [],
        }

        for line in section.split("\n"):
            if "Python" in line:
                stack["python"] = line.split(":")[1].strip()
            elif "TypeScript" in line:
                stack["typescript"] = line.split(":")[1].strip()

        return stack

    def validate_against(self, rule: str) -> bool:
        """Check if content violates constitution"""

        content = self.load() if not self.content else self.content

        if rule.lower() not in content.lower():
            return True  # Rule not in constitution, pass by default

        return True  # Placeholder - implement actual validation


# Usage
def main():
    reader = ConstitutionReader()

    print("Loading constitution...")
    print()

    # Get principles
    principles = reader.get_principles()
    print("Principles:")
    for i, principle in enumerate(principles, 1):
        print(f"  {i}. {principle}")

    print()

    # Get tech stack
    tech_stack = reader.get_tech_stack()
    print("Tech Stack Requirements:")
    print(f"  Python: {tech_stack['python']}")
    print(f"  TypeScript: {tech_stack['typescript']}")

    print()

    # Get sections
    sections = reader.parse_sections()
    print(f"Sections found: {list(sections.keys())}")


if __name__ == "__main__":
    main()
