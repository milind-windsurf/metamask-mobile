import { jsonRpcRequest } from './jsonRpcRequest';

global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('jsonRpcRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('successful requests', () => {
    it('should make a successful RPC request', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({
          id: '123',
          jsonrpc: '2.0',
          result: 'success',
        }),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await jsonRpcRequest(
        'https://mainnet.infura.io',
        'eth_blockNumber',
        []
      );

      expect(result).toBe('success');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://mainnet.infura.io',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('"method":"eth_blockNumber"'),
          cache: 'default',
        })
      );
    });

    it('should handle RPC requests with parameters', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({
          id: '123',
          jsonrpc: '2.0',
          result: '0x1',
        }),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const params = ['0x123', 'latest'];
      const result = await jsonRpcRequest(
        'https://mainnet.infura.io',
        'eth_getBalance',
        params
      );

      expect(result).toBe('0x1');
      const requestBody = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      expect(requestBody.params).toEqual(params);
    });

    it('should handle requests without parameters', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({
          id: '123',
          jsonrpc: '2.0',
          result: '0x1234',
        }),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const result = await jsonRpcRequest(
        'https://mainnet.infura.io',
        'eth_blockNumber'
      );

      expect(result).toBe('0x1234');
      const requestBody = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      expect(requestBody.params).toEqual([]);
    });

    it('should use consistent request ID format', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({
          id: '123',
          jsonrpc: '2.0',
          result: 'success',
        }),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await jsonRpcRequest('https://mainnet.infura.io', 'eth_blockNumber');

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      expect(typeof requestBody.id).toBe('string');
      expect(requestBody.id).toBeTruthy();
    });

    it('should include correct JSON-RPC structure', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({
          id: '123',
          jsonrpc: '2.0',
          result: 'success',
        }),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await jsonRpcRequest('https://mainnet.infura.io', 'eth_blockNumber', ['param1']);

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      expect(requestBody).toMatchObject({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: ['param1'],
        id: expect.any(String),
      });
    });
  });

  describe('authentication handling', () => {
    it('should handle basic auth URLs', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({
          id: '123',
          jsonrpc: '2.0',
          result: 'success',
        }),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await jsonRpcRequest(
        'https://user:pass@mainnet.infura.io/path',
        'eth_blockNumber'
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://mainnet.infura.io/pathundefined',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Basic dXNlcjpwYXNz',
          }),
        })
      );
    });

    it('should handle URLs with username but no password', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({
          id: '123',
          jsonrpc: '2.0',
          result: 'success',
        }),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await jsonRpcRequest(
        'https://user@mainnet.infura.io/path',
        'eth_blockNumber'
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://user@mainnet.infura.io/path',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should handle URLs with query parameters and auth', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({
          id: '123',
          jsonrpc: '2.0',
          result: 'success',
        }),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await jsonRpcRequest(
        'https://user:pass@mainnet.infura.io/path?param=value',
        'eth_blockNumber'
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('mainnet.infura.io'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Basic dXNlcjpwYXNz',
          }),
        })
      );
    });

    it('should handle URLs without auth credentials', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({
          id: '123',
          jsonrpc: '2.0',
          result: 'success',
        }),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await jsonRpcRequest(
        'https://mainnet.infura.io/path',
        'eth_blockNumber'
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://mainnet.infura.io/path',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });
  });

  describe('error handling', () => {
    it('should throw error for RPC error responses', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({
          id: '123',
          jsonrpc: '2.0',
          error: {
            code: -32601,
            message: 'Method not found',
          },
        }),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await expect(
        jsonRpcRequest('https://mainnet.infura.io', 'invalid_method')
      ).rejects.toThrow('Method not found');
    });

    it('should throw error for RPC error without message', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({
          id: '123',
          jsonrpc: '2.0',
          error: {
            code: -32601,
          },
        }),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await expect(
        jsonRpcRequest('https://mainnet.infura.io', 'invalid_method')
      ).rejects.toThrow();
    });

    it('should throw error for non-object responses', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue('invalid response'),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await expect(
        jsonRpcRequest('https://mainnet.infura.io', 'eth_blockNumber')
      ).rejects.toThrow('returned non-object response');
    });

    it('should throw error for array responses', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue([]),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await expect(
        jsonRpcRequest('https://mainnet.infura.io', 'eth_blockNumber')
      ).rejects.toThrow('returned non-object response');
    });

    it('should throw error for null responses', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue(null),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await expect(
        jsonRpcRequest('https://mainnet.infura.io', 'eth_blockNumber')
      ).rejects.toThrow('returned non-object response');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(
        jsonRpcRequest('https://mainnet.infura.io', 'eth_blockNumber')
      ).rejects.toThrow('Network error');
    });

    it('should handle JSON parsing errors', async () => {
      const mockResponse = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await expect(
        jsonRpcRequest('https://mainnet.infura.io', 'eth_blockNumber')
      ).rejects.toThrow('Invalid JSON');
    });

    it('should handle fetch response errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({
          id: '123',
          jsonrpc: '2.0',
          error: { message: 'Internal server error' },
        }),
      } as any);

      await expect(
        jsonRpcRequest('https://mainnet.infura.io', 'eth_blockNumber')
      ).rejects.toThrow('Internal server error');
    });
  });

  describe('edge cases', () => {
    it('should handle empty string URL', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({
          id: '123',
          jsonrpc: '2.0',
          result: 'success',
        }),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await expect(
        jsonRpcRequest('', 'eth_blockNumber')
      ).resolves.toBe('success');
    });

    it('should handle complex parameter types', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({
          id: '123',
          jsonrpc: '2.0',
          result: 'success',
        }),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const complexParams = [
        { address: '0x123', topics: ['0xabc'] },
        'latest',
        true,
        null,
        123,
      ];

      await jsonRpcRequest('https://mainnet.infura.io', 'eth_getLogs', complexParams);

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      expect(requestBody.params).toEqual(complexParams);
    });

    it('should handle special characters in auth credentials', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({
          id: '123',
          jsonrpc: '2.0',
          result: 'success',
        }),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await jsonRpcRequest(
        'https://user%40domain:p%40ss@mainnet.infura.io',
        'eth_blockNumber'
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://mainnet.infura.io/undefined',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': expect.stringMatching(/^Basic /),
          }),
        })
      );
    });

    it('should handle very long method names', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({
          id: '123',
          jsonrpc: '2.0',
          result: 'success',
        }),
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      const longMethodName = 'a'.repeat(1000);
      await jsonRpcRequest('https://mainnet.infura.io', longMethodName);

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      expect(requestBody.method).toBe(longMethodName);
    });
  });
});
