export interface NetworkState {
  showNetworkOnboarding: boolean;
  nativeToken: string;
  networkType: string;
  networkUrl: string;
}

export interface SwitchedNetwork {
  networkUrl: string;
  networkStatus: boolean;
}

export interface NetworkSelectorState {
  networkOnboardedState: Record<string, boolean>;
  networkState: NetworkState;
  switchedNetwork: SwitchedNetwork;
}
