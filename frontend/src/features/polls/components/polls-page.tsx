import { useState } from "react"
import { Plus, Trash2, Vote, Share2, RotateCcw, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PollOption {
  id: string
  text: string
  votes: number
}

interface Poll {
  id: string
  question: string
  options: PollOption[]
  voted: boolean
}

const initialPolls: Poll[] = [
  { id: "1", question: "What's for lunch?", options: [{ id: "1a", text: "Pizza", votes: 5 }, { id: "1b", text: "Sushi", votes: 8 }, { id: "1c", text: "Tacos", votes: 3 }], voted: false },
  { id: "2", question: "Best programming language?", options: [{ id: "2a", text: "TypeScript", votes: 12 }, { id: "2b", text: "Python", votes: 10 }, { id: "2c", text: "Rust", votes: 6 }, { id: "2d", text: "Go", votes: 4 }], voted: true },
]

export function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>(initialPolls)
  const [creating, setCreating] = useState(false)
  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState<string[]>(["", ""])
  const [copied, setCopied] = useState<string | null>(null)

  const addOption = () => setOptions([...options, ""])
  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }
  const removeOption = (index: number) => setOptions(options.filter((_, i) => i !== index))

  const createPoll = () => {
    if (!question || options.filter(o => o.trim()).length < 2) return
    const newPoll: Poll = {
      id: Date.now().toString(),
      question,
      options: options.filter(o => o.trim()).map((text, i) => ({ id: `${Date.now()}-${i}`, text, votes: 0 })),
      voted: false,
    }
    setPolls([newPoll, ...polls])
    setQuestion(""); setOptions(["", ""]); setCreating(false)
  }

  const vote = (pollId: string, optionId: string) => {
    setPolls(polls.map(p => {
      if (p.id !== pollId || p.voted) return p
      return { ...p, voted: true, options: p.options.map(o => o.id === optionId ? { ...o, votes: o.votes + 1 } : o) }
    }))
  }

  const resetPoll = (pollId: string) => {
    setPolls(polls.map(p => p.id === pollId ? { ...p, voted: false, options: p.options.map(o => ({ ...o, votes: 0 })) } : p))
  }

  const deletePoll = (pollId: string) => setPolls(polls.filter(p => p.id !== pollId))

  const sharePoll = (poll: Poll) => {
    const text = `${poll.question}\n${poll.options.map((o, i) => `${i + 1}. ${o.text}`).join("\n")}`
    navigator.clipboard.writeText(text)
    setCopied(poll.id)
    setTimeout(() => setCopied(null), 2000)
  }

  const getTotalVotes = (options: PollOption[]) => options.reduce((sum, o) => sum + o.votes, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Polls</h1><p className="text-sm text-muted-foreground">Create and vote on polls</p></div>
        <Button onClick={() => setCreating(!creating)}><Plus className="size-4 mr-2" />New Poll</Button>
      </div>

      {creating && (
        <div className="bg-card border rounded-lg p-4 space-y-4">
          <div className="space-y-2"><Label>Question</Label><Input value={question} onChange={e => setQuestion(e.target.value)} placeholder="What should we name the project?" /></div>
          <div className="space-y-2">
            <Label>Options</Label>
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <Input value={opt} onChange={e => updateOption(i, e.target.value)} placeholder={`Option ${i + 1}`} />
                {options.length > 2 && <Button variant="ghost" size="icon" onClick={() => removeOption(i)}><Trash2 className="size-4" /></Button>}
              </div>
            ))}
            {options.length < 6 && <Button variant="outline" size="sm" onClick={addOption}><Plus className="size-4 mr-1" />Add Option</Button>}
          </div>
          <div className="flex gap-2">
            <Button onClick={createPoll}>Create Poll</Button>
            <Button variant="outline" onClick={() => { setCreating(false); setQuestion(""); setOptions(["", ""]) }}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {polls.map(poll => {
          const total = getTotalVotes(poll.options)
          return (
            <div key={poll.id} className="bg-card border rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Vote className="size-5 text-primary" />
                  <h3 className="font-medium">{poll.question}</h3>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => sharePoll(poll)}>
                    {copied === poll.id ? <Check className="size-4 text-green-500" /> : <Share2 className="size-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => resetPoll(poll.id)}><RotateCcw className="size-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deletePoll(poll.id)}><Trash2 className="size-4" /></Button>
                </div>
              </div>

              <div className="space-y-2">
                {poll.options.map(option => {
                  const percentage = total > 0 ? (option.votes / total) * 100 : 0
                  return (
                    <button key={option.id} onClick={() => vote(poll.id, option.id)} disabled={poll.voted} className={`w-full text-left ${poll.voted ? "" : "hover:bg-muted/50 cursor-pointer"}`}>
                      <div className="relative bg-muted rounded-lg overflow-hidden">
                        <div className="absolute inset-y-0 left-0 bg-primary/20 transition-all" style={{ width: `${percentage}%` }} />
                        <div className="relative flex items-center justify-between px-4 py-3">
                          <span className="font-medium">{option.text}</span>
                          {poll.voted && <span className="text-sm text-muted-foreground">{option.votes} votes ({percentage.toFixed(0)}%)</span>}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              <p className="text-sm text-muted-foreground mt-3">{total} total votes {!poll.voted && "• Click to vote"}</p>
            </div>
          )
        })}
      </div>

      {polls.length === 0 && !creating && <p className="text-center py-8 text-muted-foreground">No polls yet</p>}
    </div>
  )
}
