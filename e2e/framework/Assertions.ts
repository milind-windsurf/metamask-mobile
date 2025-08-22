import { waitFor } from 'detox';
import Utilities, { BASE_DEFAULTS } from './Utilities';
import { AssertionOptions } from './types';
import Matchers from './Matchers';

/**
 * Assertions class providing robust element verification with auto-retry mechanisms and enhanced error messages.
 * All assertion methods include automatic retry logic and detailed error reporting for better test reliability.
 */
export default class Assertions {
  /**
   * Assert that an element is visible with automatic retry mechanism.
   * 
   * @param detoxElement - The Detox element to check for visibility
   * @param options - Configuration options for the assertion
   * @param options.timeout - Maximum time to wait for the element (default: 15000ms)
   * @param options.description - Custom description for better error messages
   * @returns Promise that resolves when the element becomes visible
   * @throws Will throw an error if the element is not visible within the timeout period
   * 
   * @example
   * ```typescript
   * await Assertions.expectElementToBeVisible(loginButton, { 
   *   timeout: 10000, 
   *   description: 'Login button should be visible' 
   * });
   * ```
   */
  static async expectElementToBeVisible(
    detoxElement:
      | DetoxElement
      | WebElement
      | DetoxMatcher
      | IndexableNativeElement,
    options: AssertionOptions = {},
  ): Promise<void> {
    const {
      timeout = BASE_DEFAULTS.timeout,
      description = 'element should be visible',
    } = options;

    return Utilities.executeWithRetry(
      async () => {
        const el = await detoxElement;
        const isWebElement = Utilities.isWebElement(el);
        if (isWebElement) {
          // Web elements use Detox's expect with toExist method - unavoidable any due to Detox API limitations
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (expect(el) as any).toExist();
        } else if (device.getPlatform() === 'ios') {
          await waitFor(el).toExist().withTimeout(100);
        } else {
          await waitFor(el).toBeVisible().withTimeout(100);
        }
      },
      {
        timeout,
        description: `Assert ${description}`,
      },
    );
  }

  /**
   * Assert that an element is not visible with automatic retry mechanism.
   * 
   * @param detoxElement - The Detox element to check for invisibility
   * @param options - Configuration options for the assertion
   * @param options.timeout - Maximum time to wait for the element to disappear (default: 15000ms)
   * @param options.description - Custom description for better error messages
   * @returns Promise that resolves when the element becomes invisible
   * @throws Will throw an error if the element remains visible within the timeout period
   * 
   * @example
   * ```typescript
   * await Assertions.expectElementToNotBeVisible(loadingSpinner, { 
   *   timeout: 5000, 
   *   description: 'Loading spinner should disappear' 
   * });
   * ```
   */
  static async expectElementToNotBeVisible(
    detoxElement:
      | DetoxElement
      | WebElement
      | DetoxMatcher
      | IndexableNativeElement,
    options: AssertionOptions = {},
  ): Promise<void> {
    const {
      timeout = BASE_DEFAULTS.timeout,
      description = 'element should not visible',
    } = options;

    return Utilities.executeWithRetry(
      async () => {
        const el = await detoxElement;
        const isWebElement = Utilities.isWebElement(el);
        if (isWebElement) {
          // Web elements use Detox's expect with toExist method - unavoidable any due to Detox API limitations
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (expect(el) as any).not.toExist();
        } else {
          await waitFor(el).not.toBeVisible().withTimeout(100);
        }
      },
      {
        timeout,
        description: `Assert ${description}`,
      },
    );
  }

  /**
   * Assert that an element contains specific text with automatic retry mechanism.
   * 
   * @param detoxElement - The Detox element to check for text content
   * @param text - The exact text that should be present in the element
   * @param options - Configuration options for the assertion
   * @param options.timeout - Maximum time to wait for the text to appear (default: 15000ms)
   * @param options.description - Custom description for better error messages
   * @returns Promise that resolves when the element contains the specified text
   * @throws Will throw an error if the element doesn't contain the text within the timeout period
   * 
   * @example
   * ```typescript
   * await Assertions.expectElementToHaveText(statusLabel, 'Connected', { 
   *   timeout: 8000, 
   *   description: 'Status should show Connected' 
   * });
   * ```
   */
  static async expectElementToHaveText(
    detoxElement: DetoxElement,
    text: string,
    options: AssertionOptions = {},
  ): Promise<void> {
    const {
      timeout = BASE_DEFAULTS.timeout,
      description = `element has text "${text}"`,
    } = options;

    return Utilities.executeWithRetry(
      async () => {
        const el = (await detoxElement) as Detox.IndexableNativeElement;
        await waitFor(el).toHaveText(text).withTimeout(100);
      },
      {
        timeout,
        description: `Assert ${description}`,
      },
    );
  }

