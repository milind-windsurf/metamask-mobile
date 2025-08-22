import { web, system } from 'detox';

/**
 * Utility class for matching (locating) UI elements across native and web contexts.
 * Provides comprehensive element selection methods with proper type safety and error handling.
 */
export default class Matchers {
  /**
   * Get a native element by its ID with optional index selection.
   * 
   * @param elementId - The ID or regex pattern to match against element IDs
   * @param index - Optional zero-based index when multiple elements match (default: undefined for first match)
   * @returns Promise resolving to the matched Detox native element
   * 
   * @example
   * ```typescript
   * const button = await Matchers.getElementByID('submit-button');
   * const thirdItem = await Matchers.getElementByID('list-item', 2);
   * ```
   */
  static async getElementByID(
    elementId: string | RegExp,
    index?: number,
  ): Promise<Detox.IndexableNativeElement> {
    const el = element(by.id(elementId));
    if (index !== undefined) {
      return el.atIndex(index) as Detox.IndexableNativeElement;
    }
    return el as Detox.IndexableNativeElement;
  }

  /**
   * Get a native element by its visible text content with optional index selection.
   * 
   * @param text - The exact text content to search for
   * @param index - Zero-based index when multiple elements match (default: 0)
   * @returns Promise resolving to the matched Detox native element
   * 
   * @example
   * ```typescript
   * const loginButton = await Matchers.getElementByText('Login');
   * const secondOption = await Matchers.getElementByText('Option', 1);
   * ```
   */
  static async getElementByText(
    text: string,
    index = 0,
  ): Promise<Detox.IndexableNativeElement> {
    return element(by.text(text)).atIndex(
      index,
    ) as Detox.IndexableNativeElement;
  }

  /**
   * Get a native element that matches both ID and accessibility label simultaneously.
   * This strategy combines two matchers for more precise element selection.
   * 
   * @param id - The element ID to match
   * @param label - The accessibility label (string or regex) to match
   * @param index - Zero-based index when multiple elements match (default: 0)
   * @returns Promise resolving to the matched Detox native element
   * 
   * @example
   * ```typescript
   * const submitBtn = await Matchers.getElementByIDAndLabel('btn-submit', 'Submit Form');
   * const dynamicBtn = await Matchers.getElementByIDAndLabel('btn-action', /^Submit|Save$/);
   * ```
   */
  static async getElementByIDAndLabel(
    id: string,
    label: string | RegExp,
    index = 0,
  ): Promise<Detox.IndexableNativeElement> {
    return element(by.id(id).and(by.label(label))).atIndex(
      index,
    ) as Detox.IndexableNativeElement;
  }

  /**
   * Get a native element by its accessibility label (iOS) or content description (Android).
   * 
   * @param label - The accessibility label to search for
   * @param index - Zero-based index when multiple elements match (default: 0)
   * @returns Promise resolving to the matched Detox native element
   * 
   * @example
   * ```typescript
   * const closeButton = await Matchers.getElementByLabel('Close dialog');
   * const secondTab = await Matchers.getElementByLabel('Tab', 1);
   * ```
   */
  static async getElementByLabel(
    label: string,
    index = 0,
  ): Promise<Detox.IndexableNativeElement> {
    return element(by.label(label)).atIndex(
      index,
    ) as Detox.IndexableNativeElement;
  }

  /**
   * Get a native element by finding a parent that contains a specific child element.
   * 
   * @param parentElement - The ID of the parent element
   * @param childElement - The ID of the child element that must exist within the parent
   * @returns Promise resolving to the parent Detox native element
   * 
   * @example
   * ```typescript
   * const form = await Matchers.getElementByDescendant('login-form', 'password-field');
   * ```
   */
  static async getElementByDescendant(
    parentElement: string,
    childElement: string,
  ): Promise<Detox.IndexableNativeElement> {
    return element(by.id(parentElement).withDescendant(by.id(childElement)));
  }

  /**
   * Get a native element by finding a child that has a specific ancestor element.
   * 
   * @param childElement - The ID of the child element to find
   * @param parentElement - The ID of the ancestor element that must contain the child
   * @returns Promise resolving to the child Detox native element
   * 
   * @example
   * ```typescript
   * const fieldInForm = await Matchers.getElementIDWithAncestor('email-field', 'login-form');
   * ```
   */
  static async getElementIDWithAncestor(
    childElement: string,
    parentElement: string,
  ): Promise<Detox.IndexableNativeElement> {
    return element(by.id(childElement).withAncestor(by.id(parentElement)));
  }

