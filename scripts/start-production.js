#!/usr/bin/env node

// Production startup script for Render deployment
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const rootDir = path.resolve(__dirname, '..');

// Check if dist directory exists
const distPath = path.join(rootDir, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ Build directory not found. Run npm run build first.');
  process.exit(1);
}

// Check if server file exists
const serverPath = path.join(distPath, 'index.js');
if (!fs.existsSync(serverPath)) {
  console.error('❌ Server build file not found. Build may have failed.');
  process.exit(1);
}

console.log('✅ Starting Zhi Systems production server...');
console.log(`🔗 NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`🔗 PORT: ${process.env.PORT || 5000}`);
console.log(`🔗 DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}`);

// Start the server
const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: process.env
});

server.on('error', (err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Received SIGTERM, shutting down gracefully...');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('📴 Received SIGINT, shutting down gracefully...');
  server.kill('SIGINT');
});