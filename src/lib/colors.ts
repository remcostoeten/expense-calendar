export const COLOR_OPTIONS = [
  { value: "blue", label: "Blue", class: "bg-blue-500", hex: "#3b82f6" },
  { value: "emerald", label: "Emerald", class: "bg-emerald-500", hex: "#10b981" },
  { value: "orange", label: "Orange", class: "bg-orange-500", hex: "#f97316" },
  { value: "violet", label: "Violet", class: "bg-violet-500", hex: "#8b5cf6" },
  { value: "rose", label: "Rose", class: "bg-rose-500", hex: "#f43f5e" },
  { value: "cyan", label: "Cyan", class: "bg-cyan-500", hex: "#06b6d4" },
  { value: "pink", label: "Pink", class: "bg-pink-500", hex: "#ec4899" },
  { value: "red", label: "Red", class: "bg-red-500", hex: "#ef4444" },
  { value: "amber", label: "Amber", class: "bg-amber-500", hex: "#f59e0b" },
  { value: "teal", label: "Teal", class: "bg-teal-500", hex: "#14b8a6" },
  { value: "indigo", label: "Indigo", class: "bg-indigo-500", hex: "#6366f1" },
  { value: "purple", label: "Purple", class: "bg-purple-500", hex: "#d946ef" },
] as const

export const COLOR_MAP: Record<string, string> = {
  "#10b981": "emerald",
  "#f97316": "orange",
  "#8b5cf6": "violet",
  "#3b82f6": "blue",
  "#f43f5e": "rose",
  "#06b6d4": "cyan",
  "#ec4899": "pink",
  "#ef4444": "red",
  "#f59e0b": "amber",
  "#14b8a6": "teal",
  "#6366f1": "indigo",
  "#d946ef": "purple",
} as const

export const COLOR_CLASSES: Record<string, string> = {
  blue: "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-200",
  emerald: "bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-200",
  orange: "bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900/30 dark:border-orange-700 dark:text-orange-200",
  violet: "bg-violet-100 border-violet-300 text-violet-800 dark:bg-violet-900/30 dark:border-violet-700 dark:text-violet-200",
  rose: "bg-rose-100 border-rose-300 text-rose-800 dark:bg-rose-900/30 dark:border-rose-700 dark:text-rose-200",
  cyan: "bg-cyan-100 border-cyan-300 text-cyan-800 dark:bg-cyan-900/30 dark:border-cyan-700 dark:text-cyan-200",
  pink: "bg-pink-100 border-pink-300 text-pink-800 dark:bg-pink-900/30 dark:border-pink-700 dark:text-pink-200",
  red: "bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-200",
  amber: "bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-200",
  teal: "bg-teal-100 border-teal-300 text-teal-800 dark:bg-teal-900/30 dark:border-teal-700 dark:text-teal-200",
  indigo: "bg-indigo-100 border-indigo-300 text-indigo-800 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-200",
  purple: "bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-200",
} as const

export function getColorByValue(value: string) {
  return COLOR_OPTIONS.find(color => color.value === value)
}

export function getColorByHex(hex: string) {
  return COLOR_OPTIONS.find(color => color.hex === hex)
}

export function getColorClasses(color: string) {
  return COLOR_CLASSES[color] || COLOR_CLASSES.blue
}

export function getColorClass(color: string) {
  const colorOption = COLOR_OPTIONS.find(c => c.value === color)
  return colorOption?.class || COLOR_OPTIONS[0].class
}
