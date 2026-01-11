import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

type Permission = { read: boolean; write: boolean; execute: boolean }

export function ChmodPage() {
  const [owner, setOwner] = useState<Permission>({ read: true, write: true, execute: true })
  const [group, setGroup] = useState<Permission>({ read: true, write: false, execute: true })
  const [others, setOthers] = useState<Permission>({ read: true, write: false, execute: false })
  const [copied, setCopied] = useState(false)

  const toNum = (p: Permission) => (p.read ? 4 : 0) + (p.write ? 2 : 0) + (p.execute ? 1 : 0)
  const toSymbolic = (p: Permission) => (p.read ? "r" : "-") + (p.write ? "w" : "-") + (p.execute ? "x" : "-")

  const numeric = `${toNum(owner)}${toNum(group)}${toNum(others)}`
  const symbolic = `${toSymbolic(owner)}${toSymbolic(group)}${toSymbolic(others)}`

  const copy = () => {
    navigator.clipboard.writeText(`chmod ${numeric}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const PermissionGroup = ({ label, perm, setPerm }: { label: string; perm: Permission; setPerm: (p: Permission) => void }) => (
    <div className="bg-card border rounded-lg p-4">
      <Label className="mb-3 block">{label}</Label>
      <div className="flex gap-4">
        {(["read", "write", "execute"] as const).map(p => (
          <label key={p} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={perm[p]} onChange={e => setPerm({ ...perm, [p]: e.target.checked })} className="size-4" />
            <span className="text-sm capitalize">{p}</span>
          </label>
        ))}
      </div>
      <div className="mt-2 text-sm text-muted-foreground font-mono">{toSymbolic(perm)} = {toNum(perm)}</div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Chmod Calculator</h1><p className="text-sm text-muted-foreground">Calculate Unix file permissions</p></div>
        <Button onClick={copy}>{copied ? <Check className="size-4 mr-2 text-green-500" /> : <Copy className="size-4 mr-2" />}Copy Command</Button>
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center">
        <div className="text-4xl font-mono font-bold mb-2">{numeric}</div>
        <div className="text-lg font-mono text-muted-foreground">-{symbolic}</div>
        <div className="mt-2 text-sm text-muted-foreground">chmod {numeric} filename</div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <PermissionGroup label="Owner (User)" perm={owner} setPerm={setOwner} />
        <PermissionGroup label="Group" perm={group} setPerm={setGroup} />
        <PermissionGroup label="Others (World)" perm={others} setPerm={setOthers} />
      </div>

      <div className="bg-muted rounded-lg p-4 text-sm space-y-1">
        <p className="font-medium">Reference</p>
        <p className="text-muted-foreground">Read (r) = 4, Write (w) = 2, Execute (x) = 1</p>
        <p className="text-muted-foreground">Common: 755 (rwxr-xr-x), 644 (rw-r--r--), 777 (rwxrwxrwx)</p>
      </div>
    </div>
  )
}
