import { InitialValuesType, RandomPortResult, PortRange } from './types';

// Standard port ranges according to IANA
export const PORT_RANGES: Record<string, PortRange> = {
  'well-known': {
    name: 'Well-Known Ports',
    min: 1,
    max: 1023,
    description:
      'System ports (1-1023) - Reserved for common services like HTTP, HTTPS, SSH, etc.'
  },
  registered: {
    name: 'Registered Ports',
    min: 1024,
    max: 49151,
    description:
      'User ports (1024-49151) - Available for applications and services'
  },
  dynamic: {
    name: 'Dynamic Ports',
    min: 49152,
    max: 65535,
    description:
      'Private ports (49152-65535) - Available for temporary or private use'
  },
  custom: {
    name: 'Custom Range',
    min: 1,
    max: 65535,
    description: 'Custom port range - Specify your own min and max values'
  }
};

/**
 * Generate random network ports within a specified range
 */
export function generateRandomPorts(
  options: InitialValuesType
): RandomPortResult {
  const { portRange, minPort, maxPort, count, allowDuplicates, sortResults } =
    options;

  // Get the appropriate port range
  const range = PORT_RANGES[portRange];
  const actualMin = portRange === 'custom' ? minPort : range.min;
  const actualMax = portRange === 'custom' ? maxPort : range.max;

  if (actualMin >= actualMax) {
    throw new Error('Minimum port must be less than maximum port');
  }

  if (count <= 0) {
    throw new Error('Count must be greater than 0');
  }

  if (actualMin < 1 || actualMax > 65535) {
    throw new Error('Ports must be between 1 and 65535');
  }

  if (!allowDuplicates && count > actualMax - actualMin + 1) {
    throw new Error(
      'Cannot generate unique ports: count exceeds available range'
    );
  }

  const ports: number[] = [];

  if (allowDuplicates) {
    // Generate random ports with possible duplicates
    for (let i = 0; i < count; i++) {
      const randomPort = generateRandomPort(actualMin, actualMax);
      ports.push(randomPort);
    }
  } else {
    // Generate unique random ports
    const availablePorts = new Set<number>();

    // Create a pool of available ports
    for (let i = actualMin; i <= actualMax; i++) {
      availablePorts.add(i);
    }

    const availableArray = Array.from(availablePorts);

    // Shuffle the available ports
    for (let i = availableArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableArray[i], availableArray[j]] = [
        availableArray[j],
        availableArray[i]
      ];
    }

    // Take the first 'count' ports
    for (let i = 0; i < Math.min(count, availableArray.length); i++) {
      ports.push(availableArray[i]);
    }
  }

  // Sort if requested
  if (sortResults) {
    ports.sort((a, b) => a - b);
  }

  return {
    ports,
    range: {
      ...range,
      min: actualMin,
      max: actualMax
    },
    count,
    hasDuplicates: !allowDuplicates && hasDuplicatesInArray(ports),
    isSorted: sortResults
  };
}

/**
 * Generate a single random port within the specified range
 */
function generateRandomPort(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Check if an array has duplicate values
 */
function hasDuplicatesInArray(arr: number[]): boolean {
  const seen = new Set<number>();
  for (const num of arr) {
    if (seen.has(num)) {
      return true;
    }
    seen.add(num);
  }
  return false;
}

/**
 * Format ports for display
 */
export function formatPorts(ports: number[], separator: string): string {
  return ports.map((port) => port.toString()).join(separator);
}

/**
 * Validate input parameters
 */
export function validateInput(options: InitialValuesType): string | null {
  const { portRange, minPort, maxPort, count } = options;

  if (count <= 0) {
    return 'Count must be greater than 0';
  }

  if (count > 1000) {
    return 'Count cannot exceed 1,000';
  }

  if (portRange === 'custom') {
    if (minPort >= maxPort) {
      return 'Minimum port must be less than maximum port';
    }

    if (minPort < 1 || maxPort > 65535) {
      return 'Ports must be between 1 and 65535';
    }
  }

  return null;
}

/**
 * Get port range information
 */
export function getPortRangeInfo(portRange: string): PortRange {
  return PORT_RANGES[portRange] || PORT_RANGES['custom'];
}

/**
 * Check if a port is commonly used
 */
export function isCommonPort(port: number): boolean {
  const commonPorts = [
    20, 21, 22, 23, 25, 53, 80, 110, 143, 443, 993, 995, 3306, 5432, 6379, 8080
  ];
  return commonPorts.includes(port);
}

/**
 * Get port service information
 */
export function getPortService(port: number): string {
  const portServices: Record<number, string> = {
    20: 'FTP Data',
    21: 'FTP Control',
    22: 'SSH',
    23: 'Telnet',
    25: 'SMTP',
    53: 'DNS',
    80: 'HTTP',
    110: 'POP3',
    143: 'IMAP',
    443: 'HTTPS',
    993: 'IMAPS',
    995: 'POP3S',
    3306: 'MySQL',
    5432: 'PostgreSQL',
    6379: 'Redis',
    8080: 'HTTP Alternative'
  };

  return portServices[port] || 'Unknown';
}
