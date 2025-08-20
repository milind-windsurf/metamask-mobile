import { Action } from 'redux';

export enum NetworkSelectorActionType {
  SHOW_NETWORK_ONBOARDING = 'SHOW_NETWORK_ONBOARDING',
  NETWORK_SWITCHED = 'NETWORK_SWITCHED',
  NETWORK_ONBOARDED = 'NETWORK_ONBOARDED',
}

export interface ShowNetworkOnboardingAction extends Action<NetworkSelectorActionType.SHOW_NETWORK_ONBOARDING> {
  nativeToken: string;
  networkType: string;
  networkUrl: string;
  showNetworkOnboarding: boolean;
}

export interface NetworkSwitchedAction extends Action<NetworkSelectorActionType.NETWORK_SWITCHED> {
  networkUrl: string;
  networkStatus: boolean;
}

export interface NetworkOnboardedAction extends Action<NetworkSelectorActionType.NETWORK_ONBOARDED> {
  payload: string;
}

export type NetworkSelectorAction =
  | ShowNetworkOnboardingAction
  | NetworkSwitchedAction
  | NetworkOnboardedAction;
