import Web3 from 'web3';

declare global {
  interface Window {
    web3: any;
    ethereum: any;
  }
}
window.ethereum.enable();

// injecting the provider in the browser web3 into the Web3(latest) in the project
const web3 = new Web3(window.web3.currentProvider);

export default web3;
