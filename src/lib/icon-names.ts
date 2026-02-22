export const FEATURE_ICON_OPTIONS = [
  { name: 'Car', label: 'Car' },
  { name: 'Fuel', label: 'Fuel' },
  { name: 'Gauge', label: 'Gauge' },
  { name: 'Wrench', label: 'Wrench' },
  { name: 'Sparkles', label: 'Sparkles' },
  { name: 'ShieldCheck', label: 'Shield Check' },
  { name: 'Shield', label: 'Shield' },
  { name: 'AirVent', label: 'Air Vent' },
  { name: 'Bluetooth', label: 'Bluetooth' },
  { name: 'Camera', label: 'Camera' },
  { name: 'Navigation', label: 'Navigation' },
  { name: 'MapPin', label: 'Map Pin' },
  { name: 'Sun', label: 'Sun' },
  { name: 'Moon', label: 'Moon' },
  { name: 'Snowflake', label: 'Snowflake' },
  { name: 'Radio', label: 'Radio' },
  { name: 'Speaker', label: 'Speaker' },
  { name: 'Battery', label: 'Battery' },
  { name: 'Key', label: 'Key' },
  { name: 'Zap', label: 'Zap' },
]

export const HISTORY_ICON_OPTIONS = [
  { name: 'ClipboardCheck', label: 'Clipboard Check' },
  { name: 'ClipboardList', label: 'Clipboard List' },
  { name: 'History', label: 'History' },
  { name: 'FileText', label: 'File Text' },
  { name: 'FileCheck', label: 'File Check' },
  { name: 'AlertTriangle', label: 'Alert Triangle' },
  { name: 'CheckCircle', label: 'Check Circle' },
  { name: 'XCircle', label: 'X Circle' },
  { name: 'Calendar', label: 'Calendar' },
  { name: 'CalendarCheck', label: 'Calendar Check' },
  { name: 'Clock', label: 'Clock' },
  { name: 'BadgeCheck', label: 'Badge Check' },
  { name: 'ShieldCheck', label: 'Shield Check' },
  { name: 'Wrench', label: 'Wrench' },
  { name: 'Tag', label: 'Tag' },
  { name: 'PaintBucket', label: 'Paint Bucket' },
  { name: 'Key', label: 'Key' },
  { name: 'Users', label: 'Users' },
  { name: 'Car', label: 'Car' },
  { name: 'Receipt', label: 'Receipt' },
]

export const FEATURE_ICON_NAMES = FEATURE_ICON_OPTIONS.map((option) => option.name)
export const HISTORY_ICON_NAMES = HISTORY_ICON_OPTIONS.map((option) => option.name)

const featureIconSet = new Set(FEATURE_ICON_NAMES)
const historyIconSet = new Set(HISTORY_ICON_NAMES)

export const isFeatureIconName = (value: string) => featureIconSet.has(value)
export const isHistoryIconName = (value: string) => historyIconSet.has(value)
