# Playwright MCP Skill References

This directory contains reference materials for the Playwright MCP server integration skill.

## Resources

### Official Documentation

- [Playwright MCP Server](https://github.com/modelcontextprotocol/servers) - Official MCP server repository
- [Playwright Documentation](https://playwright.dev/) - Official Playwright docs
- [MCP Specification](https://modelcontextprotocol.io/) - Model Context Protocol spec

### MCP Tools Reference

See the main [SKILL.md](../SKILL.md) for complete MCP tool reference including:

- Navigation tools (navigate, back, close, tabs)
- Interaction tools (click, type, hover, drag, press_key)
- Form tools (fill_form, file_upload, select_option, handle_dialog)
- Monitoring tools (console_messages, network_requests)
- Capture tools (take_screenshot, snapshot)
- JavaScript tools (run_code, evaluate)
- Utility tools (wait_for, resize, install)

### Common Use Cases

1. **Console Log Inspection** - Debug JavaScript errors and warnings
2. **Network Request Monitoring** - Inspect API calls and responses
3. **Form Automation** - Fill and submit forms programmatically
4. **Screenshot Capture** - Document visual state for debugging
5. **Web Scraping** - Extract structured data from websites
6. **E2E Testing** - Automate user journey testing

## Examples

### Basic Console Check

```typescript
await browser_install()
await browser_navigate({ url: 'http://localhost:3000' })
await browser_console_messages({ level: 'error' })
```

### Form Automation

```typescript
await browser_fill_form({
  fields: [
    { name: 'Email', type: 'textbox', ref: 'email-ref', value: 'user@example.com' },
    { name: 'Terms', type: 'checkbox', ref: 'terms-ref', value: 'true' }
  ]
})
```

### Network Monitoring

```typescript
await browser_network_requests({
  includeStatic: false,
  filename: 'api-calls.txt'
})
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Browser not found | Run `await browser_install()` |
| Element not clickable | Use snapshot to get correct ref, wait for content |
| No console output | Check console level, verify page has JavaScript |
| Missing requests | Wait for requests, check includeStatic setting |
