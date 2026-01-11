import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface Task {
  id: string
  title: string
  description: string
  status: "pending" | "in_progress" | "completed" | "on_hold"
  priority: "low" | "medium" | "high" | "urgent"
  dueDate: string | null
  tags: string[]
  subtasks: Subtask[]
  order: number
  createdAt: string
  completedAt: string | null
}

export interface TaskCreate {
  title: string
  status?: string
  description?: string
  priority?: string
  dueDate?: string | null
  tags?: string[]
  subtasks?: Subtask[]
}

export interface TaskUpdate {
  title?: string
  status?: string
  description?: string
  priority?: string
  dueDate?: string | null
  tags?: string[]
  subtasks?: Subtask[]
  order?: number
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.get<Task[]>("/tasks")
      setTasks(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const createTask = async (task: TaskCreate) => {
    const newTask = await api.post<Task>("/tasks", task)
    setTasks(prev => [...prev, newTask])
    return newTask
  }

  const updateTask = async (id: string, updates: TaskUpdate) => {
    const updated = await api.patch<Task>(`/tasks/${id}`, updates)
    setTasks(prev => prev.map(t => t.id === id ? updated : t))
    return updated
  }

  const deleteTask = async (id: string) => {
    await api.delete(`/tasks/${id}`)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  }
}
