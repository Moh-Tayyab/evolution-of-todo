# Feature Specification: Chatbot User Stories and Agent Behavior

**Feature**: AI-Powered Chatbot
**Part of**: Phase III - AI-Powered Chatbot
**Related**: [spec.md](../spec.md), [database/schema.md](../database/schema.md), [api/mcp-tools.md](../api/mcp-tools.md)

## Overview

Defines user stories, agent behavior patterns, and conversation flows for the conversational AI chatbot. Users can manage all Basic Level tasks (Add, View, Update, Delete, Mark Complete) through natural language interactions.

## User Stories

### US-001: Add Task via Natural Language (Priority: P1)

As a user, I want to add a new task by speaking naturally to the chatbot, so that I can quickly capture items without filling out forms.

**Acceptance Criteria**:
1. Given I send "Add buy milk tomorrow", then the AI correctly extracts the task title "buy milk"
2. Given I send "Create task Pay bills with description: electric and water", then the AI creates task with title "Pay bills" and description "electric and water"
3. Given I send "New task Call mom at 5pm", then the AI creates the task with appropriate timing information
4. Given I send "Add a task" without specifying a title, then the AI responds asking "What task would you like to add?"
5. Given the task is created successfully, then the AI responds with a friendly confirmation like "I've added 'buy milk' to your tasks"

**Examples**:
- User: "Add a task to buy groceries" → AI: "Done! I've added 'Buy groceries' to your tasks"
- User: "Create task Pay bills tomorrow" → AI: "Great! I've added 'Pay bills' for tomorrow"
- User: "Add task" → AI: "What task would you like to add?"

### US-002: View Tasks via Natural Language (Priority: P1)

As a user, I want to view my task list by asking the chatbot, so that I can see what I need to do without navigating to a list view.

**Acceptance Criteria**:
1. Given I send "Show my tasks", then the AI responds with a formatted list of all my tasks
2. Given I send "What's pending?", then the AI returns only incomplete tasks
3. Given I send "What's on my todo list?", then the AI shows all tasks with completion status indicators
4. Given I send "What completed tasks do I have?", then the AI returns only completed tasks
5. Given I have no tasks, then the AI responds with "You don't have any tasks yet. Would you like to add one?"

**Task List Format**:
```
Your Tasks (3 total):

[ ] 1. Buy groceries
[x] 2. Pay bills
[ ] 3. Call mom

2 tasks pending, 1 completed
```

**Examples**:
- User: "Show my tasks" → AI: Lists all 3 tasks with status indicators
- User: "What's pending?" → AI: Shows only the 2 incomplete tasks
- User: "What completed?" → AI: Shows the 1 completed task
- User: "What tasks?" → AI: "You don't have any tasks yet. Would you like to add one?"

### US-003: Update Task via Natural Language (Priority: P1)

As a user, I want to modify an existing task by telling the chatbot what to change, so that I can correct mistakes or add details without opening a form.

**Acceptance Criteria**:
1. Given I send "Change task 3 to buy groceries", then the AI identifies task ID 3 and updates the title to "buy groceries"
2. Given I send "Update task 1 description to include: eggs, bread, milk", then the AI updates the description for task ID 1
3. Given I send "Change Buy groceries to Buy groceries and snacks", then the AI updates the title appropriately
4. Given I reference a non-existent task ID, then the AI responds with "Task not found. Here are your current tasks:" and lists them
5. Given the update is successful, then the AI confirms with the updated task details

**Examples**:
- User: "Change task 2 to buy groceries" → AI: "Updated! Task 2 is now 'buy groceries'"
- User: "Update task 1 description" → AI: "What would you like to change about task 1? You can update the title or add a description."
- User: "Change task 999 title" → AI: "I couldn't find task 999. Here are your tasks: [1] Buy groceries, [2] Pay bills"
- User: "Change Buy groceries to Buy groceries and snacks" → AI: "Done! I've updated 'Buy groceries' to 'Buy groceries and snacks'"

### US-004: Delete Task via Natural Language (Priority: P1)

As a user, I want to remove a task by asking the chatbot to delete it, so that I can clean up my list without selecting checkboxes.

**Acceptance Criteria**:
1. Given I send "Delete meeting task", then the AI identifies matching task and removes it
2. Given I send "Delete task 5", then the AI removes task with ID 5 and confirms
3. Given multiple tasks match my description, then the AI asks for clarification with "Which task: 'Meeting A' or 'Meeting B'?"
4. Given the deletion succeeds, then the AI responds with a confirmation message
5. Given I attempt to delete a non-existent task, then the AI responds with a helpful error message

