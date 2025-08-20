import TransactionTypes from '../../core/TransactionTypes';
import { SecurityAlertResponse } from '@metamask/transaction-controller';
import {
  TransactionActionType,
  ResetTransactionAction,
  NewAssetTransactionAction,
  SetRecipientAction,
  SetSelectedAssetAction,
  PrepareTransactionAction,
  SetTransactionSecurityAlertResponseAction,
  SetTransactionObjectAction,
  SetTransactionIdAction,
  SetTokensTransactionAction,
  SetEtherTransactionAction,
  SetNonceAction,
  SetProposedNonceAction,
  SetMaxValueModeAction,
  SetTransactionValueAction,
  SelectedAsset,
  TransactionData,
} from './types';

const {
  ASSET: { ETH, ERC20, ERC721 },
} = TransactionTypes;

/**
 * Clears transaction object completely
 */
export function resetTransaction(): ResetTransactionAction {
  return {
    type: TransactionActionType.RESET_TRANSACTION,
  };
}

/**
 * Starts a new transaction state with an asset
 *
 * @param {object} selectedAsset - Asset to start the transaction with
 */
export function newAssetTransaction(selectedAsset: SelectedAsset): NewAssetTransactionAction {
  return {
    type: TransactionActionType.NEW_ASSET_TRANSACTION,
    selectedAsset,
    assetType: selectedAsset.isETH
      ? ETH
      : selectedAsset.tokenId
      ? ERC721
      : ERC20,
  };
}

/**
 * Sets transaction to address and ensRecipient in case is available
 *
 * @param {string} from - Address to send the transaction from
 * @param {string} to - Address to send the transaction to
 * @param {string} ensRecipient - Resolved ens name to send the transaction to
 * @param {string} transactionToName - Resolved address book name for to address
 * @param {string} transactionFromName - Resolved address book name for from address
 */
export function setRecipient(
  from: string,
  to: string,
  ensRecipient?: string,
  transactionToName?: string,
  transactionFromName?: string,
): SetRecipientAction {
  return {
    type: TransactionActionType.SET_RECIPIENT,
    from,
    to,
    ensRecipient,
    transactionToName,
    transactionFromName,
  };
}

/**
 * Sets asset as selectedAsset
 *
 * @param {object} selectedAsset - Asset to start the transaction with
 */
export function setSelectedAsset(selectedAsset: SelectedAsset): SetSelectedAssetAction {
  return {
    type: TransactionActionType.SET_SELECTED_ASSET,
    selectedAsset,
    assetType: selectedAsset.isETH
      ? ETH
      : selectedAsset.tokenId
      ? ERC721
      : ERC20,
  };
}

/**
 * Sets transaction object to be sent
 *
 * @param {object} transaction - Transaction object with from, to, data, gas, gasPrice, value
 */
export function prepareTransaction(transaction: TransactionData): PrepareTransactionAction {
  return {
    type: TransactionActionType.PREPARE_TRANSACTION,
    transaction,
  };
}

export function setTransactionSecurityAlertResponse(
  transactionId: string,
  securityAlertResponse: SecurityAlertResponse,
): SetTransactionSecurityAlertResponseAction {
  return {
    type: TransactionActionType.SET_TRANSACTION_SECURITY_ALERT_RESPONSE,
    transactionId,
    securityAlertResponse,
  };
}

/**
 * Sets any attribute in transaction object
 *
 * @param {object} transaction - New transaction object
 */
export function setTransactionObject(transaction: any): SetTransactionObjectAction {
  return {
    type: TransactionActionType.SET_TRANSACTION_OBJECT,
    transaction,
  };
}

/**
 * Sets the current transaction ID only.
 *
 * @param {object} transactionId - Id of the current transaction.
 */
export function setTransactionId(transactionId: string): SetTransactionIdAction {
  return {
    type: TransactionActionType.SET_TRANSACTION_ID,
    transactionId,
  };
}

/**
 * Enable selectable tokens (ERC20 and Ether) to send in a transaction
 *
 * @param {object} asset - Asset to start the transaction with
 */
export function setTokensTransaction(asset: SelectedAsset): SetTokensTransactionAction {
  return {
    type: TransactionActionType.SET_TOKENS_TRANSACTION,
    asset,
  };
}

/**
 * Enable Ether only to send in a transaction
 *
 * @param {object} transaction - Transaction additional object
 */
export function setEtherTransaction(transaction: any): SetEtherTransactionAction {
  return {
    type: TransactionActionType.SET_ETHER_TRANSACTION,
    transaction,
  };
}

export function setNonce(nonce: string): SetNonceAction {
  return {
    type: TransactionActionType.SET_NONCE,
    nonce,
  };
}

export function setProposedNonce(proposedNonce: string): SetProposedNonceAction {
  return {
    type: TransactionActionType.SET_PROPOSED_NONCE,
    proposedNonce,
  };
}

export function setMaxValueMode(maxValueMode: boolean): SetMaxValueModeAction {
  return {
    type: TransactionActionType.SET_MAX_VALUE_MODE,
    maxValueMode,
  };
}

export function setTransactionValue(value: string): SetTransactionValueAction {
  return {
    type: TransactionActionType.SET_TRANSACTION_VALUE,
    value,
  };
}
