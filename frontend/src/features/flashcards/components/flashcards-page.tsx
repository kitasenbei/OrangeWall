import { useState } from "react"
import {
  Plus,
  BookOpen,
  Brain,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Pencil,
  Trash2,
  FolderOpen,
  Layers,
  Zap,
  Target
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface Flashcard {
  id: string
  front: string
  back: string
  deckId: string
  difficulty: "easy" | "medium" | "hard"
  lastReviewed: Date | null
  correctCount: number
  incorrectCount: number
}

interface Deck {
  id: string
  name: string
  color: string
  description: string
}

const deckColors = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"
]

const initialDecks: Deck[] = [
  { id: "1", name: "Spanish Vocabulary", color: "#f97316", description: "Common Spanish words and phrases" },
  { id: "2", name: "JavaScript Concepts", color: "#eab308", description: "JS fundamentals and advanced topics" },
  { id: "3", name: "History Facts", color: "#3b82f6", description: "Important historical events" },
]

const initialCards: Flashcard[] = [
  { id: "1", front: "Hola", back: "Hello", deckId: "1", difficulty: "easy", lastReviewed: new Date(), correctCount: 5, incorrectCount: 1 },
  { id: "2", front: "Gracias", back: "Thank you", deckId: "1", difficulty: "easy", lastReviewed: new Date(), correctCount: 3, incorrectCount: 0 },
  { id: "3", front: "¿Cómo estás?", back: "How are you?", deckId: "1", difficulty: "medium", lastReviewed: null, correctCount: 0, incorrectCount: 0 },
  { id: "4", front: "What is a closure?", back: "A closure is a function that has access to variables from its outer (enclosing) scope, even after the outer function has returned.", deckId: "2", difficulty: "hard", lastReviewed: new Date(), correctCount: 2, incorrectCount: 3 },
  { id: "5", front: "What is hoisting?", back: "Hoisting is JavaScript's default behavior of moving declarations to the top of their scope during compilation.", deckId: "2", difficulty: "medium", lastReviewed: null, correctCount: 0, incorrectCount: 0 },
  { id: "6", front: "When did WW2 end?", back: "1945", deckId: "3", difficulty: "easy", lastReviewed: new Date(), correctCount: 4, incorrectCount: 0 },
  { id: "7", front: "Who was the first US President?", back: "George Washington", deckId: "3", difficulty: "easy", lastReviewed: null, correctCount: 0, incorrectCount: 0 },
]