**Examples**:
- User: "Delete meeting task" → AI: "Task 'Team meeting' has been deleted. You have 2 tasks remaining."
- User: "Delete task 3" → AI: "Deleted! Task 3 has been removed from your list."
- User: "Delete meeting" → AI: "Which task: 'Team meeting' or 'Client meeting'?"
- User: "Delete task 999" → AI: "I couldn't find task 999. Here are your tasks: [1] Buy groceries, [2] Pay bills"

### US-005: Mark Task as Complete via Natural Language (Priority: P1)

As a user, I want to mark a task as done by telling the chatbot, so that I can track my progress without clicking checkboxes.

**Acceptance Criteria**:
1. Given I send "Mark task 2 as done", then the AI updates task 2 completion status to true
2. Given I send "I finished paying bills", then the AI identifies the task and marks it complete
3. Given I send "Mark task 1 as not done", then the AI updates the task completion status to false
4. Given I send "Complete task" without specifying which, then the AI asks "Which task would you like to complete?"
5. Given the operation succeeds, then the AI responds with a confirmation and updated completion count

**Examples**:
- User: "Mark task 2 as done" → AI: "Done! 'Buy groceries' is now marked as complete."
- User: "I finished paying bills" → AI: "Great! 'Pay bills' is complete."
- User: "Mark task 1 as not done" → AI: "I've marked 'Team meeting' as incomplete."
- User: "Complete task" → AI: "Which task would you like to complete? You have 3 tasks: 1. Buy groceries, 2. Pay bills, 3. Team meeting"
- User: "I finished task 3" → AI: "Excellent! 'Call mom' is now complete. 2 tasks remaining."

### US-006: Conversation History Persistence (Priority: P1)

As a user, I want my conversation history to be saved when I close the browser, so that I can continue where I left off when I return.

**Acceptance Criteria**:
1. Given I have an active conversation with multiple messages, then when I close and reopen the browser, all messages are restored
2. Given I send a new message to an existing conversation, then the conversation ID remains unchanged and the new message is appended
3. Given I start a fresh conversation, then a new conversation is created with an auto-generated title
4. Given I have multiple conversations, then I can switch between them and see the correct message history
5. Given a conversation exceeds 100 messages, then a new conversation is automatically started

**Examples**:
- User: Sends "Add task", "Delete task", "View tasks" → Closes browser → Reopens → All messages present
- User: Sends "Add task" (conversation A) → Starts new chat → Sends "View tasks" → Conversation A still accessible
- User: Has "Groceries" and "Work" conversations → Can switch between them → Each shows correct history

## Agent Behavior Patterns

### Intent Recognition

The agent must recognize the following intents from natural language input:

| Intent | Key Phrasings | MCP Tool to Invoke |
|--------|----------------|---------------------|
| Add Task | "Add", "Create", "New task", "Add a task", "Create task" | add_task |
| View Tasks | "Show", "View", "List", "What's", "Display", "What tasks" | list_tasks |
| Update Task | "Change", "Update", "Modify", "Edit", "Change to" | update_task |
| Delete Task | "Delete", "Remove", "Get rid of" | delete_task |
| Complete Task | "Complete", "Done", "Finished", "Mark as done" | complete_task |
| Clarify | Ambiguous input without task details | None - ask clarification |

### Parameter Extraction

| Intent | Required Parameters | Optional Parameters | Example |
|--------|---------------------|---------------------|---------|
| Add Task | title (required) | description | "Add buy milk with description: tomorrow" |
| View Tasks | None | status (incomplete/completed) | "Show pending tasks" |
| Update Task | task identifier, field to update | new value | "Change task 3 to buy groceries" |
| Delete Task | task identifier (ID or title) | None | "Delete task 5" |
| Complete Task | task identifier (ID or title) | None | "Mark task 2 as done" |

### Response Templates

#### Success Responses

**Add Task Success**:
- "Done! I've added '{task_title}' to your tasks."
- "Great! '{task_title}' has been created."
- "I've added '{task_title}' for you. You have {count} tasks total."

**View Tasks Response**:
- "Here are your tasks ({count} total):\n\n{formatted_task_list}"
- "You have {incomplete_count} pending tasks:\n\n{incomplete_task_list}"

**Update Task Success**:
- "Updated! '{task_title}' is now '{new_title}'."
- "Done! I've updated task {task_id}."
- "I've changed the description for '{task_title}'."

