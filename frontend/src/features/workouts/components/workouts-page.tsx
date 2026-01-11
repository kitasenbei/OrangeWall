import { useState, useMemo } from "react"
import {
  Plus,
  Trash2,
  MoreVertical,
  Clock,
  Flame,
  Dumbbell,
  Trophy,
  TrendingUp,
  Play,
  CheckCircle2,
  Timer,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/cheval-ui"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  weight?: number
  duration?: number
  completed: boolean
}

interface Workout {
  id: string
  name: string
  type: "strength" | "cardio" | "flexibility" | "hiit" | "sports"
  exercises: Exercise[]
  duration: number
  caloriesBurned?: number
  completedAt?: Date
  scheduledFor?: Date
  notes: string
}

interface WorkoutTemplate {
  id: string
  name: string
  type: Workout["type"]
  exercises: Omit<Exercise, "id" | "completed">[]
  estimatedDuration: number
}

const workoutTypes: { value: Workout["type"]; label: string; icon: LucideIcon }[] = [
  { value: "strength", label: "Strength", icon: Dumbbell },
  { value: "cardio", label: "Cardio", icon: Flame },
  { value: "flexibility", label: "Flexibility", icon: TrendingUp },
  { value: "hiit", label: "HIIT", icon: Timer },
  { value: "sports", label: "Sports", icon: Trophy },
]

function generateMockWorkouts(): Workout[] {
  const today = new Date()
  return [
    {
      id: "1",
      name: "Morning Strength",
      type: "strength",
      exercises: [
        { id: "1", name: "Bench Press", sets: 4, reps: 8, weight: 135, completed: true },
        { id: "2", name: "Squats", sets: 4, reps: 10, weight: 185, completed: true },
        { id: "3", name: "Deadlifts", sets: 3, reps: 6, weight: 225, completed: true },
        { id: "4", name: "Pull-ups", sets: 3, reps: 10, completed: true },
      ],
      duration: 65,
      caloriesBurned: 450,
      completedAt: new Date(today.getTime() - 86400000),
      notes: "Great session, increased weight on squats",
    },
    {
      id: "2",
      name: "Evening Run",
      type: "cardio",
      exercises: [
        { id: "1", name: "Running", sets: 1, reps: 1, duration: 30, completed: true },
        { id: "2", name: "Cool-down walk", sets: 1, reps: 1, duration: 10, completed: true },
      ],
      duration: 40,
      caloriesBurned: 350,
      completedAt: new Date(today.getTime() - 172800000),
      notes: "5K run, felt good",
    },
    {
      id: "3",
      name: "Today's Workout",
      type: "hiit",
      exercises: [
        { id: "1", name: "Burpees", sets: 4, reps: 15, completed: false },
        { id: "2", name: "Mountain Climbers", sets: 4, reps: 20, completed: false },
        { id: "3", name: "Jump Squats", sets: 4, reps: 15, completed: false },
        { id: "4", name: "Push-ups", sets: 4, reps: 20, completed: false },
      ],
      duration: 30,
      scheduledFor: today,
      notes: "",
    },
  ]
}

const defaultTemplates: WorkoutTemplate[] = [
  {
    id: "t1",
    name: "Push Day",
    type: "strength",
    exercises: [
      { name: "Bench Press", sets: 4, reps: 8, weight: 0 },
      { name: "Shoulder Press", sets: 3, reps: 10, weight: 0 },
      { name: "Incline Dumbbell Press", sets: 3, reps: 10, weight: 0 },
      { name: "Tricep Dips", sets: 3, reps: 12 },
    ],
    estimatedDuration: 60,
  },
  {
    id: "t2",
    name: "Pull Day",
    type: "strength",
    exercises: [
      { name: "Pull-ups", sets: 4, reps: 8 },
      { name: "Barbell Rows", sets: 4, reps: 8, weight: 0 },
      { name: "Face Pulls", sets: 3, reps: 15, weight: 0 },
      { name: "Bicep Curls", sets: 3, reps: 12, weight: 0 },
    ],
    estimatedDuration: 55,
  },
  {
    id: "t3",
    name: "Leg Day",
    type: "strength",
    exercises: [
      { name: "Squats", sets: 4, reps: 8, weight: 0 },
      { name: "Romanian Deadlifts", sets: 3, reps: 10, weight: 0 },
      { name: "Leg Press", sets: 3, reps: 12, weight: 0 },
      { name: "Calf Raises", sets: 4, reps: 15, weight: 0 },
    ],
    estimatedDuration: 60,
  },
]

