/* eslint-disable no-restricted-syntax */
import { waitFor } from 'detox';
import Utilities, { BASE_DEFAULTS } from './Utilities';
import {
  LongPressOptions,
  TapOptions,
  SwipeOptions,
  ScrollOptions,
  GestureOptions,
  TypeTextOptions,
} from './types';
import { createLogger } from './logger';

const logger = createLogger({ name: 'Gestures' });

/**
 * Gestures class providing robust element interaction methods with stability checking and auto-retry mechanisms.
 * All gesture methods include automatic retry logic, element readiness verification, and enhanced error reporting.
 */
export default class Gestures {
  /**
   * Internal method to tap an element with comprehensive stability and readiness checks.
   * 
   * @param elem - The Detox or Web element to tap
   * @param options - Configuration options for the tap action
   * @param options.checkStability - Whether to verify element is not moving (default: false)
   * @param options.checkVisibility - Whether to verify element is visible (default: true)
   * @param options.checkEnabled - Whether to verify element is enabled (default: true)
   * @param options.elemDescription - Description for better error messages
   * @param options.delay - Delay before performing the tap action
   * @param point - Optional specific point coordinates to tap
   * @returns Promise that resolves when tap is completed
   * @throws Will throw an error if element is not ready or tap fails
   */
  private static tapWithChecks = async (
    elem: DetoxElement | WebElement,
    options: {
      checkStability?: boolean;
      checkVisibility?: boolean;
      checkEnabled?: boolean;
      elemDescription?: string;
      delay?: number;
    },
    point?: { x: number; y: number },
  ) => {
    const {
      checkStability = false,
      checkVisibility = true,
      checkEnabled = true,
      elemDescription,
    } = options;

    if (Utilities.isWebElement(await elem)) {
      // eslint-disable-next-line jest/valid-expect, @typescript-eslint/no-explicit-any
      await (expect(await elem) as any).toExist();
      await (await elem).tap();
      return;
    }

    const el = await Utilities.checkElementReadyState(elem, {
      checkStability,
      checkVisibility,
      checkEnabled,
    });

    if (options.delay) {
      await new Promise((resolve) => setTimeout(resolve, options.delay));
    } else {
      await new Promise((resolve) =>
        setTimeout(resolve, BASE_DEFAULTS.actionDelay),
      );
    }
    await el.tap(point);
    const successMessage = elemDescription
      ? `✅ Successfully tapped element: ${elemDescription}`
      : `✅ Successfully tapped element`;
    logger.debug(successMessage);
  };

  /**
   * Tap an element with comprehensive stability checking and automatic retry mechanism.
   * 
   * @param elem - The Detox or Web element to tap
   * @param options - Configuration options for the tap action
   * @param options.timeout - Maximum time to wait for successful tap (default: 15000ms)
   * @param options.checkStability - Whether to verify element is not moving (default: false)
   * @param options.checkVisibility - Whether to verify element is visible (default: true)
   * @param options.checkEnabled - Whether to verify element is enabled (default: true)
   * @param options.elemDescription - Description for better error messages
   * @returns Promise that resolves when the tap is successful
   * @throws Will retry the operation if it fails, with retry logic handled by executeWithRetry
   * 
   * @example
   * ```typescript
   * await Gestures.tap(submitButton, { 
   *   timeout: 10000, 
   *   checkStability: true,
   *   elemDescription: 'Submit button' 
   * });
   * ```
   */
  static async tap(
    elem: DetoxElement | WebElement,
    options: TapOptions = {},
  ): Promise<void> {
    const {
      timeout = BASE_DEFAULTS.timeout,
      checkStability = false,
      checkVisibility = true,
      checkEnabled = true,
      elemDescription,
    } = options;

    const fn = () =>
      this.tapWithChecks(elem, {
        checkStability,
        checkVisibility,
        checkEnabled,
        elemDescription,
      });
    return Utilities.executeWithRetry(fn, {
      timeout,
      description: 'tap()',
      elemDescription,
    });
  }

