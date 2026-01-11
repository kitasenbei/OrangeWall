import { useState } from "react"
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Item { id: string; name: string; value: number }

export function NetworthPage() {
  const [assets, setAssets] = useState<Item[]>([
    { id: "1", name: "Checking Account", value: 5000 },
    { id: "2", name: "Savings Account", value: 15000 },
    { id: "3", name: "Investment Portfolio", value: 25000 },
    { id: "4", name: "Car", value: 12000 },
  ])
  const [liabilities, setLiabilities] = useState<Item[]>([
    { id: "1", name: "Credit Card", value: 2000 },
    { id: "2", name: "Student Loans", value: 18000 },
  ])
  const [newAsset, setNewAsset] = useState({ name: "", value: "" })
  const [newLiability, setNewLiability] = useState({ name: "", value: "" })

  const totalAssets = assets.reduce((s, a) => s + a.value, 0)
  const totalLiabilities = liabilities.reduce((s, l) => s + l.value, 0)
  const netWorth = totalAssets - totalLiabilities

  const addAsset = () => {
    if (newAsset.name && newAsset.value) {
      setAssets([...assets, { id: Date.now().toString(), name: newAsset.name, value: parseFloat(newAsset.value) }])
      setNewAsset({ name: "", value: "" })
    }
  }

  const addLiability = () => {
    if (newLiability.name && newLiability.value) {
      setLiabilities([...liabilities, { id: Date.now().toString(), name: newLiability.name, value: parseFloat(newLiability.value) }])
      setNewLiability({ name: "", value: "" })
    }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">Net Worth</h1><p className="text-sm text-muted-foreground">Track your financial health</p></div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
          <TrendingUp className="size-5 mx-auto mb-2 text-green-500" />
          <p className="text-sm text-muted-foreground">Assets</p>
          <p className="text-2xl font-bold text-green-500">${totalAssets.toLocaleString()}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
          <TrendingDown className="size-5 mx-auto mb-2 text-red-500" />
          <p className="text-sm text-muted-foreground">Liabilities</p>
          <p className="text-2xl font-bold text-red-500">${totalLiabilities.toLocaleString()}</p>
        </div>
        <div className={`${netWorth >= 0 ? "bg-primary/10 border-primary/20" : "bg-red-500/10 border-red-500/20"} border rounded-lg p-4 text-center`}>
          <Wallet className="size-5 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Net Worth</p>
          <p className={`text-2xl font-bold ${netWorth >= 0 ? "text-primary" : "text-red-500"}`}>${netWorth.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2"><TrendingUp className="size-5 text-green-500" /><Label className="text-lg">Assets</Label></div>
          {assets.map(asset => (
            <div key={asset.id} className="flex items-center gap-2 bg-card border rounded-lg p-3">
              <span className="flex-1">{asset.name}</span>
              <span className="font-mono font-medium text-green-500">${asset.value.toLocaleString()}</span>
              <Button size="icon" variant="ghost" onClick={() => setAssets(assets.filter(a => a.id !== asset.id))}><Trash2 className="size-4" /></Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input value={newAsset.name} onChange={e => setNewAsset({ ...newAsset, name: e.target.value })} placeholder="Asset name" className="flex-1" />
            <Input type="number" value={newAsset.value} onChange={e => setNewAsset({ ...newAsset, value: e.target.value })} placeholder="Value" className="w-28" />
            <Button onClick={addAsset}><Plus className="size-4" /></Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2"><CreditCard className="size-5 text-red-500" /><Label className="text-lg">Liabilities</Label></div>
          {liabilities.map(liability => (
            <div key={liability.id} className="flex items-center gap-2 bg-card border rounded-lg p-3">
              <span className="flex-1">{liability.name}</span>
              <span className="font-mono font-medium text-red-500">${liability.value.toLocaleString()}</span>
              <Button size="icon" variant="ghost" onClick={() => setLiabilities(liabilities.filter(l => l.id !== liability.id))}><Trash2 className="size-4" /></Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input value={newLiability.name} onChange={e => setNewLiability({ ...newLiability, name: e.target.value })} placeholder="Liability name" className="flex-1" />
            <Input type="number" value={newLiability.value} onChange={e => setNewLiability({ ...newLiability, value: e.target.value })} placeholder="Value" className="w-28" />
            <Button onClick={addLiability}><Plus className="size-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  )
}