  /**
   * Assert that an element does not contain specific text with automatic retry mechanism.
   * 
   * @param detoxElement - The Detox element to check for absence of text content
   * @param text - The text that should not be present in the element
   * @param options - Configuration options for the assertion
   * @param options.timeout - Maximum time to wait for the text to disappear (default: 15000ms)
   * @param options.description - Custom description for better error messages
   * @returns Promise that resolves when the element no longer contains the specified text
   * @throws Will throw an error if the element still contains the text within the timeout period
   * 
   * @example
   * ```typescript
   * await Assertions.expectElementToNotHaveText(errorMessage, 'Loading...', { 
   *   timeout: 5000, 
   *   description: 'Error message should not show loading text' 
   * });
   * ```
   */
  static async expectElementToNotHaveText(
    detoxElement: DetoxElement,
    text: string,
    options: AssertionOptions = {},
  ): Promise<void> {
    const {
      timeout = BASE_DEFAULTS.timeout,
      description = `element does not have text "${text}"`,
    } = options;

    return Utilities.executeWithRetry(
      async () => {
        const el = (await detoxElement) as Detox.IndexableNativeElement;
        await waitFor(el).not.toHaveText(text).withTimeout(100);
      },
      {
        timeout,
        description: `Assert ${description}`,
      },
    );
  }

  /**
   * Assert that an element has a specific accessibility label with automatic retry mechanism.
   * 
   * @param detoxElement - The Detox element to check for accessibility label
   * @param label - The accessibility label that should be present on the element
   * @param options - Configuration options for the assertion
   * @param options.timeout - Maximum time to wait for the label to appear (default: 15000ms)
   * @param options.description - Custom description for better error messages
   * @returns Promise that resolves when the element has the specified label
   * @throws Will throw an error if the element doesn't have the label within the timeout period
   * 
   * @example
   * ```typescript
   * await Assertions.expectElementToHaveLabel(submitButton, 'Submit Form', { 
   *   timeout: 3000, 
   *   description: 'Submit button should have proper accessibility label' 
   * });
   * ```
   */
  static async expectElementToHaveLabel(
    detoxElement: DetoxElement,
    label: string,
    options: AssertionOptions = {},
  ): Promise<void> {
    const {
      timeout = BASE_DEFAULTS.timeout,
      description = `element has label "${label}"`,
    } = options;

    return Utilities.executeWithRetry(
      async () => {
        const el = (await detoxElement) as Detox.IndexableNativeElement;
        await waitFor(el).toHaveLabel(label).withTimeout(100);
      },
      {
        timeout,
        description: `Assert ${description}`,
      },
    );
  }

  /**
   * Assert that specific text is displayed anywhere on the screen with automatic retry mechanism.
   * 
   * @param text - The text to search for on the screen
   * @param options - Configuration options for the assertion
   * @param options.timeout - Maximum time to wait for the text to appear (default: 15000ms)
   * @param options.allowDuplicates - Whether to allow multiple instances of the text (default: false)
   * @param options.description - Custom description for better error messages
   * @returns Promise that resolves when the text is found on screen
   * @throws Will throw an error if the text is not found within the timeout period
   * 
   * @example
   * ```typescript
   * await Assertions.expectTextDisplayed('Welcome to MetaMask', { 
   *   timeout: 10000, 
   *   allowDuplicates: true,
   *   description: 'Welcome message should be visible' 
   * });
   * ```
   */
  static async expectTextDisplayed(
    text: string,
    options: AssertionOptions & { allowDuplicates?: boolean } = {},
  ): Promise<void> {
    const { timeout = BASE_DEFAULTS.timeout, allowDuplicates = false } =
      options;

    return Utilities.executeWithRetry(
      async () => {
        const textElement = allowDuplicates
          ? (await Matchers.getElementByText(text)).atIndex(0)
          : await Matchers.getElementByText(text);
        if (device.getPlatform() === 'ios') {
          await waitFor(textElement).toExist().withTimeout(100);
        } else {
          await waitFor(textElement).toBeVisible().withTimeout(100);
        }
      },
      {
        timeout,
        description: `Assert text "${text}" is displayed${
          allowDuplicates ? ' (allowing duplicates)' : ''
        }`,
      },
    );
  }

