import { defineCommand } from "citty";
import { getProviderName, mongooseConnect } from "lib";
import { ClientEncryption } from "mongodb";
import { getLocalKMSProvider, getNamespace } from "lib";

export const dekCommand = defineCommand({
  meta: {
    name: "dek",
    description: "Create data encryption keys (MongoDB)",
  },

  run: async () => {
    const namespace = getNamespace();
    const connection = await mongooseConnect();

    const ec = new ClientEncryption(connection.connection.getClient(), {
      keyVaultNamespace: namespace,
      kmsProviders: {
        local: getLocalKMSProvider(),
      },
    });

    const out: Record<string, string> = {};
    const targets = ["contact-email", "contact-message"].map((i) => `${namespace}-${i}`);

    for (const target of targets) {
      const existing = await ec.getKeyByAltName(target);
      if (existing) {
        out[target] = existing._id?.toString();
      } else {
        out[target] = await ec
          .createDataKey(getProviderName(), {
            keyAltNames: [target],
          })
          .then((res) => res.toString());
      }
    }

    console.log(out);
  },
});
