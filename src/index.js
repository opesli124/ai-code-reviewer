const core = require('@actions/core');
const github = require('@actions/github');
const OpenAI = require('openai');

async function run() {
  try {
    const githubToken = core.getInput('github-token', { required: true });
    const openaiApiKey = core.getInput('openai-api-key', { required: true });
    const model = core.getInput('model') || 'gpt-4';
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

    for (const file of files.slice(0, 15)) { // Limit to first 15 files
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

    // Call OpenAI API for code review
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: reviewPrompt
        },
        {
          role: 'user',
          content: `PR Title: ${prTitle}\n\nPR Description:\n${prBody}\n\nChanged Files (${fileCount} files):\n${diffContent}\n\nPlease provide a code review with specific, actionable feedback.`
        }
      ],
      temperature: 0.5,
      max_tokens: 1500,
    });

    const review = response.choices[0].message.content;

    // Determine review sentiment based on content
    const hasIssues = review.toLowerCase().includes('issue') ||
                      review.toLowerCase().includes('problem') ||
                      review.toLowerCase().includes('security');

    // Post comment
    const commentBody = `## 🤖 AI Code Review\n\n${review}\n\n---\n*Reviewed by [AI Code Reviewer](https://github.com/opesli124/pr-summarizer)*`;

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
