# AI Code Reviewer

A GitHub Action that provides AI-powered code review for Pull Requests.

## Features

- **Code Review**: Analyzes PR changes and provides actionable feedback
- **Security Analysis**: Identifies potential security vulnerabilities
- **Best Practices**: Suggests improvements for code quality
- **Bug Detection**: Spots potential bugs and issues
- Posts review as a comment on the PR

## Usage

```yaml
name: AI Code Reviewer
on: [pull_request]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./ai-code-reviewer
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          model: gpt-4
```

## Configuration

| Input | Required | Description |
|-------|----------|-------------|
| `github-token` | Yes | GitHub token for posting comments |
| `openai-api-key` | Yes | API key for AI service |
| `model` | No | AI model to use (default: gpt-4) |
| `review-prompt` | No | Custom prompt for code review |

## Supported AI Providers

- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Ollama (local)

## License

MIT
