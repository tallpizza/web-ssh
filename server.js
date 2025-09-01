const express = require('express');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8022; // Change to 8022 for API server

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', ttyd: ttydProcess ? 'running' : 'stopped' });
});

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

// Start ttyd when server starts
startTtyd();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  if (ttydProcess) {
    ttydProcess.kill();
  }
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`ttyd terminal available on http://localhost:8021`);
});