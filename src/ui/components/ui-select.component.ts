import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Optional,
  Output,
} from '@angular/core';
import { ControlValueAccessor, FormGroupDirective } from '@angular/forms';
import { UiBase } from './ui-base';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'ui-select',
  template: `
    &nbsp;
    <span class="ml-2 mr-6 truncate">{{ displayValue() }}</span>
    <span
      class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"
    >
      <svg
        class="h-5 w-5 text-gray-400"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75
                0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1
                0l-3.25-3.5a.75.75 0 01.04-1.06z"
          clip-rule="evenodd"
        />
      </svg>
    </span>
    <div *ngIf="panelOpen" [@enterAnimation] class="absolute z-10 w-full">
      <ul
        class="mt-10 max-h-60 w-full overflow-auto rounded-md bg-neutral-50 py-1 text-base shadow-lg ring-1
        ring-black ring-opacity-5 focus:outline-none sm:text-sm"
        tabindex="-1"
        role="listbox"
        aria-labelledby="listbox-label"
      >
        <li
          class="group relative cursor-default select-none rounded py-2 pl-3 pr-9 text-gray-900 hover:bg-sky-600 hover:text-white"
          role="option"
          *ngFor="let option of options; index as i"
          (click)="selectOption(i)"
        >
          <span
            class="block truncate"
            [ngClass]="option === value ? 'font-semibold' : 'font-normal'"
          >
            {{ displayOption(option) }}
          </span>
          <span
            *ngIf="multiple ? multipleValuesIndex[i] : option === value"
            class="absolute inset-y-0 right-0 flex items-center pr-4 text-sky-600 group-hover:text-white"
          >
            <svg
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
        </li>
      </ul>
    </div>
  `,
  animations: [
    trigger('enterAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(-10%)', opacity: 0 }),
        animate('100ms', style({ transform: 'translateY(0)', opacity: 1 })),
      ]),
      transition(':leave', [
        style({ transform: 'translateY(0)', opacity: 1 }),
        animate('100ms', style({ transform: 'translateY(-10%)', opacity: 0 })),
      ]),
    ]),
  ],
})
export class UiSelect
  extends UiBase<any>
  implements ControlValueAccessor, OnChanges, OnDestroy
{
  id = `ui-select-${this.label}`;
  controlType = 'ui-select';
  panelOpen = false;
  focused = false;

  multipleValuesIndex: Array<boolean> = [];

  selectOption(number: number) {
    if (!this.multiple) {
      this.writeValue(this.options[number]);
      this.onSelect.emit(this.options[number]);
      this.onValue.emit(this.value);
      this.panelOpen = false;
      return;
    }

    this.multipleValuesIndex[number] = !this.multipleValuesIndex[number];
    this.writeValue(
      this.options.filter((option, index) => this.multipleValuesIndex[index])
    );
    this.onSelect.emit({
      selected: this.options[number],
      status: this.multipleValuesIndex[number],
    });
    this.onValue.emit(this.value);
  }

  displayValue() {
    if (!this.value) {
      return;
    } else if (!this.multiple) {
      return this.optionsLabelField
        ? this.displayOption(this.value)
        : this.value;
    } else {
      return this.optionsLabelField
        ? this.value
            .map((value: any) => {
              let optionParam = this._optionsLabelField;
              if (!optionParam) {
                return value;
              }
              if (typeof optionParam === 'string') {
                return value[optionParam];
              }
              if (typeof optionParam === 'function') {
                return optionParam(value);
              }
            })
            .join(', ')
        : this.value.join(', ');
    }
  }

  displayOption = (value: any, param?: any) => {
    let optionParam = param ? param : this._optionsLabelField;
    if (!optionParam) {
      return value;
    }
    if (typeof optionParam === 'string') {
      return value[optionParam];
    }
    if (typeof optionParam === 'function') {
      return optionParam(value);
    }
  };

  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  @Input()
  get multiple(): boolean {
    return this._multiple;
  }

  set multiple(value: BooleanInput) {
    this._multiple = coerceBooleanProperty(value);
    this.stateChanges.next();
  }

  private _multiple = false;

  @Input()
  get options(): Array<any> {
    return this._options;
  }

  set options(value: Array<any> | null | undefined) {
    this._options = value || Array<any>(0);
    if (this.multiple) {
      this.multipleValuesIndex = Array(this.options.length).fill(false);
    }
    if (value && value.length === 1) {
      this.writeValue(value[0]);
    }
    this.stateChanges.next();
  }

  private _options: Array<any> = Array<any>(0);

  @Input()
  override get value(): any {
    if (this.multiple && this._value) {
      return this.options.filter(
        (option, index) => this.multipleValuesIndex[index]
      );
    }
    return this._value;
  }
  override set value(val: any) {
    if (!val) {
      this.multipleValuesIndex = Array(this.options.length).fill(false);
    }
    this._value = val;
    this.stateChanges.next();
    this.onChange(val);
  }

  //private override _value: any = null;
  @Input()
  get optionsLabelField(): CallableFunction | string | null | undefined {
    return this._optionsLabelField;
  }

  set optionsLabelField(value: CallableFunction | string | null | undefined) {
    this._optionsLabelField = value;
    this.stateChanges.next();
  }

  private _optionsLabelField: any = null;

  @Output() onSelect = new EventEmitter<any>();
  @Output() onValue = new EventEmitter<any>();

  @HostListener('focus')
  onFocus() {
    this.focused = true;
    this.panelOpen = true;
  }

  @HostListener('mouseleave')
  onLeave() {
    this._elementRefExt.nativeElement.blur();
    this.focused = false;
    this.panelOpen = false;
  }
  constructor(
    @Optional() _parentFormGroupExt: FormGroupDirective,
    private _elementRefExt: ElementRef<HTMLElement>
  ) {
    super(_parentFormGroupExt, _elementRefExt);
    const element = this._elementRefExt.nativeElement;
    const nodeName = element.nodeName.toLowerCase();
  }
}