**Delete Task Success**:
- "Task '{task_title}' has been deleted. You have {count} tasks remaining."
- "Deleted! '{task_title}' has been removed from your list."
- "I've removed '{task_title}' from your tasks."

**Complete Task Success**:
- "Done! '{task_title}' is now marked as complete."
- "Great! '{task_title}' is complete."
- "I've marked '{task_title}' as done. {count} tasks remaining."

#### Error Responses

**Task Not Found**:
- "I couldn't find task '{identifier}'. Here are your current tasks:\n\n{task_list}"
- "Task '{identifier}' doesn't exist. Would you like me to list your tasks?"

**Missing Required Parameter**:
- "I'd be happy to help, but I need to know what task you'd like to add. What's the task title?"
- "Which task would you like to {action}? Please provide the task ID or title."

**Ambiguous Input**:
- "I'm not sure which task you mean. Here are your tasks:\n\n{task_list}\n\nWhich one did you mean?"
- "Would you like me to add, view, update, delete, or complete a task?"

**Rate Limit Exceeded**:
- "You've reached the rate limit (60 requests per minute). Please wait a moment and try again."

#### Clarification Responses

**Missing Title for Add**:
- "What task would you like to add? Just tell me the title."

**Missing Task Identifier**:
- "Which task would you like to {action}? You can tell me the task ID (e.g., task 3) or the title."

**Multiple Tasks Match**:
- "I found {count} tasks matching '{title}':\n\n{matching_tasks}\n\nWhich one did you mean?"

### Conversation Flows

#### New Task Creation Flow

```
User: "Add buy milk tomorrow"
→ AI: [Calls add_task MCP tool with title="buy milk"]
→ AI: "Done! I've added 'buy milk' to your tasks."
```

#### Task Viewing Flow

```
User: "Show my tasks"
→ AI: [Calls list_tasks MCP tool]
→ AI: "Here are your tasks (3 total):

[ ] 1. Buy groceries
[x] 2. Pay bills
[ ] 3. Call mom

2 tasks pending, 1 completed"
```

#### Task Update Flow

```
User: "Change task 3 to buy groceries"
→ AI: [Calls list_tasks MCP tool to verify task exists]
→ AI: [Calls update_task MCP tool with task_id="3", title="buy groceries"]
→ AI: "Updated! Task 3 is now 'buy groceries'."
```

#### Task Deletion Flow

```
User: "Delete meeting task"
→ AI: [Finds multiple tasks matching "meeting"]
→ AI: "I found 2 tasks matching 'meeting': 'Team meeting' and 'Client meeting'. Which one would you like to delete?"
User: "Delete Team meeting"
→ AI: [Calls delete_task MCP tool]
→ AI: "Task 'Team meeting' has been deleted. You have 2 tasks remaining."
```

#### Task Completion Flow

```
User: "I finished paying bills"
→ AI: [Identifies "Pay bills" task]
→ AI: [Calls complete_task MCP tool with task_id]
→ AI: "Great! 'Pay bills' is complete. You have 2 tasks remaining."
```

#### Clarification Flow

```
User: "Add a task"
→ AI: "What task would you like to add? Just tell me the title."
User: "Buy groceries for the party"
→ AI: [Calls add_task MCP tool]
→ AI: "Done! I've added 'Buy groceries for the party' to your tasks."
```

### Ambiguity Resolution

When user input is ambiguous, the agent must:

1. **Acknowledge ambiguity**: "I'm not sure which task you mean."
2. **Provide options**: List matching tasks or ask for clarification
3. **Maintain context**: Keep conversation history to resolve future ambiguities
4. **Default to helpful**: When in doubt, ask for clarification rather than guessing

### Error Handling

The agent must handle errors gracefully:

1. **Task not found**: Suggest listing tasks to help user find correct identifier
2. **Database errors**: Return friendly message without exposing technical details
3. **Tool execution failures**: Retry once, then inform user with helpful suggestion
4. **Rate limiting**: Inform user of limit and retry-after time

### Quality Assurance

The agent must:

1. **Provide confirmatory feedback**: Always confirm successful operations with task details
2. **Be helpful and polite**: Use friendly language ("I've added", "Great!", "Done!")
3. **Avoid repetition**: Reference previous messages when appropriate for context
4. **Handle edge cases**: Empty task list, duplicate task names, very long titles
5. **Maintain conversation context**: Remember previous exchanges for accurate follow-ups

---

*End of Feature Specification: Chatbot User Stories and Agent Behavior*
