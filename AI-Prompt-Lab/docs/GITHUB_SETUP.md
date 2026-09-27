# Add PromptLab to GitHub

These steps upload the source code and documentation. They do not deploy the website or make a local server publicly accessible.

## 1. Create a repository

1. Sign in to GitHub.
2. Click the + menu → New repository.
3. Repository name: ai-prompt-lab.
4. Description: use the suggested description in README.md.
5. Choose Public for a portfolio or Private if preferred.
6. Leave the options to initialize a README, .gitignore, and license unchecked because this folder already contains project files.
7. Click Create repository.
8. Copy the repository's HTTPS URL.

## 2. Open a terminal in the project

In PowerShell:

    Set-Location -LiteralPath 'D:\Own Project Builds\AI Prompt Lab'

Git must be installed. You can alternatively use GitHub Desktop to add the existing folder and publish it.

## 3. Confirm private files are excluded

The supplied .gitignore excludes .env files (except .env.example), dependencies, Next.js build output, npm cache, logs, and TypeScript build metadata.

Do not upload .env.local, API keys, Google client secrets, database passwords, private documents, or unreviewed screenshots. The README screenshot shows the guest interface; review any other images before publishing them.

## 4. Initialize Git, if this folder is not already a repository

    git init
    git branch -M main

Skip initialization if the folder already belongs to a repository.

## 5. Stage and review

    git add .
    git status
    git diff --cached --stat
    git ls-files .env.local

The last command should print nothing. Review the staged file list before continuing. If .env.local is already tracked, remove it from tracking while preserving the local file:

    git rm --cached -- .env.local

If a secret has already been pushed or included in a shared commit, revoke/rotate it; removing the current file alone does not remove it from history.

## 6. Commit

    git commit -m "Document PromptLab workspace and integrations"

If Git asks for your author identity, set your name and preferred GitHub-associated or GitHub noreply email, then retry the commit.

## 7. Connect your repository

Replace YOUR_GITHUB_USERNAME and YOUR_REPOSITORY with the actual values:

    git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY.git

If origin already exists, check git remote -v and use the correct existing remote rather than adding another.

## 8. Upload

    git push -u origin main

Complete GitHub authentication yourself if prompted. Do not paste authentication tokens into chat or put them in the repository URL.

## 9. Review GitHub

Open the repository and confirm the README renders, the screenshot displays, and the private .env.local file is absent.

Suggested repository topics: nextjs, react, typescript, tailwindcss, supabase, openai, prompt-engineering, google-drive.

## What this release contains

A locally runnable interface with prepared samples, local persistence, optional service integrations, and paused live AI. Do not describe Google Drive as connected, cloud history as implemented, or paid AI/voice behavior as tested until those steps are completed.

No license has been selected for this project. Choose an appropriate license before explicitly inviting reuse of the code.

