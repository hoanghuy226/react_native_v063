import {
  toKeyString as codecToKeyString,
  isAddressType as codecIsAddressType,
} from '@iceteachain/common/src/codec';
import {toPubKeyAndAddress} from '@iceteachain/common/src/ecc';
import {AccountType} from '@iceteachain/common/src/enum';
import HDKey from 'hdkey';
import bip39 from 'react-native-bip39';

import {getAliasContract, getDidContract} from '../service/tweb3';

// import {LogTron} from './log';

const paths = 'm’/44’/349’/0’/0';
const alias = getAliasContract().methods;
const did = getDidContract().methods;

export const acc = {
  createAccountWithMneomnic() {
    return acc.getAccountFromMneomnic();
  },
  getPrivateKeyFromMnemonic(mnemonic, index = 0) {
    const hdkey = acc.getHdKeyFromMnemonic(mnemonic);
    const {privateKey} = hdkey.deriveChild(index);
    return codecToKeyString(privateKey);
  },
  getHdKeyFromMnemonic(mnemonic) {
    if (!acc.isMnemonic(mnemonic)) {
      throw new Error('wrong mnemonic format');
    }
    const seed = bip39.mnemonicToSeed(mnemonic);
    const hdkey = HDKey.fromMasterSeed(seed).derive(paths);
    return hdkey;
  },
  async getAccountFromMneomnic(mnemonic, type = AccountType.BANK_ACCOUNT) {
    let pkey;
    let found;
    let resp;

    if (!mnemonic) {
      mnemonic = await bip39.generateMnemonic(128);
    }
    const hdkey = acc.getHdKeyFromMnemonic(mnemonic);
    for (let i = 0; !found; i++) {
      if (i > 100) {
        // there must be something wrong, because the ratio of regular account is 50%
        throw new Error('Too many tries deriving regular account from seed.');
      }
      pkey = codecToKeyString(hdkey.deriveChild(i).privateKey);
      const {address, publicKey} = toPubKeyAndAddress(pkey);
      found = codecIsAddressType(address, type);
      resp = {mnemonic, privateKey: pkey, publicKey, address};
    }
    return resp;
  },
  isMnemonic(mnemonic) {
    return !!bip39.validateMnemonic(mnemonic);
  },
  isAliasExists(value) {
    return alias.resolve(`account.${value}`).call();
  },
  registerAlias(value, address) {
    value = value.toLowerCase();
    return alias.register(value, address).sendCommit({from: address});
  },
  getAlias(address) {
    return alias
      .byAddress(address)
      .call()
      .then(() => {
        return alias ? alias.replace('account.', '') : alias;
      });
  },
  setTagsInfo(tags, address) {
    return did.setTag(address, tags).sendCommit({from: address});
  },
  getTagsInfo(address) {
    return did.query(address).call();
  },
  setAliasAndTags(value, tags, address) {
    return Promise.all([
      acc.registerAlias(value, address),
      acc.setTagsInfo(tags, address),
    ]);
  },
  getAliasAndTags(address) {
    return Promise.all([acc.getAlias(address), acc.getTagsInfo(address)]);
  },
};
