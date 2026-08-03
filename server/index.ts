import { createCloudVoiceServer, loadCloudVoiceConfig } from './cloudVoiceServer';

const config = loadCloudVoiceConfig();
const server = createCloudVoiceServer(config);

server.listen(config.port, config.host, () => {
  process.stdout.write(
    `Cloud Voice backend listening on http://${config.host}:${config.port} (live=${Boolean(config.apiKey)})\n`,
  );
});

function closeServer(): void {
  server.close(() => process.exit(0));
}

process.once('SIGINT', closeServer);
process.once('SIGTERM', closeServer);

server.once('error', () => {
  process.stderr.write('Cloud Voice backend could not start.\n');
  process.exitCode = 1;
});
