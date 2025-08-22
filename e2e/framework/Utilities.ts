import { blacklistURLs } from '../resources/blacklistURLs.json';
import { RetryOptions, StabilityOptions } from './types';
import { createLogger } from './logger';

const TEST_CONFIG_DEFAULTS = {
  timeout: 15000,
  retryInterval: 500,
  actionDelay: 100,
  stabilityCheckInterval: 200,
  stabilityCheckCount: 3,
};

const logger = createLogger({ name: 'Utilities' });

/**
 * Enhanced Utilities class with retry mechanisms and stability checking
 */
export default class Utilities {
  /**
   * Format an array of strings into a regex pattern string for exact matching.
   * 
   * @param regexstrings - Array of strings to format into regex pattern
   * @returns Formatted regex pattern string for exact matching
   * 
   * @example
   * ```typescript
   * const pattern = Utilities.formatForExactMatchGroup(['url1', 'url2']);
   * // Returns: \("url1","url2"\)
   * ```
   */
  static formatForExactMatchGroup(regexstrings: string[]): string {
    return `\\("${regexstrings.join('","')}"\\)`;
  }

  /**
   * Get a formatted string of blacklisted URLs for exact matching in regex patterns.
   * 
   * @returns Formatted regex pattern string containing all blacklisted URLs
   * 
   * @example
   * ```typescript
   * const blacklistPattern = Utilities.BlacklistURLs;
   * ```
   */
  static get BlacklistURLs(): string {
    return this.formatForExactMatchGroup(blacklistURLs);
  }

  /**
   * Check if an element is enabled without retry mechanism (single attempt).
   * 
   * @param detoxElement - The Detox element to check for enabled state
   * @returns Promise that resolves when element is enabled
   * @throws Will throw an error with helpful guidance if element is not enabled
   * 
   * @example
   * ```typescript
   * await Utilities.checkElementEnabled(submitButton);
   * ```
   */
  static async checkElementEnabled(detoxElement: DetoxElement): Promise<void> {
    const el = (await detoxElement) as Detox.IndexableNativeElement;
    const attributes = await el.getAttributes();
    if (!('enabled' in attributes) || !attributes.enabled) {
      throw new Error(
        [
          '🚫 Element is not enabled.',
          '',
          '💡 If this element might be disabled in some situations,',
          '   consider using the {checkEnabled: false} option.',
          '',
          '📝 Example:',
          '   await Gestures.waitAndTap(element, {checkEnabled: false})',
        ].join('\n'),
      );
    }
  }

  /**
   * Wait for an element to become enabled with automatic retry mechanism.
   * 
   * @param detoxElement - The Detox element to wait for
   * @param timeout - Maximum time to wait in milliseconds (default: 3500ms)
   * @param interval - Retry interval in milliseconds (default: 100ms)
   * @returns Promise that resolves when element becomes enabled
   * @throws Will throw an error if element doesn't become enabled within timeout
   * 
   * @example
   * ```typescript
   * await Utilities.waitForElementToBeEnabled(submitButton, 5000, 200);
   * ```
   */
  static async waitForElementToBeEnabled(
    detoxElement: DetoxElement,
    timeout = 3500,
    interval = 100,
  ): Promise<void> {
    return this.executeWithRetry(() => this.checkElementEnabled(detoxElement), {
      timeout,
      interval,
      description: 'Element to be enabled',
    });
  }

