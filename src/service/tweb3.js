import {IceteaWeb3} from '@iceteachain/web3';
import {APP_RPC, APP_CONTRACT, APP_WS_RPC, APP_HTTP_RPC} from '@env';

const instances = {};
const contracts = {};

export const getWeb3 = (url = APP_RPC) => {
  if (!instances[url]) {
    instances[url] = new IceteaWeb3(APP_RPC);
  }
  return instances[url];
};

export const getWsWeb3 = () => getWeb3(APP_WS_RPC);
export const getHttpWeb3 = () => getWeb3(APP_HTTP_RPC);

export const getContract = (address = APP_CONTRACT) => {
  if (!contracts[address]) {
    contracts[address] = getWeb3().contract(address);
  }
  return contracts[address];
};

export const getAliasContract = () => getContract('system.alias');
export const getDidContract = () => getContract('system.did');

export function callPure(funcName, params, opts = {}) {
  return callReadOrPure(funcName, params, 'callPureContractMethod', opts);
}
export function callView(funcName, params, opts = {}) {
  return callReadOrPure(funcName, params, 'callReadonlyContractMethod', opts);
}
function callReadOrPure(funcName, params, method, opts = {}) {
  return getWeb3()[method](opts.ct || APP_CONTRACT, funcName, params || []);
}

export async function sendTxUtil(funcName, params, opts = {}) {
  // getWeb3().wallet.createAccount();
  const ct = getContract(opts.ct);
  const sendType = opts.sendType || 'sendCommit';

  const result = await ct.methods[funcName](...(params || []))[sendType]({
    from: opts.address,
    signers: opts.tokenAddress,
  });
  return result;
}

// export async function getPastEvents(eventName, conditions, options) {
//   const {txs} = await getWeb3().getPastEvents(eventName, conditions, options);
//   let tx = fmtTxs(txs);
//   tx = await addTimeToTx(tx);
//   return tx;
// }

export default getWeb3;
