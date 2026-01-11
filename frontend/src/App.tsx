import { Routes, Route, Navigate } from "react-router-dom"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { TasksPage } from "@/features/tasks"
import { NotesPage } from "@/features/notes"
import { HabitsPage } from "@/features/habits"
import { PomodoroPage } from "@/features/pomodoro"
import { BookmarksPage } from "@/features/bookmarks"
import { GoalsPage } from "@/features/goals"
import { FinancesPage } from "@/features/finances"
import { TimeTrackerPage } from "@/features/time-tracker"
import { KanbanPage } from "@/features/kanban"
import { JournalPage } from "@/features/journal"
import { ContactsPage } from "@/features/contacts"
import { ReadingPage } from "@/features/reading"
import { IdeasPage } from "@/features/ideas"
import { CalendarPage } from "@/features/calendar"
import { SubscriptionsPage } from "@/features/subscriptions"
import { WatchlistPage } from "@/features/watchlist"
import { SnippetsPage } from "@/features/snippets"
import { RecipesPage } from "@/features/recipes"
import { WorkoutsPage } from "@/features/workouts"
import { MoodPage } from "@/features/mood"
import { FlashcardsPage } from "@/features/flashcards"
import { WishlistPage } from "@/features/wishlist"
import { VehiclesPage } from "@/features/vehicles"
import { HorsesPage } from "@/features/horses"
import { PasswordsPage } from "@/features/passwords"
import { ConverterPage } from "@/features/converter"
import { CountdownsPage } from "@/features/countdowns"
import { DicePage } from "@/features/dice"
import { LinksPage } from "@/features/links"
import { QuotesPage } from "@/features/quotes"
import { BirthdaysPage } from "@/features/birthdays"
import { CalculatorPage } from "@/features/calculator"
import { ColorsPage } from "@/features/colors"
import { DebtsPage } from "@/features/debts"
import { GradesPage } from "@/features/grades"
import { GratitudePage } from "@/features/gratitude"
import { InventoryPage } from "@/features/inventory"
import { InvoicesPage } from "@/features/invoices"
import { JsonPage } from "@/features/json"
import { MarkdownPage } from "@/features/markdown"
import { MedicationsPage } from "@/features/medications"
import { PetsPage } from "@/features/pets"
import { PlantsPage } from "@/features/plants"
import { QRCodePage } from "@/features/qrcode"
import { RegexPage } from "@/features/regex"
import { SavingsPage } from "@/features/savings"
import { SleepPage } from "@/features/sleep"
import { TravelPage } from "@/features/travel"
import { WaterPage } from "@/features/water"
import { WeatherPage } from "@/features/weather"
import { LoginPage } from "@/features/auth"
import { AuthProvider } from "@/stores/auth-context"
import { ThemeProvider } from "@/stores/theme-context"
import { PreferencesProvider } from "@/stores/preferences-context"
import { ProtectedRoute } from "@/components/common/protected-route"
import { CommandPalette } from "@/components/common/command-palette"
// New imports
import { LoremPage } from "@/features/lorem"
import { DiffPage } from "@/features/diff"
import { CounterPage } from "@/features/counter"
import { CasePage } from "@/features/case"
import { UuidPage } from "@/features/uuid"
import { HashPage } from "@/features/hash"
import { Base64Page } from "@/features/base64"
import { GradientPage } from "@/features/gradient"
import { ShadowsPage } from "@/features/shadows"
import { TipPage } from "@/features/tip"
import { LoanPage } from "@/features/loan"
import { SalaryPage } from "@/features/salary"
import { BmiPage } from "@/features/bmi"
import { CaloriesPage } from "@/features/calories"
import { TimezonePage } from "@/features/timezone"
import { EpochPage } from "@/features/epoch"
import { StopwatchPage } from "@/features/stopwatch"
import { CronPage } from "@/features/cron"
import { JwtPage } from "@/features/jwt"
import { CsvPage } from "@/features/csv"
import { ChmodPage } from "@/features/chmod"
import { MetaPage } from "@/features/meta"
import { WheelPage } from "@/features/wheel"
import { ProsconsPage } from "@/features/proscons"
import { BucketPage } from "@/features/bucket"
import { AffirmationsPage } from "@/features/affirmations"
import { NetworthPage } from "@/features/networth"
import { BillsPage } from "@/features/bills"
import { ChoresPage } from "@/features/chores"
import { MealsPage } from "@/features/meals"
import { GroceryPage } from "@/features/grocery"
import { EventsPage } from "@/features/events"
import { WarrantyPage } from "@/features/warranty"
import { DocumentsPage } from "@/features/documents"
import { MeasurementsPage } from "@/features/measurements"
import { SchedulePage } from "@/features/schedule"
import { AssignmentsPage } from "@/features/assignments"
import { CitationsPage } from "@/features/citations"
import { PollsPage } from "@/features/polls"
import { BingoPage } from "@/features/bingo"
import { SecretSantaPage } from "@/features/secretsanta"
import { TriviaPage } from "@/features/trivia"
import { RsvpPage } from "@/features/rsvp"
import { RoutinesPage } from "@/features/routines"
import { ParkingPage } from "@/features/parking"
import { WifiPage } from "@/features/wifi"
import { MorsePage } from "@/features/morse"
import { BinaryPage } from "@/features/binary"
import { AspectPage } from "@/features/aspect"
import { MeetingCostPage } from "@/features/meetingcost"

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-full">
        <main className="relative flex-1 min-h-0 p-6 overflow-auto">
          {children}
        </main>
      </SidebarInset>
      <CommandPalette />
    </SidebarProvider>
  )
}