  /**
   * Check if an element is actually tappable and not obscured by other elements.
   * Includes Android-specific checks for element obscuration and accessibility.
   * 
   * @param detoxElement - The Detox element to check for obscuration
   * @returns Promise that resolves when element is not obscured
   * @throws Will throw an error if element is obscured or not tappable
   * 
   * @example
   * ```typescript
   * await Utilities.checkElementNotObscured(overlayButton);
   * ```
   */
  static async checkElementNotObscured(
    detoxElement: DetoxElement,
  ): Promise<void> {
    try {
      const el = (await detoxElement) as Detox.IndexableNativeElement;
      const attributes = await el.getAttributes();

      // Check if element has proper frame/bounds
      if (!('frame' in attributes) || !attributes.frame) {
        throw new Error(
          '🚫 Element does not have valid frame bounds - may be obscured',
        );
      }

      // Additional Android-specific checks could be added here
      // For now, we rely on the basic frame check and visibility
      try {
        // Try to get element center point to ensure it's accessible
        const centerX = attributes.frame.x + attributes.frame.width / 2;
        const centerY = attributes.frame.y + attributes.frame.height / 2;

        if (centerX <= 0 || centerY <= 0) {
          throw new Error(
            '🚫 Element center point is not accessible - may be obscured',
          );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new Error(
          `🚫 Element appears to be obscured or not tappable: ${errorMessage}`,
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes('window focus') ||
        errorMessage.includes('window-focus') ||
        errorMessage.includes('has-window-focus=false')
      ) {
        logger.warn(
          '⚠️ Skipping obscuration check - window has no focus (common in CI environments)',
        );
        return;
      }
      throw error;
    }
  }

  /**
   * Check if an element is stable (not moving) by monitoring its position over time.
   * Single attempt without retry mechanism.
   * 
   * @param detoxElement - The Detox element to check for stability
   * @param options - Configuration options for stability checking
   * @param options.timeout - Maximum time to wait for stability (default: 2000ms)
   * @param options.interval - Check interval in milliseconds (default: 200ms)
   * @param options.stableCount - Number of consecutive stable checks required (default: 3)
   * @returns Promise that resolves when element becomes stable
   * @throws Will throw an error if element doesn't stabilize within timeout
   * 
   * @example
   * ```typescript
   * await Utilities.checkElementStable(animatedElement, { timeout: 3000, stableCount: 5 });
   * ```
   */
  static async checkElementStable(
    detoxElement: DetoxElement,
    options: StabilityOptions = {},
  ): Promise<void> {
    const { timeout = 2000, interval = 200, stableCount = 3 } = options;
    let lastPosition: { x: number; y: number } | null = null;
    let stableChecks = 0;
    const fallBackTimeout = 2000;
    const start = Date.now();

    const getPosition = async (el: Detox.IndexableNativeElement) => {
      try {
        const attributes = await el.getAttributes();
        if (
          'frame' in attributes &&
          attributes.frame &&
          typeof attributes.frame.x === 'number' &&
          typeof attributes.frame.y === 'number'
        ) {
          return { x: attributes.frame.x, y: attributes.frame.y };
        }
        return null;
      } catch {
        return null;
      }
    };

    while (Date.now() - start < timeout) {
      const el = (await detoxElement) as Detox.IndexableNativeElement;
      const position = await getPosition(el);

      if (!position) {
        await new Promise((resolve) =>
          // eslint-disable-next-line no-restricted-syntax
          setTimeout(resolve, fallBackTimeout),
        );
        return; // Return early if position is not available
      }

      if (
        lastPosition &&
        position.x === lastPosition.x &&
        position.y === lastPosition.y
      ) {
        stableChecks += 1;
        if (stableChecks >= stableCount) return;
      } else {
        lastPosition = position;
        stableChecks = 1;
      }

      // eslint-disable-next-line no-restricted-syntax
      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    throw new Error('⏱️ Element did not become stable in time');
  }

  /**
   * Wait for an element to become stable (not moving) with automatic retry mechanism.
   * Monitors element position over time to ensure it has stopped moving.
   * 
   * @param detoxElement - The Detox element to wait for stability
   * @param options - Configuration options for stability checking
   * @param options.timeout - Maximum time to wait for stability (default: 5000ms)
   * @param options.interval - Check interval in milliseconds
   * @param options.stableCount - Number of consecutive stable checks required
   * @returns Promise that resolves when element becomes stable
   * @throws Will throw an error if element doesn't stabilize within timeout
   * 
   * @example
   * ```typescript
   * await Utilities.waitForElementToStopMoving(carouselItem, { timeout: 8000 });
   * ```
   */
  static async waitForElementToStopMoving(
    detoxElement: DetoxElement,
    options: StabilityOptions = {},
  ): Promise<void> {
    const { timeout = 5000 } = options;
    return this.executeWithRetry(
      () => this.checkElementStable(detoxElement, options),
      {
        timeout,
        description: 'Element stability',
      },
    );
  }

  /**
   * Check if an element is in a ready state for interaction (visible, enabled, stable).
   * Single attempt without retry mechanism.
   * 
   * @param detoxElement - The Detox element to check readiness
   * @param options - Configuration options for readiness checking
   * @param options.timeout - Maximum time for individual checks
   * @param options.checkStability - Whether to verify element is not moving (default: false)
   * @param options.checkVisibility - Whether to verify element is visible (default: true)
   * @param options.checkEnabled - Whether to verify element is enabled (default: true)
   * @returns Promise resolving to the ready element
   * @throws Will throw an error if element is not ready
   * 
   * @example
   * ```typescript
   * const readyElement = await Utilities.checkElementReadyState(button, {
   *   checkStability: true,
   *   timeout: 5000
   * });
   * ```
   */
  static async checkElementReadyState(
    detoxElement: DetoxElement,
    options: {
      timeout?: number;
      checkStability?: boolean;
      checkVisibility?: boolean;
      checkEnabled?: boolean;
    } = {},
  ): DetoxElement {
    const {
      timeout,
      checkStability = false,
      checkVisibility = true,
      checkEnabled = true,
    } = options;

    const el = (await detoxElement) as Detox.IndexableNativeElement;
    /**
     * IMPORTANT: Default timeout behavior
     *
     * When no timeout is provided, we use fallback defaults to ensure compatibility
     * with the retry mechanism in executeWithRetry(). This method can be used in two ways:
     *
     * 1. Direct usage: Always provide explicit timeout values for predictable behavior
     * 2. Via executeWithRetry(): Timeout defaults are handled automatically
     *
     * Default fallbacks:
     * - Visibility check: 100ms (minimal check)
     * - Enabled check: No timeout (immediate check)
     * - Stability check: 2000ms (allows time for UI to settle)
     */

    if (checkVisibility) {
      const visibilityTimeout = timeout || 100; // If no timeout is provided, default to 100ms
      if (device.getPlatform() === 'ios') {
        await waitFor(el).toExist().withTimeout(visibilityTimeout);
      } else {
        await waitFor(el).toBeVisible().withTimeout(visibilityTimeout);
        await this.checkElementNotObscured(Promise.resolve(el)); // Ensure element is not obscured
      }
    }

    if (checkEnabled && device.getPlatform() === 'android') {
      // checkEnabled is only relevant for Android
      // iOS elements often fail on enabled checks even when they are tappable
      await this.checkElementEnabled(Promise.resolve(el));
    }

    if (checkStability) {
      const stabilityTimeout = timeout || 2000; // If no timeout is provided, default to 2000ms
      const stabilityCheckInterval = timeout ? timeout / 10 : 200; // Default to 200ms if no timeout is provided
      await this.checkElementStable(Promise.resolve(el), {
        timeout: stabilityTimeout,
        interval: stabilityCheckInterval,
      });
    }

    return el;
  }

  /**
   * Wait for an element to be in a ready state for interaction with automatic retry mechanism.
   * Combines visibility, enabled state, and stability checks as needed.
   * 
   * @param detoxElement - The Detox element to wait for readiness
   * @param options - Configuration options for readiness checking
   * @param options.timeout - Maximum time to wait for readiness (default: 15000ms)
   * @param options.checkStability - Whether to verify element is not moving (default: false)
   * @param options.skipVisibilityCheck - Whether to skip visibility verification (default: false)
   * @param options.elemDescription - Description for better error messages
   * @returns Promise resolving to the ready element
   * @throws Will throw an error if element doesn't become ready within timeout
   * 
   * @example
   * ```typescript
   * const readyButton = await Utilities.waitForReadyState(submitButton, {
   *   checkStability: true,
   *   elemDescription: 'Submit form button'
   * });
   * ```
   */
  static async waitForReadyState(
    detoxElement: DetoxElement,
    options: {
      timeout?: number;
      checkStability?: boolean;
      skipVisibilityCheck?: boolean;
      elemDescription?: string;
    } = {},
  ): DetoxElement {
    const { timeout = TEST_CONFIG_DEFAULTS.timeout, elemDescription } = options;

    return this.executeWithRetry(
      () => this.checkElementReadyState(detoxElement, options),
      {
        timeout,
        description: 'Element ready state check',
        elemDescription,
      },
    );
  }

  /**
   * Check if an element is a WebElement by examining its properties and constructor.
   * Useful for determining the correct interaction methods to use.
   * 
   * @param el - The element to check (can be any type)
   * @returns True if the element is a WebElement, false otherwise
   * 
   * @example
   * ```typescript
   * const isWeb = Utilities.isWebElement(someElement);
   * if (isWeb) {
   *   // Use web-specific interaction methods
   * }
   * ```
   */
  static isWebElement(el: unknown): boolean {
    if (!el || typeof el !== 'object') {
      return false;
    }

    const webEl = el as Record<string, unknown>;
    return !!(
      webEl?.webViewElement ||
      typeof webEl?.runScript === 'function' ||
      (webEl?.constructor?.name &&
        (webEl.constructor.name.includes('IndexableWebElement') ||
          webEl.constructor.name.includes('SecuredWebElementFacade') ||
          webEl.constructor.name.includes('WebElement')))
    );
  }

  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions,
  ): Promise<T> {
    const {
      timeout = TEST_CONFIG_DEFAULTS.timeout,
      interval = TEST_CONFIG_DEFAULTS.retryInterval,
      maxRetries = Math.floor(timeout / interval),
      elemDescription = '',
      description,
    } = options;

    let lastError: Error | undefined;
    let attempt = 0;
    const startTime = Date.now();

    const action = description || operation.name;

    while (true) {
      try {
        const result = await operation();

        if (attempt > 0) {
          const successMessage = [
            `✅ ${action} succeeded after ${attempt}`,
            ` ${attempt === 1 ? 'retry' : 'retries'}`,
            elemDescription ? ` for ${elemDescription}` : '',
            '.',
          ].join('');

          logger.debug(successMessage);
        }

        return result;
      } catch (error) {
        lastError = error as Error;
        attempt++;

        const elapsedTime = Date.now() - startTime;
        const timeoutExceeded = elapsedTime >= timeout;
        const maxRetriesReached = attempt >= maxRetries;

        if (timeoutExceeded || maxRetriesReached) {
          break;
        }

        if (attempt === 1) {
          const retryMessage = [
            `⚠️  ${action} failed (attempt ${attempt})`,
            ` on element`,
            elemDescription ? `: ${elemDescription}` : '',
            `. Retrying... (timeout: ${timeout}ms)`,
          ].join('');

          logger.debug(retryMessage);
          logger.debug(`🔍 Error: ${lastError.message}`);
        }

        // eslint-disable-next-line no-restricted-syntax
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
    }

    const elapsedTime = Date.now() - startTime;

    const errorMessage = [
      `❌ ${action} failed after ${attempt} attempt(s) over ${elapsedTime}ms`,
      `📍 Element Description: ${
        elemDescription || 'Description not provided'
      }`,
      `🔍 Last error: ${lastError?.message || 'Unknown error'}`,
    ].join('\n');

    const enhancedError = new Error(errorMessage);
    if (lastError?.stack) {
      enhancedError.stack = `${errorMessage}\n\nOriginal error stack:\n${lastError.stack}`;
    }
    throw enhancedError;
  }
}

export { TEST_CONFIG_DEFAULTS as BASE_DEFAULTS };
