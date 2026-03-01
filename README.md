# AI Code Reviewer

[![GitHub stars](https://img.shields.io/github/stars/opesli124/ai-code-reviewer?style=flat)](https://github.com/opesli124/ai-code-reviewer)
[![Version](https://img.shields.io/github/v/release/opesli124/ai-code-reviewer)](https://github.com/opesli124/ai-code-reviewer/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

A GitHub Action that provides AI-powered code review for Pull Requests using OpenAI, Anthropic Claude, or Ollama.

## Why AI Code Reviewer?

- **No more waiting** for code reviews - get instant feedback on every PR
- **Catch bugs early** before they reach production
- **Learn and improve** with AI suggestions on best practices
- **Free option available** - use Ollama to run locally without API costs

## Quick Start (3 lines)

```yaml
name: AI Code Review
on: [pull_request]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: opesli124/ai-code-reviewer@v1.1.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          api-key: ${{ secrets.OPENAI_API_KEY }}
```

## Features

```yaml
- uses: opesli124/ai-code-reviewer@v1.1.0
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    api-key: ${{ secrets.OPENAI_API_KEY }}
    provider: openai
    model: gpt-4
```

## Usage with Anthropic Claude

```yaml
- uses: opesli124/ai-code-reviewer@v1.1.0
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    api-key: ${{ secrets.ANTHROPIC_API_KEY }}
    provider: anthropic
    model: claude-3-opus-20240229
    review-prompt: "You are a senior software engineer. Review the following PR changes for code quality, security issues, and best practices."
```

## Usage with Ollama (Local)

```yaml
- uses: opesli124/ai-code-reviewer@v1.1.0
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    api-key: http://localhost:11434
    provider: ollama
    model: codellama
```

## Cost Control (Recommended)

Avoid expensive API calls on large PRs:

```yaml
- uses: opesli124/ai-code-reviewer@v1.1.0
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    api-key: ${{ secrets.OPENAI_API_KEY }}
    max-files: 15          # Skip if > 15 files changed
    max-changes: 400      # Skip if > 400 lines changed
    skip-label: no-ai-review  # Add this label to skip
```

## Skip Review with Label

Add `no-ai-review` label to a PR to skip AI review entirely:

## Configuration

| Input | Required | Description |
|-------|----------|-------------|
| `github-token` | Yes | GitHub token for posting comments |
| `api-key` | Yes | API key for AI service |
| `provider` | No | AI provider: openai, anthropic, or ollama (default: openai) |
| `model` | No | AI model to use (default: gpt-4) |
| `review-prompt` | No | Custom prompt for code review |
| `max-files` | No | Max files to review, skip if exceeded (default: 20) |
| `max-changes` | No | Max total changes (additions+deletions), skip if exceeded (default: 500) |
| `skip-label` | No | Label to skip review (default: ai-skip-review) |

## Supported AI Models

### OpenAI
- gpt-4
- gpt-4-turbo
- gpt-3.5-turbo

### Anthropic
- claude-3-opus-20240229
- claude-3-sonnet-20240229
- claude-3-haiku-20240307

### Ollama (Local)
- codellama
- llama2
- mistral
- neural-chat

## Example Review Output

After running, the action will post a comment like:

```
## 🤖 AI Code Review

### Security
- **High**: Potential SQL injection in `db.js:42` - use parameterized queries
- **Medium**: Hardcoded API key in `config.js:15` - use environment variables

### Code Quality
- Function `processData` is 85 lines - consider breaking into smaller functions
- Missing error handling in `api.js:23`

### Best Practices
- Consider adding JSDoc comments to `utils.js`
- TODO comment found in `main.js:100`

---
*Reviewed by AI Code Reviewer*
```

## License

MIT
