import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  Optional,
  SimpleChanges,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormGroupDirective,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  template: ``,
  host: {
    class: 'relative uiField',
    '[disabled]': 'disabled',
    '[required]': 'required',
    '[attr.label]': 'label || null',
    '[attr.tabindex]': '0',
    // Only mark the input as invalid for assistive technology if it has a value since the
    // state usually overlaps with `aria-required` when the input is empty and can be redundant.
    '[attr.aria-invalid]': '(empty && required) ? null : errorState',
    '[attr.aria-required]': 'required',
    '[attr.aria-label]': 'label || null',
  },
  providers: [
    { provide: NG_VALUE_ACCESSOR, multi: true, useExisting: UiBase },
    { provide: NG_VALIDATORS, multi: true, useExisting: UiBase },
  ],
})
export abstract class UiBase<T>
  implements ControlValueAccessor, OnChanges, OnDestroy
{
  touched = false;
  valid = true;
  stateChanges = new Subject<void>();
  onChange = (_: any) => {};
  onTouched = () => {};

  get empty() {
    return !!this.value;
  }

  @Input()
  get placeholder(): string {
    return this._placeholder;
  }
  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }
  private _placeholder!: string;

  @Input()
  get label(): string {
    return this._label;
  }
  set label(value: string) {
    this._label = value;
    this._labelElement.innerHTML = value;
    this.stateChanges.next();
  }
  private _label!: string;

  @Input('aria-label') ariaLabel: string = '';
  @Input('aria-labelledby') ariaLabelledby: string | null = null;

  @Input()
  get required(): boolean {
    return this._required;
  }
  set required(value: BooleanInput) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }
  private _required = false;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
    this.stateChanges.next();
  }
  private _disabled = false;

  @Input()
  get value(): T {
    return this._value;
  }
  set value(val: T) {
    this._value = val;
    this.stateChanges.next();
    this.onChange(val);
  }
  protected _value!: T;

  private _labelElement: HTMLLabelElement;
  private _parentFormGroup;

  constructor(
    @Optional() _parentFormGroup: FormGroupDirective,
    private _elementRef: ElementRef<HTMLElement>
  ) {
    if (_parentFormGroup) this._parentFormGroup = _parentFormGroup;

    const element = this._elementRef.nativeElement;
    const nodeName = element.nodeName.toLowerCase();

    const fieldDiv = document.createElement('div');
    fieldDiv.classList.add('flex', 'flex-col', 'w-full');
    this._labelElement = document.createElement('label');
    this._labelElement.classList.add('uiLabel');
    this._labelElement.setAttribute('for', element.id);
    this._labelElement.innerHTML = element.getAttribute('label') || '';
    element.replaceWith(fieldDiv);

    fieldDiv.appendChild(element);
    fieldDiv.appendChild(this._labelElement);
  }

  get errorState(): boolean {
    return (
      (!this.valid && this.touched) ||
      (!this.valid &&
        this._parentFormGroup!! &&
        this._parentFormGroup?.submitted)
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['disabled'] || changes['userAriaDescribedBy']) {
      this.stateChanges.next();
    }
  }

  setDescribedByIds(ids: string[]) {
    const controlElement =
      this._elementRef.nativeElement.querySelector('.select-container')!;
    controlElement.setAttribute('aria-describedby', ids.join(' '));
  }
  ngOnDestroy() {
    this.stateChanges.complete();
  }

  onContainerClick() {}
  validate(control: AbstractControl) {
    console.log('validate', control);
    if (this.required && !this.value) {
      return { required: true };
    }
    return null;
  }
  writeValue(value: any | null): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  _handleInput(control: AbstractControl, nextElement?: HTMLInputElement): void {
    //this.autoFocusNext(control, nextElement);
    this.onChange(this.value);
  }
}
