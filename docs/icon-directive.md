# Icon Import Directive with Auto-Complete

This is arguably one the best things I have ever made, 
and not because its complicated, 
but because its simple and easy to use.
the icon directive allows svg tag to be used to import the paths for any svg icon in the `icons.ts` file.
More importantly the svg can be given additional styling with inline html and tailwind, 
so no need to jump through odd hoops for that one check mark that is needs to be `h-6 w-7`

The result looks like: 

```html
<svg uiIcon name="x-mark-mini" class="h-5 w-5 text-neutral-400"></svg>
```

Make a file calling it `icon.directive.ts` then copy paste this typescript into it. You will also need to copy the `icons.ts` file into the folder above( or into the same folder and change the path).
You will have to add this to a module as well.

```ts
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
```

## Breaking it down

Starting with the directive we are targeting `<svg uiIcon>` in the application.
When angular finds the matching selector it will attach the following directive class to the tag.
Next the getter and setter for the name are defined. Notice on the setter type is `IconNames`. 
At the bottom of `icons.ts` there is a type definition that exports all the names.

```ts
export type IconNames = typeof IconsList[number]['name'];
```

This is what gives the name attribute the ability to autocomplete.

Next is the constructor. There is a Dependency Injection for the element so it can be modified. 
There is a few attributes defined ahead of time for the standard svg stuff.

The setIcon function which defines the attributes for the viewbox and fill, 
then imports the paths for the svg. I do have some reservation about using innerHTML, 
but from my understanding this doesn't matter since directives resolve on build.

lastly is the icon list itself which is just an array of svg information broken down.

```ts
export const IconsList = [
  {
    name: 'x-mark',
    viewBox: '0 0 24 24',
    fill: 'none',
    paths: [
      '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />'
    ],
  },
]
```
