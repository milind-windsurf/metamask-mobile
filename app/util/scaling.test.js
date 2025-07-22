import scaling from './scaling';

const mockDimensions = {
  get: jest.fn(),
};

const mockPixelRatio = {
  roundToNearestPixel: jest.fn((value) => Math.round(value)),
};

jest.mock('react-native', () => ({
  Dimensions: mockDimensions,
  PixelRatio: mockPixelRatio,
}));

describe('scaling utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDimensions.get.mockReturnValue({
      width: 375,
      height: 667,
    });
  });

  describe('scale function', () => {
    it('should scale size correctly for default iPhone 6 base model', () => {
      const result = scaling.scale(20);
      expect(result).toBe(20);
    });

    it('should scale size with custom factor', () => {
      const result = scaling.scale(20, { factor: 0.5 });
      expect(typeof result).toBe('number');
    });

    it('should handle scaleVertical option', () => {
      const result = scaling.scale(20, { scaleVertical: true });
      expect(typeof result).toBe('number');
    });

    it('should handle different base models', () => {
      const result1 = scaling.scale(20, { baseModel: 1 });
      const result2 = scaling.scale(20, { baseModel: 2 });
      expect(typeof result1).toBe('number');
      expect(typeof result2).toBe('number');
    });

    it('should handle zero size input', () => {
      const result = scaling.scale(0);
      expect(result).toBe(0);
    });

    it('should handle negative size input', () => {
      const result = scaling.scale(-10);
      expect(typeof result).toBe('number');
    });

    it('should handle extreme screen dimensions', () => {
      mockDimensions.get.mockReturnValue({
        width: 1000,
        height: 2000,
      });
      const result = scaling.scale(20);
      expect(typeof result).toBe('number');
    });

    it('should handle small screen dimensions', () => {
      mockDimensions.get.mockReturnValue({
        width: 200,
        height: 300,
      });
      const result = scaling.scale(20);
      expect(typeof result).toBe('number');
    });

    it('should handle landscape orientation', () => {
      mockDimensions.get.mockReturnValue({
        width: 667,
        height: 375,
      });
      const result = scaling.scale(20, { scaleVertical: true });
      expect(typeof result).toBe('number');
    });
  });

  describe('scaleVertical function', () => {
    it('should return a scaled value for vertical scaling', () => {
      const result = scaling.scaleVertical(20, { factor: 0.8 });
      expect(typeof result).toBe('number');
    });

    it('should handle no options parameter', () => {
      const result = scaling.scaleVertical(20);
      expect(typeof result).toBe('number');
    });
  });


  describe('performance tests', () => {
    it('should handle multiple scaling operations efficiently', () => {
      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        scaling.scale(20);
      }
      const end = Date.now();
      expect(end - start).toBeLessThan(100);
    });
  });

  describe('edge cases', () => {
    it('should handle undefined options', () => {
      const result = scaling.scale(20, undefined);
      expect(typeof result).toBe('number');
    });

    it('should handle null options', () => {
      const result = scaling.scale(20, {});
      expect(typeof result).toBe('number');
    });

    it('should handle empty options object', () => {
      const result = scaling.scale(20, {});
      expect(typeof result).toBe('number');
    });

    it('should handle very large size values', () => {
      const result = scaling.scale(10000);
      expect(typeof result).toBe('number');
    });

    it('should handle decimal size values', () => {
      const result = scaling.scale(20.5);
      expect(typeof result).toBe('number');
    });
  });
});
