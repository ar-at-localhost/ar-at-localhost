import { defineCommand } from "citty";
import { getProviderName, mongooseConnect } from "lib";
import { ClientEncryption } from "mongodb";
import { getKMSProvider, getNamespace } from "lib";

export const dekCommand = defineCommand({
  meta: {
    name: "dek",
    description: "Create data encryption keys (MongoDB)",
  },

  run: async () => {
    const connection = await mongooseConnect();

    const ec = new ClientEncryption(connection.connection.getClient(), {
      keyVaultNamespace: getNamespace(),
      kmsProviders: {
        local: getKMSProvider(),
      },
    });

    const out: Record<string, string> = {};
    const targets = ["contact-email", "contact-message"];

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
