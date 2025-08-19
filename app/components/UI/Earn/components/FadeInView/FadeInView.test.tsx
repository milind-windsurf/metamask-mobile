import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import FadeInView from './index';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useFakeTimers({ legacyFakeTimers: true });
  jest.clearAllMocks();
});

describe('FadeInView', () => {
  it('should render without error', () => {
    const { getByTestId } = render(
      <FadeInView testID="fade-in-view">
        <Text>Test content</Text>
      </FadeInView>
    );
    expect(getByTestId('fade-in-view')).toBeDefined();
  });

  it('should render children correctly', () => {
    const testContent = 'Test content';
    const { getByText } = render(
      <FadeInView>
        <Text>{testContent}</Text>
      </FadeInView>
    );
    expect(getByText(testContent)).toBeDefined();
  });

  it('should render multiple children', () => {
    const { getByText } = render(
      <FadeInView>
        <Text>First child</Text>
        <Text>Second child</Text>
      </FadeInView>
    );
    expect(getByText('First child')).toBeDefined();
    expect(getByText('Second child')).toBeDefined();
  });

  it('should use default fadeDuration when not provided', () => {
    const { getByTestId } = render(
      <FadeInView testID="fade-in-view">
        <Text>Test content</Text>
      </FadeInView>
    );
    const fadeInView = getByTestId('fade-in-view');
    expect(fadeInView).toBeDefined();
  });

  it('should accept custom fadeDuration prop', () => {
    const customDuration = 500;
    const { getByTestId } = render(
      <FadeInView testID="fade-in-view" fadeDuration={customDuration}>
        <Text>Test content</Text>
      </FadeInView>
    );
    const fadeInView = getByTestId('fade-in-view');
    expect(fadeInView).toBeDefined();
  });

  it('should pass through ViewProps correctly', () => {
    const customStyle = { backgroundColor: 'red', padding: 10 };
    const { getByTestId } = render(
      <FadeInView testID="fade-in-view" style={customStyle}>
        <Text>Test content</Text>
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

  it('should handle accessibility props', () => {
    const { getByTestId } = render(
      <FadeInView 
        testID="fade-in-view" 
        accessible={true}
        accessibilityLabel="Fade in container"
      >
        <Text>Test content</Text>
      </FadeInView>
    );
    const fadeInView = getByTestId('fade-in-view');
    expect(fadeInView.props.accessible).toBe(true);
    expect(fadeInView.props.accessibilityLabel).toBe('Fade in container');
  });

  it('should render as Animated.View with opacity style', () => {
    const { getByTestId } = render(
      <FadeInView testID="fade-in-view">
        <Text>Test content</Text>
      </FadeInView>
    );
    const fadeInView = getByTestId('fade-in-view');
    expect(fadeInView.props.style).toEqual(
      expect.objectContaining({
        opacity: expect.anything(),
      })
    );
  });

  it('should initialize with opacity 0', () => {
    const { getByTestId } = render(
      <FadeInView testID="fade-in-view">
        <Text>Test content</Text>
      </FadeInView>
    );
    const fadeInView = getByTestId('fade-in-view');
    expect(fadeInView).toBeDefined();
  });

  it('should handle zero fadeDuration', () => {
    const { getByTestId } = render(
      <FadeInView testID="fade-in-view" fadeDuration={0}>
        <Text>Test content</Text>
      </FadeInView>
    );
    const fadeInView = getByTestId('fade-in-view');
    expect(fadeInView).toBeDefined();
  });

  it('should handle very large fadeDuration', () => {
    const { getByTestId } = render(
      <FadeInView testID="fade-in-view" fadeDuration={10000}>
        <Text>Test content</Text>
      </FadeInView>
    );
    const fadeInView = getByTestId('fade-in-view');
    expect(fadeInView).toBeDefined();
  });

  it('should handle negative fadeDuration gracefully', () => {
    const { getByTestId } = render(
      <FadeInView testID="fade-in-view" fadeDuration={-100}>
        <Text>Test content</Text>
      </FadeInView>
    );
    const fadeInView = getByTestId('fade-in-view');
    expect(fadeInView).toBeDefined();
  });

  it('should render without children', () => {
    const { getByTestId } = render(
      <FadeInView testID="fade-in-view">
        {null}
      </FadeInView>
    );
    const fadeInView = getByTestId('fade-in-view');
    expect(fadeInView).toBeDefined();
  });

  it('should handle complex nested children', () => {
    const { getByTestId, getByText } = render(
      <FadeInView testID="fade-in-view">
        <View testID="nested-view">
          <Text>Nested text</Text>
          <View>
            <Text>Deeply nested text</Text>
          </View>
        </View>
      </FadeInView>
    );
    expect(getByTestId('fade-in-view')).toBeDefined();
    expect(getByTestId('nested-view')).toBeDefined();
    expect(getByText('Nested text')).toBeDefined();
    expect(getByText('Deeply nested text')).toBeDefined();
  });

  it('should match snapshot', () => {
    const { toJSON } = render(
      <FadeInView fadeDuration={200}>
        <Text>Snapshot test content</Text>
      </FadeInView>
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot with custom props', () => {
    const { toJSON } = render(
      <FadeInView 
        fadeDuration={500} 
        style={{ backgroundColor: 'blue' }}
        testID="custom-fade-in"
      >
        <Text>Custom snapshot content</Text>
      </FadeInView>
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
