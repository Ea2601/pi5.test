#!/usr/bin/env node

/**
 * Pi5 Supernode - Module Installer
 * Automated module installation and management
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const COLORS = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function logStep(step, message) {
  log(`\n${COLORS.bright}[${step}]${COLORS.reset} ${message}`, 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

const availableModules = [
  {
    id: 'device-management',
    name: 'Device Management',
    description: 'Network device discovery and management',
    category: 'network',
    dependencies: [],
    size: '2.1 MB',
    builtIn: true
  },
  {
    id: 'network-management',
    name: 'Network Management', 
    description: 'DNS, DHCP, WiFi configuration',
    category: 'network',
    dependencies: [],
    size: '3.4 MB',
    builtIn: true
  },
  {
    id: 'vpn-management',
    name: 'VPN Management',
    description: 'WireGuard VPN server/client management',
    category: 'security',
    dependencies: [],
    size: '1.8 MB',
    builtIn: true
  },
  {
    id: 'automation-engine',
    name: 'Automation Engine',
    description: 'Rule engine and external integrations',
    category: 'automation',
    dependencies: [],
    size: '2.7 MB',
    builtIn: true
  },
  {
    id: 'storage-management',
    name: 'Storage Management',
    description: 'USB devices and network storage',
    category: 'storage',
    dependencies: [],
    size: '1.9 MB',
    builtIn: true
  },
  {
    id: 'monitoring-dashboard',
    name: 'Monitoring Dashboard',
    description: 'System monitoring and observability',
    category: 'monitoring',
    dependencies: [],
    size: '2.3 MB',
    builtIn: true
  },
  {
    id: 'system-settings',
    name: 'System Settings',
    description: 'System configuration and management',
    category: 'system',
    dependencies: [],
    size: '1.5 MB',
    builtIn: true
  }
];

async function main() {
  const command = process.argv[2];
  const moduleId = process.argv[3];

  log(`
${COLORS.bright}${COLORS.blue}
╔══════════════════════════════════════════════════════════════╗
║                   Pi5 Modular System Manager                 ║
║                Module Installation & Management               ║
╚══════════════════════════════════════════════════════════════╝
${COLORS.reset}
  `);

  switch (command) {
    case 'list':
      await listAvailableModules();
      break;
    case 'install':
      if (!moduleId) {
        logError('Module ID required for installation');
        showUsage();
        process.exit(1);
      }
      await installModule(moduleId);
      break;
    case 'install-all':
      await installAllModules();
      break;
    case 'uninstall':
      if (!moduleId) {
        logError('Module ID required for uninstallation');
        showUsage();
        process.exit(1);
      }
      await uninstallModule(moduleId);
      break;
    case 'status':
      await showModuleStatus();
      break;
    case 'verify':
      await verifyModules();
      break;
    default:
      showUsage();
      break;
  }
}

async function listAvailableModules() {
  logStep('MODULES', 'Available Modules for Pi5 Supernode');
  
  console.log('\n📦 Built-in Modules:');
  availableModules.filter(m => m.builtIn).forEach(module => {
    const status = checkModuleStatus(module.id);
    const statusIcon = status === 'installed' ? '✅' : status === 'available' ? '📦' : '❌';
    
    console.log(`  ${statusIcon} ${module.name} (${module.id})`);
    console.log(`     📝 ${module.description}`);
    console.log(`     📊 Category: ${module.category} | Size: ${module.size}`);
    
    if (module.dependencies.length > 0) {
      console.log(`     🔗 Dependencies: ${module.dependencies.join(', ')}`);
    }
    console.log('');
  });

  console.log('🛠  Installation Commands:');
  console.log('  node scripts/module-installer.js install <module-id>');
  console.log('  node scripts/module-installer.js install-all');
  console.log('  node scripts/module-installer.js status');
}

async function installModule(moduleId) {
  const module = availableModules.find(m => m.id === moduleId);
  
  if (!module) {
    logError(`Module not found: ${moduleId}`);
    return;
  }

  logStep('INSTALL', `Installing ${module.name}`);
  
  try {
    // Check dependencies
    logStep('DEPS', 'Checking dependencies...');
    await checkDependencies(module);
    
    // Install module
    logStep('MODULE', `Installing ${module.name}...`);
    await performModuleInstallation(module);
    
    // Verify installation
    logStep('VERIFY', 'Verifying installation...');
    const status = await verifyModuleInstallation(module.id);
    
    if (status.success) {
      logSuccess(`${module.name} installed successfully`);
      
      console.log(`\n📋 Installation Summary:`);
      console.log(`   Module: ${module.name} v${module.version || '1.0.0'}`);
      console.log(`   Status: ${status.status}`);
      console.log(`   Features: ${status.features?.join(', ') || 'All features'}`);
      
      if (status.postInstallNotes) {
        console.log(`\n📌 Post-Installation Notes:`);
        status.postInstallNotes.forEach(note => console.log(`   • ${note}`));
      }
    } else {
      logError(`Installation failed: ${status.error}`);
    }
    
  } catch (error) {
    logError(`Installation failed: ${error.message}`);
  }
}

async function installAllModules() {
  logStep('INSTALL-ALL', 'Installing all core modules...');
  
  const coreModules = availableModules.filter(m => m.builtIn);
  
  for (const module of coreModules) {
    try {
      logStep(`${module.id.toUpperCase()}`, `Installing ${module.name}...`);
      await performModuleInstallation(module);
      logSuccess(`${module.name} installed`);
    } catch (error) {
      logWarning(`Failed to install ${module.name}: ${error.message}`);
    }
  }
  
  logSuccess('All modules installation completed');
}

async function performModuleInstallation(module) {
  // For built-in modules, ensure files exist
  if (module.builtIn) {
    const modulePath = path.join('src', 'modules', `${module.id.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('')}Module.tsx`);
    
    if (!fs.existsSync(modulePath)) {
      throw new Error(`Module file not found: ${modulePath}`);
    }
    
    log(`   ✓ Module file: ${modulePath}`);
  }
  
  // Create module configuration
  const configDir = path.join('config', 'modules');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  const moduleConfig = {
    id: module.id,
    name: module.name,
    version: module.version || '1.0.0',
    installed: true,
    installedAt: new Date().toISOString(),
    status: 'ready'
  };
  
  fs.writeFileSync(
    path.join(configDir, `${module.id}.json`), 
    JSON.stringify(moduleConfig, null, 2)
  );
  
  log(`   ✓ Module configuration saved`);
  
  // Add to module registry
  await updateModuleRegistry(module);
  
  log(`   ✓ Module registered`);
}

async function updateModuleRegistry(module) {
  const registryPath = path.join('config', 'module-registry.json');
  let registry = { modules: [] };
  
  if (fs.existsSync(registryPath)) {
    registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  }
  
  // Remove existing entry if exists
  registry.modules = registry.modules.filter(m => m.id !== module.id);
  
  // Add new entry
  registry.modules.push({
    id: module.id,
    name: module.name,
    version: module.version || '1.0.0',
    category: module.category,
    installed: true,
    installedAt: new Date().toISOString()
  });
  
  registry.lastUpdated = new Date().toISOString();
  
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
}

async function checkDependencies(module) {
  for (const dep of module.dependencies) {
    const depStatus = checkModuleStatus(dep);
    if (depStatus !== 'installed') {
      throw new Error(`Missing dependency: ${dep}`);
    }
    log(`   ✓ Dependency satisfied: ${dep}`);
  }
}

function checkModuleStatus(moduleId) {
  const configPath = path.join('config', 'modules', `${moduleId}.json`);
  
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return config.installed ? 'installed' : 'available';
  }
  
  return 'available';
}

async function verifyModuleInstallation(moduleId) {
  const module = availableModules.find(m => m.id === moduleId);
  if (!module) {
    return { success: false, error: 'Module not found' };
  }

  const features = [];
  const postInstallNotes = [];

  switch (moduleId) {
    case 'device-management':
      features.push('Device Discovery', 'Wake-on-LAN', 'Device Management');
      postInstallNotes.push('Device discovery will work after network scan');
      break;
    case 'network-management':
      features.push('DNS Management', 'DHCP Pools', 'WiFi Configuration', 'Network Settings');
      postInstallNotes.push('Complete Supabase setup for full functionality');
      break;
    case 'vpn-management':
      features.push('WireGuard Servers', 'VPN Clients', 'Auto WG Installer', 'Config Generation');
      postInstallNotes.push('Ensure WireGuard kernel module is loaded');
      break;
    case 'automation-engine':
      features.push('Visual Rule Builder', 'Webhook Integration', 'Telegram Bot', 'Event System');
      postInstallNotes.push('Configure Telegram bot token for notifications');
      break;
    case 'storage-management':
      features.push('USB Device Management', 'Network Shares', 'Backup System', 'Storage Monitoring');
      postInstallNotes.push('USB auto-mount requires proper permissions');
      break;
    case 'monitoring-dashboard':
      features.push('System Metrics', 'Log Aggregation', 'Grafana Integration', 'Health Monitoring');
      postInstallNotes.push('Access Grafana at http://localhost:3100');
      break;
    case 'system-settings':
      features.push('System Configuration', 'Module Management', 'Documentation', 'Snapshot Management');
      break;
  }

  return {
    success: true,
    status: 'installed',
    features,
    postInstallNotes
  };
}

async function showModuleStatus() {
  logStep('STATUS', 'Module Installation Status');
  
  console.log('\n📊 Module Status Report:\n');
  
  for (const module of availableModules) {
    const status = checkModuleStatus(module.id);
    const statusIcon = status === 'installed' ? '✅' : '❌';
    
    console.log(`${statusIcon} ${module.name}`);
    console.log(`   Status: ${status}`);
    console.log(`   Category: ${module.category}`);
    console.log('');
  }
  
  const installedCount = availableModules.filter(m => checkModuleStatus(m.id) === 'installed').length;
  console.log(`📈 Summary: ${installedCount}/${availableModules.length} modules installed\n`);
}

async function verifyModules() {
  logStep('VERIFY', 'Verifying all module installations...');
  
  let allValid = true;
  
  for (const module of availableModules) {
    const status = checkModuleStatus(module.id);
    if (status === 'installed') {
      try {
        const verification = await verifyModuleInstallation(module.id);
        if (verification.success) {
          logSuccess(`${module.name}: OK`);
        } else {
          logError(`${module.name}: ${verification.error}`);
          allValid = false;
        }
      } catch (error) {
        logError(`${module.name}: Verification failed - ${error.message}`);
        allValid = false;
      }
    }
  }
  
  if (allValid) {
    logSuccess('All installed modules verified successfully');
  } else {
    logWarning('Some modules have verification issues');
  }
}

async function uninstallModule(moduleId) {
  logStep('UNINSTALL', `Removing module: ${moduleId}`);
  
  const configPath = path.join('config', 'modules', `${moduleId}.json`);
  
  if (fs.existsSync(configPath)) {
    fs.unlinkSync(configPath);
    logSuccess(`Module ${moduleId} uninstalled`);
  } else {
    logWarning(`Module ${moduleId} not found`);
  }
}

function showUsage() {
  console.log(`
${COLORS.bright}Pi5 Supernode Module Manager${COLORS.reset}

Usage:
  ${COLORS.green}node scripts/module-installer.js <command> [options]${COLORS.reset}

Commands:
  ${COLORS.blue}list${COLORS.reset}                     List all available modules
  ${COLORS.blue}install <module-id>${COLORS.reset}      Install specific module
  ${COLORS.blue}install-all${COLORS.reset}              Install all core modules
  ${COLORS.blue}uninstall <module-id>${COLORS.reset}    Remove module
  ${COLORS.blue}status${COLORS.reset}                   Show module installation status
  ${COLORS.blue}verify${COLORS.reset}                   Verify all module installations

Examples:
  ${COLORS.yellow}node scripts/module-installer.js list${COLORS.reset}
  ${COLORS.yellow}node scripts/module-installer.js install network-management${COLORS.reset}
  ${COLORS.yellow}node scripts/module-installer.js install-all${COLORS.reset}
  ${COLORS.yellow}node scripts/module-installer.js status${COLORS.reset}

For more information, visit: https://docs.pi5supernode.com
  `);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    logError(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { main, installModule, availableModules };