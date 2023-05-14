import { Directive, ElementRef, Input } from '@angular/core';
import { IconsList, IconNames } from '../icons';

@Directive({
  selector: 'svg [uiIcon]',
})
export class IconDirective {
  svgElement: SVGElement;
  @Input()
  get name() {
    return this._name;
  }
  set name(value: IconNames) {
    this._name = value;
    this.setIcon(value);
  }
  private _name: IconNames = 'none';

  constructor(private el: ElementRef) {
    this.svgElement = this.el.nativeElement;
    this.svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    this.svgElement.setAttribute('aria-hidden', 'true');
    this.svgElement.setAttribute('stroke', 'currentColor');
  }

  setIcon(name: IconNames) {
    let Icon = IconsList.find((icon) => icon.name === this.name);
    this.svgElement.setAttribute('viewBox', Icon!.viewBox);
    this.svgElement.setAttribute('fill', Icon!.fill);
    this.svgElement.innerHTML = Icon!.paths.join(' ');
  }
}
