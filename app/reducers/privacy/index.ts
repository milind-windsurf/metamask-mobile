import { PrivacyAction, PrivacyActionType } from '../../actions/privacy/types';
import { PrivacyState } from './types';

export * from './types';

const initialState: PrivacyState = {
  approvedHosts: {},
  revealSRPTimestamps: [],
};

/* eslint-disable @typescript-eslint/default-param-last */
const privacyReducer = (
  state: PrivacyState = initialState,
  action: PrivacyAction,
): PrivacyState => {
  const newHosts = { ...state.approvedHosts };
  switch (action.type) {
    case PrivacyActionType.APPROVE_HOST:
      return {
        ...state,
        approvedHosts: {
          ...state.approvedHosts,
          [action.hostname]: true,
        },
      };
    case PrivacyActionType.REJECT_HOST:
      delete newHosts[action.hostname];
      return {
        ...state,
        approvedHosts: newHosts,
      };
    case PrivacyActionType.CLEAR_HOSTS:
      return {
        ...state,
        approvedHosts: {},
      };
    case PrivacyActionType.RECORD_SRP_REVEAL_TIMESTAMP:
      return {
        ...state,
        revealSRPTimestamps: [...state.revealSRPTimestamps, action.timestamp],
      };
    default:
      return state;
  }
};

export default privacyReducer;
