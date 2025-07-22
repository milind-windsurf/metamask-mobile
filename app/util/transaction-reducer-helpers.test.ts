import BN from 'bnjs4';
import { getTxData, getTxMeta } from './transaction-reducer-helpers';

describe('transaction-reducer-helpers', () => {
  describe('getTxData', () => {
    it('should extract standard transaction properties', () => {
      const txMeta = {
        data: '0x123',
        from: '0xabc',
        gas: new BN('21000'),
        gasPrice: new BN('20000000000'),
        to: '0xdef',
        value: new BN('1000000000000000000'),
        customProperty: 'should not be included',
      };

      const result = getTxData(txMeta);

      expect(result).toEqual({
        data: '0x123',
        from: '0xabc',
        gas: new BN('21000'),
        gasPrice: new BN('20000000000'),
        to: '0xdef',
        value: new BN('1000000000000000000'),
      });
      expect(result).not.toHaveProperty('customProperty');
    });

    it('should handle EIP-1559 transaction properties', () => {
      const txMeta = {
        from: '0xabc',
        to: '0xdef',
        maxFeePerGas: new BN('30000000000'),
        maxPriorityFeePerGas: new BN('2000000000'),
      };

      const result = getTxData(txMeta);

      expect(result).toEqual({
        from: '0xabc',
        to: '0xdef',
        maxFeePerGas: new BN('30000000000'),
        maxPriorityFeePerGas: new BN('2000000000'),
      });
    });

    it('should handle security alert response', () => {
      const securityAlertResponse = {
        reason: 'test',
        features: [],
        result_type: 'Malicious',
      };
      const txMeta = {
        from: '0xabc',
        securityAlertResponse,
      };

      const result = getTxData(txMeta);

      expect(result).toEqual({
        from: '0xabc',
        securityAlertResponse,
      });
    });

    it('should filter out undefined properties', () => {
      const txMeta = {
        from: '0xabc',
        to: undefined,
        value: new BN('1000'),
        gas: undefined,
      };

      const result = getTxData(txMeta);

      expect(result).toEqual({
        from: '0xabc',
        value: new BN('1000'),
      });
      expect(result).not.toHaveProperty('to');
      expect(result).not.toHaveProperty('gas');
    });

    it('should handle empty input', () => {
      const result = getTxData();
      expect(result).toEqual({});
    });

    it('should handle empty object input', () => {
      const result = getTxData({});
      expect(result).toEqual({});
    });


    it('should handle all standard transaction fields', () => {
      const txMeta = {
        data: '0x123',
        from: '0xabc',
        gas: new BN('21000'),
        gasPrice: new BN('20000000000'),
        to: '0xdef',
        value: new BN('1000000000000000000'),
        maxFeePerGas: new BN('30000000000'),
        maxPriorityFeePerGas: new BN('2000000000'),
      };

      const result = getTxData(txMeta);

      expect(result).toEqual({
        data: '0x123',
        from: '0xabc',
        gas: new BN('21000'),
        gasPrice: new BN('20000000000'),
        to: '0xdef',
        value: new BN('1000000000000000000'),
        maxFeePerGas: new BN('30000000000'),
        maxPriorityFeePerGas: new BN('2000000000'),
      });
    });

    it('should handle BN objects correctly', () => {
      const txMeta = {
        gas: new BN('21000'),
        gasPrice: new BN('20000000000'),
        value: new BN('0'),
      };

      const result = getTxData(txMeta);

      expect(result.gas).toBeInstanceOf(BN);
      expect(result.gasPrice).toBeInstanceOf(BN);
      expect(result.value).toBeInstanceOf(BN);
      expect(result.gas?.toString()).toBe('21000');
      expect(result.gasPrice?.toString()).toBe('20000000000');
      expect(result.value?.toString()).toBe('0');
    });

    it('should handle string values for numeric fields', () => {
      const txMeta = {
        gas: '21000' as any,
        gasPrice: '20000000000' as any,
        value: '1000000000000000000' as any,
      };

      const result = getTxData(txMeta);

      expect(result).toEqual({
        gas: '21000',
        gasPrice: '20000000000',
        value: '1000000000000000000',
      });
    });
  });

  describe('getTxMeta', () => {
    it('should extract non-standard properties', () => {
      const txMeta = {
        data: '0x123',
        from: '0xabc',
        gas: new BN('21000'),
        customProperty: 'should be included',
        anotherCustom: 'also included',
        to: '0xdef',
      };

      const result = getTxMeta(txMeta);

      expect(result).toEqual({
        customProperty: 'should be included',
        anotherCustom: 'also included',
      });
      expect(result).not.toHaveProperty('data');
      expect(result).not.toHaveProperty('from');
      expect(result).not.toHaveProperty('gas');
      expect(result).not.toHaveProperty('to');
    });

    it('should handle empty input', () => {
      const result = getTxMeta();
      expect(result).toEqual({});
    });

    it('should handle empty object input', () => {
      const result = getTxMeta({});
      expect(result).toEqual({});
    });


    it('should exclude all standard transaction fields', () => {
      const txMeta = {
        data: '0x123',
        from: '0xabc',
        gas: new BN('21000'),
        gasPrice: new BN('20000000000'),
        to: '0xdef',
        value: new BN('1000000000000000000'),
        maxFeePerGas: new BN('30000000000'),
        maxPriorityFeePerGas: new BN('2000000000'),
        securityAlertResponse: { reason: 'test', features: [], result_type: 'Malicious' },
        customField1: 'custom1',
        customField2: 'custom2',
      } as any;

      const result = getTxMeta(txMeta);

      expect(result).toEqual({
        customField1: 'custom1',
        customField2: 'custom2',
        securityAlertResponse: { reason: 'test', features: [], result_type: 'Malicious' },
      });
      expect(Object.keys(result)).toHaveLength(3);
    });

    it('should handle objects with only standard fields', () => {
      const txMeta = {
        data: '0x123',
        from: '0xabc',
        gas: new BN('21000'),
        to: '0xdef',
      };

      const result = getTxMeta(txMeta);

      expect(result).toEqual({});
    });

    it('should handle objects with only custom fields', () => {
      const txMeta = {
        customField1: 'value1',
        customField2: 42,
        customField3: true,
        customField4: { nested: 'object' },
      } as any;

      const result = getTxMeta(txMeta);

      expect(result).toEqual({
        customField1: 'value1',
        customField2: 42,
        customField3: true,
        customField4: { nested: 'object' },
      });
    });

    it('should filter out undefined values in custom fields', () => {
      const txMeta = {
        customField: undefined,
        validCustomField: 'value',
        from: '0xabc',
      };

      const result = getTxMeta(txMeta);

      expect(result).toEqual({
        validCustomField: 'value',
      });
      expect(result).not.toHaveProperty('customField');
    });
  });

  describe('integration tests', () => {
    it('should work together to split transaction data and metadata', () => {
      const originalTxMeta = {
        data: '0x123',
        from: '0xabc',
        gas: new BN('21000'),
        to: '0xdef',
        value: new BN('1000'),
        customField1: 'metadata1',
        customField2: 'metadata2',
      };

      const txData = getTxData(originalTxMeta);
      const txMeta = getTxMeta(originalTxMeta);

      expect(txData).toEqual({
        data: '0x123',
        from: '0xabc',
        gas: new BN('21000'),
        to: '0xdef',
        value: new BN('1000'),
      });

      expect(txMeta).toEqual({
        customField1: 'metadata1',
        customField2: 'metadata2',
      });

      const combinedKeys = [...Object.keys(txData), ...Object.keys(txMeta)];
      const originalKeys = Object.keys(originalTxMeta);
      expect(combinedKeys.sort()).toEqual(originalKeys.sort());
    });
  });
});
