import Engine from '../core/Engine';
// @ts-expect-error - ethjs-ens does not have TypeScript type definitions
import ENS from 'ethjs-ens';
import { areAddressesEqual } from './address';
import {
  ChainId,
  InfuraNetworkType,
  NetworkType,
} from '@metamask/controller-utils';

const ENS_NAME_NOT_DEFINED_ERROR = 'ENS name not defined';
const INVALID_ENS_NAME_ERROR = 'invalid ENS name';
const CACHE_REFRESH_THRESHOLD = 60 * 60 * 1000;
import { EMPTY_ADDRESS } from '../constants/transaction';
import { regex } from '../../app/util/regex';

interface CacheEntry {
  name?: string;
  timestamp: number;
}

export class ENSCache {
  static cache: Record<string, CacheEntry> = {};
}

const ENS_SUPPORTED_CHAIN_IDS: string[] = [ChainId[NetworkType.mainnet]];

const ENS_SUPPORTED_NETWORK_IDS: Record<string, string> = {
  [InfuraNetworkType.mainnet]: '1',
};

const CHAIN_ID_TO_NETWORK_ID: Record<string, string> = {
  [ChainId[NetworkType.mainnet]]:
    ENS_SUPPORTED_NETWORK_IDS[NetworkType.mainnet],
};

export function getCachedENSName(address: string, chainId: string): string | undefined {
  const networkHasEnsSupport = ENS_SUPPORTED_CHAIN_IDS.includes(chainId);
  if (!networkHasEnsSupport) {
    return undefined;
  }

  const networkId = CHAIN_ID_TO_NETWORK_ID[chainId];
  const cacheEntry = ENSCache.cache[networkId + address];

  return cacheEntry?.name;
}

export async function doENSReverseLookup(address: string, chainId: string): Promise<string | undefined> {
  const { provider } =
    Engine.context.NetworkController.getProviderAndBlockTracker();
  const { name: cachedName, timestamp } =
    ENSCache.cache[chainId + address] || {};
  const nowTimestamp = Date.now();
  if (timestamp && nowTimestamp - timestamp < CACHE_REFRESH_THRESHOLD) {
    return Promise.resolve(cachedName);
  }

  const networkHasEnsSupport = ENS_SUPPORTED_CHAIN_IDS.includes(chainId);

  if (networkHasEnsSupport) {
    const networkId = CHAIN_ID_TO_NETWORK_ID[chainId];
    const ens = new ENS({ provider, network: networkId });
    try {
      const name = await ens.reverse(address);
      const resolvedAddress = await ens.lookup(name);
      if (areAddressesEqual(address, resolvedAddress)) {
        ENSCache.cache[networkId + address] = { name, timestamp: Date.now() };
        return name;
      }
    } catch (e) {
      const error = e as Error;
      if (
        error.message.includes(ENS_NAME_NOT_DEFINED_ERROR) ||
        error.message.includes(INVALID_ENS_NAME_ERROR)
      ) {
        ENSCache.cache[networkId + address] = { timestamp: Date.now() };
      }
    }
  }
  return undefined;
}

export async function doENSLookup(ensName: string, chainId: string): Promise<string | undefined> {
  const { provider } =
    Engine.context.NetworkController.getProviderAndBlockTracker();

  const networkHasEnsSupport = ENS_SUPPORTED_CHAIN_IDS.includes(chainId);

  if (networkHasEnsSupport) {
    const networkId = CHAIN_ID_TO_NETWORK_ID[chainId];
    const ens = new ENS({ provider, network: networkId });
    try {
      const resolvedAddress = await ens.lookup(ensName);
      if (resolvedAddress === EMPTY_ADDRESS) return undefined;
      return resolvedAddress;
    } catch (e) {
      return undefined;
    }
  }
  return undefined;
}

export function isDefaultAccountName(name: string): boolean {
  return regex.defaultAccount.test(name);
}
