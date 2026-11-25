import { Storage } from "@google-cloud/storage";

const { TF_VAR_project_name: project } = process.env;

export const getStorage = () => {
  return new Storage({
    projectId: project,
  });
};

export const getBucket = () => getStorage().bucket(`${project}-server`);
export const getFile = (uri: string) => getBucket().file(uri);

export const getUserFile = async (uri: string, user: number, template?: boolean) => {
  const path = `users/${user}/${uri}`;
  const file = getFile(path);
  const [exists] = await file.exists();

  if (!exists && template) {
    await getFile(`templates/${uri}`).copy(path);
  }

  return file;
};
