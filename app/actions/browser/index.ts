import {
  BrowserActionType,
  AddToViewedDappAction,
  AddToBrowserHistoryAction,
  ClearBrowserHistoryAction,
  AddToBrowserWhitelistAction,
  CloseAllTabsAction,
  CreateNewTabAction,
  CloseTabAction,
  SetActiveTabAction,
  UpdateTabAction,
  StoreFaviconAction,
  BrowserTab,
} from './types';

export * from './types';

/**
 * Browser actions for Redux
 */
export const BrowserActionTypes = {
  ADD_TO_VIEWED_DAPP: BrowserActionType.ADD_TO_VIEWED_DAPP,
};

/**
 * Adds a new entry to viewed dapps
 */
export function addToViewedDapp(hostname: string): AddToViewedDappAction {
  return {
    type: BrowserActionType.ADD_TO_VIEWED_DAPP,
    hostname,
  };
}

/**
 * Adds a new entry to the browser history
 */
export function addToHistory({ url, name }: { url: string; name: string }): AddToBrowserHistoryAction {
  return {
    type: BrowserActionType.ADD_TO_BROWSER_HISTORY,
    url,
    name,
  };
}

/**
 * Clears the entire browser history
 */
export function clearHistory(metricsEnabled: boolean, marketingEnabled: boolean): ClearBrowserHistoryAction {
  return {
    type: BrowserActionType.CLEAR_BROWSER_HISTORY,
    id: Date.now(),
    metricsEnabled,
    marketingEnabled,
  };
}

/**
 * Adds a new entry to the whitelist
 */
export function addToWhitelist(url: string): AddToBrowserWhitelistAction {
  return {
    type: BrowserActionType.ADD_TO_BROWSER_WHITELIST,
    url,
  };
}

/**
 * Closes all the opened tabs
 */
export function closeAllTabs(): CloseAllTabsAction {
  return {
    type: BrowserActionType.CLOSE_ALL_TABS,
  };
}

/**
 * Creates a new tab
 */
export function createNewTab(url: string, linkType?: string): CreateNewTabAction {
  return {
    type: BrowserActionType.CREATE_NEW_TAB,
    url,
    linkType,
    id: Date.now(),
  };
}

/**
 * Closes an exiting tab
 */
export function closeTab(id: number): CloseTabAction {
  return {
    type: BrowserActionType.CLOSE_TAB,
    id,
  };
}

/**
 * Selects an exiting tab
 */
export function setActiveTab(id: number): SetActiveTabAction {
  return {
    type: BrowserActionType.SET_ACTIVE_TAB,
    id,
  };
}

/**
 * Updates an existing tab
 */
export function updateTab(id: number, data: Partial<BrowserTab>): UpdateTabAction {
  return {
    type: BrowserActionType.UPDATE_TAB,
    id,
    data,
  };
}

/**
 * Stores the favicon url using the origin as key
 */
export function storeFavicon({ origin, url }: { origin: string; url: string }): StoreFaviconAction {
  return {
    type: BrowserActionType.STORE_FAVICON_URL,
    origin,
    url,
  };
}
