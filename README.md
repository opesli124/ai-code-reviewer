# PR Summarizer

A GitHub Action that automatically generates summaries for Pull Requests using AI.

## Features

- Automatically generates concise summaries of PR changes
- Posts summary as a comment on the PR
- Supports custom prompts
- Works with any AI provider (OpenAI, Anthropic, etc.)

## Usage

```yaml
name: PR Summarizer
on: [pull_request]

jobs:
  summarize:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./pr-summarizer
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
| `summary-prompt` | No | Custom prompt for summarization |

## Supported AI Providers

- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Ollama (local)

## License

MIT
