import { useState } from "react"
import { Plus, GraduationCap, BookOpen, TrendingUp, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface Course { id: string; name: string; credits: number; grade: string; semester: string }

const gradePoints: Record<string, number> = { "A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "C-": 1.7, "D+": 1.3, "D": 1.0, "D-": 0.7, "F": 0.0 }
const grades = Object.keys(gradePoints)

const initialCourses: Course[] = [
  { id: "1", name: "Calculus II", credits: 4, grade: "A", semester: "Fall 2024" },
  { id: "2", name: "Physics I", credits: 4, grade: "B+", semester: "Fall 2024" },
  { id: "3", name: "Computer Science 101", credits: 3, grade: "A", semester: "Fall 2024" },
  { id: "4", name: "English Composition", credits: 3, grade: "A-", semester: "Fall 2024" },
  { id: "5", name: "Introduction to Psychology", credits: 3, grade: "B", semester: "Spring 2024" },
]

export function GradesPage() {
  const [courses, setCourses] = useState<Course[]>(initialCourses)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [name, setName] = useState(""); const [credits, setCredits] = useState("3"); const [grade, setGrade] = useState("A"); const [semester, setSemester] = useState("Fall 2024")

  const handleSave = () => {
    if (!name.trim()) return
    if (editingCourse) { setCourses(prev => prev.map(c => c.id === editingCourse.id ? { ...c, name, credits: parseInt(credits) || 3, grade, semester } : c)) }
    else { setCourses(prev => [...prev, { id: Date.now().toString(), name, credits: parseInt(credits) || 3, grade, semester }]) }
    setName(""); setCredits("3"); setGrade("A"); setEditingCourse(null); setDialogOpen(false)
  }

  const openEdit = (c: Course) => { setEditingCourse(c); setName(c.name); setCredits(c.credits.toString()); setGrade(c.grade); setSemester(c.semester); setDialogOpen(true) }
  const deleteCourse = (id: string) => setCourses(prev => prev.filter(c => c.id !== id))

  const totalCredits = courses.reduce((s, c) => s + c.credits, 0)
  const totalPoints = courses.reduce((s, c) => s + c.credits * (gradePoints[c.grade] || 0), 0)
  const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00"

  const semesters = [...new Set(courses.map(c => c.semester))]
  const grouped = semesters.map(sem => ({ semester: sem, courses: courses.filter(c => c.semester === sem) }))

  const getGradeColor = (g: string) => {
    const p = gradePoints[g] || 0
    if (p >= 3.7) return "text-green-500 bg-green-500/10"
    if (p >= 3.0) return "text-blue-500 bg-blue-500/10"
    if (p >= 2.0) return "text-yellow-500 bg-yellow-500/10"
    return "text-red-500 bg-red-500/10"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Grades</h1><p className="text-sm text-muted-foreground">Track your academic progress</p></div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditingCourse(null); setName(""); setCredits("3"); setGrade("A") } }}>
          <DialogTrigger asChild><Button><Plus className="size-4 mr-2" />Add Course</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingCourse ? "Edit" : "Add"} Course</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2"><Label>Course Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Credits</Label><Input type="number" value={credits} onChange={e => setCredits(e.target.value)} /></div>
                <div className="space-y-2"><Label>Grade</Label>
                  <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full h-10 rounded-md border bg-background px-3">{grades.map(g => <option key={g} value={g}>{g}</option>)}</select>
                </div>
                <div className="space-y-2"><Label>Semester</Label><Input value={semester} onChange={e => setSemester(e.target.value)} /></div>
              </div>
              <Button onClick={handleSave} className="w-full">{editingCourse ? "Save" : "Add"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border rounded-lg p-4 text-center">
          <GraduationCap className="size-6 mx-auto mb-2 text-primary" />
          <div className="text-3xl font-bold text-primary">{gpa}</div>
          <div className="text-sm text-muted-foreground">Cumulative GPA</div>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center"><BookOpen className="size-5 mx-auto mb-2 text-muted-foreground" /><div className="text-2xl font-semibold">{totalCredits}</div><div className="text-xs text-muted-foreground">Total Credits</div></div>
        <div className="bg-card border rounded-lg p-4 text-center"><TrendingUp className="size-5 mx-auto mb-2 text-muted-foreground" /><div className="text-2xl font-semibold">{courses.length}</div><div className="text-xs text-muted-foreground">Courses</div></div>
      </div>

      {grouped.map(({ semester, courses: semCourses }) => {
        const semCredits = semCourses.reduce((s, c) => s + c.credits, 0)
        const semPoints = semCourses.reduce((s, c) => s + c.credits * (gradePoints[c.grade] || 0), 0)
        const semGpa = semCredits > 0 ? (semPoints / semCredits).toFixed(2) : "0.00"
        return (
          <div key={semester} className="space-y-2">
            <div className="flex items-center justify-between"><h2 className="font-medium">{semester}</h2><span className="text-sm text-muted-foreground">GPA: {semGpa}</span></div>
            {semCourses.map(course => (
              <div key={course.id} className="bg-card border rounded-lg p-4 flex items-center gap-4">
                <div className="flex-1"><h3 className="font-medium">{course.name}</h3><p className="text-sm text-muted-foreground">{course.credits} credits</p></div>
                <span className={cn("px-3 py-1 rounded-full text-sm font-medium", getGradeColor(course.grade))}>{course.grade}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="size-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(course)}><Pencil className="size-4 mr-2" />Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => deleteCourse(course.id)} className="text-destructive"><Trash2 className="size-4 mr-2" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )
      })}

      {courses.length === 0 && <div className="text-center py-12 text-muted-foreground"><GraduationCap className="size-12 mx-auto mb-4 opacity-50" /><p>No courses added</p></div>}
    </div>
  )
}
