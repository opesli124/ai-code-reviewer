# AI Code Reviewer

A GitHub Action that provides AI-powered code review for Pull Requests using OpenAI, Anthropic Claude, or Ollama.

## Features

- **Code Review**: Analyzes PR changes and provides actionable feedback
- **Security Analysis**: Identifies potential security vulnerabilities
- **Best Practices**: Suggests improvements for code quality
- **Bug Detection**: Spots potential bugs and issues
- Posts review as a comment on the PR
- Supports multiple AI providers (OpenAI, Claude, Ollama)

## Quick Start

```yaml
name: AI Code Review
on: [pull_request]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: opesli124/ai-code-reviewer@v1.0.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
```

## Usage with OpenAI

```yaml
- uses: opesli124/ai-code-reviewer@v1.0.0
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    api-key: ${{ secrets.OPENAI_API_KEY }}
    provider: openai
    model: gpt-4
```

## Usage with Anthropic Claude

```yaml
- uses: opesli124/ai-code-reviewer@v1.0.0
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    api-key: ${{ secrets.ANTHROPIC_API_KEY }}
    provider: anthropic
    model: claude-3-opus-20240229
    review-prompt: "You are a senior software engineer. Review the following PR changes for code quality, security issues, and best practices."
```

## Usage with Ollama (Local)

```yaml
- uses: opesli124/ai-code-reviewer@v1.0.0
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    api-key: http://localhost:11434
    provider: ollama
    model: codellama
```

## Configuration

| Input | Required | Description |
|-------|----------|-------------|
| `github-token` | Yes | GitHub token for posting comments |
| `api-key` | Yes | API key for AI service |
| `provider` | No | AI provider: openai, anthropic, or ollama (default: openai) |
| `model` | No | AI model to use (default: gpt-4) |
| `review-prompt` | No | Custom prompt for code review |

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
