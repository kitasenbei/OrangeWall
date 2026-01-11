import { useState } from "react"
import { Play, RotateCcw, Trophy, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface Question {
  question: string
  options: string[]
  correct: number
  category: string
}

const questions: Question[] = [
  { question: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], correct: 2, category: "Geography" },
  { question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correct: 1, category: "Science" },
  { question: "Who painted the Mona Lisa?", options: ["Van Gogh", "Picasso", "Da Vinci", "Michelangelo"], correct: 2, category: "Art" },
  { question: "What year did World War II end?", options: ["1943", "1944", "1945", "1946"], correct: 2, category: "History" },
  { question: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3, category: "Geography" },
  { question: "Who wrote 'Romeo and Juliet'?", options: ["Dickens", "Shakespeare", "Austen", "Hemingway"], correct: 1, category: "Literature" },
  { question: "What is the chemical symbol for gold?", options: ["Go", "Gd", "Au", "Ag"], correct: 2, category: "Science" },
  { question: "Which country hosted the 2020 Olympics?", options: ["China", "Brazil", "Japan", "USA"], correct: 2, category: "Sports" },
  { question: "What is the smallest prime number?", options: ["0", "1", "2", "3"], correct: 2, category: "Math" },
  { question: "Who is known as the 'Father of Computers'?", options: ["Turing", "Babbage", "Gates", "Jobs"], correct: 1, category: "Technology" },
  { question: "What is the hardest natural substance?", options: ["Gold", "Iron", "Diamond", "Titanium"], correct: 2, category: "Science" },
  { question: "Which river is the longest in the world?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], correct: 1, category: "Geography" },
  { question: "What does HTTP stand for?", options: ["HyperText Transfer Protocol", "High Tech Transfer Protocol", "Hyper Transfer Text Protocol", "High Transfer Text Protocol"], correct: 0, category: "Technology" },
  { question: "How many continents are there?", options: ["5", "6", "7", "8"], correct: 2, category: "Geography" },
  { question: "What is the speed of light (approx)?", options: ["300,000 m/s", "300,000 km/s", "30,000 km/s", "3,000,000 km/s"], correct: 1, category: "Science" },
]

type GameState = "idle" | "playing" | "finished"

export function TriviaPage() {
  const [gameState, setGameState] = useState<GameState>("idle")
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [questionCount, setQuestionCount] = useState(10)
  const [category, setCategory] = useState<string>("all")

  const categories = ["all", ...new Set(questions.map(q => q.category))]

  const startGame = () => {
    let filtered = category === "all" ? questions : questions.filter(q => q.category === category)
    const shuffled = [...filtered].sort(() => Math.random() - 0.5).slice(0, questionCount)
    setCurrentQuestions(shuffled)
    setCurrentIndex(0)
    setScore(0)
    setSelected(null)
    setAnswered(false)
    setGameState("playing")
  }

  const selectAnswer = (index: number) => {
    if (answered) return
    setSelected(index)
    setAnswered(true)
    if (index === currentQuestions[currentIndex].correct) {
      setScore(score + 1)
    }
  }

  const nextQuestion = () => {
    if (currentIndex + 1 >= currentQuestions.length) {
      setGameState("finished")
    } else {
      setCurrentIndex(currentIndex + 1)
      setSelected(null)
      setAnswered(false)
    }
  }

  const current = currentQuestions[currentIndex]
  const percentage = currentQuestions.length > 0 ? Math.round((score / currentQuestions.length) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Trivia Quiz</h1><p className="text-sm text-muted-foreground">Test your knowledge</p></div>
        {gameState !== "idle" && <Button variant="outline" onClick={() => setGameState("idle")}><RotateCcw className="size-4 mr-2" />New Game</Button>}
      </div>

      {gameState === "idle" && (
        <div className="max-w-md mx-auto space-y-6">
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <div className="space-y-2">
              <Label>Number of Questions</Label>
              <div className="flex gap-2">
                {[5, 10, 15].map(n => (
                  <Button key={n} variant={questionCount === n ? "default" : "outline"} onClick={() => setQuestionCount(n)}>{n}</Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <div className="flex gap-2 flex-wrap">
                {categories.map(c => (
                  <Button key={c} variant={category === c ? "default" : "outline"} size="sm" onClick={() => setCategory(c)} className="capitalize">{c}</Button>
                ))}
              </div>
            </div>

            <Button onClick={startGame} className="w-full" size="lg"><Play className="size-4 mr-2" />Start Quiz</Button>
          </div>
        </div>
      )}

      {gameState === "playing" && current && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Question {currentIndex + 1} of {currentQuestions.length}</span>
            <span className="font-medium">Score: {score}</span>
          </div>

          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${((currentIndex + 1) / currentQuestions.length) * 100}%` }} />
          </div>

          <div className="bg-card border rounded-lg p-6 space-y-6">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">{current.category}</span>
            </div>

            <h2 className="text-xl font-medium">{current.question}</h2>

            <div className="grid gap-3">
              {current.options.map((option, i) => {
                let className = "w-full p-4 text-left border rounded-lg transition-colors "
                if (answered) {
                  if (i === current.correct) className += "bg-green-500/20 border-green-500"
                  else if (i === selected) className += "bg-red-500/20 border-red-500"
                  else className += "opacity-50"
                } else {
                  className += "hover:bg-muted cursor-pointer"
                }

                return (
                  <button key={i} onClick={() => selectAnswer(i)} disabled={answered} className={className}>
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {answered && i === current.correct && <CheckCircle className="size-5 text-green-500" />}
                      {answered && i === selected && i !== current.correct && <XCircle className="size-5 text-red-500" />}
                    </div>
                  </button>
                )
              })}
            </div>

            {answered && (
              <Button onClick={nextQuestion} className="w-full">
                {currentIndex + 1 >= currentQuestions.length ? "See Results" : "Next Question"}
              </Button>
            )}
          </div>
        </div>
      )}

      {gameState === "finished" && (
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="bg-card border rounded-lg p-8 space-y-4">
            <Trophy className={`size-16 mx-auto ${percentage >= 70 ? "text-yellow-500" : percentage >= 50 ? "text-gray-400" : "text-orange-600"}`} />
            <h2 className="text-2xl font-bold">Quiz Complete!</h2>
            <div className="text-4xl font-bold text-primary">{score} / {currentQuestions.length}</div>
            <p className="text-muted-foreground">{percentage}% correct</p>
            <p className="text-lg">
              {percentage >= 90 ? "Outstanding!" : percentage >= 70 ? "Great job!" : percentage >= 50 ? "Not bad!" : "Keep practicing!"}
            </p>
            <Button onClick={startGame} className="w-full"><RotateCcw className="size-4 mr-2" />Play Again</Button>
          </div>
        </div>
      )}
    </div>
  )
}
