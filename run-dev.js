const { spawn } = require('child_process');
const path = require('path');

// Function to run a command in a specific directory
function runCommand(command, args, cwd) {
  const proc = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    shell: true
  });
  
  return proc;
}

// Start backend server
console.log('\x1b[36m%s\x1b[0m', '🚀 Starting backend server...');
const backend = runCommand('npm', ['run', 'dev'], path.join(__dirname, 'backend'));

// Start frontend development server
console.log('\x1b[35m%s\x1b[0m', '🚀 Starting frontend development server...');
const frontend = runCommand('npm', ['run', 'dev'], path.join(__dirname, 'frontend'));

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\x1b[33m%s\x1b[0m', '👋 Shutting down development servers...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});

// Log any errors
backend.on('error', (error) => {
  console.error('\x1b[31m%s\x1b[0m', '❌ Backend error:', error);
});

frontend.on('error', (error) => {
  console.error('\x1b[31m%s\x1b[0m', '❌ Frontend error:', error);
});

console.log('\x1b[32m%s\x1b[0m', '✅ Development environment is running!');
console.log('\x1b[32m%s\x1b[0m', '🌐 Frontend: http://localhost:5173');
console.log('\x1b[32m%s\x1b[0m', '🌐 Backend: http://localhost:5000');
console.log('\x1b[33m%s\x1b[0m', '⚠️ Press Ctrl+C to stop all servers'); 