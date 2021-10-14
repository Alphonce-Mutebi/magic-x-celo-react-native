import { Magic } from '@magic-sdk/react-native';
import Web3 from 'web3';

export const magic = new Magic('pk_live_04940F0EFB35EAE9', {
  network: {
    rpcUrl: 'https://alfajores-forno.celo-testnet.org'
  }
});

export const web3 = new Web3(magic.rpcProvider);