  /**
   * Get a WebView instance by its element ID with platform-specific optimizations.
   * On Android, multiple WebView instances may exist, so the correct one is selected
   * based on its parent element ID for better reliability.
   * 
   * @param elementId - The ID of the WebView element
   * @returns The Detox WebView element for web interaction
   * 
   * @example
   * ```typescript
   * const webView = Matchers.getWebViewByID('dapp-webview');
   * ```
   */
  static getWebViewByID(elementId: string): Detox.WebViewElement {
    if (process.env.CI) {
      return device.getPlatform() === 'ios'
        ? web(by.id(elementId))
        : web(by.type('android.webkit.WebView').withAncestor(by.id(elementId)));
    }
    return web(by.id(elementId));
  }

  /**
   * Get a web element by its ID within a specific WebView container.
   * 
   * @param webviewID - The ID of the WebView container
   * @param innerID - The ID of the element within the WebView
   * @returns Promise resolving to the web element
   * 
   * @example
   * ```typescript
   * const connectButton = await Matchers.getElementByWebID('dapp-webview', 'connect-wallet');
   * ```
   */
  static async getElementByWebID(
    webviewID: string,
    innerID: string,
  ): WebElement {
    const myWebView = this.getWebViewByID(webviewID);
    return myWebView.element(by.web.id(innerID));
  }

  /**
   * Get a web element by CSS selector within a specific WebView container.
   * 
   * @param webviewID - The ID of the WebView container
   * @param selector - The CSS selector to match elements
   * @returns Promise resolving to the first matching web element
   * 
   * @example
   * ```typescript
   * const submitBtn = await Matchers.getElementByCSS('dapp-webview', 'button[type="submit"]');
   * ```
   */
  static async getElementByCSS(
    webviewID: string,
    selector: string,
  ): Promise<Detox.IndexableWebElement> {
    const myWebView = this.getWebViewByID(webviewID);
    return myWebView
      .element(by.web.cssSelector(selector))
      .atIndex(0) as unknown as Detox.IndexableWebElement;
  }

  /**
   * Get a web element by XPath expression within a specific WebView container.
   * 
   * @param webviewID - The ID of the WebView container
   * @param xpath - The XPath expression to locate the element
   * @returns Promise resolving to the matching web element
   * 
   * @example
   * ```typescript
   * const element = await Matchers.getElementByXPath('dapp-webview', '//button[text()="Connect"]');
   * ```
   */
  static async getElementByXPath(
    webviewID: string,
    xpath: string,
  ): Promise<Detox.IndexableWebElement | Detox.SecuredWebElementFacade> {
    const myWebView = this.getWebViewByID(webviewID);
    return myWebView.element(by.web.xpath(xpath));
  }

  /**
   * Get a web element by its href attribute within a specific WebView container.
   * 
   * @param webviewID - The ID of the WebView container
   * @param url - The href URL to match against
   * @returns Promise resolving to the first matching web element
   * 
   * @example
   * ```typescript
   * const link = await Matchers.getElementByHref('dapp-webview', 'https://metamask.io');
   * ```
   */
  static async getElementByHref(
    webviewID: string,
    url: string,
  ): Promise<Detox.IndexableWebElement> {
    const myWebView = this.getWebViewByID(webviewID);
    return myWebView
      .element(by.web.href(url))
      .atIndex(0) as unknown as Detox.IndexableWebElement;
  }

  /**
   * Create a Detox matcher for identifying an element by its ID without creating an element instance.
   * This method generates only a matcher that can be used for identification purposes
   * or combined with other matchers, without performing any actions on the element.
   * 
   * @param selectorString - The ID string to create a matcher for
   * @returns Promise resolving to a Detox native matcher
   * 
   * @example
   * ```typescript
   * const matcher = await Matchers.getIdentifier('submit-button');
   * // Use matcher for complex matching scenarios
   * ```
   */
  static async getIdentifier(
    selectorString: string,
  ): Promise<Detox.NativeMatcher> {
    return by.id(selectorString);
  }

  /**
   * Get system-level dialog elements (permissions, alerts, notifications) by their text content.
   * These are system dialogs that appear outside the app's UI context.
   * 
   * @param text - The text content of the system dialog element
   * @returns Promise resolving to the system element
   * 
   * @example
   * ```typescript
   * const allowButton = await Matchers.getSystemElementByText('Allow');
   * const permissionDialog = await Matchers.getSystemElementByText('Camera Permission');
   * ```
   */
  static async getSystemElementByText(
    text: string,
  ): Promise<Detox.IndexableSystemElement> {
    return system.element(by.system.label(text));
  }
}
