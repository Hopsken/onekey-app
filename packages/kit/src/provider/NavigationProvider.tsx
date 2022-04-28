import React, { useMemo } from 'react';

import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createURL } from 'expo-linking';

import { Box, DialogManager, useThemeValue } from '@onekeyhq/components';
import Toast from '@onekeyhq/components/src/Toast/Custom';
import platformEnv from '@onekeyhq/shared/src/platformEnv';

import Navigator, { navigationRef } from '../navigator';

const prefix = createURL('/');

const NavigationApp = () => {
  const linking = {
    prefixes: [prefix],
  };
  let enableLinkingRoute =
    platformEnv.isDev || platformEnv.isNative || platformEnv.isExtension;
  // firefox popup window resize issue
  if (platformEnv.isExtensionUiPopup && platformEnv.isFirefox) {
    enableLinkingRoute = false;
  }

  const [bgColor, textColor, bgDefault] = useThemeValue([
    'surface-subdued',
    'text-default',
    'background-default',
  ]);

  const navigationTheme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: platformEnv.isAndroid ? bgDefault : 'transparent',
        card: bgColor,
        text: textColor,
      },
    }),
    [bgColor, textColor, bgDefault],
  );

  return (
    <>
      <NavigationContainer
        ref={navigationRef}
        theme={navigationTheme}
        linking={enableLinkingRoute ? linking : undefined}
      >
        <Navigator />
      </NavigationContainer>
      <Box
        overflow="hidden"
        pointerEvents="none"
        position="absolute"
        top={0}
        bottom={0}
        left={0}
        right={0}
      >
        <Toast bottomOffset={60} />
        <DialogManager.Holder />
      </Box>
    </>
  );
};

NavigationApp.displayName = 'NavigationApp';

export default NavigationApp;
