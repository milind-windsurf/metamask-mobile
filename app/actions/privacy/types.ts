import { type Action } from 'redux';

export enum PrivacyActionType {
  APPROVE_HOST = 'APPROVE_HOST',
  REJECT_HOST = 'REJECT_HOST',
  CLEAR_HOSTS = 'CLEAR_HOSTS',
  RECORD_SRP_REVEAL_TIMESTAMP = 'RECORD_SRP_REVEAL_TIMESTAMP',
}

export type ApproveHostAction = Action<PrivacyActionType.APPROVE_HOST> & {
  hostname: string;
};

export type RejectHostAction = Action<PrivacyActionType.REJECT_HOST> & {
  hostname: string;
};

export type ClearHostsAction = Action<PrivacyActionType.CLEAR_HOSTS>;

export type RecordSrpRevealTimestampAction = Action<PrivacyActionType.RECORD_SRP_REVEAL_TIMESTAMP> & {
  timestamp: number;
};

export type PrivacyAction =
  | ApproveHostAction
  | RejectHostAction
  | ClearHostsAction
  | RecordSrpRevealTimestampAction;
