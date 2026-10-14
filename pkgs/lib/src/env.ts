export const getPort = () => {
  return parseInt(process.env.PORT!);
};

export const getBaseURL = () => {
  const url = new URL(process.env.SRV_URL!);
  url.port = getPort().toString();
  return url.toString().replace(/\/$/, "");
};
