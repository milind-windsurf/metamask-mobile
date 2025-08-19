import bookmarksReducer from './bookmarks';
import browserReducer from './browser';
import engineReducer from '../core/redux/slices/engine';
import privacyReducer from './privacy';
import modalsReducer from './modals';
import settingsReducer from './settings';
import alertReducer from './alert';
import transactionReducer from './transaction';
import legalNoticesReducer from './legalNotices';
import userReducer, { UserState } from './user';
import wizardReducer from './wizard';
import onboardingReducer, { OnboardingState } from './onboarding';
import fiatOrders from './fiatOrders';
import swapsReducer from './swaps';
import signatureRequestReducer from './signatureRequest';
import notificationReducer from './notification';
import infuraAvailabilityReducer from './infuraAvailability';
import collectiblesReducer from './collectibles';
import navigationReducer, { NavigationState } from './navigation';
import networkOnboardReducer from './networkSelector';
import securityReducer, { SecurityState } from './security';
import { combineReducers, Reducer } from 'redux';
import experimentalSettingsReducer from './experimentalSettings';
import { EngineState } from '../core/Engine';
import rpcEventReducer from './rpcEvents';
import accountsReducer from './accounts';
import sdkReducer from './sdk';
import inpageProviderReducer from '../core/redux/slices/inpageProvider';
import confirmationMetricsReducer from '../core/redux/slices/confirmationMetrics';
import originThrottlingReducer from '../core/redux/slices/originThrottling';
import notificationsAccountsProvider from '../core/redux/slices/notifications';
import bannersReducer, { BannersState } from './banners';
import bridgeReducer from '../core/redux/slices/bridge';
import performanceReducer, {
  PerformanceState,
} from '../core/redux/slices/performance';
import { isTest } from '../util/test/utils';

export interface BookmarksState {
  bookmarks: Array<{ url: string; name: string }>;
}

export interface BrowserState {
  history: Array<{ url: string; name: string }>;
  whitelist: string[];
  tabs: Array<{
    url: string;
    id: string | number;
    linkType?: string;
    image?: string;
    isArchived?: boolean;
  }>;
  favicons: Array<{ origin: string; url: string }>;
  activeTab: string | number | null;
  visitedDappsByHostname: Record<string, boolean>;
}

export interface PrivacyState {
  approvedHosts: Record<string, boolean>;
  revealSRPTimestamps: number[];
}

export interface ModalsState {
  networkModalVisible: boolean;
  shouldNetworkSwitchPopToWallet: boolean;
  collectibleContractModalVisible: boolean;
  dappTransactionModalVisible: boolean;
  signMessageModalVisible: boolean;
  infoNetworkModalVisible?: boolean;
  receiveAsset?: unknown;
  receiveModalVisible?: boolean;
}

export interface SettingsState {
  searchEngine: string;
  primaryCurrency: string;
  lockTime: number;
  useBlockieIcon: boolean;
  hideZeroBalanceTokens: boolean;
  basicFunctionalityEnabled: boolean;
  deepLinkModalDisabled: boolean;
  showHexData?: boolean;
  showCustomNonce?: boolean;
  showFiatOnTestnets?: boolean;
  deviceNotificationEnabled?: boolean;
}

export interface AlertState {
  isVisible: boolean;
  autodismiss: number | null;
  content: unknown | null;
  data: unknown | null;
}

export interface TransactionState {
  ensRecipient: string | undefined;
  assetType: string | undefined;
  selectedAsset: unknown;
  transaction: {
    data: string | undefined;
    from: string | undefined;
    gas: string | undefined;
    gasPrice: string | undefined;
    to: string | undefined;
    value: string | undefined;
    maxFeePerGas: string | undefined;
    maxPriorityFeePerGas: string | undefined;
  };
  warningGasPriceHigh: boolean | undefined;
  transactionTo: string | undefined;
  transactionToName: string | undefined;
  transactionFromName: string | undefined;
  transactionValue: string | undefined;
  symbol: string | undefined;
  paymentRequest: unknown | undefined;
  readableValue: string | undefined;
  id: string | undefined;
  type: string | undefined;
  proposedNonce: string | undefined;
  nonce: string | undefined;
  securityAlertResponses: Record<string, unknown>;
  useMax: boolean;
  maxValueMode?: boolean;
  origin?: string;
  chainId?: string;
}

export interface WizardState {
  step: number;
}

export interface NotificationState {
  notifications: Array<{
    id: string;
    isVisible: boolean;
    autodismiss: number;
    title?: string;
    description?: string;
    status?: string;
    type: string;
    transaction?: unknown;
  }>;
  notification?: {
    notificationsSettings?: Record<string, unknown>;
  };
}

export interface SwapsState {
  isLive: boolean;
  hasOnboarded: boolean;
  featureFlags: unknown;
  [chainId: string]: unknown;
}

export interface InfuraAvailabilityState {
  isBlocked: boolean;
}

export interface CollectiblesState {
  favorites: Record<string, Record<string, Array<{ tokenId: string; address: string }>>>;
  isNftFetchingProgress: boolean;
}

export interface LegalNoticesState {
  newPrivacyPolicyToastClickedOrClosed: boolean;
  newPrivacyPolicyToastShownDate: number | null;
}

export interface ExperimentalSettingsState {
  securityAlertsEnabled: boolean;
}

export interface SignatureRequestState {
  securityAlertResponse?: unknown;
}

export interface RpcEventsState {
  signingEvent: {
    eventStage: string;
    rpcName: string;
    error?: Error;
  };
}

