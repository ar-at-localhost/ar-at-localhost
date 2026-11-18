import { Storage } from "@google-cloud/storage";

const { TF_VAR_project_name: project } = process.env;

export const getStorage = () => {
  return new Storage({
    projectId: project,
  });
};

export const getBucket = () => getStorage().bucket(`${project}-server`);
export const getFile = (uri: string) => getBucket().file(uri);