export function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>(generateMockWorkouts)
  const [templates] = useState<WorkoutTemplate[]>(defaultTemplates)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null)
  const [activeTab, setActiveTab] = useState<"workouts" | "templates">("workouts")

  const [formData, setFormData] = useState({
    name: "",
    type: "strength" as Workout["type"],
    duration: "60",
    exercises: [] as Exercise[],
    notes: "",
  })

  const stats = useMemo(() => {
    const completed = workouts.filter((w) => w.completedAt)
    const thisWeek = completed.filter((w) => {
      const weekAgo = new Date(Date.now() - 7 * 86400000)
      return w.completedAt && w.completedAt >= weekAgo
    })
    const totalCalories = thisWeek.reduce((acc, w) => acc + (w.caloriesBurned || 0), 0)
    const totalTime = thisWeek.reduce((acc, w) => acc + w.duration, 0)

    return {
      totalWorkouts: completed.length,
      thisWeek: thisWeek.length,
      totalCalories,
      totalTime,
    }
  }, [workouts])

  const handleStartFromTemplate = (template: WorkoutTemplate) => {
    const newWorkout: Workout = {
      id: crypto.randomUUID(),
      name: template.name,
      type: template.type,
      exercises: template.exercises.map((e) => ({
        ...e,
        id: crypto.randomUUID(),
        completed: false,
      })),
      duration: template.estimatedDuration,
      scheduledFor: new Date(),
      notes: "",
    }
    setWorkouts((prev) => [...prev, newWorkout])
    setActiveWorkout(newWorkout)
  }

  const handleToggleExercise = (exerciseId: string) => {
    if (!activeWorkout) return
    setWorkouts((prev) =>
      prev.map((w) =>
        w.id === activeWorkout.id
          ? {
              ...w,
              exercises: w.exercises.map((e) =>
                e.id === exerciseId ? { ...e, completed: !e.completed } : e
              ),
            }
          : w
      )
    )
    setActiveWorkout((prev) =>
      prev
        ? {
            ...prev,
            exercises: prev.exercises.map((e) =>
              e.id === exerciseId ? { ...e, completed: !e.completed } : e
            ),
          }
        : null
    )
  }

  const handleCompleteWorkout = () => {
    if (!activeWorkout) return
    setWorkouts((prev) =>
      prev.map((w) =>
        w.id === activeWorkout.id
          ? { ...w, completedAt: new Date(), exercises: w.exercises.map((e) => ({ ...e, completed: true })) }
          : w
      )
    )
    setActiveWorkout(null)
  }

  const handleDeleteWorkout = (id: string) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== id))
  }

  const getTypeIcon = (type: Workout["type"]) => {
    return workoutTypes.find((t) => t.value === type)?.icon || Dumbbell
  }

  const pendingWorkouts = workouts.filter((w) => !w.completedAt)
  const completedWorkouts = workouts.filter((w) => w.completedAt).sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workouts</h1>
          <p className="text-muted-foreground">Track your fitness journey</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="size-4 mr-2" />
          New Workout
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Workouts" value={stats.totalWorkouts.toString()} icon={Dumbbell} />
        <StatCard title="This Week" value={stats.thisWeek.toString()} icon={Trophy} />
        <StatCard title="Calories Burned" value={stats.totalCalories.toString()} icon={Flame} />
        <StatCard title="Total Time" value={`${stats.totalTime} min`} icon={Clock} />
      </div>

      {activeWorkout && (
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Play className="size-5 text-green-500" />
                {activeWorkout.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {activeWorkout.exercises.filter((e) => e.completed).length}/{activeWorkout.exercises.length} exercises completed
              </p>
            </div>
            <Button onClick={handleCompleteWorkout}>
              <CheckCircle2 className="size-4 mr-2" />
              Complete Workout
            </Button>
          </div>
          <Progress
            value={(activeWorkout.exercises.filter((e) => e.completed).length / activeWorkout.exercises.length) * 100}
            className="h-2 mb-4"
          />
          <div className="space-y-2">
            {activeWorkout.exercises.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => handleToggleExercise(exercise.id)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-lg border transition-all",
                  exercise.completed ? "bg-green-50 border-green-200 dark:bg-green-900/20" : "hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "size-6 rounded-full border-2 flex items-center justify-center",
                    exercise.completed ? "bg-green-500 border-green-500 text-white" : "border-muted-foreground"
                  )}>
                    {exercise.completed && <CheckCircle2 className="size-4" />}
                  </div>
                  <span className={cn(exercise.completed && "line-through text-muted-foreground")}>
                    {exercise.name}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {exercise.sets} x {exercise.reps}
                  {exercise.weight && ` @ ${exercise.weight}lbs`}
                  {exercise.duration && ` for ${exercise.duration}min`}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="workouts">My Workouts</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="workouts" className="mt-4 space-y-6">
          {pendingWorkouts.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Scheduled</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {pendingWorkouts.map((workout) => {
                  const TypeIcon = getTypeIcon(workout.type)
                  return (
                    <div key={workout.id} className="rounded-lg border bg-card p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="size-5 text-muted-foreground" />
                          <h4 className="font-medium">{workout.name}</h4>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setActiveWorkout(workout)}>
                              <Play className="size-4 mr-2" />Start
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteWorkout(workout.id)}>
                              <Trash2 className="size-4 mr-2" />Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Badge variant="outline">{workout.exercises.length} exercises</Badge>
                        <Badge variant="outline"><Clock className="size-3 mr-1" />{workout.duration} min</Badge>
                      </div>
                      <Button className="w-full" size="sm" onClick={() => setActiveWorkout(workout)}>
                        <Play className="size-4 mr-2" />Start Workout
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {completedWorkouts.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Completed</h3>
              <div className="space-y-2">
                {completedWorkouts.slice(0, 10).map((workout) => {
                  const TypeIcon = getTypeIcon(workout.type)
                  return (
                    <div key={workout.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-3">
                        <TypeIcon className="size-5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">{workout.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {workout.completedAt?.toLocaleDateString()} • {workout.duration} min
                            {workout.caloriesBurned && ` • ${workout.caloriesBurned} cal`}
                          </p>
                        </div>
                      </div>
                      <CheckCircle2 className="size-5 text-green-500" />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => {
              const TypeIcon = getTypeIcon(template.type)
              return (
                <div key={template.id} className="rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TypeIcon className="size-5 text-muted-foreground" />
                    <h4 className="font-medium">{template.name}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Badge variant="outline">{template.exercises.length} exercises</Badge>
                    <Badge variant="outline"><Clock className="size-3 mr-1" />~{template.estimatedDuration} min</Badge>
                  </div>
                  <ul className="text-sm text-muted-foreground mb-3 space-y-1">
                    {template.exercises.slice(0, 3).map((e, i) => (
                      <li key={i}>• {e.name}</li>
                    ))}
                    {template.exercises.length > 3 && <li>+ {template.exercises.length - 3} more</li>}
                  </ul>
                  <Button className="w-full" size="sm" onClick={() => handleStartFromTemplate(template)}>
                    <Play className="size-4 mr-2" />Start Workout
                  </Button>
                </div>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Workout</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Workout name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as Workout["type"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {workoutTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Duration (min)</Label>
                <Input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Or choose from a template above for pre-built workouts with exercises.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                const newWorkout: Workout = {
                  id: crypto.randomUUID(),
                  name: formData.name || "Quick Workout",
                  type: formData.type,
                  exercises: [],
                  duration: parseInt(formData.duration) || 30,
                  scheduledFor: new Date(),
                  notes: "",
                }
                setWorkouts((prev) => [...prev, newWorkout])
                setIsDialogOpen(false)
              }}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
