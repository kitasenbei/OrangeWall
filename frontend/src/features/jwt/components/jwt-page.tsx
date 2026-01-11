import { useState, useMemo } from "react"
import { Key, AlertCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

const sampleJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

function decodeBase64Url(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/")
  const padded = base64 + "=".repeat((4 - base64.length % 4) % 4)
  return atob(padded)
}

export function JwtPage() {
  const [token, setToken] = useState(sampleJwt)

  const decoded = useMemo(() => {
    try {
      const parts = token.split(".")
      if (parts.length !== 3) throw new Error("Invalid JWT format")

      const header = JSON.parse(decodeBase64Url(parts[0]))
      const payload = JSON.parse(decodeBase64Url(parts[1]))

      let expiry = null
      if (payload.exp) {
        const expDate = new Date(payload.exp * 1000)
        expiry = { date: expDate, expired: expDate < new Date() }
      }

      return { header, payload, signature: parts[2], error: null, expiry }
    } catch (e) {
      return { header: null, payload: null, signature: null, error: (e as Error).message, expiry: null }
    }
  }, [token])

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">JWT Decoder</h1><p className="text-sm text-muted-foreground">Decode and inspect JSON Web Tokens</p></div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2"><Key className="size-4" />JWT Token</Label>
        <Textarea value={token} onChange={e => setToken(e.target.value)} className="font-mono text-sm min-h-[100px]" placeholder="Paste your JWT here..." />
      </div>

      {decoded.error ? (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="size-5 text-destructive" />
          <span className="text-destructive">{decoded.error}</span>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-red-400">Header</Label>
                <span className="text-xs text-muted-foreground">ALGORITHM & TOKEN TYPE</span>
              </div>
              <pre className="text-sm font-mono bg-muted p-3 rounded overflow-auto">{JSON.stringify(decoded.header, null, 2)}</pre>
            </div>

            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-purple-400">Payload</Label>
                <span className="text-xs text-muted-foreground">DATA</span>
              </div>
              <pre className="text-sm font-mono bg-muted p-3 rounded overflow-auto max-h-64">{JSON.stringify(decoded.payload, null, 2)}</pre>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-cyan-400">Signature</Label>
                <span className="text-xs text-muted-foreground">VERIFY SIGNATURE</span>
              </div>
              <p className="text-sm font-mono text-muted-foreground break-all">{decoded.signature}</p>
            </div>

            {decoded.expiry && (
              <div className={`border rounded-lg p-4 ${decoded.expiry.expired ? "bg-red-500/10 border-red-500/30" : "bg-green-500/10 border-green-500/30"}`}>
                <p className="text-sm font-medium">{decoded.expiry.expired ? "Expired" : "Valid"}</p>
                <p className="text-xs text-muted-foreground">Expires: {decoded.expiry.date.toLocaleString()}</p>
              </div>
            )}

            {decoded.payload && (
              <div className="bg-card border rounded-lg p-4 space-y-2">
                <Label>Common Claims</Label>
                <div className="text-sm space-y-1">
                  {decoded.payload.sub && <div className="flex justify-between"><span className="text-muted-foreground">Subject (sub)</span><span>{decoded.payload.sub}</span></div>}
                  {decoded.payload.iss && <div className="flex justify-between"><span className="text-muted-foreground">Issuer (iss)</span><span>{decoded.payload.iss}</span></div>}
                  {decoded.payload.aud && <div className="flex justify-between"><span className="text-muted-foreground">Audience (aud)</span><span>{decoded.payload.aud}</span></div>}
                  {decoded.payload.iat && <div className="flex justify-between"><span className="text-muted-foreground">Issued At (iat)</span><span>{new Date(decoded.payload.iat * 1000).toLocaleString()}</span></div>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
