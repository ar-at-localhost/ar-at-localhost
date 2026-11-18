/**
 * Extracts filename from content disposition header
 */
export const extractFileName = (contentDisposition: string) => {
  if (!contentDisposition) return;
  const star = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition)?.[1];
  if (star) return decodeURIComponent(star);
  return /filename="?([^";]+)"?/i.exec(contentDisposition)?.[1];
};

/**
 * Converts `Response` to a file
 * @param res Response
 */
export const fileTransformer = async (res: unknown) => {
  const r = res as Response;
  const c = r.clone();
  const f = new File(
    [await c.blob()],
    extractFileName(r.headers.get("content-disposition") || "") || "download",
  );

  return f;
};
