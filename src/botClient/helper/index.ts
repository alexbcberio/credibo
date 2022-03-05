// @ts-expect-error NODE_ENV value is forced on scripts
const env: "development" | "production" = process.env.NODE_ENV ?? "production";

const isDevelopment = env === "development";
const isProduction = env === "production";

export { isDevelopment, isProduction };
