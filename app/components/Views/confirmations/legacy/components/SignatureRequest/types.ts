import { SecurityAlertResponse as ImportedSecurityAlertResponse } from '../BlockaidBanner/BlockaidBanner.types';

export interface MessageInfo {
  origin: string;
  type: string;
}

export interface PageMeta {
  analytics?: {
    request_platform: string;
    request_source: string;
  };
  icon?: string;
  title: string;
  url: string;
}

export interface SecurityAlertResponse {
  result_type: string;
  reason: string;
  description: string;
  features?: string[];
}

export interface MessageParams {
  data: string | object | any[];
  from: string;
  metamaskId: string;
  meta?: PageMeta;
  origin: string;
  version?: string;
  securityAlertResponse?: SecurityAlertResponse;
}
