import * as React from 'react'
import * as LucideIcons from 'lucide-react'
import { cn } from '@/lib/utils'

type IconPreviewProps = {
  name?: string | null
  className?: string
  fallbackName?: string
}

type IconComponent = React.ComponentType<{ className?: string }>

function resolveIcon(name?: string | null, fallbackName = 'HelpCircle') {
  const isRenderableComponent = (value: unknown): value is IconComponent =>
    typeof value === 'function' || (typeof value === 'object' && value !== null)

  const candidateName = (name ?? '').trim()
  const defaultIcon = LucideIcons.HelpCircle as unknown as IconComponent
  const fallback = LucideIcons[fallbackName as keyof typeof LucideIcons] as unknown
  const fallbackIcon = isRenderableComponent(fallback) ? fallback : defaultIcon

  if (!candidateName) {
    return fallbackIcon
  }

  const icon = LucideIcons[candidateName as keyof typeof LucideIcons] as unknown
  if (isRenderableComponent(icon)) {
    return icon
  }

  return fallbackIcon
}

export function IconPreview({ name, className, fallbackName }: IconPreviewProps) {
  const Icon = resolveIcon(name, fallbackName)
  return <Icon className={cn('size-4', className)} />
}
