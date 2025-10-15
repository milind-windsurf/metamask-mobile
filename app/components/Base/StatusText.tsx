import React from 'react';
import Text from './Text';
import { StyleSheet } from 'react-native';
import { FIAT_ORDER_STATES } from '../../constants/on-ramp';
import { strings } from '../../../locales/i18n';
import { useTheme } from '../../util/theme';

const styles = StyleSheet.create({
  status: {
    marginTop: 4,
    fontSize: 12,
    letterSpacing: 0.5,
  },
});

interface StatusTextProps {
  testID?: string;
  children?: React.ReactNode;
}

export const ConfirmedText: React.FC<StatusTextProps> = ({ testID, children }) => (
  <Text testID={testID} bold green style={styles.status}>
    {children}
  </Text>
);

export const PendingText: React.FC<StatusTextProps> = ({ testID, children }) => {
  const { colors } = useTheme();
  return (
    <Text
      testID={testID}
      bold
      style={[styles.status, { color: colors.warning.default }]}
    >
      {children}
    </Text>
  );
};

export const FailedText: React.FC<StatusTextProps> = ({ testID, children }) => {
  const { colors } = useTheme();
  return (
    <Text
      testID={testID}
      bold
      style={[styles.status, { color: colors.error.default }]}
    >
      {children}
    </Text>
  );
};

interface MainStatusTextProps {
  status: string;
  context?: string;
  testID?: string;
  style?: import('react-native').TextStyle;
}

function StatusText({ status, context = 'transaction', testID }: MainStatusTextProps) {
  switch (status) {
    case 'Confirmed':
    case 'confirmed':
      return (
        <ConfirmedText testID={testID}>
          {strings(`${context}.${status}`)}
        </ConfirmedText>
      );
    case 'Pending':
    case 'pending':
    case 'Submitted':
    case 'submitted':
      return (
        <PendingText testID={testID}>
          {strings(`${context}.${status}`)}
        </PendingText>
      );
    case 'Failed':
    case 'Cancelled':
    case 'failed':
    case 'cancelled':
      return (
        <FailedText testID={testID}>
          {strings(`${context}.${status}`)}
        </FailedText>
      );

    case FIAT_ORDER_STATES.COMPLETED:
      return (
        <ConfirmedText>
          {strings(`${context}.completed`)}
        </ConfirmedText>
      );
    case FIAT_ORDER_STATES.PENDING:
      return (
        <PendingText>{strings(`${context}.pending`)}</PendingText>
      );
    case FIAT_ORDER_STATES.FAILED:
      return <FailedText>{strings(`${context}.failed`)}</FailedText>;
    case FIAT_ORDER_STATES.CANCELLED:
      return (
        <FailedText>{strings(`${context}.cancelled`)}</FailedText>
      );

    default:
      return (
        <Text bold style={styles.status}>
          {status}
        </Text>
      );
  }
}

export default StatusText;
