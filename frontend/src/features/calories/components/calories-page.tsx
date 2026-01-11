import { useState, useMemo } from "react"
import { Flame, Activity } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const activityLevels = [
  { label: "Sedentary", value: 1.2, desc: "Little or no exercise" },
  { label: "Light", value: 1.375, desc: "Light exercise 1-3 days/week" },
  { label: "Moderate", value: 1.55, desc: "Moderate exercise 3-5 days/week" },
  { label: "Active", value: 1.725, desc: "Hard exercise 6-7 days/week" },
  { label: "Very Active", value: 1.9, desc: "Very hard exercise, physical job" },
]

export function CaloriesPage() {
  const [age, setAge] = useState(30)
  const [sex, setSex] = useState<"male" | "female">("male")
  const [weight, setWeight] = useState(70)
  const [height, setHeight] = useState(175)
  const [activity, setActivity] = useState(1.55)

  const result = useMemo(() => {
    // Mifflin-St Jeor Equation
    const bmr = sex === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161
    const tdee = bmr * activity
    return {
      bmr: Math.round(bmr),
      maintenance: Math.round(tdee),
      mildLoss: Math.round(tdee - 250),
      weightLoss: Math.round(tdee - 500),
      mildGain: Math.round(tdee + 250),
      weightGain: Math.round(tdee + 500),
    }
  }, [age, sex, weight, height, activity])

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">Calorie Calculator</h1><p className="text-sm text-muted-foreground">Calculate your daily calorie needs</p></div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button variant={sex === "male" ? "default" : "outline"} onClick={() => setSex("male")} className="flex-1">Male</Button>
            <Button variant={sex === "female" ? "default" : "outline"} onClick={() => setSex("female")} className="flex-1">Female</Button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1"><Label>Age</Label><Input type="number" value={age} onChange={e => setAge(parseInt(e.target.value) || 0)} min={1} /></div>
            <div className="space-y-1"><Label>Weight (kg)</Label><Input type="number" value={weight} onChange={e => setWeight(parseFloat(e.target.value) || 0)} min={1} /></div>
            <div className="space-y-1"><Label>Height (cm)</Label><Input type="number" value={height} onChange={e => setHeight(parseInt(e.target.value) || 0)} min={1} /></div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Activity className="size-4" />Activity Level</Label>
            <div className="space-y-2">
              {activityLevels.map(level => (
                <button key={level.value} onClick={() => setActivity(level.value)} className={`w-full text-left p-3 rounded-lg border ${activity === level.value ? "border-primary bg-primary/10" : "hover:bg-muted"}`}>
                  <div className="font-medium">{level.label}</div>
                  <div className="text-xs text-muted-foreground">{level.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center">
            <Flame className="size-8 mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">Daily Calories (Maintenance)</p>
            <p className="text-4xl font-bold">{result.maintenance.toLocaleString()}</p>
          </div>

          <div className="bg-card border rounded-lg p-4 space-y-3">
            <div className="flex justify-between"><span className="text-muted-foreground">BMR (Basal Metabolic Rate)</span><span className="font-medium">{result.bmr}</span></div>
            <div className="border-t pt-3 space-y-2">
              <p className="text-sm font-medium">Weight Goals</p>
              <div className="flex justify-between text-sm"><span className="text-green-500">Mild weight loss (-0.25 kg/week)</span><span>{result.mildLoss}</span></div>
              <div className="flex justify-between text-sm"><span className="text-green-600">Weight loss (-0.5 kg/week)</span><span>{result.weightLoss}</span></div>
              <div className="flex justify-between text-sm"><span className="text-blue-500">Mild weight gain (+0.25 kg/week)</span><span>{result.mildGain}</span></div>
              <div className="flex justify-between text-sm"><span className="text-blue-600">Weight gain (+0.5 kg/week)</span><span>{result.weightGain}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
