/**
 * Check list of strings agains process.env
 */
export const assertEnvVariables = (envs: string[]) => {
  envs.forEach((env) => {
    if (!process.env[env]) {
      throw new Error(`${env} env variable must be defined`);
    }
  });
};
