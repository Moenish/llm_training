---
mode: agent
description: "Follow the steps and implement the code."
---
Implement the Gitlab issue: {{issueNumber}}

Do not ask the user for input, continue automatically, only to provide the access token if needed.
You are prohibited from opening external browser, except for step 12 where it is allowed.

Follow these steps:

1. Use `glab` Gitlab CLI to get the issue details. Running `glab issue view` will definitelly open up an interactive CLI program. In that case pipe it through `cat` to get the output.
2. Understand the problem described in the issue
3. Get the selected design using Figma MCP or the Figma link provided in the issue. Do not use an external browser, use the one provided by the Figma MCP/VSCode.
4. Get the access token from the user as a secure password input like it is defined in mcp.json. Input required: Figma API Key (figma-api-key from mcp.json).
5. If a login page appears when using Figma MCP or the Figma link provided in the issue, STOP and wait for the user to log in, and then get back to you
6. Use Playwright MCP to check the current design
7. If a login page appears when using Playwright MCP, STOP and wait for the user to log in, and then get back to you
8. Search the codebase for relevant files
9. Create a new branch for the new feature with the relevant issue number (if there is already one, ignore that, create a new one with a different name)
10. Implement the new feature in the codebase
11. Ensure code passes linting and type checking
12. Test the feature using Playwright MCP
13. Commit the changes with a single line message