  /**
   * Assert that specific text is not displayed anywhere on the screen with automatic retry mechanism.
   * 
   * @param text - The text that should not be present on the screen
   * @param options - Configuration options for the assertion
   * @param options.timeout - Maximum time to wait for the text to disappear (default: 15000ms)
   * @param options.description - Custom description for better error messages
   * @returns Promise that resolves when the text is no longer found on screen
   * @throws Will throw an error if the text is still present within the timeout period
   * 
   * @example
   * ```typescript
   * await Assertions.expectTextNotDisplayed('Error occurred', { 
   *   timeout: 5000, 
   *   description: 'Error message should not be visible' 
   * });
   * ```
   */
  static async expectTextNotDisplayed(
    text: string,
    options: AssertionOptions = {},
  ): Promise<void> {
    const { timeout = BASE_DEFAULTS.timeout } = options;
    return Utilities.executeWithRetry(
      async () => {
        const textElement = await Matchers.getElementByText(text);
        if (device.getPlatform() === 'ios') {
          await waitFor(textElement).not.toExist().withTimeout(100);
        } else {
          await waitFor(textElement).not.toBeVisible().withTimeout(100);
        }
      },
      {
        timeout,
        description: `expectTextNotDisplayed("${text}")`,
      },
    );
  }

  /**
   * Assert that a toggle element is in the "on" state with automatic retry mechanism.
   * 
   * @param detoxElement - The Detox toggle element to check
   * @param options - Configuration options for the assertion
   * @param options.timeout - Maximum time to wait for the toggle state (default: 15000ms)
   * @param options.description - Custom description for better error messages
   * @returns Promise that resolves when the toggle is in the "on" state
   * @throws Will throw an error if the toggle is not "on" within the timeout period
   * 
   * @example
   * ```typescript
   * await Assertions.expectToggleToBeOn(notificationsToggle, { 
   *   timeout: 3000, 
   *   description: 'Notifications toggle should be enabled' 
   * });
   * ```
   */
  static async expectToggleToBeOn(
    detoxElement: DetoxElement,
    options: AssertionOptions = {},
  ): Promise<void> {
    const {
      timeout = BASE_DEFAULTS.timeout,
      description = 'element should be enabled',
    } = options;

    return Utilities.executeWithRetry(
      async () => {
        try {
          const el = (await Utilities.waitForReadyState(
            detoxElement,
          )) as Detox.IndexableNativeElement;
          // Use Detox expect interface for toggle values - unavoidable any due to Detox API limitations
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (expect(el) as any).toHaveToggleValue(true);
        } catch (error) {
          // Log attributes for debugging
          throw new Error(
            [
              '🔄 Toggle state mismatch detected',
              `   Expected: on`,
              `   Actual:   off`,
            ].join('\n'),
          );
        }
      },
      {
        timeout,
        description: `Assert ${description}`,
      },
    );
  }

  /**
   * Assert that a toggle element is in the "off" state with automatic retry mechanism.
   * 
   * @param detoxElement - The Detox toggle element to check
   * @param options - Configuration options for the assertion
   * @param options.timeout - Maximum time to wait for the toggle state (default: 15000ms)
   * @param options.description - Custom description for better error messages
   * @returns Promise that resolves when the toggle is in the "off" state
   * @throws Will throw an error if the toggle is not "off" within the timeout period
   * 
   * @example
   * ```typescript
   * await Assertions.expectToggleToBeOff(biometricsToggle, { 
   *   timeout: 3000, 
   *   description: 'Biometrics toggle should be disabled' 
   * });
   * ```
   */
  static async expectToggleToBeOff(
    detoxElement: DetoxElement,
    options: AssertionOptions = {},
  ): Promise<void> {
    const {
      timeout = BASE_DEFAULTS.timeout,
      description = 'element should be disabled',
    } = options;

    return Utilities.executeWithRetry(
      async () => {
        try {
          const el = (await Utilities.waitForReadyState(
            detoxElement,
          )) as Detox.IndexableNativeElement;
          // Use Detox expect interface for toggle values - unavoidable any due to Detox API limitations
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (expect(el) as any).toHaveToggleValue(false);
        } catch (error) {
          throw new Error(
            [
              '🔄 Toggle state mismatch detected',
              `   Expected: off`,
              `   Actual:   on`,
            ].join('\n'),
          );
        }
      },
      {
        timeout,
        description: `Assert ${description}`,
      },
    );
  }