export function FlashcardsPage() {
  const [decks, setDecks] = useState<Deck[]>(initialDecks)
  const [cards, setCards] = useState<Flashcard[]>(initialCards)
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
  const [studyMode, setStudyMode] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>([])

  // Dialog states
  const [deckDialogOpen, setDeckDialogOpen] = useState(false)
  const [cardDialogOpen, setCardDialogOpen] = useState(false)
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null)
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null)

  // Form states
  const [deckName, setDeckName] = useState("")
  const [deckDescription, setDeckDescription] = useState("")
  const [deckColor, setDeckColor] = useState(deckColors[0])
  const [cardFront, setCardFront] = useState("")
  const [cardBack, setCardBack] = useState("")
  const [cardDifficulty, setCardDifficulty] = useState<"easy" | "medium" | "hard">("medium")

  const deckCards = selectedDeck ? cards.filter(c => c.deckId === selectedDeck.id) : []

  const startStudy = () => {
    const shuffled = [...deckCards].sort(() => Math.random() - 0.5)
    setShuffledCards(shuffled)
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setStudyMode(true)
  }

  const handleNext = () => {
    if (currentCardIndex < shuffledCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1)
      setIsFlipped(false)
    }
  }

  const handlePrev = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1)
      setIsFlipped(false)
    }
  }

  const handleAnswer = (correct: boolean) => {
    const card = shuffledCards[currentCardIndex]
    setCards(prev => prev.map(c => {
      if (c.id === card.id) {
        return {
          ...c,
          lastReviewed: new Date(),
          correctCount: correct ? c.correctCount + 1 : c.correctCount,
          incorrectCount: correct ? c.incorrectCount : c.incorrectCount + 1,
        }
      }
      return c
    }))
    handleNext()
  }

  const handleSaveDeck = () => {
    if (!deckName.trim()) return

    if (editingDeck) {
      setDecks(prev => prev.map(d =>
        d.id === editingDeck.id
          ? { ...d, name: deckName, description: deckDescription, color: deckColor }
          : d
      ))
    } else {
      const newDeck: Deck = {
        id: Date.now().toString(),
        name: deckName,
        description: deckDescription,
        color: deckColor,
      }
      setDecks(prev => [...prev, newDeck])
    }
    resetDeckForm()
    setDeckDialogOpen(false)
  }

  const handleSaveCard = () => {
    if (!cardFront.trim() || !cardBack.trim() || !selectedDeck) return

    if (editingCard) {
      setCards(prev => prev.map(c =>
        c.id === editingCard.id
          ? { ...c, front: cardFront, back: cardBack, difficulty: cardDifficulty }
          : c
      ))
    } else {
      const newCard: Flashcard = {
        id: Date.now().toString(),
        front: cardFront,
        back: cardBack,
        deckId: selectedDeck.id,
        difficulty: cardDifficulty,
        lastReviewed: null,
        correctCount: 0,
        incorrectCount: 0,
      }
      setCards(prev => [...prev, newCard])
    }
    resetCardForm()
    setCardDialogOpen(false)
  }

  const resetDeckForm = () => {
    setDeckName("")
    setDeckDescription("")
    setDeckColor(deckColors[0])
    setEditingDeck(null)
  }

  const resetCardForm = () => {
    setCardFront("")
    setCardBack("")
    setCardDifficulty("medium")
    setEditingCard(null)
  }

  const openEditDeck = (deck: Deck) => {
    setEditingDeck(deck)
    setDeckName(deck.name)
    setDeckDescription(deck.description)
    setDeckColor(deck.color)
    setDeckDialogOpen(true)
  }

  const openEditCard = (card: Flashcard) => {
    setEditingCard(card)
    setCardFront(card.front)
    setCardBack(card.back)
    setCardDifficulty(card.difficulty)
    setCardDialogOpen(true)
  }

  const deleteDeck = (deckId: string) => {
    setDecks(prev => prev.filter(d => d.id !== deckId))
    setCards(prev => prev.filter(c => c.deckId !== deckId))
    if (selectedDeck?.id === deckId) {
      setSelectedDeck(null)
    }
  }

  const deleteCard = (cardId: string) => {
    setCards(prev => prev.filter(c => c.id !== cardId))
  }

  // Study Mode View
  if (studyMode && shuffledCards.length > 0) {
    const currentCard = shuffledCards[currentCardIndex]
    const progress = ((currentCardIndex + 1) / shuffledCards.length) * 100

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setStudyMode(false)}>
            <ChevronLeft className="size-4 mr-2" />
            Back to Deck
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentCardIndex + 1} / {shuffledCards.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Flashcard */}
        <div
          className="relative h-80 cursor-pointer perspective-1000"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div
            className={cn(
              "absolute inset-0 bg-card border rounded-xl p-8 flex items-center justify-center text-center transition-all duration-500 backface-hidden",
              isFlipped && "rotate-y-180"
            )}
            style={{ backfaceVisibility: "hidden" }}
          >
            <div>
              <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wide">Question</p>
              <p className="text-xl font-medium">{currentCard.front}</p>
              <p className="text-sm text-muted-foreground mt-6">Click to reveal answer</p>
            </div>
          </div>
          <div
            className={cn(
              "absolute inset-0 bg-card border rounded-xl p-8 flex items-center justify-center text-center transition-all duration-500 backface-hidden rotate-y-180",
              isFlipped && "rotate-y-0"
            )}
            style={{
              backfaceVisibility: "hidden",
              transform: isFlipped ? "rotateY(0deg)" : "rotateY(180deg)"
            }}
          >
            <div>
              <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wide">Answer</p>
              <p className="text-xl font-medium">{currentCard.back}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrev}
            disabled={currentCardIndex === 0}
          >
            <ChevronLeft className="size-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => handleAnswer(false)}
          >
            <X className="size-5 mr-2" />
            Wrong
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="text-green-500 hover:text-green-600 hover:bg-green-50"
            onClick={() => handleAnswer(true)}
          >
            <Check className="size-5 mr-2" />
            Correct
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleNext}
            disabled={currentCardIndex === shuffledCards.length - 1}
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>
      </div>
    )
  }

  // Deck View
  if (selectedDeck) {
    const masteryRate = deckCards.length > 0
      ? Math.round((deckCards.filter(c => c.correctCount > c.incorrectCount).length / deckCards.length) * 100)
      : 0

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setSelectedDeck(null)}>
              <ChevronLeft className="size-4 mr-2" />
              All Decks
            </Button>
            <div className="flex items-center gap-3">
              <div
                className="size-4 rounded-full"
                style={{ backgroundColor: selectedDeck.color }}
              />
              <h1 className="text-2xl font-semibold">{selectedDeck.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={cardDialogOpen} onOpenChange={setCardDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetCardForm}>
                  <Plus className="size-4 mr-2" />
                  Add Card
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingCard ? "Edit Card" : "Add Flashcard"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Front (Question)</Label>
                    <Textarea
                      value={cardFront}
                      onChange={(e) => setCardFront(e.target.value)}
                      placeholder="Enter the question or term"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Back (Answer)</Label>
                    <Textarea
                      value={cardBack}
                      onChange={(e) => setCardBack(e.target.value)}
                      placeholder="Enter the answer or definition"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select value={cardDifficulty} onValueChange={(v) => setCardDifficulty(v as typeof cardDifficulty)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSaveCard} className="w-full">
                    {editingCard ? "Save Changes" : "Add Card"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={startStudy} disabled={deckCards.length === 0}>
              <Brain className="size-4 mr-2" />
              Study
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Layers className="size-4" />
              <span className="text-sm">Total Cards</span>
            </div>
            <span className="text-2xl font-semibold">{deckCards.length}</span>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Target className="size-4" />
              <span className="text-sm">Mastery Rate</span>
            </div>
            <span className="text-2xl font-semibold">{masteryRate}%</span>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Zap className="size-4" />
              <span className="text-sm">To Review</span>
            </div>
            <span className="text-2xl font-semibold">
              {deckCards.filter(c => !c.lastReviewed).length}
            </span>
          </div>
        </div>

        {/* Cards List */}
        <div className="space-y-2">
          {deckCards.map((card) => (
            <div
              key={card.id}
              className="bg-card border rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{card.front}</p>
                <p className="text-sm text-muted-foreground truncate">{card.back}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">{card.correctCount}</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-red-500">{card.incorrectCount}</span>
                </div>
                <span className={cn(
                  "px-2 py-1 rounded text-xs",
                  card.difficulty === "easy" && "bg-green-500/10 text-green-500",
                  card.difficulty === "medium" && "bg-yellow-500/10 text-yellow-500",
                  card.difficulty === "hard" && "bg-red-500/10 text-red-500"
                )}>
                  {card.difficulty}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditCard(card)}>
                      <Pencil className="size-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => deleteCard(card.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="size-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}

          {deckCards.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="size-12 mx-auto mb-4 opacity-50" />
              <p>No cards in this deck yet</p>
              <p className="text-sm">Add some flashcards to start studying</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Decks Overview
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Flashcards</h1>
          <p className="text-sm text-muted-foreground">Create and study flashcard decks</p>
        </div>
        <Dialog open={deckDialogOpen} onOpenChange={setDeckDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetDeckForm}>
              <Plus className="size-4 mr-2" />
              New Deck
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDeck ? "Edit Deck" : "Create Deck"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  placeholder="e.g., Spanish Vocabulary"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={deckDescription}
                  onChange={(e) => setDeckDescription(e.target.value)}
                  placeholder="What's this deck about?"
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  {deckColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setDeckColor(color)}
                      className={cn(
                        "size-8 rounded-full transition-transform",
                        deckColor === color && "ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleSaveDeck} className="w-full">
                {editingDeck ? "Save Changes" : "Create Deck"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <FolderOpen className="size-4" />
            <span className="text-sm">Total Decks</span>
          </div>
          <span className="text-2xl font-semibold">{decks.length}</span>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Layers className="size-4" />
            <span className="text-sm">Total Cards</span>
          </div>
          <span className="text-2xl font-semibold">{cards.length}</span>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Brain className="size-4" />
            <span className="text-sm">Cards Studied</span>
          </div>
          <span className="text-2xl font-semibold">
            {cards.filter(c => c.lastReviewed).length}
          </span>
        </div>
      </div>

      {/* Decks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {decks.map((deck) => {
          const deckCardCount = cards.filter(c => c.deckId === deck.id).length
          return (
            <div
              key={deck.id}
              className="bg-card border rounded-lg p-5 cursor-pointer hover:border-foreground/20 transition-colors"
              onClick={() => setSelectedDeck(deck)}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="size-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${deck.color}20` }}
                >
                  <BookOpen className="size-5" style={{ color: deck.color }} />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditDeck(deck) }}>
                      <Pencil className="size-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => { e.stopPropagation(); deleteDeck(deck.id) }}
                      className="text-destructive"
                    >
                      <Trash2 className="size-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <h3 className="font-medium mb-1">{deck.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{deck.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{deckCardCount} cards</span>
              </div>
            </div>
          )
        })}
      </div>

      {decks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="size-12 mx-auto mb-4 opacity-50" />
          <p>No flashcard decks yet</p>
          <p className="text-sm">Create a deck to start studying</p>
        </div>
      )}
    </div>
  )
}