  /**
   * Wait for an element to be visible and then tap it with enhanced options and additional delay.
   * This method is identical to tap() but includes an additional delay before the tap action.
   * Useful for cases where the element might not be immediately ready for interaction.
   * 
   * @param elem - The Detox or Web element to tap
   * @param options - Configuration options for the tap action
   * @param options.timeout - Maximum time to wait for successful tap (default: 15000ms)
   * @param options.checkStability - Whether to verify element is not moving (default: false)
   * @param options.checkVisibility - Whether to verify element is visible (default: true)
   * @param options.checkEnabled - Whether to verify element is enabled (default: true)
   * @param options.elemDescription - Description for better error messages
   * @param options.delay - Delay before performing the tap action (default: 500ms)
   * @returns Promise that resolves when the tap is successful
   * @throws Will retry the operation if it fails, with retry logic handled by executeWithRetry
   * 
   * @example
   * ```typescript
   * await Gestures.waitAndTap(dynamicButton, { 
   *   delay: 1000, 
   *   elemDescription: 'Dynamic button that appears after animation' 
   * });
   * ```
   */
  static async waitAndTap(
    elem: DetoxElement | WebElement,
    options: TapOptions = {},
  ): Promise<void> {
    const {
      timeout = BASE_DEFAULTS.timeout,
      checkStability = false,
      checkVisibility = true,
      checkEnabled = true,
      elemDescription,
      delay = 500,
    } = options;

    const fn = async () =>
      await this.tapWithChecks(elem, {
        checkStability,
        checkVisibility,
        checkEnabled,
        elemDescription,
        delay,
      });

    return Utilities.executeWithRetry(fn, {
      timeout,
      description: 'waitAndTap()',
      elemDescription,
    });
  }

  /**
   * Tap an element at a specific index when multiple elements match the same selector.
   * 
   * @param elem - The Detox element selector that may match multiple elements
   * @param index - The zero-based index of the element to tap
   * @param timeout - Maximum time to wait for the element to be visible and tappable (default: 15000ms)
   * @returns Promise that resolves when the tap is successful
   * @throws Will retry the operation if it fails, with retry logic handled by executeWithRetry
   * 
   * @example
   * ```typescript
   * await Gestures.tapAtIndex(listItems, 2, 10000); // Tap the third item in a list
   * ```
   */
  static async tapAtIndex(
    elem: DetoxElement,
    index: number,
    timeout = 15000,
  ): Promise<void> {
    return Utilities.executeWithRetry(
      async () => {
        const el = (await elem) as Detox.IndexableNativeElement;
        const itemElementAtIndex = el.atIndex(index);
        await waitFor(itemElementAtIndex).toBeVisible().withTimeout(timeout);
        await itemElementAtIndex.tap();
      },
      {
        timeout,
        description: `tapAtIndex(${index})`,
      },
    );
  }

  /**
   * Tap an element at specific coordinates with comprehensive stability checking.
   * This method is specifically designed for Detox native elements and should not be used with web elements.
   * 
   * @param elem - The Detox element to tap
   * @param point - The specific coordinates to tap within the element
   * @param point.x - X coordinate relative to element
   * @param point.y - Y coordinate relative to element
   * @param options - Configuration options for the tap action
   * @param options.timeout - Maximum time to wait for successful tap (default: 15000ms)
   * @param options.checkStability - Whether to verify element is not moving (default: false)
   * @param options.checkVisibility - Whether to verify element is visible (default: true)
   * @param options.checkEnabled - Whether to verify element is enabled (default: true)
   * @param options.elemDescription - Description for better error messages
   * @returns Promise that resolves when the tap is successful
   * @throws Will retry the operation if it fails, with retry logic handled by executeWithRetry
   * 
   * @example
   * ```typescript
   * await Gestures.tapAtPoint(mapElement, { x: 100, y: 150 }, { 
   *   elemDescription: 'Map pin location' 
   * });
   * ```
   */
  static async tapAtPoint(
    elem: DetoxElement,
    point: { x: number; y: number },
    options: TapOptions = {},
  ): Promise<void> {
    const {
      timeout = BASE_DEFAULTS.timeout,
      checkStability = false,
      checkVisibility = true,
      checkEnabled = true,
      elemDescription,
    } = options;
    const fn = () =>
      this.tapWithChecks(
        elem,
        {
          checkStability,
          checkVisibility,
          checkEnabled,
          elemDescription,
        },
        point,
      );

    return Utilities.executeWithRetry(fn, {
      timeout,
      description: 'tapAtPoint()',
      elemDescription,
    });
  }