function App() {
  return (
    <ThemeProvider>
      <PreferencesProvider>
        <AuthProvider>
          <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/tasks" replace />} />
                  <Route path="/affirmations" element={<AffirmationsPage />} />
                  <Route path="/aspect" element={<AspectPage />} />
                  <Route path="/assignments" element={<AssignmentsPage />} />
                  <Route path="/base64" element={<Base64Page />} />
                  <Route path="/bills" element={<BillsPage />} />
                  <Route path="/binary" element={<BinaryPage />} />
                  <Route path="/bingo" element={<BingoPage />} />
                  <Route path="/birthdays" element={<BirthdaysPage />} />
                  <Route path="/bmi" element={<BmiPage />} />
                  <Route path="/bookmarks" element={<BookmarksPage />} />
                  <Route path="/bucket" element={<BucketPage />} />
                  <Route path="/calculator" element={<CalculatorPage />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/calories" element={<CaloriesPage />} />
                  <Route path="/case" element={<CasePage />} />
                  <Route path="/chmod" element={<ChmodPage />} />
                  <Route path="/chores" element={<ChoresPage />} />
                  <Route path="/citations" element={<CitationsPage />} />
                  <Route path="/colors" element={<ColorsPage />} />
                  <Route path="/contacts" element={<ContactsPage />} />
                  <Route path="/converter" element={<ConverterPage />} />
                  <Route path="/counter" element={<CounterPage />} />
                  <Route path="/countdowns" element={<CountdownsPage />} />
                  <Route path="/cron" element={<CronPage />} />
                  <Route path="/csv" element={<CsvPage />} />
                  <Route path="/debts" element={<DebtsPage />} />
                  <Route path="/dice" element={<DicePage />} />
                  <Route path="/diff" element={<DiffPage />} />
                  <Route path="/documents" element={<DocumentsPage />} />
                  <Route path="/epoch" element={<EpochPage />} />
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/finances" element={<FinancesPage />} />
                  <Route path="/flashcards" element={<FlashcardsPage />} />
                  <Route path="/goals" element={<GoalsPage />} />
                  <Route path="/grades" element={<GradesPage />} />
                  <Route path="/gradient" element={<GradientPage />} />
                  <Route path="/gratitude" element={<GratitudePage />} />
                  <Route path="/grocery" element={<GroceryPage />} />
                  <Route path="/habits" element={<HabitsPage />} />
                  <Route path="/hash" element={<HashPage />} />
                  <Route path="/horses" element={<HorsesPage />} />
                  <Route path="/ideas" element={<IdeasPage />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/invoices" element={<InvoicesPage />} />
                  <Route path="/journal" element={<JournalPage />} />
                  <Route path="/json" element={<JsonPage />} />
                  <Route path="/jwt" element={<JwtPage />} />
                  <Route path="/kanban" element={<KanbanPage />} />
                  <Route path="/links" element={<LinksPage />} />
                  <Route path="/loan" element={<LoanPage />} />
                  <Route path="/lorem" element={<LoremPage />} />
                  <Route path="/markdown" element={<MarkdownPage />} />
                  <Route path="/meals" element={<MealsPage />} />
                  <Route path="/measurements" element={<MeasurementsPage />} />
                  <Route path="/medications" element={<MedicationsPage />} />
                  <Route path="/meetingcost" element={<MeetingCostPage />} />
                  <Route path="/meta" element={<MetaPage />} />
                  <Route path="/mood" element={<MoodPage />} />
                  <Route path="/morse" element={<MorsePage />} />
                  <Route path="/networth" element={<NetworthPage />} />
                  <Route path="/notes" element={<NotesPage />} />
                  <Route path="/parking" element={<ParkingPage />} />
                  <Route path="/passwords" element={<PasswordsPage />} />
                  <Route path="/pets" element={<PetsPage />} />
                  <Route path="/plants" element={<PlantsPage />} />
                  <Route path="/polls" element={<PollsPage />} />
                  <Route path="/pomodoro" element={<PomodoroPage />} />
                  <Route path="/proscons" element={<ProsconsPage />} />
                  <Route path="/qrcode" element={<QRCodePage />} />
                  <Route path="/quotes" element={<QuotesPage />} />
                  <Route path="/reading" element={<ReadingPage />} />
                  <Route path="/recipes" element={<RecipesPage />} />
                  <Route path="/regex" element={<RegexPage />} />
                  <Route path="/routines" element={<RoutinesPage />} />
                  <Route path="/rsvp" element={<RsvpPage />} />
                  <Route path="/salary" element={<SalaryPage />} />
                  <Route path="/savings" element={<SavingsPage />} />
                  <Route path="/schedule" element={<SchedulePage />} />
                  <Route path="/secretsanta" element={<SecretSantaPage />} />
                  <Route path="/shadows" element={<ShadowsPage />} />
                  <Route path="/sleep" element={<SleepPage />} />
                  <Route path="/snippets" element={<SnippetsPage />} />
                  <Route path="/stopwatch" element={<StopwatchPage />} />
                  <Route path="/subscriptions" element={<SubscriptionsPage />} />
                  <Route path="/tasks" element={<TasksPage />} />
                  <Route path="/time" element={<TimeTrackerPage />} />
                  <Route path="/timezone" element={<TimezonePage />} />
                  <Route path="/tip" element={<TipPage />} />
                  <Route path="/travel" element={<TravelPage />} />
                  <Route path="/trivia" element={<TriviaPage />} />
                  <Route path="/uuid" element={<UuidPage />} />
                  <Route path="/vehicles" element={<VehiclesPage />} />
                  <Route path="/warranty" element={<WarrantyPage />} />
                  <Route path="/watchlist" element={<WatchlistPage />} />
                  <Route path="/water" element={<WaterPage />} />
                  <Route path="/weather" element={<WeatherPage />} />
                  <Route path="/wheel" element={<WheelPage />} />
                  <Route path="/wifi" element={<WifiPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/workouts" element={<WorkoutsPage />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />
          </Routes>
        </AuthProvider>
      </PreferencesProvider>
    </ThemeProvider>
  )
}

export default App
