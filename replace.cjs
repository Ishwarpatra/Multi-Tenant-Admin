const fs = require('fs');
const files = [
  'src/components/views/ControlPlaneDashboard.tsx',
  'src/components/views/HardwareMonitoring.tsx',
  'src/components/views/SecretsVault.tsx',
  'src/components/views/CoreInfrastructure.tsx',
  'src/components/views/LocalEnvManager.tsx',
  'src/components/views/DataPlaneNode.tsx',
  'src/components/layout/VSCodeShell.tsx',
  'src/App.tsx'
];
files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/text-white/g, 'text-vs-text');
    fs.writeFileSync(f, content);
  }
});
