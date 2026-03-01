const core = require('@actions/core');
const github = require('@actions/github');
const OpenAI = require('openai');

async function callOpenAI(apiKey, model, systemPrompt, userPrompt) {
  const openai = new OpenAI({ apiKey });
  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.5,
    max_tokens: 1500,
  });
  return response.choices[0].message.content;
}

async function callAnthropic(apiKey, model, systemPrompt, userPrompt) {
  const anthropicKey = apiKey.startsWith('sk-ant-') ? apiKey : apiKey;
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: model || 'claude-3-haiku-20240307',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.content[0].text;
}

async function callOllama(apiKey, model, systemPrompt, userPrompt) {
  // apiKey can be used as base URL or empty for local
  const baseURL = apiKey && !apiKey.startsWith('sk-') ? apiKey : 'http://localhost:11434';
  const modelName = model || 'codellama';
  const response = await fetch(`${baseURL}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      stream: false,
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data.message.content;
}

async function run() {
  try {
    const githubToken = core.getInput('github-token', { required: true });
    const apiKey = core.getInput('api-key', { required: true });
    const provider = core.getInput('provider') || 'openai';
    const model = core.getInput('model');
    const reviewPrompt = core.getInput('review-prompt') || 'You are an expert code reviewer. Analyze the following PR changes and provide feedback on: 1) Security issues, 2) Bug potential, 3) Code quality, 4) Best practices. Be concise but actionable.';

    const client = github.getOctokit(githubToken);
    const context = github.context;

    if (!context.payload.pull_request) {
      core.setFailed('This action only runs on pull_request events');
      return;
    }

    const prNumber = context.payload.pull_request.number;
    const prTitle = context.payload.pull_request.title;
    const prBody = context.payload.pull_request.body || '';
    const repoOwner = context.repo.owner;
    const repoRepo = context.repo.repo;

    // Get the diff
    const { data: files } = await client.rest.pulls.listFiles({
      owner: repoOwner,
      repo: repoRepo,
      pull_number: prNumber,
    });

    // Build context from changed files
    let diffContent = '';
    let fileCount = files.length;

    for (const file of files.slice(0, 15)) {
      diffContent += `## ${file.filename}\n`;
      diffContent += `Status: ${file.status}\n`;
      diffContent += `Changes: +${file.additions} -${file.deletions}\n`;
      if (file.patch) {
        diffContent += `\`\`\`diff\n${file.patch}\n\`\`\`\n`;
      }
    }

    if (files.length > 15) {
      diffContent += `\n*... and ${files.length - 15} more files*\n`;
    }

    const userPrompt = `PR Title: ${prTitle}\n\nPR Description:\n${prBody}\n\nChanged Files (${fileCount} files):\n${diffContent}\n\nPlease provide a code review with specific, actionable feedback.`;

    let review;
    switch (provider.toLowerCase()) {
      case 'anthropic':
        review = await callAnthropic(apiKey, model, reviewPrompt, userPrompt);
        break;
      case 'ollama':
        review = await callOllama(apiKey, model, reviewPrompt, userPrompt);
        break;
      case 'openai':
      default:
        review = await callOpenAI(apiKey, model || 'gpt-4', reviewPrompt, userPrompt);
        break;
    }

    // Post comment
    const commentBody = `## 🤖 AI Code Review\n\n${review}\n\n---\n*Reviewed by [AI Code Reviewer](https://github.com/opesli124/ai-code-reviewer)*`;

    await client.rest.issues.createComment({
      owner: repoOwner,
      repo: repoRepo,
      issue_number: prNumber,
      body: commentBody,
    });

    core.info('Code review posted successfully');
  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

run();
