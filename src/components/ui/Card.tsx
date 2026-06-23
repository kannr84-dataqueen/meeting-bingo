import { cn } from '../../lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn('rounded-xl shadow-md bg-white p-4', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Card }
export type { CardProps }
