import * as React from 'react'
import {
  FEATURE_ICON_OPTIONS,
  HISTORY_ICON_OPTIONS,
} from '@/lib/icon-names'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  AirVent,
  AlertTriangle,
  BadgeCheck,
  Battery,
  Bluetooth,
  Calendar,
  CalendarCheck,
  Camera,
  Car,
  CheckCircle,
  ClipboardCheck,
  ClipboardList,
  Clock,
  FileCheck,
  FileText,
  Fuel,
  Gauge,
  History,
  Key,
  MapPin,
  Moon,
  Navigation,
  PaintBucket,
  Radio,
  Receipt,
  Shield,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Speaker,
  Tag,
  Users,
  Wrench,
  XCircle,
  Zap,
  HelpCircle,
} from 'lucide-react'

const ICON_COMPONENTS: Record<string, React.ComponentType<{ className?: string }>> = {
  AirVent,
  AlertTriangle,
  BadgeCheck,
  Battery,
  Bluetooth,
  Calendar,
  CalendarCheck,
  Camera,
  Car,
  CheckCircle,
  ClipboardCheck,
  ClipboardList,
  Clock,
  FileCheck,
  FileText,
  Fuel,
  Gauge,
  History,
  Key,
  MapPin,
  Moon,
  Navigation,
  PaintBucket,
  Radio,
  Receipt,
  Shield,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Speaker,
  Tag,
  Users,
  Wrench,
  XCircle,
  Zap,
}

const getIconComponent = (name: string) => ICON_COMPONENTS[name] ?? HelpCircle

type IconPickerProps = {
  type: 'feature' | 'history'
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function IconDisplay({ name, className }: { name: string; className?: string }) {
  const Icon = getIconComponent(name)
  return <Icon className={cn('size-4', className)} />
}

export function IconPicker({
  type,
  value,
  onChange,
  label,
  placeholder,
  disabled,
  className,
}: IconPickerProps) {
  const options = type === 'feature' ? FEATURE_ICON_OPTIONS : HISTORY_ICON_OPTIONS
  const selected = options.find((option) => option.name === value)

  return (
    <div className={cn('space-y-2', className)}>
      {label ? (
        <label className="text-sm font-medium">{label}</label>
      ) : null}
      <Select
        value={value}
        onValueChange={(next) => {
          if (next) onChange(next)
        }}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder ?? 'Select an icon'}>
            {selected ? (
              <span className="flex items-center gap-2">
                <IconDisplay name={selected.name} />
                <span>{selected.label}</span>
              </span>
            ) : null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.name} value={option.name}>
              <IconDisplay name={option.name} />
              <span>{option.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