  /**
   * Verify that actual text matches expected text exactly.
   * 
   * @param actualText - The actual text to compare
   * @param expectedText - The expected text to match against
   * @returns Promise that resolves when texts match
   * @throws Will throw an error if texts don't match with detailed comparison
   * 
   * @example
   * ```typescript
   * await Assertions.checkIfTextMatches(element.getText(), 'Expected Value');
   * ```
   */
  static async checkIfTextMatches(
    actualText: string,
    expectedText: string,
  ): Promise<void> {
    try {
      if (!actualText || !expectedText) {
        throw new Error('Both actual and expected text must be provided');
      }

      return expect(actualText).toBe(expectedText);
    } catch (error) {
      if (actualText !== expectedText) {
        throw new Error(
          `Text matching failed.\nExpected: "${expectedText}"\nActual: "${actualText}"`,
        );
      }
    }
  }

  /**
   * Verify that two objects are deeply equal.
   * 
   * @param actualObject - The actual object to compare
   * @param expectedObject - The expected object to match against
   * @returns Promise that resolves when objects match
   * @throws Will throw an error if objects don't match with detailed comparison
   * 
   * @example
   * ```typescript
   * await Assertions.checkIfObjectsMatch(responseData, expectedResponse);
   * ```
   */
  static async checkIfObjectsMatch(
    actualObject: object,
    expectedObject: object,
  ): Promise<void> {
    try {
      if (!actualObject || !expectedObject) {
        throw new Error('Both actual and expected objects must be provided');
      }

      return expect(actualObject).toEqual(expectedObject);
    } catch (error) {
      if (JSON.stringify(actualObject) !== JSON.stringify(expectedObject)) {
        throw new Error(
          `Object matching failed.\nExpected: ${JSON.stringify(
            expectedObject,
            null,
            2,
          )}\nActual: ${JSON.stringify(actualObject, null, 2)}`,
        );
      }
    }
  }

  /**
   * Verify that an array has the expected length.
   * 
   * @param array - The array to check
   * @param expectedLength - The expected length of the array
   * @returns Promise that resolves when array has correct length
   * @throws Will throw an error if array length doesn't match expected value
   * 
   * @example
   * ```typescript
   * await Assertions.checkIfArrayHasLength(searchResults, 5);
   * ```
   */
  static async checkIfArrayHasLength(
    array: unknown[],
    expectedLength: number,
  ): Promise<void> {
    try {
      if (!Array.isArray(array)) {
        throw new Error('The provided value is not an array');
      }

      if (typeof expectedLength !== 'number') {
        throw new Error('Expected length must be a number');
      }

      return expect(array.length).toBe(expectedLength);
    } catch (error) {
      if (array.length !== expectedLength) {
        throw new Error(
          `Array length assertion failed.\nExpected length: ${expectedLength}\nActual length: ${array.length}`,
        );
      }
    }
  }

  /**
   * Verify that a value is defined (not null, undefined, or falsy, except for 0).
   * 
   * @param value - The value to check for definition
   * @returns Promise that resolves when value is defined
   * @throws Will throw an error if value is undefined, null, or falsy (except 0)
   * 
   * @example
   * ```typescript
   * await Assertions.checkIfValueIsDefined(apiResponse.data);
   * ```
   */
  static async checkIfValueIsDefined(value: unknown): Promise<void> {
    // 0 evaluates to false, so we need to handle it separately
    if (typeof value === 'number') {
      return;
    }

    if (!value) {
      throw new Error('Value is not present (falsy value)');
    }
  }