  /**
   * Perform a double tap gesture on a native mobile element with stability checking.
   * This method is specifically designed for mobile automation testing and should not be used with web elements.
   * 
   * @param elem - The Detox element to double tap
   * @param options - Configuration options for the double tap action
   * @param options.timeout - Maximum time to wait for successful double tap (default: 15000ms)
   * @param options.checkStability - Whether to verify element is not moving (default: false)
   * @param options.checkVisibility - Whether to verify element is visible (default: true)
   * @param options.checkEnabled - Whether to verify element is enabled (default: true)
   * @param options.elemDescription - Description for better error messages
   * @returns Promise that resolves when the double tap gesture is completed
   * @throws Will retry the operation if it fails, with retry logic handled by executeWithRetry
   * 
   * @example
   * ```typescript
   * await Gestures.dblTap(imageElement, { 
   *   elemDescription: 'Profile image for zoom' 
   * });
   * ```
   */
  static async dblTap(
    elem: DetoxElement,
    options: TapOptions = {},
  ): Promise<void> {
    const {
      timeout = BASE_DEFAULTS.timeout,
      checkStability = false,
      checkVisibility = true,
      checkEnabled = true,
      elemDescription,
    } = options;

    return Utilities.executeWithRetry(
      async () => {
        const el = (await Utilities.checkElementReadyState(elem, {
          timeout,
          checkStability,
          checkVisibility,
          checkEnabled,
        })) as Detox.IndexableNativeElement;

        await new Promise((resolve) =>
          setTimeout(resolve, BASE_DEFAULTS.actionDelay),
        );
        await el.multiTap(2);
      },
      {
        timeout,
        description: 'dblTap()',
        elemDescription,
      },
    );
  }

  /**
   * Perform a long press gesture on an element with comprehensive stability checking.
   * 
   * @param elem - The Detox element to long press
   * @param options - Configuration options for the long press action
   * @param options.timeout - Maximum time to wait for successful long press (default: 15000ms)
   * @param options.checkStability - Whether to verify element is not moving (default: false)
   * @param options.checkEnabled - Whether to verify element is enabled (default: true)
   * @param options.checkVisibility - Whether to verify element is visible (default: true)
   * @param options.duration - Duration of the long press in milliseconds (default: 2000ms)
   * @param options.elemDescription - Description for better error messages
   * @returns Promise that resolves when the long press is successful
   * @throws Will retry the operation if it fails, with retry logic handled by executeWithRetry
   * 
   * @example
   * ```typescript
   * await Gestures.longPress(contextMenuTrigger, { 
   *   duration: 1500, 
   *   elemDescription: 'Context menu trigger' 
   * });
   * ```
   */
  static async longPress(
    elem: DetoxElement,
    options: LongPressOptions = {},
  ): Promise<void> {
    const {
      timeout = BASE_DEFAULTS.timeout,
      checkStability = false,
      checkEnabled = true,
      checkVisibility = true,
      duration = 2000,
      elemDescription,
    } = options;

    return Utilities.executeWithRetry(
      async () => {
        const el = (await Utilities.checkElementReadyState(elem, {
          timeout,
          checkStability,
          checkEnabled,
          checkVisibility,
        })) as Detox.IndexableNativeElement;

        await new Promise((resolve) =>
          setTimeout(resolve, BASE_DEFAULTS.actionDelay),
        );
        await el.longPress(duration);
      },
      {
        timeout,
        description: `longPress() for ${duration}ms`,
        elemDescription,
      },
    );
  }

