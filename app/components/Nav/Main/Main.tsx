import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import {
  AppState,
  ActivityIndicator,
  View,
  StyleSheet,
  Linking,
} from 'react-native';
import { connect } from 'react-redux';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import NetInfo from '@react-native-community/netinfo';
import BackgroundTimer from 'react-native-background-timer';

import MainNavigator from './MainNavigator';
import ReviewModal from '../../UI/ReviewModal';
import GlobalAlert from '../../UI/GlobalAlert';
import BackupAlert from '../../UI/BackupAlert';
import ProtectYourWalletModal from '../../UI/ProtectYourWalletModal';
import FadeOutOverlay from '../../UI/FadeOutOverlay';
import Notification from '../../UI/Notification';
import WarningAlert from '../../UI/WarningAlert';
import { useTheme } from '../../../util/theme';
import { useConnectionHandler } from '../../../util/navigation/useConnectionHandler';
import {
  stopIncomingTransactionPolling,
  startIncomingTransactionPolling,
  updateIncomingTransactions,
} from '../../../util/transaction-controller';
import { DEPRECATED_NETWORKS } from '../../../constants/network';
import { NETWORKS_CHAIN_ID } from '../../../constants/network';
import { GOERLI_DEPRECATED_ARTICLE } from '../../../constants/urls';
import AppConstants from '../../../core/AppConstants';
import Authentication from '../../../core/Authentication';
import Engine from '../../../core/Engine';
import NotificationManager from '../../../core/NotificationManager';
import Routes from '../../../constants/navigation/Routes';
import { strings } from '../../../../locales/i18n';
import { IconName } from '../../../component-library/components/Icons/Icon';
import { ToastContext } from '../../../component-library/components/Toast';
import { ToastVariants } from '../../../component-library/components/Toast/Toast.types';
import { isPortfolioViewEnabled } from '../../../util/networks';
import {
  showTransactionNotification,
  showSimpleNotification,
  hideCurrentNotification,
  removeNotificationById,
  removeNotVisibleNotifications,
} from '../../../actions/notification';
import {
  setInfuraAvailabilityBlocked,
  setInfuraAvailabilityNotBlocked,
} from '../../../actions/infuraAvailability';
import {
  selectShowIncomingTransactionNetworks,
  selectTokenNetworkFilter,
} from '../../../selectors/preferencesController';
import {
  selectProviderConfig,
  selectProviderType,
  selectNetworkConfigurations,
  selectChainId,
  selectNetworkClientId,
  selectIsAllNetworks,
} from '../../../selectors/networkController';
import {
  makeSelectNetworkName,
  makeSelectNetworkImageSource,
} from '../../../selectors/selectedNetworkController';
import { selectIsEvmNetworkSelected } from '../../../selectors/multichainNetworkController';
import { RootState } from '../../../reducers';
import { Dispatch } from 'redux';

const Stack = createStackNavigator();

interface ShowTransactionNotificationArgs {
  autodismiss?: boolean;
  transaction: any;
  status: string;
}

interface ShowSimpleNotificationArgs {
  autodismiss?: boolean;
  title: string;
  description: string;
  status?: string;
  id?: string;
}

