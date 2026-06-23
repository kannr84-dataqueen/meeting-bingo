import { Button } from './ui/Button'

interface LandingPageProps {
  onNewGame: () => void
}

export default function LandingPage({ onNewGame }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Meeting Bingo</h1>
          <p className="text-lg" style={{ color: '#374151' }}>
            Turn any meeting into a game
          </p>
        </div>

        <Button variant="primary" size="lg" onClick={onNewGame} className="w-full max-w-xs">
          New Game
        </Button>

        <p className="text-sm" style={{ color: '#374151' }}>
          Audio processed locally. Never recorded.
        </p>

        <section className="w-full" aria-labelledby="how-it-works-heading">
          <h2
            id="how-it-works-heading"
            className="text-base font-semibold text-gray-900 mb-4 text-center"
          >
            How It Works
          </h2>
          <ol className="steps-list">
            <li>Pick a category</li>
            <li>Allow microphone access (or play manually)</li>
            <li>Tap squares when you hear a buzzword — or let the mic do it</li>
            <li>Get BINGO!</li>
          </ol>
        </section>
      </div>
    </div>
  )
}
