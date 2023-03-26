export interface Options {
  debug?: boolean
  locale?: string
  type?: 'date' | 'time' | 'datetime'
}

export interface Locale {
  name: string
  weekDays: string[]
  months: string[]
}