  /**
   * Type text into an input element with automatic field clearing and comprehensive retry logic.
   * 
   * @param elem - The Detox input element to type into
   * @param text - The text to type into the element
   * @param options - Configuration options for the text input action
   * @param options.timeout - Maximum time to wait for successful text input (default: 15000ms)
   * @param options.clearFirst - Whether to clear the field before typing (default: true)
   * @param options.hideKeyboard - Whether to hide keyboard after typing (default: false)
   * @param options.checkStability - Whether to verify element is not moving (default: false)
   * @param options.checkEnabled - Whether to verify element is enabled (default: true)
   * @param options.checkVisibility - Whether to verify element is visible (default: true)
   * @param options.sensitive - Whether to hide the text in logs for security (default: false)
   * @param options.elemDescription - Description for better error messages
   * @returns Promise that resolves when the text is successfully typed
   * @throws Will retry the operation if it fails, with retry logic handled by executeWithRetry
   * 
   * @example
   * ```typescript
   * await Gestures.typeText(passwordField, 'secretPassword', { 
   *   sensitive: true, 
   *   hideKeyboard: true,
   *   elemDescription: 'Password input field' 
   * });
   * ```
   */
  static async typeText(
    elem: DetoxElement,
    text: string,
    options: TypeTextOptions = {},
  ): Promise<void> {
    const {
      timeout = BASE_DEFAULTS.timeout,
      clearFirst = true,
      hideKeyboard = false,
      checkStability = false,
      checkEnabled = true,
      checkVisibility = true,
      sensitive = false,
      elemDescription,
    } = options;

    return Utilities.executeWithRetry(
      async () => {
        const el = (await Utilities.checkElementReadyState(elem, {
          timeout,
          checkStability,
          checkVisibility,
          checkEnabled,
        })) as Detox.IndexableNativeElement;

        await new Promise((resolve) =>
          setTimeout(resolve, BASE_DEFAULTS.actionDelay),
        );

        if (clearFirst) {
          await el.replaceText('');
        }

        const textToType = hideKeyboard ? text + '\n' : text;
        await el.typeText(textToType);

        logger.debug(
          `✅ Successfully typed: "${sensitive ? '***' : text}" into element: ${
            elemDescription || 'unknown'
          }`,
        );
      },
      {
        timeout,
        description: `typeText("${text}")`,
        elemDescription,
      },
    );
  }

  /**
   * Replace all text in an input field with new text using comprehensive retry logic.
   * 
   * @param elem - The Detox input element to replace text in
   * @param text - The new text to replace existing content with
   * @param options - Configuration options for the text replacement action
   * @param options.timeout - Maximum time to wait for successful text replacement (default: 15000ms)
   * @param options.checkStability - Whether to verify element is not moving (default: false)
   * @param options.checkEnabled - Whether to verify element is enabled (default: true)
   * @param options.checkVisibility - Whether to verify element is visible (default: true)
   * @param options.elemDescription - Description for better error messages
   * @returns Promise that resolves when the text is successfully replaced
   * @throws Will retry the operation if it fails, with retry logic handled by executeWithRetry
   * 
   * @example
   * ```typescript
   * await Gestures.replaceText(searchField, 'new search term', { 
   *   elemDescription: 'Search input field' 
   * });
   * ```
   */
  static async replaceText(
    elem: DetoxElement,
    text: string,
    options: GestureOptions = {},
  ): Promise<void> {
    const {
      timeout = BASE_DEFAULTS.timeout,
      checkStability = false,
      checkEnabled = true,
      checkVisibility = true,
      elemDescription,
    } = options;

    return Utilities.executeWithRetry(
      async () => {
        const el = (await Utilities.checkElementReadyState(elem, {
          timeout,
          checkStability,
          checkEnabled,
          checkVisibility,
        })) as Detox.IndexableNativeElement;

        await new Promise((resolve) =>
          setTimeout(resolve, BASE_DEFAULTS.actionDelay),
        );
        await el.replaceText(text);
      },
      {
        timeout,
        description: `replaceText("${text}")`,
        elemDescription,
      },
    );
  }

