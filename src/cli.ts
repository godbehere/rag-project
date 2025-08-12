#!/usr/bin/env node
import { spawn } from 'child_process';
import fs from 'fs';
import readline from 'readline';
import path from 'path';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config();

function printHelp() {
  console.log(`rag-cli

Usage:
  rag-cli start:server       Start the API server
  rag-cli start:worker       Start the worker
  rag-cli up                 Start all services with Docker Compose
  rag-cli down               Stop all Docker Compose services
  rag-cli status             Show status of services
  rag-cli clear-vectorstore  Clear the vector store (admin)
  rag-cli ingest:text        Ingest plain text from stdin or --text argument
  rag-cli ingest:file        Ingest one or more files (--file <path> ...)
  rag-cli ingest:url         Ingest one or more URLs (--url <url> ...)
  rag-cli query              Query the vector store (prompt for input or --query argument)
  rag-cli init               Interactive config setup
  rag-cli help               Show this help message
`);
}

async function ingestFileCLI(files: string[]) {
  if (!files || files.length === 0) {
    console.error('No file(s) provided. Use --file <path> ...');
    process.exit(1);
  }
  const form = new FormData();
  for (const file of files) {
    form.append('files', fs.createReadStream(path.resolve(file)));
  }
  const res = await fetch('http://localhost:3000/api/ingest/files', {
    method: 'POST',
    // @ts-ignore
    body: form,
    headers: form.getHeaders(),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('File ingestion failed:', err);
    process.exit(1);
  }
  const result = await res.json();
  console.log('File ingestion result:', result);
}

async function ingestUrlCLI(urls: string[]) {
  if (!urls || urls.length === 0) {
    console.error('No URL(s) provided. Use --url <url> ...');
    process.exit(1);
  }
  const res = await fetch('http://localhost:3000/api/ingest/files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urls }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('URL ingestion failed:', err);
    process.exit(1);
  }
  const result = await res.json();
  console.log('URL ingestion result:', result);
}
import fetch from 'node-fetch';
async function ingestTextCLI(text?: string) {
  if (!text) {
    // Read from stdin
    console.log('Enter text to ingest (end with Ctrl+D):');
    text = await new Promise<string>(resolve => {
      let data = '';
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', chunk => data += chunk);
      process.stdin.on('end', () => resolve(data));
    });
    text = text.trim();
  }
  if (!text) {
    console.error('No text provided.');
    process.exit(1);
  }
  const res = await fetch('http://localhost:3000/api/ingest/text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('Ingestion failed:', err);
    process.exit(1);
  }
  const result = await res.json();
  console.log('Ingestion result:', result);
}

async function queryCLI(query?: string) {
  if (!query) {
    // Read from stdin
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    query = await new Promise<string>(resolve => rl.question('Enter your query: ', resolve));
    rl.close();
  }
  if (!query) {
    console.error('No query provided.');
    process.exit(1);
  }
  const res = await fetch('http://localhost:3000/api/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        query: query,
        topK: 15,
        generate: true
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('Query failed:', err);
    process.exit(1);
  }
  const result = await res.json();
  console.log('Query result:', JSON.stringify(result, null, 2));
}

async function runInit() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  function ask(q: string) {
    return new Promise<string>(resolve => rl.question(q, resolve));
  }
  console.log('Interactive .env setup. Press Enter to keep default in [brackets].');
  const env: Record<string, string> = {};
  env.OPENAI_API_KEY = await ask('OpenAI API Key: ');
  env.REDIS_URL = await ask('Redis URL [redis://localhost:6379]: ') || 'redis://localhost:6379';
  env.QDRANT_URL = await ask('Qdrant URL [http://localhost:6333]: ') || 'http://localhost:6333';
  env.GENERATION_MODEL = await ask('OpenAI Generation Model [gpt-3.5-turbo]: ') || 'gpt-3.5-turbo';
  env.EMBEDDING_MODEL = await ask('OpenAI Embedding Model [text-embedding-3-small]: ') || 'text-embedding-3-small';
  env.USE_MOCK_EMBEDDINGS = await ask('Use mock embeddings? (true/false) [false]: ') || 'false';
  rl.close();
  let envStr = '';
  for (const [k, v] of Object.entries(env)) {
    envStr += `${k}=${v}\n`;
  }
  fs.writeFileSync('.env', envStr);
  console.log('.env file written.');
}

function checkEnvOrPromptInit(required: string[], cmd: string | undefined) {
  const missing = required.filter(k => !process.env[k]);
  if (missing.length > 0 && cmd !== 'init') {
    console.log(`Required configuration missing: ${missing.join(', ')}`);
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('Would you like to run interactive setup now? (Y/n): ', async (answer) => {
      rl.close();
      if (answer.trim().toLowerCase() === 'n') {
        console.log('Aborting. Please run `rag-cli init` to set up your config.');
        process.exit(1);
      } else {
        await runInit();
        process.exit(0);
      }
    });
    return false;
  }
  return true;
}


const cmd = process.argv[2];
const requiredEnv = ['OPENAI_API_KEY', 'REDIS_URL', 'QDRANT_URL'];

if (!checkEnvOrPromptInit(requiredEnv, cmd)) {
// checkEnvOrPromptInit will handle process exit if needed
} else {
  switch (cmd) {
    case 'ingest:text': {
      // Support --text argument or stdin
      const textArgIdx = process.argv.indexOf('--text');
      let text: string | undefined = undefined;
      if (textArgIdx !== -1 && process.argv[textArgIdx + 1]) {
        text = process.argv[textArgIdx + 1];
      }
      ingestTextCLI(text);
      break;
    }
    case 'ingest:file': {
      // Support --file <path> ...
      const fileArgs: string[] = [];
      for (let i = 3; i < process.argv.length; i++) {
        if (process.argv[i] === '--file' && process.argv[i + 1]) {
          fileArgs.push(process.argv[i + 1]);
          i++;
        }
      }
      ingestFileCLI(fileArgs);
      break;
    }
    case 'ingest:url': {
      // Support --url <url> ...
      const urlArgs: string[] = [];
      for (let i = 3; i < process.argv.length; i++) {
        if (process.argv[i] === '--url' && process.argv[i + 1]) {
          urlArgs.push(process.argv[i + 1]);
          i++;
        }
      }
      ingestUrlCLI(urlArgs);
      break;
    }
    case 'query': {
      // Support --query argument or prompt
      const queryArgIdx = process.argv.indexOf('--query');
      let query: string | undefined = undefined;
      if (queryArgIdx !== -1 && process.argv[queryArgIdx + 1]) {
        query = process.argv[queryArgIdx + 1];
      }
      queryCLI(query);
      break;
    }
    case 'start:server':
        spawn('npm', ['run', 'dev'], { stdio: 'inherit' });
        break;
    case 'start:worker':
        spawn('npm', ['run', 'worker'], { stdio: 'inherit' });
        break;
    case 'up':
        spawn('docker', ['compose', 'up'], { stdio: 'inherit' });
        break;
    case 'down':
        spawn('docker', ['compose', 'down'], { stdio: 'inherit' });
        break;
    case 'status':
        spawn('docker', ['compose', 'ps'], { stdio: 'inherit' });
        break;
    case 'clear-vectorstore':
        // TODO: Implement API call to clear vectorstore
        console.log('Not yet implemented.');
        break;
    case 'init':
        runInit();
        break;
    case 'help':
    case undefined:
        printHelp();
        break;
    default:
        console.error(`Unknown command: ${cmd}`);
        printHelp();
        process.exit(1);
    }
}
