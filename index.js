const nmap = require('node-nmap');  // Correct way to import node-nmap
const { exec } = require('child_process');  // To execute system commands like arp

// Function to scan a network and list devices using Nmap
async function scanNetwork() {
  const options = {
    target: '192.168.1.0/24',  // Update with your network's subnet (e.g., 192.168.1.0/24)
    arguments: '-sS -O -sV -F',          // Enhanced scan options:
    // -sS: TCP SYN scan
    // -O: OS detection
    // -sV: Service/version detection
    // -F: Fast mode (scan fewer ports)
  };

  // Nmap scan process
  const scanner = new nmap.NmapScan(options.target, options.arguments);

  scanner.on('complete', function(data) {
    console.log('\n=== Detailed Network Scan Results ===');
    data.forEach(device => {
      console.log('\n-----------------------------------');
      console.log(`IP Address: ${device.ip}`);
      
      // Display hostnames if available
      if (device.hostname) {
        console.log(`Hostname: ${device.hostname}`);
      }

      // Display vendor information
      if (device.vendor) {
        console.log(`Vendor: ${device.vendor}`);
      }

      // Display OS information
      if (device.osNmap) {
        console.log(`Operating System: ${device.osNmap}`);
      }

      // Display open ports and services
      if (device.openPorts && device.openPorts.length > 0) {
        console.log('\nOpen Ports and Services:');
        device.openPorts.forEach(port => {
          console.log(`  Port ${port.port}/${port.protocol}: ${port.service} ${port.version || ''}`);
        });
      }
    });
  });

  scanner.on('error', function(error) {
    console.error('Error during Nmap scan: ', error);
  });

  scanner.start();
}

// Function to get the ARP table
function getArpTable() {
  exec('arp -a', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error getting ARP table: ${error}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(stdout);
  });
}

// Function to continuously monitor the network for new devices
async function monitorNetwork() {
  console.log("Monitoring the network for devices...");
  
  setInterval(() => {
    console.log("\nGetting ARP Table:");
    getArpTable();  // Get ARP info
    scanNetwork();  // Run Nmap to scan the network
  }, 60000);  // Every 60 seconds
}

// Start monitoring
monitorNetwork();