interface MainProps {
  navigation: any;
  showTransactionNotification: (args: ShowTransactionNotificationArgs) => void;
  showSimpleNotification: (args: ShowSimpleNotificationArgs) => void;
  hideCurrentNotification: () => void;
  removeNotificationById: (id: string) => void;
  showIncomingTransactionsNetworks: Record<string, boolean>;
  providerType: string;
  setInfuraAvailabilityBlocked: () => void;
  setInfuraAvailabilityNotBlocked: () => void;
  removeNotVisibleNotifications: () => void;
  chainId: string;
  backUpSeedphraseVisible: boolean;
  networkClientId: string;
  networkConfigurations: Record<string, any>;
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },
    loader: {
      backgroundColor: colors.background.default,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

const Main: React.FC<MainProps> = (props) => {
  const [forceReload, setForceReload] = useState(false);
  const [showDeprecatedAlert, setShowDeprecatedAlert] = useState(true);
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const backgroundMode = useRef(false);
  const locale = useRef('en');
  const removeConnectionStatusListener = useRef<(() => void) | undefined>();


  const { connectionChangeHandler } = useConnectionHandler(props.navigation);

  const removeNotVisibleNotifications = props.removeNotVisibleNotifications;

  const { chainId, networkClientId, showIncomingTransactionsNetworks } = props;

  useEffect(() => {
    if (DEPRECATED_NETWORKS.includes(props.chainId as any)) {
      setShowDeprecatedAlert(true);
    } else {
      setShowDeprecatedAlert(false);
    }
  }, [props.chainId]);

  useEffect(() => {
    stopIncomingTransactionPolling();
    startIncomingTransactionPolling();
  }, [
    chainId,
    networkClientId,
    showIncomingTransactionsNetworks,
    props.networkConfigurations,
  ]);

  const checkInfuraAvailability = useCallback(async () => {
    props.setInfuraAvailabilityNotBlocked();
  }, [
    props.setInfuraAvailabilityNotBlocked,
  ]);

  const handleAppStateChange = useCallback(
    (appState: string) => {
      const newModeIsBackground = appState === 'background';

      if (backgroundMode.current && !newModeIsBackground) {
        BackgroundTimer.stop();
      }

      backgroundMode.current = newModeIsBackground;

      if (backgroundMode.current) {
        removeNotVisibleNotifications();

        BackgroundTimer.runBackgroundTimer(async () => {
          await updateIncomingTransactions();
        }, AppConstants.TX_CHECK_BACKGROUND_FREQUENCY);
      }
    },
    [backgroundMode, removeNotVisibleNotifications],
  );

  const initForceReload = () => {
    setForceReload(true);
    setTimeout(() => {
      setForceReload(false);
    }, 1000);
  };

  const renderLoader = () => (
    <View style={styles.loader}>
      <ActivityIndicator size="small" />
    </View>
  );
  const skipAccountModalSecureNow = () => {
    props.navigation.navigate(Routes.SET_PASSWORD_FLOW.ROOT, {
      screen: Routes.SET_PASSWORD_FLOW.MANUAL_BACKUP_STEP_1,
      params: { backupFlow: true },
    });
  };

  const navigation = useNavigation();

  const toggleRemindLater = () => {
    props.navigation.navigate(Routes.MODAL.ROOT_MODAL_FLOW, {
      screen: Routes.SHEET.SKIP_ACCOUNT_SECURITY_MODAL,
      params: {
        onConfirm: () => navigation.goBack(),
        onCancel: skipAccountModalSecureNow,
      },
    });
  };

  const providerConfig = useSelector(selectProviderConfig);
  const networkConfigurations = useSelector(selectNetworkConfigurations);
  const selectNetworkName = makeSelectNetworkName();
  const selectNetworkImageSource = makeSelectNetworkImageSource();
  const networkName = useSelector(selectNetworkName);
  const isEvmSelected = useSelector(selectIsEvmNetworkSelected);
  const previousProviderConfig = useRef<any>(undefined);
  const previousNetworkConfigurations = useRef<any>(undefined);
  const { toastRef } = useContext(ToastContext);
  const networkImage = useSelector(selectNetworkImageSource);

  const isAllNetworks = useSelector(selectIsAllNetworks);
  const tokenNetworkFilter = useSelector(selectTokenNetworkFilter);

  const hasNetworkChanged = useCallback(
    (chainId: string, previousConfig: any, isEvmSelected: boolean) => {
      if (!previousConfig) return false;

      return isEvmSelected
        ? chainId !== previousConfig.chainId ||
            providerConfig.type !== previousConfig.type
        : chainId !== previousConfig.chainId;
    },
    [providerConfig.type],
  );

  useEffect(() => {
    if (
      hasNetworkChanged(chainId, previousProviderConfig.current, isEvmSelected)
    ) {
      if (isPortfolioViewEnabled()) {
        const { PreferencesController } = Engine.context;
        if (Object.keys(tokenNetworkFilter).length === 1) {
          PreferencesController.setTokenNetworkFilter({
            [chainId]: true,
          });
        } else {
          PreferencesController.setTokenNetworkFilter({
            ...tokenNetworkFilter,
            [chainId]: true,
          } as Record<string, boolean>);
        }
      }
      toastRef?.current?.showToast({
        variant: ToastVariants.Network,
        labelOptions: [
          {
            label: `${networkName} `,
            isBold: true,
          },
          { label: strings('toast.now_active') },
        ],
      } as any);
    }
    previousProviderConfig.current = !isEvmSelected
      ? { chainId }
      : providerConfig;
  }, [
    providerConfig,
    networkName,
    networkImage,
    toastRef,
    chainId,
    isEvmSelected,
    hasNetworkChanged,
    isAllNetworks,
    tokenNetworkFilter,
  ]);

  useEffect(() => {

    const currentNetworkValues = Object.values(networkConfigurations);
    const previousNetworkValues = Object.values(
      previousNetworkConfigurations.current ?? {},
    );

    if (
      previousNetworkValues.length &&
      currentNetworkValues.length !== previousNetworkValues.length
    ) {
      const newNetwork = currentNetworkValues.find(
        (network: any) => !previousNetworkValues.includes(network),
      );
      const deletedNetwork = previousNetworkValues.find(
        (network: any) => !currentNetworkValues.includes(network),
      );

      toastRef?.current?.showToast({
        variant: ToastVariants.Plain,
        labelOptions: [
          {
            label: `${
              ((newNetwork as any)?.name || (deletedNetwork as any)?.name) ??
              strings('asset_details.network')
            } `,
            isBold: true,
          },
          {
            label: deletedNetwork
              ? strings('toast.network_removed')
              : strings('toast.network_added'),
          },
        ],
      } as any);
    }
    previousNetworkConfigurations.current = networkConfigurations;
  }, [networkConfigurations, networkName, networkImage, toastRef]);


  useEffect(() => {
    removeNotVisibleNotifications();
  }, [removeNotVisibleNotifications]);

  useEffect(() => {
    const appStateListener = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    setTimeout(() => {
      NotificationManager.init({
        navigation: props.navigation,
        showTransactionNotification: props.showTransactionNotification,
        hideCurrentNotification: props.hideCurrentNotification,
        showSimpleNotification: props.showSimpleNotification,
        removeNotificationById: props.removeNotificationById,
      });
      checkInfuraAvailability();
      removeConnectionStatusListener.current = NetInfo.addEventListener(
        connectionChangeHandler as any,
      );
    }, 1000);

    return function cleanup() {
      appStateListener.remove();
      removeConnectionStatusListener.current &&
        removeConnectionStatusListener.current();
    };
  }, [connectionChangeHandler]);


  const openDeprecatedNetworksArticle = () => {
    Linking.openURL(GOERLI_DEPRECATED_ARTICLE);
  };

  const renderDeprecatedNetworkAlert = (chainId: string, backUpSeedphraseVisible: boolean) => {
    if (DEPRECATED_NETWORKS.includes(chainId as any) && showDeprecatedAlert) {
      if ((NETWORKS_CHAIN_ID as any).MUMBAI === chainId) {
        return (
          <WarningAlert
            text={strings('networks.network_deprecated_title')}
            dismissAlert={() => setShowDeprecatedAlert(false)}
            precedentAlert={backUpSeedphraseVisible}
          />
        );
      }
      return (
        <WarningAlert
          text={strings('networks.deprecated_goerli')}
          dismissAlert={() => setShowDeprecatedAlert(false)}
          onPressLearnMore={openDeprecatedNetworksArticle}
          precedentAlert={backUpSeedphraseVisible}
        />
      );
    }
  };

  return (
    <React.Fragment>
      <View style={styles.flex}>
        {!forceReload ? (
          <MainNavigator {...(props as any)} />
        ) : (
          renderLoader()
        )}
        <GlobalAlert />
        <FadeOutOverlay />
        <Notification {...(props as any)} />
        <BackupAlert
          onDismiss={toggleRemindLater}
          {...(props as any)}
        />
        {renderDeprecatedNetworkAlert(
          props.chainId,
          props.backUpSeedphraseVisible,
        )}
        <ProtectYourWalletModal {...(props as any)} />
      </View>
    </React.Fragment>
  );
};

const mapStateToProps = (state: RootState) => ({
  showIncomingTransactionsNetworks:
    selectShowIncomingTransactionNetworks(state),
  providerType: selectProviderType(state),
  chainId: selectChainId(state),
  networkClientId: selectNetworkClientId(state),
  backUpSeedphraseVisible: (state as any).user?.backUpSeedphraseVisible || false,
  networkConfigurations: selectNetworkConfigurations(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  showTransactionNotification: (args: ShowTransactionNotificationArgs) =>
    dispatch(showTransactionNotification(args as any)),
  showSimpleNotification: (args: ShowSimpleNotificationArgs) => dispatch(showSimpleNotification(args as any)),
  hideCurrentNotification: () => dispatch(hideCurrentNotification()),
  removeNotificationById: (id: string) => dispatch(removeNotificationById(id)),
  setInfuraAvailabilityBlocked: () => dispatch(setInfuraAvailabilityBlocked()),
  setInfuraAvailabilityNotBlocked: () =>
    dispatch(setInfuraAvailabilityNotBlocked()),
  removeNotVisibleNotifications: () =>
    dispatch(removeNotVisibleNotifications()),
});

const ConnectedMain = connect(mapStateToProps, mapDispatchToProps)(Main);

const MainFlow: React.FC = () => (
  <Stack.Navigator
    initialRouteName={'Main'}
    mode={'modal'}
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name={'Main'} component={ConnectedMain} />
    <Stack.Screen
      name={'ReviewModal'}
      component={ReviewModal}
      options={{ animationEnabled: false }}
    />
  </Stack.Navigator>
);

export default MainFlow;
