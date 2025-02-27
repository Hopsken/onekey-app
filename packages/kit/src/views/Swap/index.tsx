import React, { useEffect } from 'react';

import { Box } from '@onekeyhq/components';

import backgroundApiProxy from '../../background/instance/backgroundApiProxy';
import { useManageTokens } from '../../hooks';
import { useActiveWalletAccount } from '../../hooks/redux';
import { reset } from '../../store/reducers/swap';

import { useSwapActionHandlers, useSwapEnabled } from './hooks/useSwap';
import { refs } from './refs';
import SwapContent from './SwapContent';
import SwapHeader from './SwapHeader';
import SwapTransactions from './SwapTransactions';
import SwapUpdator from './SwapUpdator';

const Swap = () => {
  const { network, account } = useActiveWalletAccount();
  const { nativeToken } = useManageTokens();
  const { onSelectToken } = useSwapActionHandlers();
  const isSwapEnabled = useSwapEnabled();
  useEffect(() => {
    backgroundApiProxy.dispatch(reset());
  }, [account]);
  useEffect(() => {
    backgroundApiProxy.dispatch(reset());
    if (!isSwapEnabled) {
      return;
    }
    if (nativeToken) {
      onSelectToken(nativeToken, 'INPUT');
    } else {
      backgroundApiProxy.serviceToken.fetchAccountTokens().then((tokens) => {
        const native = tokens?.filter((token) => !token.tokenIdOnNetwork)[0];
        if (native && refs.inputIsDirty === false) {
          onSelectToken(native, 'INPUT');
        }
      });
    }
    return () => {
      refs.inputIsDirty = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network]);
  return (
    <Box>
      <SwapHeader />
      <SwapTransactions />
      <SwapContent />
      <SwapUpdator />
    </Box>
  );
};

export default Swap;
