import { Locale, Options } from './types';
declare class RocketCalendar {
    private _isOpened;
    private _selectedDate;
    private today;
    private calendarComponent;
    private container;
    locale: Locale;
    options: Options;
    input: HTMLInputElement;
    disabledDates: Date[];
    constructor(element: HTMLInputElement, options: Options);
    get selectedDate(): Date | undefined;
    set selectedDate(value: Date | undefined);
    init: () => Promise<void>;
    renderStyles: () => void;
    wrapElement: (element: HTMLElement) => HTMLElement;
    printValue: () => void;
    renderCalendar: (month: number, year: number) => void;
    generateCalendar: (month: number, year: number) => HTMLElement;
    generateHeader: (month: number, year: number) => HTMLElement;
    generateBody: (month: number, year: number) => HTMLElement;
    generateWeekDays: () => HTMLElement;
    generateDays: (month: number, year: number) => HTMLElement;
    isSameDay: (date1: Date, date2: Date) => boolean;
    getDaysInMonth: (month: number, year: number) => number;
    generateFooter: () => HTMLElement;
    subscribeInputEvents: () => void;
    get isOpened(): boolean;
    set isOpened(value: boolean);
}
export default RocketCalendar;
