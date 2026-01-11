export const authConfig = {
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || "",
  clientId: import.meta.env.VITE_COGNITO_CLIENT_ID || "",
  region: import.meta.env.VITE_AWS_REGION || "us-east-1",
}

// Dev mode: bypass auth when Cognito isn't configured
export const isDevMode = !authConfig.userPoolId || !authConfig.clientId
