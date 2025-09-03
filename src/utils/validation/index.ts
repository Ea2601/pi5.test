export const validators = {
  macAddress: (mac: string): boolean => {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(mac);
  },
  
  ipAddress: (ip: string): boolean => {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    return ipRegex.test(ip) && ip.split('.').every(octet => 
      parseInt(octet) >= 0 && parseInt(octet) <= 255
    );
  },
  
  port: (port: number): boolean => {
    return port >= 1 && port <= 65535;
  }
};