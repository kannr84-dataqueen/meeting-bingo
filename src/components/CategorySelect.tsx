import { CATEGORIES } from '../data/categories'
import { useGameContext } from '../context/GameContext'
import type { CategoryId } from '../types'
import { cn } from '../lib/utils'
import { Button } from './ui/Button'

interface CategorySelectProps {
  onSelectCategory: () => void
  onBack: () => void
}

interface CategoryCardProps {
  id: CategoryId
  icon: string
  name: string
  description: string
  sampleWords: string[]
  isSelected: boolean
  onSelect: () => void
}

function CategoryCard({
  icon,
  name,
  description,
  sampleWords,
  isSelected,
  onSelect,
}: CategoryCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full text-left rounded-xl border-2 p-4 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50'
      )}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl" aria-hidden="true">
          {icon}
        </span>
        <div>
          <h3 className="font-semibold text-gray-900">{name}</h3>
          <p className="text-sm" style={{ color: '#374151' }}>
            {description}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {sampleWords.map(word => (
          <span
            key={word}
            className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700"
          >
            {word}
          </span>
        ))}
      </div>
    </button>
  )
}

export default function CategorySelect({ onSelectCategory, onBack }: CategorySelectProps) {
  const { startGame, gameState } = useGameContext()

  function handleSelect(categoryId: CategoryId) {
    startGame(categoryId)
    onSelectCategory()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200 bg-white">
        <Button variant="ghost" size="sm" onClick={onBack} aria-label="Back to home">
          ← Back
        </Button>
        <h1 className="text-lg font-semibold text-gray-900">Choose a Category</h1>
      </div>

      <div className="flex-1 px-4 py-6 flex flex-col gap-4 max-w-lg mx-auto w-full">
        {CATEGORIES.map(category => (
          <CategoryCard
            key={category.id}
            id={category.id}
            icon={category.icon}
            name={category.name}
            description={category.description}
            sampleWords={category.words.slice(0, 5)}
            isSelected={gameState.category === category.id}
            onSelect={() => handleSelect(category.id)}
          />
        ))}
      </div>
    </div>
  )
}
