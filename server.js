const { spawn } = require('child_process');
const { exec } = require('child_process');
const path = require('path');

// Start ttyd process
let ttydProcess = null;

function startTtyd() {
  if (ttydProcess) {
    console.log('ttyd is already running');
    return;
  }

  const ttydPort = 8021;
  const args = [
    '-p', ttydPort.toString(),
    '-W', // Allow write
    '-t', 'titleFixed=Web SSH Terminal',
    '-s', '2', // SIGINT on exit
    '-P', '10', // Ping interval
    '/bin/zsh'  // Changed to zsh
  ];

  console.log('Starting ttyd on port', ttydPort);
  ttydProcess = spawn('ttyd', args);

  ttydProcess.stdout.on('data', (data) => {
    console.log(`ttyd: ${data}`);
  });

  ttydProcess.stderr.on('data', (data) => {
    console.error(`ttyd error: ${data}`);
  });

  ttydProcess.on('exit', (code) => {
    console.log(`ttyd exited with code ${code}`);
    ttydProcess = null;
  });
}


// Start Vite dev server
function startViteServer() {
  console.log('Starting Vite dev server on port 8020...');
  const viteProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });

  viteProcess.on('error', (err) => {
    console.error('Failed to start Vite:', err);
  });

  return viteProcess;
}

// Graceful shutdown
let viteProcess = null;

process.on('SIGINT', () => {
  console.log('\nShutting down...');
  if (ttydProcess) {
    ttydProcess.kill();
  }
  if (viteProcess) {
    viteProcess.kill();
  }
  process.exit(0);
});

// Start everything
console.log('Starting Web SSH Terminal...');
startTtyd();
viteProcess = startViteServer();

console.log('Web SSH Terminal is running:');
console.log('  Frontend: http://localhost:8020');
console.log('  Terminal: http://localhost:8021');