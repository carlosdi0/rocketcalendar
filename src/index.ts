import { Locale, Options } from './types'
import * as locale from './locales/en'

class RocketCalendar {
  private _isOpened: boolean = false
  private _selectedDate: Date | undefined
  private today: Date = new Date()
  private calendarComponent: HTMLElement | undefined
  private container: HTMLElement
  public locale: Locale
  public options: Options
  public input: HTMLInputElement
  public disabledDates: Date[] = []

  // constructor of the class that receive the input and the options
  constructor(element: HTMLInputElement, options: Options) {
    this.input = element
    this.options = options
    this.locale = { ...locale }
    const calendarDate = this.selectedDate || this.today
    const month = calendarDate.getMonth()
    const year = calendarDate.getFullYear()
    this.container = this.wrapElement(this.input)
    this.renderStyles()
    this.renderCalendar(month, year)
    this.init()
  }

  get selectedDate() {
    return this._selectedDate
  }

  set selectedDate(value: Date | undefined) {
    this._selectedDate = value
    this.printValue()
    if (value) {
      const month = value.getMonth()
      const year = value.getFullYear()
      this.renderCalendar(month, year)
    }
  }

  init = async () => {
    if (this.options.locale && this.options.locale !== 'en') {
      const localeImported: Locale = await import(
        `./locales/${this.options.locale}`
      )
      if (localeImported) this.locale = { ...localeImported }
    }
    if (this.input.value) this.selectedDate = new Date(this.input.value)
    this.subscribeInputEvents()
  }

  renderStyles = () => {
    const style = document.createElement('style')
    style.innerHTML = `
    .calendar {
      width: fit-content;
      max-width: 100%;
      border: 1px solid;
    }

    .calendar__header {
      border-bottom: 1px solid;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 5px;
    }

    .calendar__week-days {
      border-bottom: 1px solid;
    }

    .calendar__prev-month, .calendar__next-month {
      padding: 5px;
      cursor: pointer;
    }

    .calendar__week-days,
    .calendar__days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
    }

    .calendar__week-day,
    .calendar__day {
      text-align: center;
    }

    .calendar__day:not(.calendar__day--is-disabled) {
      cursor: pointer;
    }

    .calendar__day--is-today {
      background-color: #8e8e8e;
      color: #fff;
    }

    .calendar__day--is-disabled {
      color: #ccc;
      pointer-events: none;
    }

    .calendar__day--is-selected {
      background-color: #000;
      color: #fff;
    }

    .calendar__day:not(.calendar__day--is-disabled):hover {
      background-color: #eee;
      color: #000;
    }

    .calendar:not(.calendar--is-opened) {
      display: none;
    }
    `
    document.head.appendChild(style)
  }

  // method that wrap selected html element with a div
  wrapElement = (element: HTMLElement): HTMLElement => {
    const wrapper = document.createElement('div')
    wrapper.classList.add('rocket-calendar')
    element.parentNode?.insertBefore(wrapper, element)
    wrapper.appendChild(element)
    return wrapper
  }

  // method that print the selected date in the input with specific format
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
    if (!this.calendarComponent) {
      this.calendarComponent = this.generateCalendar(month, year)
      this.container.appendChild(this.calendarComponent)
    } else {
      this.updateCalendar(month, year)
    }
  }

  // method that update content of calendar
  updateCalendar = (month: number, year: number) => {
    const header = this.calendarComponent?.querySelector(
      '.calendar__header'
    ) as HTMLElement
    const body = this.calendarComponent?.querySelector(
      '.calendar__body'
    ) as HTMLElement
    header.innerHTML = ''
    body.innerHTML = ''
    Array.from(this.generateHeader(month, year).children).forEach((node) =>
      header.append(node)
    )
    Array.from(this.generateBody(month, year).children).forEach((node) =>
      body.append(node)
    )
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
    const prevMonthBtn = document.createElement('div')
    prevMonthBtn.classList.add('calendar__prev-month')
    prevMonthBtn.innerText = '<'
    prevMonthBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      const prevMonth = month - 1
      const prevYear = prevMonth < 0 ? year - 1 : year
      this.updateCalendar(prevMonth, prevYear)
    })
    header.appendChild(prevMonthBtn)
    const monthName = document.createElement('div')
    monthName.classList.add('calendar__month-name')
    monthName.innerText = `${this.locale.months[month]} ${year}`
    header.appendChild(monthName)
    const nextMonthBtn = document.createElement('div')
    nextMonthBtn.classList.add('calendar__next-month')
    nextMonthBtn.innerText = '>'
    nextMonthBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      const nextMonth = month + 1
      const nextYear = nextMonth > 11 ? year + 1 : year
      this.updateCalendar(nextMonth, nextYear)
    })
    header.appendChild(nextMonthBtn)
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
          day.addEventListener('click', (e) => {
            e.stopPropagation()
            this.selectedDate = dayDate
            this.isOpened = false
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
    this.input.addEventListener('focus', (e) => {
      this.isOpened = true
    })
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      if (!target.closest('.calendar') && target !== this.input) {
        this.isOpened = false
      }
    })
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
