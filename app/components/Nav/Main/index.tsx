import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from 'react';

import {
  ActivityIndicator,
  AppState,
  StyleSheet,
  View,
  Linking,
  AppStateStatus,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { connect, useSelector } from 'react-redux';
import GlobalAlert from '../../UI/GlobalAlert';
import BackgroundTimer from 'react-native-background-timer';
import NotificationManager from '../../../core/NotificationManager';
import Engine from '../../../core/Engine';
import AppConstants from '../../../core/AppConstants';
import I18n, { strings } from '../../../../locales/i18n';
import FadeOutOverlay from '../../UI/FadeOutOverlay';
import BackupAlert from '../../UI/BackupAlert';
import Notification from '../../UI/Notification';
import RampOrders from '../../UI/Ramp';
import {
  showTransactionNotification,
  hideCurrentNotification,
  showSimpleNotification,
  removeNotificationById,
  removeNotVisibleNotifications,
} from '../../../actions/notification';

import ProtectYourWalletModal from '../../UI/ProtectYourWalletModal';
import MainNavigator from './MainNavigator';
import { query } from '@metamask/controller-utils';
import SwapsLiveness from '../../UI/Swaps/SwapsLiveness';

import {
  setInfuraAvailabilityBlocked,
  setInfuraAvailabilityNotBlocked,
} from '../../../actions/infuraAvailability';

import ReviewModal from '../../UI/ReviewModal';
import { useTheme } from '../../../util/theme';
import RootRPCMethodsUI from './RootRPCMethodsUI';
import {
  ToastContext,
  ToastVariants,
} from '../../../component-library/components/Toast';
import { useMinimumVersions } from '../../hooks/MinimumVersions';
import navigateTermsOfUse from '../../../util/termsOfUse/termsOfUse';
import {
  selectChainId,
  selectIsAllNetworks,
  selectNetworkClientId,
  selectNetworkConfigurations,
  selectProviderConfig,
  selectProviderType,
} from '../../../selectors/networkController';
import {
  selectNetworkName,
  selectNetworkImageSource,
} from '../../../selectors/networkInfos';
import {
  selectShowIncomingTransactionNetworks,
  selectTokenNetworkFilter,
} from '../../../selectors/preferencesController';

import useNotificationHandler from '../../../util/notifications/hooks';
import {
  DEPRECATED_NETWORKS,
  NETWORKS_CHAIN_ID,
} from '../../../constants/network';
import WarningAlert from '../../../components/UI/WarningAlert';
import { GOERLI_DEPRECATED_ARTICLE } from '../../../constants/urls';
import {
  updateIncomingTransactions,
  startIncomingTransactionPolling,
  stopIncomingTransactionPolling,
} from '../../../util/transaction-controller';
import isNetworkUiRedesignEnabled from '../../../util/networks/isNetworkUiRedesignEnabled';
import { useConnectionHandler } from '../../../util/navigation/useConnectionHandler';
import { getGlobalEthQuery } from '../../../util/networks/global-network';
import { selectIsEvmNetworkSelected } from '../../../selectors/multichainNetworkController';
import { isPortfolioViewEnabled } from '../../../util/networks';
import { useIdentityEffects } from '../../../util/identity/hooks/useIdentityEffects/useIdentityEffects';
import ProtectWalletMandatoryModal from '../../Views/ProtectWalletMandatoryModal/ProtectWalletMandatoryModal';
import InfoNetworkModal from '../../Views/InfoNetworkModal/InfoNetworkModal';
import { selectIsSeedlessPasswordOutdated } from '../../../selectors/seedlessOnboardingController';
import { Authentication } from '../../../core';
import { IconName } from '../../../component-library/components/Icons/Icon';
import Routes from '../../../constants/navigation/Routes';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useCompletedOnboardingEffect } from '../../../util/onboarding/hooks/useCompletedOnboardingEffect';

const Stack = createStackNavigator();

interface Colors {
  background: {
    default: string;
  };
}