  /**
   * Perform a swipe gesture on an element with comprehensive readiness checking.
   * 
   * @param elem - The Detox element to swipe on
   * @param direction - The direction to swipe ('up', 'down', 'left', or 'right')
   * @param options - Configuration options for the swipe action
   * @param options.timeout - Maximum time to wait for successful swipe (default: 15000ms)
   * @param options.speed - Speed of the swipe gesture ('fast' or 'slow', default: 'fast')
   * @param options.percentage - Percentage of element to swipe across (default: 0.75)
   * @param options.checkStability - Whether to verify element is not moving (default: false)
   * @param options.checkEnabled - Whether to verify element is enabled (default: true)
   * @param options.checkVisibility - Whether to verify element is visible (default: true)
   * @param options.elemDescription - Description for better error messages
   * @returns Promise that resolves when the swipe is successful
   * @throws Will retry the operation if it fails, with retry logic handled by executeWithRetry
   * 
   * @example
   * ```typescript
   * await Gestures.swipe(carouselElement, 'left', { 
   *   speed: 'slow', 
   *   percentage: 0.8,
   *   elemDescription: 'Image carousel' 
   * });
   * ```
   */
  static async swipe(
    elem: DetoxElement,
    direction: 'up' | 'down' | 'left' | 'right',
    options: SwipeOptions = {},
  ): Promise<void> {
    const {
      timeout = BASE_DEFAULTS.timeout,
      speed = 'fast',
      percentage = 0.75,
      checkStability = false,
      checkEnabled = true,
      checkVisibility = true,
      elemDescription,
    } = options;

    return Utilities.executeWithRetry(
      async () => {
        const el = (await Utilities.checkElementReadyState(elem, {
          timeout,
          checkStability,
          checkEnabled,
          checkVisibility,
        })) as Detox.IndexableNativeElement;

        await new Promise((resolve) =>
          setTimeout(resolve, BASE_DEFAULTS.actionDelay),
        );
        await el.swipe(direction, speed, percentage);
      },
      {
        timeout,
        description: `swipe(${direction})`,
        elemDescription,
      },
    );
  }
  /**
   * Scroll within a container until a target element becomes visible with platform-specific optimizations.
   * 
   * @param targetElement - The Detox element to scroll to and make visible
   * @param scrollableContainer - The scrollable container element to perform scrolling within
   * @param options - Configuration options for the scroll action
   * @param options.timeout - Maximum time to wait for successful scroll (default: 15000ms)
   * @param options.direction - Direction to scroll ('up', 'down', 'left', or 'right', default: 'down')
   * @param options.scrollAmount - Amount to scroll in pixels (default: 350)
   * @param options.elemDescription - Description for better error messages
   * @returns Promise that resolves when the scroll is successful and target element is visible
   * @throws Will retry the operation if it fails, with retry logic handled by executeWithRetry
   * 
   * @example
   * ```typescript
   * await Gestures.scrollToElement(
   *   targetListItem, 
   *   scrollableList, 
   *   { 
   *     direction: 'down', 
   *     scrollAmount: 200,
   *     elemDescription: 'Target list item' 
   *   }
   * );
   * ```
   */
  static async scrollToElement(
    targetElement: DetoxElement,
    scrollableContainer: Promise<Detox.NativeMatcher>,
    options: ScrollOptions = {},
  ): Promise<void> {
    const {
      timeout = BASE_DEFAULTS.timeout,
      direction = 'down',
      scrollAmount = 350,
      elemDescription,
    } = options;

    return Utilities.executeWithRetry(
      async () => {
        const target = (await targetElement) as Detox.IndexableNativeElement;
        const scrollable = await scrollableContainer;

        if (device.getPlatform() === 'android') {
          const scrollableElement = element(scrollable);
          try {
            await waitFor(target).toBeVisible().withTimeout(100);
            return;
          } catch {
            await scrollableElement.scroll(scrollAmount / 2, direction); // Decrease scroll amount for Android to avoid overshooting
            await waitFor(target).toBeVisible().withTimeout(100);
          }
        } else {
          await waitFor(target)
            .toBeVisible()
            .whileElement(scrollable)
            .scroll(scrollAmount, direction);
        }
      },
      {
        timeout,
        description: `scrollToElement(${direction})`,
        elemDescription,
      },
    );
  }

