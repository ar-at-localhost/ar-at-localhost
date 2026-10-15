import { type KMSProviders } from "mongodb";
import { getCtx } from "./env.ts";

export const getNamespace = () => `${getCtx()}.encryption.__keyVault`;
export const getProviderName = (): keyof KMSProviders => "local";
export const getKeyAltName = () => "ar-at-localhost";
export const getKeyAltNameFormatted = () => `/${getKeyAltName()}`;

export const getKMSProvider = () => ({
  key: Buffer.from(process.env.MONGODB_ENC_KEY!, "base64"),
});
