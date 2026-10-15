import { type KMSProviders } from "mongodb";

export const getNamespace = () => "encryption.__keys";
export const getProviderName = (): keyof KMSProviders => "local";

export const getLocalKMSProvider = () => ({
  key: Buffer.from(process.env.MONGODB_ENC_KEY!, "base64"),
});
