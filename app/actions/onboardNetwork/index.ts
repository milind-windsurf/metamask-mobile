import {
  NetworkSelectorActionType,
  NetworkOnboardedAction,
  NetworkSwitchedAction,
  ShowNetworkOnboardingAction,
} from '../networkSelector/types';

/**
 * Handle the onboarding network action
 *
 * @param {object} chainId - The chain ID of the current selected network
 * @returns
 */
export const onboardNetworkAction = (chainId: string): NetworkOnboardedAction => ({
  type: NetworkSelectorActionType.NETWORK_ONBOARDED,
  payload: chainId,
});

export const networkSwitched = ({
  networkUrl,
  networkStatus,
}: {
  networkUrl: string;
  networkStatus: boolean;
}): NetworkSwitchedAction => ({
  type: NetworkSelectorActionType.NETWORK_SWITCHED,
  networkUrl,
  networkStatus,
});

export const showNetworkOnboardingAction = ({
  networkUrl,
  networkType,
  nativeToken,
  showNetworkOnboarding,
}: {
  networkUrl: string;
  networkType: string;
  nativeToken: string;
  showNetworkOnboarding: boolean;
}): ShowNetworkOnboardingAction => ({
  type: NetworkSelectorActionType.SHOW_NETWORK_ONBOARDING,
  networkUrl,
  networkType,
  nativeToken,
  showNetworkOnboarding,
});
