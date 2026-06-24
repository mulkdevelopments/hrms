/** @type {import('@expo/config').ExpoConfig} */
module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    apiEnvironment: process.env.EXPO_PUBLIC_API_ENV === "production" ? "production" : "local",
    localApiHost: process.env.EXPO_PUBLIC_LOCAL_API_HOST ?? config.extra?.localApiHost,
  },
});
