# Project Instructions for AI Agents

## Purpose

This file explains how an AI agent should work in this project. Read it before
making project changes. Keep these instructions simple and follow them on every
task.

## Rules for changing code

- Read the relevant files before suggesting or making changes.
- Do not change, delete, rename, or reformat code unless the user clearly gives
  permission for that specific change.
- A request to review code means: explain problems and suggest fixes. It does
  not give permission to edit the code.
- A request to add comments or docstrings allows changes to comments and
  docstrings only. Do not change how the code works unless separately allowed.
- When the user asks to add docstrings, edit only the currently open or
  explicitly tagged source file. Do not add docstrings to other files unless
  the user asks for those files too.
- If permission is unclear, stop before editing and ask the user.
- Keep changes limited to the requested work. Do not undo work that may belong
  to the user.
- Explain errors in plain language and make it clear which changes were made.

## Reviewing code

- Report likely mistakes with the file and the reason they may cause a problem.
- Give a suggested fix separately. Never apply the fix without permission.
- Do not claim that a problem is confirmed if it has not been tested or checked
  against the relevant package or project setup.
- Run suitable existing checks only when they are safe and relevant. Report
  what was and was not checked.

## Writing comments and documentation

- Use short, clear wording that a non-technical reader can understand.
- Explain why something may be confusing; do not add comments that merely repeat
  the code.
- Keep Markdown readable with clear headings and short sections.
- Update related documentation when the user has asked for a feature or change
  that needs it.

## Recording prompts and work

For each project task, add an entry to [docs/agent-history.md](docs/agent-history.md)
with:

1. The date.
2. The user's original project prompt, when it is available in the active
   conversation.
3. A lightly improved version that keeps the user's meaning.
4. A short summary of the work, review findings, and checks performed.
5. The files changed, if any.

Do not silently rewrite the original prompt. Keep the original and improved
versions clearly labeled. Do not copy passwords, access tokens, personal
information, or other sensitive material into the history. If a prompt contains
sensitive information, leave that part out and note that it was omitted.

This instruction asks future agents to update the history; a Markdown file
cannot capture conversations by itself. The history is updated only when an
agent or person reads this instruction and adds an entry. It does not record
private chats automatically.

## Current project notes

- The application code is under `backend/app/`.
- Check the current files before relying on this description; the project may
  change over time.
- Keep project-specific notes here only when they are useful to future work.
