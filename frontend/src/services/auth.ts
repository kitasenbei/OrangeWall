import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
} from "amazon-cognito-identity-js"
import { authConfig, isDevMode } from "@/config/auth"

export interface AuthUser {
  email: string
  sub: string
}

// Dev mode mock user
const devUser: AuthUser = {
  email: "dev@localhost",
  sub: "dev-user-123",
}

// Only create user pool if we have valid config
const userPool = isDevMode
  ? null
  : new CognitoUserPool({
      UserPoolId: authConfig.userPoolId,
      ClientId: authConfig.clientId,
    })

export function getCurrentUser(): CognitoUser | null {
  if (isDevMode) return null
  return userPool?.getCurrentUser() || null
}

export function getSession(): Promise<CognitoUserSession | null> {
  if (isDevMode) return Promise.resolve(null)

  return new Promise((resolve) => {
    const user = getCurrentUser()
    if (!user) {
      resolve(null)
      return
    }

    user.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session?.isValid()) {
        resolve(null)
        return
      }
      resolve(session)
    })
  })
}

export function getIdToken(): Promise<string | null> {
  if (isDevMode) return Promise.resolve("dev-token")
  return getSession().then((session) => {
    return session?.getIdToken().getJwtToken() || null
  })
}

export interface SignInResult {
  user: AuthUser
  token: string
}

export function signIn(email: string, password: string): Promise<SignInResult> {
  // Dev mode: accept any credentials
  if (isDevMode) {
    return Promise.resolve({ user: { ...devUser, email }, token: "dev-token" })
  }

  return new Promise((resolve, reject) => {
    if (!userPool) {
      reject(new Error("Auth not configured"))
      return
    }

    const user = new CognitoUser({
      Username: email,
      Pool: userPool,
    })

    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    })

    user.authenticateUser(authDetails, {
      onSuccess: (session) => {
        const payload = session.getIdToken().payload
        resolve({
          user: {
            email: payload.email,
            sub: payload.sub,
          },
          token: session.getIdToken().getJwtToken(),
        })
      },
      onFailure: (err) => {
        reject(err)
      },
      newPasswordRequired: () => {
        reject(new Error("New password required"))
      },
    })
  })
}

export function signOut(): void {
  if (isDevMode) return
  const user = getCurrentUser()
  if (user) {
    user.signOut()
  }
}

export function forgotPassword(email: string): Promise<void> {
  if (isDevMode) return Promise.resolve()

  return new Promise((resolve, reject) => {
    if (!userPool) {
      reject(new Error("Auth not configured"))
      return
    }

    const user = new CognitoUser({
      Username: email,
      Pool: userPool,
    })

    user.forgotPassword({
      onSuccess: () => resolve(),
      onFailure: (err) => reject(err),
    })
  })
}

export function confirmPassword(
  email: string,
  code: string,
  newPassword: string
): Promise<void> {
  if (isDevMode) return Promise.resolve()

  return new Promise((resolve, reject) => {
    if (!userPool) {
      reject(new Error("Auth not configured"))
      return
    }

    const user = new CognitoUser({
      Username: email,
      Pool: userPool,
    })

    user.confirmPassword(code, newPassword, {
      onSuccess: () => resolve(),
      onFailure: (err) => reject(err),
    })
  })
}

export { isDevMode }
