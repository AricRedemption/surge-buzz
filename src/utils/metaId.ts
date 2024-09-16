import CryptoJS from "crypto-js";

export function getMetaId(address: string, len = 6) {
  return CryptoJS.SHA256(address).toString().slice(0, len);
}
