import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Optional,
  SimpleChanges,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormGroupDirective,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { UiBase } from './ui-base';

const Months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
type MonthNames =
  | 'January'
  | 'February'
  | 'March'
  | 'April'
  | 'May'
  | 'June'
  | 'July'
  | 'August'
  | 'September'
  | 'October'
  | 'November'
  | 'December';

/**
 * This class was created to hold the state for each day in 6 weeks.
 * This way we only have to mutate state for each day instead of reallocating in memory for every month change.
 */
class CalendarDay {
  date: Date = new Date();
  isCurrentMonth: boolean = false;
  isToday: boolean = false;
  disabled: boolean = false;
  setDate(date: Date, selectedMonth: number, selectedYear: number) {
    this.date = date;
    this.isCurrentMonth =
      date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    let d = new Date();
    this.isToday =
      date.getFullYear() === d.getFullYear() &&
      date.getMonth() === d.getMonth() &&
      date.getDate() === d.getDate();
  }
  get datetime() {
    return (
      this.date.getFullYear() +
      '-' +
      (this.date.getMonth() + 1) +
      '-' +
      this.date.getDate()
    );
  }
  checkDisabled(
    minDate: Date | null | undefined,
    maxDate: Date | null | undefined,
    filterFn: (date: Date) => boolean
  ) {
    this.disabled =
      (minDate && this.date < minDate) ||
      (maxDate && this.date > maxDate) ||
      !filterFn(this.date) ||
      false;
  }
}

@Component({
  selector: 'ui-date',
  template: `
    <span class="w-full whitespace-nowrap px-3">
      {{ value ? value.toDateString() : 'Select a date' }}
      <svg
        uiIcon
        class="float-right ml-2 mr-1 inline-block h-5 w-5"
        name="today-material"
      ></svg>
    </span>
    <div class="relative top-9">
      <div *ngIf="panelOpen" class="absolute h-0 w-0">
        <div
          class="relative right-80 z-50 w-80 rounded-md border border-neutral-300 bg-neutral-50 px-6 py-4"
        >
          <div class="flex items-center">
            <h2 class="flex-auto text-sm font-semibold text-gray-900">
              {{ months[monthSelected] }} {{ yearSelected }}
            </h2>
            <button
              type="button"
              class="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
              (click)="previousMonth()"
            >
              <span class="sr-only">Previous month</span>
              <svg
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
            <button
              type="button"
              class="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
              (click)="nextMonth()"
            >
              <span class="sr-only">Next month</span>
              <svg
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
          <div
            class="mt-10 grid grid-cols-7 text-center text-xs leading-6 text-gray-500"
          >
            <div>S</div>
            <div>M</div>
            <div>T</div>
            <div>W</div>
            <div>T</div>
            <div>F</div>
            <div>S</div>
          </div>
          <div class="mt-2 grid grid-cols-7 text-sm">
            <div class="py-2" *ngFor="let day of calendar">
              <button
                type="button"
                class="mx-auto flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-200"
                [ngClass]="
                  (day.isCurrentMonth
                    ? ' text-neutral-900'
                    : ' text-neutral-400') +
                  (day.isToday
                    ? ' text-secondary bg-neutral-100 font-semibold'
                    : ' ') +
                  (day.date === value
                    ? 'bg-primary font-semibold text-neutral-50'
                    : ' ') +
                  (day.disabled
                    ? ' bg-transparent font-thin text-neutral-200 hover:bg-transparent'
                    : ' ')
                "
                [disabled]="day.disabled"
                (click)="writeValue(day.date)"
              >
                <time [dateTime]="day.datetime">{{ day.date.getDate() }}</time>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  providers: [
    { provide: NG_VALUE_ACCESSOR, multi: true, useExisting: UiDate },
    { provide: NG_VALIDATORS, multi: true, useExisting: UiDate },
  ],
})
export class UiDate extends UiBase<Date> implements OnChanges, OnDestroy {
  focused = false;
  months = Months;
  panelOpen = false;
  @Input()
  get min(): Date | null | undefined {
    return this._min;
  }
  set min(value: Date | null | undefined) {
    value ? value.setHours(0, 0, 0, 0) : null;
    this._min = value;
    this.stateChanges.next();
  }
  _min: Date | null | undefined;
  @Input()
  get max(): Date | null | undefined {
    return this._max;
  }
  set max(value: Date | null | undefined) {
    value ? value.setHours(0, 0, 0, 0) : null;
    this._max = value;
    this.stateChanges.next();
  }
  _max: Date | null | undefined;

  @Input('filter') filterFn: (date: Date) => boolean = () => true;
  // get filter(): CallableFunction | null | undefined {
  //   return this._max;
  // }
  // set filter(value: Date | null | undefined) {
  //   value ? value.setHours(0,0,0,0) : null;
  //   this._max = value;
  //   this.stateChanges.next();
  // }
  // _max: Date | null | undefined;

  @HostListener('focus')
  onFocus() {
    this.focused = true;
    this.panelOpen = true;
  }
  @HostListener('blur')
  onBlur() {
    this.focused = false;
    this.onCheckPanel();
  }
  @HostListener('mouseover')
  onMouseOver() {
    this._mouseOver = true;
    this.onCheckPanel();
  }
  @HostListener('mouseleave')
  onMouseOut() {
    this._mouseOver = false;
    this.onCheckPanel();
  }
  _mouseOver = false;

  date = new Date();
  monthSelected = this.date.getMonth();
  yearSelected = this.date.getFullYear();
  calendar: CalendarDay[] = Array(42)
    .fill(new CalendarDay())
    .map((_) => new CalendarDay());

  getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };
  getCalendarIndexStart = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  buildCalendar = (year: number, month: number) => {
    const days = this.getDaysInMonth(year, month);
    let start = this.getCalendarIndexStart(year, month);
    for (let i = 1; i <= 42; i++) {
      let date = new Date(year, month, i - start);
      this.calendar[i - 1].setDate(date, this.monthSelected, this.yearSelected);
      this.calendar[i - 1].checkDisabled(this.min, this.max, this.filterFn);
    }
    //console.table(this.calendar);
  };
  constructor(
    @Optional() _parentFormGroupExt: FormGroupDirective,
    private _elementRefExt: ElementRef<HTMLElement>
  ) {
    super(_parentFormGroupExt, _elementRefExt);
    const element = this._elementRefExt.nativeElement;
    const nodeName = element.nodeName.toLowerCase();
    this.buildCalendar(this.yearSelected, this.monthSelected);
  }

  override ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);
    this.buildCalendar(this.yearSelected, this.monthSelected);
  }

  onCheckPanel() {
    if (!this._mouseOver && !this.focused) {
      this.panelOpen = false;
    }
  }
  nextMonth = () => {
    if (this.monthSelected === 11) {
      this.monthSelected = 0;
      this.yearSelected++;
    } else {
      this.monthSelected++;
    }
    this.buildCalendar(this.yearSelected, this.monthSelected);
  };
  previousMonth = () => {
    if (this.monthSelected === 0) {
      this.monthSelected = 11;
      this.yearSelected--;
    } else {
      this.monthSelected--;
    }
    this.buildCalendar(this.yearSelected, this.monthSelected);
  };
}
