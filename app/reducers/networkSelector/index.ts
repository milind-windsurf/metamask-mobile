import { NetworkSelectorAction, NetworkSelectorActionType } from '../../actions/networkSelector/types';
import { NetworkSelectorState } from './types';

export const initialState: NetworkSelectorState = {
  networkOnboardedState: {},
  networkState: {
    showNetworkOnboarding: false,
    nativeToken: '',
    networkType: '',
    networkUrl: '',
  },
  switchedNetwork: {
    networkUrl: '',
    networkStatus: false,
  },
};

/**
 *
 * Network onboarding reducer
 * @returns
 */

function networkOnboardReducer(
  state: NetworkSelectorState = initialState,
  action: NetworkSelectorAction,
): NetworkSelectorState {
  switch (action.type) {
    case NetworkSelectorActionType.SHOW_NETWORK_ONBOARDING:
      return {
        ...state,
        networkState: {
          showNetworkOnboarding: action.showNetworkOnboarding,
          nativeToken: action.nativeToken,
          networkType: action.networkType,
          networkUrl: action.networkUrl,
        },
      };
    case NetworkSelectorActionType.NETWORK_SWITCHED:
      return {
        ...state,
        switchedNetwork: {
          networkUrl: action.networkUrl,
          networkStatus: action.networkStatus,
        },
      };
    case NetworkSelectorActionType.NETWORK_ONBOARDED:
      return {
        ...state,
        networkState: {
          showNetworkOnboarding: false,
          nativeToken: '',
          networkType: '',
          networkUrl: '',
        },
        networkOnboardedState: {
          ...state.networkOnboardedState,
          [action.payload]: true,
        },
      };
    default:
      return state;
  }
}

export default networkOnboardReducer;