  /**
   * Scroll a web element into the viewport with comprehensive retry logic.
   * This method is specifically designed for web elements within webviews.
   * 
   * @param elem - The web element to scroll into view
   * @returns Promise that resolves when the element has been successfully scrolled into view
   * @throws Will throw an error if the scroll operation fails after all retry attempts
   * 
   * @example
   * ```typescript
   * await Gestures.scrollToWebViewPort(webElement);
   * ```
   */
  static async scrollToWebViewPort(elem: WebElement): Promise<void> {
    await Utilities.executeWithRetry(
      async () => {
        await (await elem).scrollToView();
      },
      {
        timeout: BASE_DEFAULTS.timeout,
        description: 'scrollToWebViewPort()',
      },
    );
  }

  // Legacy methods for backwards compatibility

  /**
   * Legacy method: Tap and long press
   * @deprecated Use longPress() instead for better error handling and retry mechanisms
   */
  static async tapAndLongPress(
    elem: DetoxElement,
    timeout = 2000,
  ): Promise<void> {
    return this.longPress(elem, { duration: timeout });
  }

  /**
   * Legacy method: Tap web element
   * @deprecated Use tap() with web elements instead for better error handling and retry mechanisms
   */
  static async tapWebElement(
    elem: Promise<Detox.IndexableWebElement>,
    timeout = 15000,
  ): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, jest/valid-expect
        await (expect(await elem) as any).toExist();
        await (await elem).tap();
        return;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    throw new Error('Web element not found or not tappable');
  }

  /**
   * Legacy method: Double tap an element
   * @deprecated Use dblTap() instead for better error handling and retry mechanisms - we should replace the function name when we have migrated all usages
   */
  static async doubleTap(elem: DetoxElement): Promise<void> {
    return Utilities.executeWithRetry(
      async () => {
        const el = (await elem) as Detox.IndexableNativeElement;
        await el.multiTap(2);
      },
      {
        description: 'Double tapped element',
      },
    );
  }

  /**
   * Legacy method: Clear the text field
   * @deprecated Use typeText() with clearFirst option or the replaceText() from Gestures.ts instead for better error handling and retry mechanisms
   */
  static async clearField(
    elem: DetoxElement,
    options: GestureOptions = {},
  ): Promise<void> {
    const {
      timeout = BASE_DEFAULTS.timeout,
      checkStability = false,
      checkEnabled = true,
      checkVisibility = true,
      elemDescription,
    } = options;

    return Utilities.executeWithRetry(
      async () => {
        const el = (await Utilities.checkElementReadyState(elem, {
          timeout,
          checkStability,
          checkVisibility,
          checkEnabled,
        })) as Detox.IndexableNativeElement;

        await new Promise((resolve) =>
          setTimeout(resolve, BASE_DEFAULTS.actionDelay),
        );
        await el.replaceText('');
      },
      {
        timeout,
        description: 'clearField()',
        elemDescription,
      },
    );
  }

  /**
   * Legacy method: Type text and hide keyboard
   * @deprecated Use typeText() with hideKeyboard option instead for better error handling and retry mechanisms
   */
  static async typeTextAndHideKeyboard(
    elem: DetoxElement,
    text: string,
  ): Promise<void> {
    return this.typeText(elem, text, {
      clearFirst: true,
      hideKeyboard: true,
    });
  }

  /**
   * Legacy method: Type text without hiding keyboard
   * @deprecated Use typeText() with hideKeyboard: false option instead for better error handling and retry mechanisms
   */
  static async typeTextWithoutKeyboard(
    elem: DetoxElement,
    text: string,
  ): Promise<void> {
    return this.typeText(elem, text, {
      clearFirst: false,
      hideKeyboard: false,
    });
  }

  /**
   * Legacy method: Replace text in field
   * @deprecated Use replaceText() instead for better error handling and retry mechanisms
   */
  static async replaceTextInField(
    elem: DetoxElement,
    text: string,
    timeout = 10000,
  ): Promise<void> {
    return this.replaceText(elem, text, { timeout });
  }
}
