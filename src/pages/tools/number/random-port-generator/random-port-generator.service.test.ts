import { expect, describe, it } from 'vitest';
import {
  generateRandomPorts,
  validateInput,
  formatPorts,
  getPortRangeInfo,
  isCommonPort,
  getPortService,
  PORT_RANGES
} from './service';
import { InitialValuesType } from './types';

describe('Random Port Generator Service', () => {
  describe('generateRandomPorts', () => {
    it('should generate random ports within the well-known range', () => {
      const options: InitialValuesType = {
        portRange: 'well-known',
        minPort: 1,
        maxPort: 1023,
        count: 5,
        allowDuplicates: true,
        sortResults: false,
        separator: ', '
      };

      const result = generateRandomPorts(options);

      expect(result.ports).toHaveLength(5);
      expect(result.range.min).toBe(1);
      expect(result.range.max).toBe(1023);
      expect(result.count).toBe(5);

      // Check that all ports are within range
      result.ports.forEach((port) => {
        expect(port).toBeGreaterThanOrEqual(1);
        expect(port).toBeLessThanOrEqual(1023);
        expect(Number.isInteger(port)).toBe(true);
      });
    });

    it('should generate random ports within the registered range', () => {
      const options: InitialValuesType = {
        portRange: 'registered',
        minPort: 1024,
        maxPort: 49151,
        count: 3,
        allowDuplicates: false,
        sortResults: false,
        separator: ', '
      };

      const result = generateRandomPorts(options);

      expect(result.ports).toHaveLength(3);
      expect(result.range.min).toBe(1024);
      expect(result.range.max).toBe(49151);

      // Check for uniqueness
      const uniquePorts = new Set(result.ports);
      expect(uniquePorts.size).toBe(3);
    });

    it('should generate random ports within custom range', () => {
      const options: InitialValuesType = {
        portRange: 'custom',
        minPort: 8000,
        maxPort: 8100,
        count: 4,
        allowDuplicates: true,
        sortResults: true,
        separator: ', '
      };

      const result = generateRandomPorts(options);

      expect(result.ports).toHaveLength(4);
      expect(result.range.min).toBe(8000);
      expect(result.range.max).toBe(8100);
      expect(result.isSorted).toBe(true);

      // Check that numbers are sorted
      for (let i = 1; i < result.ports.length; i++) {
        expect(result.ports[i]).toBeGreaterThanOrEqual(result.ports[i - 1]);
      }
    });

    it('should throw error when minPort >= maxPort', () => {
      const options: InitialValuesType = {
        portRange: 'custom',
        minPort: 1000,
        maxPort: 500,
        count: 5,
        allowDuplicates: true,
        sortResults: false,
        separator: ', '
      };

      expect(() => generateRandomPorts(options)).toThrow(
        'Minimum port must be less than maximum port'
      );
    });

    it('should throw error when count <= 0', () => {
      const options: InitialValuesType = {
        portRange: 'registered',
        minPort: 1024,
        maxPort: 49151,
        count: 0,
        allowDuplicates: true,
        sortResults: false,
        separator: ', '
      };

      expect(() => generateRandomPorts(options)).toThrow(
        'Count must be greater than 0'
      );
    });

    it('should throw error when ports are outside valid range', () => {
      const options: InitialValuesType = {
        portRange: 'custom',
        minPort: 0,
        maxPort: 70000,
        count: 5,
        allowDuplicates: true,
        sortResults: false,
        separator: ', '
      };

      expect(() => generateRandomPorts(options)).toThrow(
        'Ports must be between 1 and 65535'
      );
    });

    it('should throw error when unique count exceeds available range', () => {
      const options: InitialValuesType = {
        portRange: 'custom',
        minPort: 1,
        maxPort: 5,
        count: 10,
        allowDuplicates: false,
        sortResults: false,
        separator: ', '
      };

      expect(() => generateRandomPorts(options)).toThrow(
        'Cannot generate unique ports: count exceeds available range'
      );
    });
  });

  describe('validateInput', () => {
    it('should return null for valid input', () => {
      const options: InitialValuesType = {
        portRange: 'registered',
        minPort: 1024,
        maxPort: 49151,
        count: 5,
        allowDuplicates: true,
        sortResults: false,
        separator: ', '
      };

      const result = validateInput(options);
      expect(result).toBeNull();
    });

    it('should return error when count <= 0', () => {
      const options: InitialValuesType = {
        portRange: 'registered',
        minPort: 1024,
        maxPort: 49151,
        count: 0,
        allowDuplicates: true,
        sortResults: false,
        separator: ', '
      };

      const result = validateInput(options);
      expect(result).toBe('Count must be greater than 0');
    });

    it('should return error when count > 1000', () => {
      const options: InitialValuesType = {
        portRange: 'registered',
        minPort: 1024,
        maxPort: 49151,
        count: 1001,
        allowDuplicates: true,
        sortResults: false,
        separator: ', '
      };

      const result = validateInput(options);
      expect(result).toBe('Count cannot exceed 1,000');
    });

    it('should return error when custom range has invalid ports', () => {
      const options: InitialValuesType = {
        portRange: 'custom',
        minPort: 0,
        maxPort: 70000,
        count: 5,
        allowDuplicates: true,
        sortResults: false,
        separator: ', '
      };

      const result = validateInput(options);
      expect(result).toBe('Ports must be between 1 and 65535');
    });

    it('should return error when custom range has minPort >= maxPort', () => {
      const options: InitialValuesType = {
        portRange: 'custom',
        minPort: 1000,
        maxPort: 500,
        count: 5,
        allowDuplicates: true,
        sortResults: false,
        separator: ', '
      };

      const result = validateInput(options);
      expect(result).toBe('Minimum port must be less than maximum port');
    });
  });

  describe('formatPorts', () => {
    it('should format ports correctly', () => {
      const ports = [80, 443, 8080, 3000];
      const result = formatPorts(ports, ', ');
      expect(result).toBe('80, 443, 8080, 3000');
    });

    it('should handle custom separators', () => {
      const ports = [80, 443, 8080];
      const result = formatPorts(ports, ' -> ');
      expect(result).toBe('80 -> 443 -> 8080');
    });

    it('should handle empty array', () => {
      const ports: number[] = [];
      const result = formatPorts(ports, ', ');
      expect(result).toBe('');
    });
  });

  describe('getPortRangeInfo', () => {
    it('should return correct port range info for well-known', () => {
      const result = getPortRangeInfo('well-known');
      expect(result.name).toBe('Well-Known Ports');
      expect(result.min).toBe(1);
      expect(result.max).toBe(1023);
    });

    it('should return correct port range info for registered', () => {
      const result = getPortRangeInfo('registered');
      expect(result.name).toBe('Registered Ports');
      expect(result.min).toBe(1024);
      expect(result.max).toBe(49151);
    });

    it('should return correct port range info for dynamic', () => {
      const result = getPortRangeInfo('dynamic');
      expect(result.name).toBe('Dynamic Ports');
      expect(result.min).toBe(49152);
      expect(result.max).toBe(65535);
    });

    it('should return custom range for unknown range', () => {
      const result = getPortRangeInfo('unknown');
      expect(result.name).toBe('Custom Range');
    });
  });

  describe('isCommonPort', () => {
    it('should identify common ports correctly', () => {
      expect(isCommonPort(80)).toBe(true);
      expect(isCommonPort(443)).toBe(true);
      expect(isCommonPort(22)).toBe(true);
      expect(isCommonPort(3306)).toBe(true);
    });

    it('should return false for uncommon ports', () => {
      expect(isCommonPort(12345)).toBe(false);
      expect(isCommonPort(54321)).toBe(false);
    });
  });

  describe('getPortService', () => {
    it('should return correct service names for common ports', () => {
      expect(getPortService(80)).toBe('HTTP');
      expect(getPortService(443)).toBe('HTTPS');
      expect(getPortService(22)).toBe('SSH');
      expect(getPortService(3306)).toBe('MySQL');
    });

    it('should return "Unknown" for uncommon ports', () => {
      expect(getPortService(12345)).toBe('Unknown');
      expect(getPortService(54321)).toBe('Unknown');
    });
  });

  describe('PORT_RANGES', () => {
    it('should have correct port range definitions', () => {
      expect(PORT_RANGES['well-known'].min).toBe(1);
      expect(PORT_RANGES['well-known'].max).toBe(1023);
      expect(PORT_RANGES['registered'].min).toBe(1024);
      expect(PORT_RANGES['registered'].max).toBe(49151);
      expect(PORT_RANGES['dynamic'].min).toBe(49152);
      expect(PORT_RANGES['dynamic'].max).toBe(65535);
    });
  });
});
