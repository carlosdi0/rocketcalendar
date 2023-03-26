import { Locale, Options } from './types'
import * as locale from './locales/en'

class RocketCalendar {
  private _isOpened: boolean = false
  private _selectedDate: Date | undefined
  private today: Date = new Date()
  private calendarComponent: HTMLElement | undefined

  public locale: Locale
  public options: Options
  public input: HTMLInputElement
  public disabledDates: Date[] = [new Date(2023, 2, 5)]

  // constructor of the class that receive the input and the options
  constructor(element: HTMLInputElement, options: Options) {
    this.input = element
    this.options = options
    this.locale = locale
    this.init()
  }

  get selectedDate() {
    return this._selectedDate
  }

  set selectedDate(value: Date | undefined) {
    this._selectedDate = value
    this.printValue()
  }

  init = async () => {
    if (this.options.locale && this.options.locale !== 'en') {
      this.locale = await import(`./locales/${this.options.locale}`)
    }
    if (this.input.value) this.selectedDate = new Date(this.input.value)
    this.subscribeInputEvents()
    const calendarDate = this.selectedDate || this.today
    const month = calendarDate.getMonth()
    const year = calendarDate.getFullYear()
    this.renderCalendar(month, year)
  }

  printValue = () => {
    if (this.selectedDate) {
      if (this.options.type === 'time') {
        this.input.value = this.selectedDate.toLocaleTimeString(
          this.locale.name,
          {
            hour: '2-digit',
            minute: '2-digit'
          }
        )
      } else if (this.options.type === 'datetime') {
        this.input.value = this.selectedDate.toLocaleString(this.locale.name, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      } else {
        this.input.value = this.selectedDate.toLocaleDateString(
          this.locale.name,
          {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }
        )
      }
    }
  }

  // method to render the calendar
  renderCalendar = (month: number, year: number) => {
    this.calendarComponent = this.generateCalendar(month, year)
    document.body.appendChild(this.calendarComponent)
  }

  // method to generate the calendar
  generateCalendar = (month: number, year: number): HTMLElement => {
    const calendar = document.createElement('div')
    calendar.classList.add('calendar')
    calendar.appendChild(this.generateHeader(month, year))
    calendar.appendChild(this.generateBody(month, year))
    calendar.appendChild(this.generateFooter())
    return calendar
  }

  // method to generate the header of the calendar
  generateHeader = (month: number, year: number): HTMLElement => {
    const header = document.createElement('div')
    header.classList.add('calendar__header')
    const monthName = document.createElement('div')
    monthName.classList.add('calendar__month-name')
    monthName.innerText = `${this.locale.months[month]} ${year}`
    header.appendChild(monthName)
    return header
  }

  // method to generate the body of the calendar
  generateBody = (month: number, year: number): HTMLElement => {
    const body = document.createElement('div')
    body.classList.add('calendar__body')
    body.appendChild(this.generateWeekDays())
    body.appendChild(this.generateDays(month, year))
    return body
  }

  // method to generate the week days of the calendar
  generateWeekDays = (): HTMLElement => {
    const monthDays = document.createElement('div')
    monthDays.classList.add('calendar__week-days')
    for (const weekDay of this.locale.weekDays) {
      const day = document.createElement('div')
      day.classList.add('calendar__week-day')
      day.innerText = weekDay
      monthDays.appendChild(day)
    }
    return monthDays
  }

  // method to generate the days of the month selected but with the current day highlighted
  generateDays = (month: number, year: number): HTMLElement => {
    const days = document.createElement('div')
    days.classList.add('calendar__days')
    const numberOfDays = this.getDaysInMonth(month, year)
    const firstDay = new Date(year, month, 1).getDay()
    let monthDay = 1
    for (let i = 1; i <= 42; i++) {
      const dayDate = new Date(year, month, monthDay)
      const isDisabled = this.disabledDates.some((date) =>
        this.isSameDay(date, dayDate)
      )
      const isToday = this.isSameDay(this.today, dayDate)
      const isSelected =
        this.selectedDate && this.isSameDay(this.selectedDate, dayDate)
      const day = document.createElement('div')
      day.classList.add('calendar__day')
      if (i >= firstDay && monthDay <= numberOfDays) {
        day.innerText = monthDay.toString()
        if (isToday) day.classList.add('calendar__day--is-today')
        if (isSelected) day.classList.add('calendar__day--is-selected')
        if (isDisabled) day.classList.add('calendar__day--is-disabled')
        if (!isSelected && !isDisabled)
          day.addEventListener('click', () => {
            this.selectedDate = dayDate
          })
        monthDay++
      } else {
        day.classList.add('calendar__day--is-empty')
      }

      days.appendChild(day)
    }
    return days
  }

  // method that compare if the current day is the same as the day selected
  isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

  // method that return the number of days in the month selected
  getDaysInMonth = (month: number, year: number): number => {
    return new Date(year, month + 1, 0).getDate()
  }

  // method to generate the footer of the calendar
  generateFooter = (): HTMLElement => {
    const footer = document.createElement('div')
    footer.classList.add('calendar__footer')
    return footer
  }

  // method to subscribe the events of the input
  subscribeInputEvents = () => {
    this.input.addEventListener('focus', () => (this.isOpened = true))
    // this.input.addEventListener('blur', () => (this.isOpened = false))
  }

  // method to get the state of the calendar
  get isOpened() {
    return this._isOpened
  }

  // method to open and close the calendar
  set isOpened(value: boolean) {
    this._isOpened = value
    if (value) {
      this.calendarComponent?.classList.add('calendar--is-opened')
    } else {
      this.calendarComponent?.classList.remove('calendar--is-opened')
    }
  }
}

export default RocketCalendar
