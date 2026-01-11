import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { getSession, signIn, signOut, isDevMode, type AuthUser } from "@/services/auth"
import { api } from "@/lib/api"

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      // Dev mode: auto-authenticate
      if (isDevMode) {
        setUser({ email: "dev@localhost", sub: "dev-user-123" })
        api.setToken("dev-token")
        setIsLoading(false)
        return
      }

      const session = await getSession()
      if (session) {
        const payload = session.getIdToken().payload
        const token = session.getIdToken().getJwtToken()
        api.setToken(token)
        setUser({
          email: payload.email,
          sub: payload.sub,
        })
      }
    } catch {
      setUser(null)
      api.setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  async function login(email: string, password: string) {
    const { user: authUser, token } = await signIn(email, password)
    api.setToken(token)
    setUser(authUser)
  }

  function logout() {
    signOut()
    api.setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
