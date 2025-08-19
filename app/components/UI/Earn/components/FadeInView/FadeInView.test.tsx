import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { Text, Animated } from 'react-native';
import FadeInView from './index';

describe('FadeInView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Basic Rendering Tests', () => {
    it('renders correctly with children', () => {
      const { getByText } = render(
        <FadeInView>
          <Text>Test Content</Text>
        </FadeInView>
      );
      
      expect(getByText('Test Content')).toBeTruthy();
    });

    it('renders multiple children correctly', () => {
      const { getByText } = render(
        <FadeInView>
          <Text>First Child</Text>
          <Text>Second Child</Text>
        </FadeInView>
      );
      
      expect(getByText('First Child')).toBeTruthy();
      expect(getByText('Second Child')).toBeTruthy();
    });
  });

  describe('Animation Behavior Tests', () => {
    it('starts animation on mount with default duration', async () => {
      const animatedTimingSpy = jest.spyOn(Animated, 'timing');

      render(
        <FadeInView>
          <Text>Test Content</Text>
        </FadeInView>
      );

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      expect(animatedTimingSpy).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      );

      animatedTimingSpy.mockRestore();
    });

    it('starts animation on mount with custom duration', async () => {
      const animatedTimingSpy = jest.spyOn(Animated, 'timing');

      render(
        <FadeInView fadeDuration={500}>
          <Text>Test Content</Text>
        </FadeInView>
      );

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      expect(animatedTimingSpy).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      );

      animatedTimingSpy.mockRestore();
    });
  });

  describe('Props Testing', () => {
    it('uses default fadeDuration of 200ms when not provided', async () => {
      const animatedTimingSpy = jest.spyOn(Animated, 'timing');

      render(
        <FadeInView>
          <Text>Test Content</Text>
        </FadeInView>
      );

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      expect(animatedTimingSpy).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          duration: 200,
        })
      );

      animatedTimingSpy.mockRestore();
    });

    it('uses custom fadeDuration when provided', async () => {
      const animatedTimingSpy = jest.spyOn(Animated, 'timing');

      render(
        <FadeInView fadeDuration={1000}>
          <Text>Test Content</Text>
        </FadeInView>
      );

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      expect(animatedTimingSpy).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          duration: 1000,
        })
      );

      animatedTimingSpy.mockRestore();
    });

    it('handles fadeDuration of 0', async () => {
      const animatedTimingSpy = jest.spyOn(Animated, 'timing');

      render(
        <FadeInView fadeDuration={0}>
          <Text>Test Content</Text>
        </FadeInView>
      );

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      expect(animatedTimingSpy).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          duration: 0,
        })
      );

      animatedTimingSpy.mockRestore();
    });
  });

  describe('ViewProps Spread Testing', () => {
    it('passes through additional ViewProps correctly', () => {
      const { getByTestId } = render(
        <FadeInView testID="fade-in-view" accessibilityLabel="Fade in container">
          <Text>Test Content</Text>
        </FadeInView>
      );
      
      const fadeInView = getByTestId('fade-in-view');
      expect(fadeInView.props.accessibilityLabel).toBe('Fade in container');
    });

    it('passes through style props correctly', () => {
      const customStyle = { backgroundColor: 'red', padding: 10 };
      
      const { getByTestId } = render(
        <FadeInView testID="fade-in-view" style={customStyle}>
          <Text>Test Content</Text>
        </FadeInView>
      );

      const fadeInView = getByTestId('fade-in-view');
      expect(fadeInView.props.style).toEqual(
        expect.objectContaining({
          backgroundColor: 'red',
          padding: 10,
        })
      );
    });
  });

  describe('Animation Configuration Tests', () => {
    it('configures animation with correct parameters', async () => {
      const animatedTimingSpy = jest.spyOn(Animated, 'timing');

      render(
        <FadeInView fadeDuration={300}>
          <Text>Test Content</Text>
        </FadeInView>
      );

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      expect(animatedTimingSpy).toHaveBeenCalledWith(
        expect.any(Object),
        {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }
      );

      animatedTimingSpy.mockRestore();
    });

    it('always uses useNativeDriver: true', async () => {
      const animatedTimingSpy = jest.spyOn(Animated, 'timing');

      render(
        <FadeInView>
          <Text>Test Content</Text>
        </FadeInView>
      );

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      expect(animatedTimingSpy).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          useNativeDriver: true,
        })
      );

      animatedTimingSpy.mockRestore();
    });

    it('always animates to opacity value of 1', async () => {
      const animatedTimingSpy = jest.spyOn(Animated, 'timing');

      render(
        <FadeInView>
          <Text>Test Content</Text>
        </FadeInView>
      );

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      expect(animatedTimingSpy).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          toValue: 1,
        })
      );

      animatedTimingSpy.mockRestore();
    });
  });

  describe('Effect Dependencies', () => {
    it('re-runs animation when fadeDuration changes', async () => {
      const animatedTimingSpy = jest.spyOn(Animated, 'timing');

      const { rerender } = render(
        <FadeInView fadeDuration={200}>
          <Text>Test Content</Text>
        </FadeInView>
      );

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      expect(animatedTimingSpy).toHaveBeenCalledTimes(1);

      rerender(
        <FadeInView fadeDuration={400}>
          <Text>Test Content</Text>
        </FadeInView>
      );

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      expect(animatedTimingSpy).toHaveBeenCalledTimes(2);
      expect(animatedTimingSpy).toHaveBeenLastCalledWith(
        expect.any(Object),
        {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }
      );

      animatedTimingSpy.mockRestore();
    });
  });
});