  static async checkIfObjectContains(
    actual: Record<string, unknown>,
    partial: Record<string, unknown>,
    deep = true,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const errors: string[] = [];

      function check(
        actualObj: Record<string, unknown>,
        partialObj: Record<string, unknown>,
        path = '',
      ) {
        if (
          typeof actualObj !== 'object' ||
          typeof partialObj !== 'object' ||
          actualObj === null ||
          partialObj === null
        ) {
          if (actualObj !== partialObj) {
            errors.push(
              `Value mismatch at "${path || 'root'}": expected ${JSON.stringify(
                partialObj,
              )}, got ${JSON.stringify(actualObj)}`,
            );
          }
          return;
        }

        for (const key in partialObj) {
          const currentPath = path ? `${path}.${key}` : key;
          if (!Object.prototype.hasOwnProperty.call(actualObj, key)) {
            errors.push(`Missing key at "${currentPath}" in actual object`);
            continue;
          }

          if (
            deep &&
            typeof partialObj[key] === 'object' &&
            partialObj[key] !== null
          ) {
            check(
              actualObj[key] as Record<string, unknown>,
              partialObj[key] as Record<string, unknown>,
              currentPath,
            );
          } else if (actualObj[key] !== partialObj[key]) {
            errors.push(
              `Value mismatch at "${currentPath}": expected ${JSON.stringify(
                partialObj[key],
              )}, got ${JSON.stringify(actualObj[key])}`,
            );
          }
        }
      }

      check(actual, partial);

      if (errors.length > 0) {
        reject(
          new Error('Object contains assertion failed:\n' + errors.join('\n')),
        );
      } else {
        resolve();
      }
    });
  }

  /**
   * Checks if the actual object contains all keys from the expected array
   * @param actual - The object to check against
   * @param validations - Object with keys and their expected values
   */
  static async checkIfObjectHasKeysAndValidValues(
    actual: Record<string, unknown>,
    validations: Record<string, string | ((value: unknown) => boolean)>,
  ): Promise<void> {
    const errors: string[] = [];

    for (const [key, validation] of Object.entries(validations)) {
      if (!Object.prototype.hasOwnProperty.call(actual, key)) {
        errors.push(`Missing key: ${key}`);
        continue;
      }

      const value = actual[key];

      if (typeof validation === 'string') {
        const actualType = typeof value;

        if (Array.isArray(value) && validation === 'array') continue;
        if (value === null && validation === 'null') continue;

        // Check type
        if (
          actualType !== validation &&
          !(Array.isArray(value) && validation === 'array')
        ) {
          errors.push(
            `Type mismatch for key "${key}": expected "${validation}", got "${actualType}"`,
          );
        }
      } else if (typeof validation === 'function') {
        try {
          const valid = validation(value);
          if (!valid) {
            errors.push(
              `Validation failed for key "${key}": custom validator returned false`,
            );
          }
        } catch (err) {
          errors.push(
            `Validation error for key "${key}": ${(err as Error).message}`,
          );
        }
      }
    }

    if (errors.length > 0) {
      throw new Error('Object validation failed:\n' + errors.join('\n'));
    }
  }

  /**
   * Legacy method: Check if an element is visible (backwards compatibility)
   * @deprecated Use expectElementToBeVisible() instead for better error handling and retry mechanisms
   */
  static async checkIfVisible(
    detoxElement: DetoxElement,
    timeout = 15000,
  ): Promise<void> {
    return this.expectElementToBeVisible(detoxElement, { timeout });
  }

  /**
   * Legacy method: Check if a web element exists
   * @deprecated Use expectElementToBeVisible() instead for better error handling and retry mechanisms
   */
  static async webViewElementExists(detoxElement: DetoxElement): Promise<void> {
    // For web elements, just use the basic expect assertion
    const el = (await detoxElement) as Detox.IndexableNativeElement;
    // Use Detox's expect which has toExist method
    // Use Detox's expect syntax for element existence
    // Use Detox expect interface for element existence - unavoidable any due to Detox API limitations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (expect(el) as any).toExist();
  }

  /**
   * Legacy method: Check if an element is not visible
   * @deprecated Use expectElementToNotBeVisible() instead for better error handling and retry mechanisms
   */
  static async checkIfNotVisible(
    detoxElement: DetoxElement,
    timeout = 15000,
  ): Promise<void> {
    return this.expectElementToNotBeVisible(detoxElement as DetoxElement, {
      timeout,
    });
  }

  /**
   * Legacy method: Check if an element has specific text
   * @deprecated Use expectElementToHaveText() instead for better error handling and retry mechanisms
   */
  static async checkIfElementToHaveText(
    detoxElement: DetoxElement,
    text: string,
    timeout = 15000,
  ): Promise<void> {
    return this.expectElementToHaveText(detoxElement as DetoxElement, text, {
      timeout,
    });
  }

  /**
   * Legacy method: Check if an element has specific label
   * @deprecated Use expectElementToHaveLabel() instead for better error handling and retry mechanisms
   */
  static async checkIfElementHasLabel(
    detoxElement: DetoxElement,
    label: string,
    timeout = 15000,
  ): Promise<void> {
    return this.expectElementToHaveLabel(detoxElement, label, { timeout });
  }

  /**
   * Legacy method: Check if text is displayed anywhere on screen
   * @deprecated Use expectTextNotDisplayed() instead for better error handling and retry mechanisms
   */
  static async checkIfTextIsDisplayed(
    text: string,
    timeout = 15000,
  ): Promise<void> {
    return this.expectTextDisplayed(text, { timeout });
  }

  /**
   * Legacy method: Check if text is not displayed
   * @deprecated Use expectElementToNotBeVisible() or custom assertion instead for better error handling and retry mechanisms
   */
  static async checkIfTextIsNotDisplayed(
    text: string,
    timeout = 15000,
  ): Promise<void> {
    return Utilities.executeWithRetry(
      async () => {
        const textElement = await Matchers.getElementByText(text);
        await waitFor(textElement).not.toBeVisible().withTimeout(100);
      },
      {
        timeout,
        description: `Text "${text}" is not displayed`,
      },
    );
  }

  /**
   * Legacy method: Check if an element does not have specific text
   * @deprecated Use expectElementToNotHaveText() or custom assertion instead for better error handling and retry mechanisms
   */
  static async checkIfElementNotToHaveText(
    detoxElement: DetoxElement,
    text: string,
    timeout = 15000,
  ): Promise<void> {
    return Utilities.executeWithRetry(
      async () => {
        const el = (await detoxElement) as Detox.IndexableNativeElement;
        await waitFor(el).not.toHaveText(text).withTimeout(100);
      },
      {
        timeout,
        description: `Element does not have text "${text}"`,
      },
    );
  }

  /**
   * Legacy method: Check if an element does not have specific label
   * @deprecated Use expectElementToNotBeVisible() or custom assertion instead for better error handling and retry mechanisms
   */
  static async checkIfElementDoesNotHaveLabel(
    detoxElement: DetoxElement,
    label: string,
    timeout = 15000,
  ): Promise<void> {
    return Utilities.executeWithRetry(
      async () => {
        const el = (await detoxElement) as Detox.IndexableNativeElement;
        await waitFor(el).not.toHaveLabel(label).withTimeout(100);
      },
      {
        timeout,
        description: `Element does not have label "${label}"`,
      },
    );
  }

  /**
   * Legacy method: Check if toggle is in "on" state
   * @deprecated Use expectToggleToBeOn() instead for better error handling and retry mechanisms
   */
  static async checkIfToggleIsOn(detoxElement: DetoxElement): Promise<void> {
    const el = (await detoxElement) as Detox.IndexableNativeElement;
    // Use Detox's expect syntax for toggle values
    // Use Detox expect interface for toggle values - unavoidable any due to Detox API limitations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (expect(el) as any).toHaveToggleValue(true);
  }

  /**
   * Legacy method: Check if toggle is in "off" state
   * @deprecated Use expectToggleToBeOff() instead for better error handling and retry mechanisms
   */
  static async checkIfToggleIsOff(detoxElement: DetoxElement): Promise<void> {
    const el = (await detoxElement) as Detox.IndexableNativeElement;
    // Use Detox's expect syntax for toggle values
    // Use Detox expect interface for toggle values - unavoidable any due to Detox API limitations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (expect(el) as any).toHaveToggleValue(false);
  }

  /**
   * Legacy method: Check if element is enabled
   * @deprecated Use Utilities.waitForElementToBeEnabled() instead for better retry handling
   */
  static async checkIfEnabled(detoxElement: DetoxElement): Promise<boolean> {
    const el = (await detoxElement) as Detox.IndexableNativeElement;
    const attributes = await el.getAttributes();
    return 'enabled' in attributes ? !!attributes.enabled : false;
  }

  /**
   * Legacy method: Check if element is disabled
   * @deprecated Use Utilities.waitForElementToBeEnabled() with negated logic instead
   */
  static async checkIfDisabled(detoxElement: DetoxElement): Promise<boolean> {
    const el = (await detoxElement) as Detox.IndexableNativeElement;
    const attributes = await el.getAttributes();
    return 'enabled' in attributes ? !attributes.enabled : true;
  }

  /**
   * Legacy method: Check if label contains text
   * @deprecated Use expectLabel() with regex pattern instead for better error handling and retry mechanisms
   */
  static async checkIfLabelContainsText(
    text: string,
    timeout = 15000,
  ): Promise<void> {
    return Utilities.executeWithRetry(
      async () => {
        const labelMatcher = element(by.label(new RegExp(text)));
        await waitFor(labelMatcher).toExist().withTimeout(100);
      },
      {
        timeout,
        description: `Label contains text "${text}"`,
      },
    );
  }
}
