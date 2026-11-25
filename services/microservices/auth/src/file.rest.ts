import type { FastifyPluginAsync } from "fastify";
import {
  type DownloadFileQuery,
  downloadFileQuery,
  uploadFileBody,
  type UploadFileBody,
  type UserInfo,
} from "lib";
import {
  badReqErrorSchema,
  getFile,
  getUserFile,
  mkNotFoundErr,
  notFoundErrorSchema,
  okSchema,
} from "lib-server";

export const fileRest: FastifyPluginAsync = async (app) => {
  /**
   * Download a file
   */
  app.get(
    "/",
    {
      config: {
        auth: {
          strategies: "jwt",
          permissions: {
            roles: ["admin"],
          },

          opts: {
            jwt: {
              aud: "auth",
            },
          },
        },
      },

      schema: {
        querystring: downloadFileQuery,
        response: {
          400: badReqErrorSchema,
          404: notFoundErrorSchema,
        },
      },
    },
    async (req, rep) => {
      {
        const query = req.query as DownloadFileQuery;
        const user: UserInfo = (await req.getUser?.())!;
        const f = await getUserFile(`${query.path}`, user.id, true);

        const m = await f
          .getMetadata()
          .then((m) => m[0])
          .catch((e) => {
            if (e.code !== 404) {
              throw e;
            }

            return null;
          });

        if (!m) {
          const e = mkNotFoundErr("File does not exists!");
          return rep.status(e.statusCode).send(e);
        }

        const stream = f.createReadStream();
        return rep.header("content-type", m.contentType).send(stream);
      }
    },
  );

  /**
   * Upload a file
   */
  app.post(
    "/",
    {
      config: {
        auth: {
          strategies: "jwt",
          permissions: {
            roles: ["admin"],
          },
        },
      },

      schema: {
        body: uploadFileBody,
        response: {
          200: okSchema,
          400: badReqErrorSchema,
          404: notFoundErrorSchema,
        },
      },
    },
    async (req, rep) => {
      {
        const { path, content } = req.body as UploadFileBody;
        const user: UserInfo = (await req.getUser?.())!;
        const f = getFile(`users/${user.id}/${path}`);

        await f
          .getMetadata()
          .then((m) => m[0])
          .catch((e) => {
            if (e.code !== 404) {
              throw e;
            }

            return null;
          });

        await f.save(content);
        return rep.status(200).send({
          message: "File has been save successfully!",
        });
      }
    },
  );
};
