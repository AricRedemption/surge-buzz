import { environment } from "./environments";
// add current network
export const errors = {
  NO_METALET_DETECTED:
    "It appears that you do not have Metalet Wallet Extentsion installed or have not created a wallet account.",
  NO_WALLET_CONNECTED: "Please connect your wallet first.",
  NO_METALET_LOGIN: "Please log in your Metalet Account first.",
  SWITCH_NETWORK_ALERT: `Please switch to the ${
    environment.network.charAt(0).toUpperCase() + environment.network.slice(1)
  } to go on.`,
  MAX_FILE_SIZE_LIMIT: "File size cannot be greater than 200kb",
  NO_USERNAME_ALERT:
    "You need to set a username in order to post、repost and comment.",
  STILL_MEMPOOL_ALERT:
    "MetaID Init TX hasn't been confirmed yet. You can click the gray refresh button on the right to check the latest transaction confirmation status",
  METALET_LOCKED: "Metalet is locked. Please unlock it first.",
};