const createStyles = (colors: Colors) =>
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

interface NotificationArgs {
  autodismiss: unknown;
  transaction: unknown;
  status: unknown;
  title: unknown;
  description: unknown;
  id: unknown;
}

interface MainProps {
  navigation: NavigationProp<ParamListBase>;
  showTransactionNotification: (args: NotificationArgs) => void;
  showSimpleNotification: (args: NotificationArgs) => void;
  hideCurrentNotification: () => void;
  removeNotificationById: (id: string) => void;
  showIncomingTransactionsNetworks: Record<string, unknown>;
  providerType: string;
  setInfuraAvailabilityBlocked: () => void;
  setInfuraAvailabilityNotBlocked: () => void;
  removeNotVisibleNotifications: () => void;
  chainId: `0x${string}`;
  backUpSeedphraseVisible: boolean;
  networkClientId: string;
  networkConfigurations: Record<string, unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Main: React.FC<MainProps> = (props) => {
  const [forceReload, setForceReload] = useState<boolean>(false);
  const [showDeprecatedAlert, setShowDeprecatedAlert] = useState<boolean>(true);
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const backgroundMode = useRef<boolean>(false);
  const locale = useRef<string>(I18n.locale);
  const removeConnectionStatusListener = useRef<(() => void) | undefined>();

  const isSeedlessPasswordOutdated = useSelector(
    selectIsSeedlessPasswordOutdated,
  );

  useEffect(() => {
    if (isSeedlessPasswordOutdated) {
      // show seedless password outdated modal and force user to lock app
      props.navigation.navigate(Routes.MODAL.ROOT_MODAL_FLOW, {
        screen: Routes.SHEET.SUCCESS_ERROR_SHEET,
        params: {
          title: strings('login.seedless_password_outdated_modal_title'),
          description: strings(
            'login.seedless_password_outdated_modal_content',
          ),
          primaryButtonLabel: strings(
            'login.seedless_password_outdated_modal_confirm',
          ),
          type: 'error',
          icon: IconName.Danger,
          isInteractable: false,
          onPrimaryButtonPress: async () => {
            await Authentication.lockApp({ locked: true });
          },
          closeOnPrimaryButtonPress: true,
        },
      });
    }
  }, [isSeedlessPasswordOutdated, props.navigation]);

  const { connectionChangeHandler } = useConnectionHandler(props.navigation);

  const handleRemoveNotVisibleNotifications = props.removeNotVisibleNotifications;
  useCompletedOnboardingEffect();
  useNotificationHandler();
  useIdentityEffects();
  useMinimumVersions();

  const { chainId, networkClientId, showIncomingTransactionsNetworks } = props;

  useEffect(() => {
    if (DEPRECATED_NETWORKS.includes(props.chainId)) {
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

  const checkInfuraAvailability = useCallback(async (): Promise<void> => {
    if (props.providerType !== 'rpc') {
      try {
        const ethQuery = getGlobalEthQuery();
        await query(ethQuery, 'blockNumber', []);
        props.setInfuraAvailabilityNotBlocked();
      } catch (e: unknown) {
        if (e instanceof Error && e.message === AppConstants.ERRORS.INFURA_BLOCKED_MESSAGE) {
          props.navigation.navigate('OfflineModeView');
          props.setInfuraAvailabilityBlocked();
        }
      }
    } else {
      props.setInfuraAvailabilityNotBlocked();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.navigation,
    props.providerType,
    props.setInfuraAvailabilityBlocked,
    props.setInfuraAvailabilityNotBlocked,
  ]);

  const handleAppStateChange = useCallback(
    (appState: AppStateStatus): void => {
      const newModeIsBackground = appState === 'background';

      // If it was in background and it's not anymore
      // we need to stop the Background timer
      if (backgroundMode.current && !newModeIsBackground) {
        BackgroundTimer.stop();
      }

      backgroundMode.current = newModeIsBackground;

      // If the app is now in background, we need to start
      // the background timer, which is less intense
      if (backgroundMode.current) {
        handleRemoveNotVisibleNotifications();

        BackgroundTimer.runBackgroundTimer(async () => {
          await updateIncomingTransactions();
        }, AppConstants.TX_CHECK_BACKGROUND_FREQUENCY);
      }
    },
    [backgroundMode, handleRemoveNotVisibleNotifications],
  );

  const initForceReload = (): void => {
    // Force unmount the webview to avoid caching problems
    setForceReload(true);
    setTimeout(() => {
      setForceReload(false);
    }, 1000);
  };

  const renderLoader = (): React.ReactElement => (
    <View style={styles.loader}>
      <ActivityIndicator size="small" />
    </View>
  );
  const skipAccountModalSecureNow = (): void => {
    props.navigation.navigate(Routes.SET_PASSWORD_FLOW.ROOT, {
      screen: Routes.SET_PASSWORD_FLOW.MANUAL_BACKUP_STEP_1,
      params: { backupFlow: true },
    });
  };

  const navigation = useNavigation();

  const toggleRemindLater = (): void => {
    props.navigation.navigate(Routes.MODAL.ROOT_MODAL_FLOW, {
      screen: Routes.SHEET.SKIP_ACCOUNT_SECURITY_MODAL,
      params: {
        onConfirm: () => navigation.goBack(),
        onCancel: skipAccountModalSecureNow,
      },
    });
  };

  /**
   * Current network
   */
  const providerConfig = useSelector(selectProviderConfig);
  const networkConfigurations = useSelector(selectNetworkConfigurations);
  const networkName = useSelector(selectNetworkName);
  const isEvmSelected = useSelector(selectIsEvmNetworkSelected);
  const previousProviderConfig = useRef<Record<string, unknown> | undefined>(undefined);
  const previousNetworkConfigurations = useRef<Record<string, unknown> | undefined>(undefined);
  const { toastRef } = useContext(ToastContext);
  const networkImage = useSelector(selectNetworkImageSource);

  const isAllNetworks = useSelector(selectIsAllNetworks);
  const tokenNetworkFilter = useSelector(selectTokenNetworkFilter);

  const hasNetworkChanged = useCallback(
    (currentChainId: `0x${string}`, previousConfig: Record<string, unknown> | undefined, currentIsEvmSelected: boolean): boolean => {
      if (!previousConfig) return false;

      return currentIsEvmSelected
        ? currentChainId !== previousConfig.chainId ||
            providerConfig.type !== previousConfig.type
        : currentChainId !== previousConfig.chainId;
    },
    [providerConfig.type],
  );

  // Show network switch confirmation.
  useEffect(() => {
    if (
      hasNetworkChanged(chainId, previousProviderConfig.current, isEvmSelected)
    ) {
      //set here token network filter if portfolio view is enabled
      if (isPortfolioViewEnabled()) {
        const { PreferencesController } = Engine.context;
        if (Object.keys(tokenNetworkFilter).length === 1) {
          PreferencesController.setTokenNetworkFilter({
            [chainId]: true,
          });
        } else {
          PreferencesController.setTokenNetworkFilter({
            ...(tokenNetworkFilter as unknown as Record<string, boolean>),
            [chainId]: true,
          });
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
      } as never);
    }
    previousProviderConfig.current = !isEvmSelected
      ? { chainId }
      : (providerConfig as unknown as Record<string, unknown>);
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

  // Show add network confirmation.
  useEffect(() => {
    if (!isNetworkUiRedesignEnabled()) return;

    // Memoized values to avoid recalculations
    const currentNetworkValues = Object.values(networkConfigurations);
    const previousNetworkValues = Object.values(
      previousNetworkConfigurations.current ?? {},
    );

    if (
      previousNetworkValues.length &&
      currentNetworkValues.length !== previousNetworkValues.length
    ) {
      // Find the newly added network
      const newNetwork = currentNetworkValues.find(
        (network) => !previousNetworkValues.includes(network),
      ) as { name?: string } | undefined;
      const deletedNetwork = previousNetworkValues.find(
        (network) => !currentNetworkValues.includes(network as never),
      ) as { name?: string } | undefined;

      toastRef?.current?.showToast({
        variant: ToastVariants.Plain,
        labelOptions: [
          {
            label: `${
              (newNetwork?.name || deletedNetwork?.name) ??
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
      } as never);
    }
    previousNetworkConfigurations.current = networkConfigurations as Record<string, unknown>;
  }, [networkConfigurations, networkName, networkImage, toastRef]);

  useEffect(() => {
    if (locale.current !== I18n.locale) {
      locale.current = I18n.locale;
      initForceReload();
      return;
    }
  });

  // Remove all notifications that aren't visible
  useEffect(() => {
    handleRemoveNotVisibleNotifications();
  }, [handleRemoveNotVisibleNotifications]);

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
        connectionChangeHandler as never,
      );
    }, 1000);

    return function cleanup() {
      appStateListener.remove();
      removeConnectionStatusListener.current &&
        removeConnectionStatusListener.current();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionChangeHandler]);

  const termsOfUse = useCallback(async (): Promise<void> => {
    if (props.navigation) {
      await navigateTermsOfUse(props.navigation.navigate);
    }
  }, [props.navigation]);

  useEffect(() => {
    termsOfUse();
  }, [termsOfUse]);

  const openDeprecatedNetworksArticle = (): void => {
    Linking.openURL(GOERLI_DEPRECATED_ARTICLE);
  };

  const renderDeprecatedNetworkAlert = (currentChainId: `0x${string}`, backUpSeedphraseVisible: boolean): React.ReactElement | undefined => {
    if (DEPRECATED_NETWORKS.includes(currentChainId) && showDeprecatedAlert) {
      if (NETWORKS_CHAIN_ID.MUMBAI === currentChainId) {
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
          <MainNavigator {...(props as unknown as Record<string, unknown>)} />
        ) : (
          renderLoader()
        )}
        <GlobalAlert />
        <FadeOutOverlay />
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Notification {...(props as any)} />
        <RampOrders />
        <SwapsLiveness />
        <BackupAlert
          onDismiss={toggleRemindLater}
          navigation={props.navigation}
        />
        {renderDeprecatedNetworkAlert(
          props.chainId,
          props.backUpSeedphraseVisible,
        )}
        <ProtectYourWalletModal navigation={props.navigation} />
        <InfoNetworkModal />
        <RootRPCMethodsUI navigation={props.navigation} />
        <ProtectWalletMandatoryModal />
      </View>
    </React.Fragment>
  );
};


// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RootState = any;

const mapStateToProps = (state: RootState) => ({
  showIncomingTransactionsNetworks:
    selectShowIncomingTransactionNetworks(state),
  providerType: selectProviderType(state),
  chainId: selectChainId(state),
  networkClientId: selectNetworkClientId(state),
  backUpSeedphraseVisible: state.user.backUpSeedphraseVisible,
  networkConfigurations: selectNetworkConfigurations(state),
});

const mapDispatchToProps = (dispatch: (action: { type: string; [key: string]: unknown }) => void) => ({
  showTransactionNotification: (args: NotificationArgs) =>
    dispatch(showTransactionNotification(args)),
  showSimpleNotification: (args: NotificationArgs) => dispatch(showSimpleNotification(args)),
  hideCurrentNotification: () => dispatch(hideCurrentNotification()),
  removeNotificationById: (id: string) => dispatch(removeNotificationById(id)),
  setInfuraAvailabilityBlocked: () => dispatch(setInfuraAvailabilityBlocked()),
  setInfuraAvailabilityNotBlocked: () =>
    dispatch(setInfuraAvailabilityNotBlocked()),
  removeNotVisibleNotifications: () =>
    dispatch(removeNotVisibleNotifications()),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ConnectedMain = connect(mapStateToProps, mapDispatchToProps)(Main as any);

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
