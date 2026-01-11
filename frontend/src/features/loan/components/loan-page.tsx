import { useState, useMemo } from "react"
import { DollarSign, Percent, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoanPage() {
  const [principal, setPrincipal] = useState(250000)
  const [rate, setRate] = useState(6.5)
  const [years, setYears] = useState(30)

  const result = useMemo(() => {
    const monthlyRate = rate / 100 / 12
    const numPayments = years * 12
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
    const totalPayment = monthlyPayment * numPayments
    const totalInterest = totalPayment - principal
    return { monthlyPayment, totalPayment, totalInterest }
  }, [principal, rate, years])

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">Loan Calculator</h1><p className="text-sm text-muted-foreground">Calculate mortgage and loan payments</p></div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><DollarSign className="size-4" />Loan Amount</Label>
            <Input type="number" value={principal} onChange={e => setPrincipal(parseFloat(e.target.value) || 0)} min={0} />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Percent className="size-4" />Interest Rate (%)</Label>
            <Input type="number" value={rate} onChange={e => setRate(parseFloat(e.target.value) || 0)} min={0} max={30} step={0.1} />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Calendar className="size-4" />Loan Term (Years)</Label>
            <Input type="number" value={years} onChange={e => setYears(parseInt(e.target.value) || 1)} min={1} max={50} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Monthly Payment</p>
            <p className="text-4xl font-bold">${result.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>

          <div className="bg-card border rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Principal</span>
              <span className="font-medium">${principal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Interest</span>
              <span className="font-medium text-red-500">${result.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-medium">Total Cost</span>
              <span className="font-bold">${result.totalPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <div className="flex h-4 rounded-full overflow-hidden">
              <div className="bg-primary" style={{ width: `${(principal / result.totalPayment) * 100}%` }} />
              <div className="bg-red-500" style={{ width: `${(result.totalInterest / result.totalPayment) * 100}%` }} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Principal ({((principal / result.totalPayment) * 100).toFixed(0)}%)</span>
              <span>Interest ({((result.totalInterest / result.totalPayment) * 100).toFixed(0)}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
