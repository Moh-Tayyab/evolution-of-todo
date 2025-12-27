// Voice Command Parser

interface Command {
  pattern: RegExp;
  action: 'add' | 'complete' | 'delete' | 'show' | 'clear';
  args: string[];
}

export class VoiceCommandParser {
  private commands: Command[] = [
    {
      pattern: /add (?:new )?todo(?: called| named)? (.+)/i,
      action: 'add',
      args: []
    },
    {
      pattern: /(?:complete|mark as done|finish|check) (?:todo )?(?:number )?(\d+)/i,
      action: 'complete',
      args: []
    },
    {
      pattern: /(?:delete|remove) (?:todo )?(?:number )?(\d+)/i,
      action: 'delete',
      args: []
    },
    {
      pattern: /(?:show|list|display) (?:all )?(?:my )?todos?/i,
      action: 'show',
      args: []
    },
    {
      pattern: /(?:clear|remove) (?:all )?(?:completed )?todos?/i,
      action: 'clear',
      args: []
    },
  ];

  parse(text: string): { action: string | null; args: string[] } | null {
    for (const command of this.commands) {
      const match = text.match(command.pattern);

      if (match) {
        return {
          action: command.action,
          args: match.slice(1).filter(Boolean),
        };
      }
    }

    return null;
  }

  addCommand(pattern: RegExp, action: Command['action']): void {
    this.commands.push({ pattern, action, args: [] });
  }

  execute(command: { action: string; args: string[] }, todos: any[]): any[] {
    const newTodos = [...todos];

    switch (command.action) {
      case 'add':
        newTodos.push({
          id: newTodos.length + 1,
          title: command.args[0],
          completed: false,
          createdAt: new Date(),
        });
        break;

      case 'complete':
        const id = parseInt(command.args[0], 10);
        const todo = newTodos.find((t) => t.id === id);
        if (todo) {
          todo.completed = true;
        }
        break;

      case 'delete':
        const deleteId = parseInt(command.args[0], 10);
        return newTodos.filter((t) => t.id !== deleteId);

      case 'clear':
        return newTodos.filter((t) => !t.completed);

      default:
        return newTodos;
    }

    return newTodos;
  }
}

// Usage examples
const parser = new VoiceCommandParser();

// Parse commands
console.log(parser.parse('add todo Buy groceries'));
// { action: 'add', args: ['Buy groceries'] }

console.log(parser.parse('complete task 3'));
// { action: 'complete', args: ['3'] }

console.log(parser.parse('show all todos'));
// { action: 'show', args: [] }

// Execute command
const todos = [
  { id: 1, title: 'Existing task', completed: false },
];

const command = parser.parse('add todo New task');
if (command) {
  const updatedTodos = parser.execute(command, todos);
  console.log('Updated todos:', updatedTodos);
}
