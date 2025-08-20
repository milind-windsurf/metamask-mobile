import { Action } from 'redux';
import { SecurityAlertResponse } from '@metamask/transaction-controller';

export enum TransactionActionType {
  RESET_TRANSACTION = 'RESET_TRANSACTION',
  NEW_ASSET_TRANSACTION = 'NEW_ASSET_TRANSACTION',
  SET_RECIPIENT = 'SET_RECIPIENT',
  SET_SELECTED_ASSET = 'SET_SELECTED_ASSET',
  PREPARE_TRANSACTION = 'PREPARE_TRANSACTION',
  SET_TRANSACTION_SECURITY_ALERT_RESPONSE = 'SET_TRANSACTION_SECURITY_ALERT_RESPONSE',
  SET_TRANSACTION_OBJECT = 'SET_TRANSACTION_OBJECT',
  SET_TRANSACTION_ID = 'SET_TRANSACTION_ID',
  SET_TOKENS_TRANSACTION = 'SET_TOKENS_TRANSACTION',
  SET_ETHER_TRANSACTION = 'SET_ETHER_TRANSACTION',
  SET_NONCE = 'SET_NONCE',
  SET_PROPOSED_NONCE = 'SET_PROPOSED_NONCE',
  SET_MAX_VALUE_MODE = 'SET_MAX_VALUE_MODE',
  SET_TRANSACTION_VALUE = 'SET_TRANSACTION_VALUE',
}

export interface SelectedAsset {
  isETH?: boolean;
  tokenId?: string;
  symbol?: string;
  address?: string;
  decimals?: number;
  name?: string | null;
  image?: string | null;
  balance?: string;
  contractName?: string | null;
  chainId?: string | number;
  isNative?: boolean;
}

export interface TransactionData {
  data?: string;
  from?: string;
  gas?: string;
  gasPrice?: string;
  to?: string;
  value?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

export interface ResetTransactionAction extends Action<TransactionActionType.RESET_TRANSACTION> {}

export interface NewAssetTransactionAction extends Action<TransactionActionType.NEW_ASSET_TRANSACTION> {
  selectedAsset: SelectedAsset;
  assetType: string;
}

export interface SetRecipientAction extends Action<TransactionActionType.SET_RECIPIENT> {
  from: string;
  to: string;
  ensRecipient?: string;
  transactionToName?: string;
  transactionFromName?: string;
}

export interface SetSelectedAssetAction extends Action<TransactionActionType.SET_SELECTED_ASSET> {
  selectedAsset: SelectedAsset;
  assetType?: string;
}

export interface PrepareTransactionAction extends Action<TransactionActionType.PREPARE_TRANSACTION> {
  transaction: TransactionData;
}

export interface SetTransactionSecurityAlertResponseAction extends Action<TransactionActionType.SET_TRANSACTION_SECURITY_ALERT_RESPONSE> {
  transactionId: string;
  securityAlertResponse: SecurityAlertResponse;
}

export interface SetTransactionObjectAction extends Action<TransactionActionType.SET_TRANSACTION_OBJECT> {
  transaction: any;
}

export interface SetTransactionIdAction extends Action<TransactionActionType.SET_TRANSACTION_ID> {
  transactionId: string;
}

export interface SetTokensTransactionAction extends Action<TransactionActionType.SET_TOKENS_TRANSACTION> {
  asset: SelectedAsset;
}

export interface SetEtherTransactionAction extends Action<TransactionActionType.SET_ETHER_TRANSACTION> {
  transaction: any;
}

export interface SetNonceAction extends Action<TransactionActionType.SET_NONCE> {
  nonce: string;
}

export interface SetProposedNonceAction extends Action<TransactionActionType.SET_PROPOSED_NONCE> {
  proposedNonce: string;
}

export interface SetMaxValueModeAction extends Action<TransactionActionType.SET_MAX_VALUE_MODE> {
  maxValueMode: boolean;
}

export interface SetTransactionValueAction extends Action<TransactionActionType.SET_TRANSACTION_VALUE> {
  value: string;
}

export type TransactionAction =
  | ResetTransactionAction
  | NewAssetTransactionAction
  | SetRecipientAction
  | SetSelectedAssetAction
  | PrepareTransactionAction
  | SetTransactionSecurityAlertResponseAction
  | SetTransactionObjectAction
  | SetTransactionIdAction
  | SetTokensTransactionAction
  | SetEtherTransactionAction
  | SetNonceAction
  | SetProposedNonceAction
  | SetMaxValueModeAction
  | SetTransactionValueAction;