export interface AccountsState {
  reloadAccounts: boolean;
}

export interface NetworkOnboardedState {
  [key: string]: unknown;
}

/**
 * Infer state from a reducer
 *
 * @template reducer A reducer function
 */
export type StateFromReducer<reducer> = reducer extends Reducer<
  infer State,
  // TODO: Replace "any" with type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
>
  ? State
  : never;

export interface RuntimeRootState {
  legalNotices: LegalNoticesState;
  collectibles: CollectiblesState;
  engine: { backgroundState: EngineState };
  privacy: PrivacyState;
  bookmarks: BookmarksState;
  browser: BrowserState;
  modals: ModalsState;
  settings: SettingsState;
  alert: AlertState;
  transaction: TransactionState;
  user: UserState;
  wizard: WizardState;
  onboarding: OnboardingState;
  notification: NotificationState;
  swaps: SwapsState;
  fiatOrders: StateFromReducer<typeof fiatOrders>;
  infuraAvailability: InfuraAvailabilityState;
  navigation: NavigationState;
  networkOnboarded: NetworkOnboardedState;
  security: SecurityState;
  sdk: StateFromReducer<typeof sdkReducer>;
  experimentalSettings: ExperimentalSettingsState;
  signatureRequest: SignatureRequestState;
  rpcEvents: RpcEventsState;
  accounts: AccountsState;
  inpageProvider: StateFromReducer<typeof inpageProviderReducer>;
  confirmationMetrics: StateFromReducer<typeof confirmationMetricsReducer>;
  originThrottling: StateFromReducer<typeof originThrottlingReducer>;
  notifications: StateFromReducer<typeof notificationsAccountsProvider>;
  bridge: StateFromReducer<typeof bridgeReducer>;
  banners: BannersState;
  performance?: PerformanceState;
}

// TODO: Convert all reducers to valid TypeScript Redux reducers, and add them
// to this type. Once that is complete, we can automatically generate this type
// using the `StateFromReducersMapObject` type from redux.
export interface RootState {
  legalNotices?: Partial<LegalNoticesState>;
  collectibles?: Partial<CollectiblesState>;
  engine?: { backgroundState?: Partial<EngineState> };
  privacy?: Partial<PrivacyState>;
  bookmarks?: Partial<BookmarksState> | Array<{ url: string; name: string }>;
  browser?: Partial<BrowserState>;
  modals?: Partial<ModalsState>;
  settings?: Partial<SettingsState>;
  alert?: Partial<AlertState>;
  transaction?: Partial<TransactionState>;
  user?: Partial<UserState>;
  wizard?: Partial<WizardState>;
  onboarding?: Partial<OnboardingState>;
  notification?: Partial<NotificationState>;
  swaps?: Partial<SwapsState>;
  fiatOrders?: StateFromReducer<typeof fiatOrders>;
  infuraAvailability?: Partial<InfuraAvailabilityState>;
  navigation?: Partial<NavigationState>;
  // The networkOnboarded reducer is TypeScript but not yet a valid reducer
  networkOnboarded?: Partial<NetworkOnboardedState>;
  security?: Partial<SecurityState>;
  sdk?: StateFromReducer<typeof sdkReducer>;
  // The experimentalSettings reducer is TypeScript but not yet a valid reducer
  experimentalSettings?: Partial<ExperimentalSettingsState>;
  signatureRequest?: Partial<SignatureRequestState>;
  rpcEvents?: Partial<RpcEventsState>;
  accounts?: Partial<AccountsState>;
  inpageProvider?: StateFromReducer<typeof inpageProviderReducer>;
  confirmationMetrics?: StateFromReducer<typeof confirmationMetricsReducer>;
  originThrottling?: StateFromReducer<typeof originThrottlingReducer>;
  notifications?: StateFromReducer<typeof notificationsAccountsProvider>;
  bridge?: StateFromReducer<typeof bridgeReducer>;
  banners?: Partial<BannersState>;
  performance?: PerformanceState;
}

const baseReducers = {
  legalNotices: legalNoticesReducer,
  collectibles: collectiblesReducer,
  // TODO: Replace "any" with type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  engine: engineReducer as any,
  privacy: privacyReducer,
  bookmarks: bookmarksReducer,
  browser: browserReducer,
  modals: modalsReducer,
  settings: settingsReducer,
  alert: alertReducer,
  transaction: transactionReducer,
  user: userReducer,
  wizard: wizardReducer,
  onboarding: onboardingReducer,
  notification: notificationReducer,
  signatureRequest: signatureRequestReducer,
  swaps: swapsReducer,
  fiatOrders,
  infuraAvailability: infuraAvailabilityReducer,
  navigation: navigationReducer,
  networkOnboarded: networkOnboardReducer,
  security: securityReducer,
  sdk: sdkReducer,
  experimentalSettings: experimentalSettingsReducer,
  rpcEvents: rpcEventReducer,
  accounts: accountsReducer,
  inpageProvider: inpageProviderReducer,
  originThrottling: originThrottlingReducer,
  notifications: notificationsAccountsProvider,
  bridge: bridgeReducer,
  banners: bannersReducer,
  confirmationMetrics: confirmationMetricsReducer,
};

if (isTest) {
  // @ts-expect-error - it's expected to not exist, it should only exist in not production environments
  baseReducers.performance = performanceReducer;
}

// TODO: Fix the Action type. It's set to `any` now because some of the
// TypeScript reducers have invalid actions
// TODO: Replace "any" with type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rootReducer = combineReducers<RuntimeRootState, any>(baseReducers);

export default rootReducer;
