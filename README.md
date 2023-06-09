# Custom Angular UI With Tailwindcss

This project was made to show how to build your own ui components in angular with tailwindcss.
Set up a new angular project or jump into one that you already have.
Why do this at all? well if Angular Material fits your needs then go for that. The problem with Angular Material is the
moment you want some sort of custom styling then angular material is the worst to work with.
From my experience at this point. I won't even use AM anymore because it tends to be all or nothing kind of system and
it's better to just do the leg work up front and save yourself a lot of pain down the road.

Side Note: There have been some large changes in angular 16, so some of this information may be dated.

[Go to the Github repository for more information.](https://github.com/vamuscari/custom-angular-ui-with-tailwindcss/tree/main)

### Goals of a custom UI system

1. Customization - The ability to make large css style changes or customize individual components.
2. Flexibility - Provide a simple way for new pieces to be added to the component system.
3. Scaling - Create components and directives that can universally applied throughout an application.

## Installing Tailwind

To get started [install tailwindcss](https://tailwindcss.com/docs/installation) in Angualar

```shell
npm install -D tailwindcss
npx tailwindcss init
```

now change the tailwind config file.

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

finally, in src/styles.css add the following:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

we should now be able to start using tailwind!
If you started a new project, go ahead and delete everything from app.component.html then paste

```html
<h1 class="text-3xl font-bold underline">
  Hello world!
</h1>
```

which should give you something similar to this.

 <blockquote><h1><strong><u>Hello World!</u></strong></h1></blockquote>

If not check your version of angular and tailwind

I recommend installing the [prettier](https://tailwindcss.com/blog/automatic-class-sorting-with-prettier) plugin,
because tailwind does have a order it is supposed to be written in.

I also recommend installing tailwind forms. Its the easiest way to get to keep formatting consistent when making using
input.

## Creating a UI

Most component systems use forms in one way or another. Because of this we will want to lean
into [angular's built in forms](https://angular.io/guide/forms-overview).
We will specifically want to use reactive forms instead of template driven forms. Reactive forms scale much better with
validation but do come with some annoying quirks.
For what its worth, while I do recommend trying both anyway, I have learned a hard lesson on scaling when "Never-mind,
do it the other way" or "we need to add new pages for x", and so on...

We will start by building the styles for from tailwind. Try keeping as much styling as possible in the tailwind setup,
this way if you need to change frameworks it considerably reduces the amount of initial work.

### Global CSS Styles

in the `styles.css` add the following:

```css
@layer components {
  .uiFieldFocus {
    @apply border-sky-500;
  }
  .uiFieldError {
    @apply bg-red-50 border border-red-700 shadow-red-400/50;
  }
  .uiField[disabled] {
    @apply text-neutral-600/50 bg-neutral-100/25 border border-neutral-400/50 shadow-neutral-400/50 pointer-events-none;
  }
  .uiField {
    @apply w-full flex mb-1 py-3 rounded-md border ring-0 ring-transparent outline-0
    outline-offset-0 outline-transparent text-left focus:uiFieldFocus order-2;
  }
  .uiLabel {
    @apply flex ml-4 mb-1 text-neutral-700 text-sm font-medium order-1;
  }
  .uiField[required] + .uiLabel::after {
    @apply content-['*'] ml-0.5 text-red-700;
  }
  .uiFieldError + .uiLabel {
    @apply text-red-700;
  }
  .uiFieldDisabled + .uiLabel {
    @apply text-neutral-700/50;
  }
  .uiHint {
    @apply block ml-4 mb-1 font-thin text-neutral-500 text-sm tracking-wide order-3;
  }
  .uiInput {
    @apply mb-1 px-3
  }
  .caret {
    @apply h-5 w-px bg-neutral-300 pointer-events-none;
  }
}
/* These css classes look for Angulars reactive form identifiers. */
.uiField.ng-invalid.ng-touched:not(.ng-pristine) {
  @apply uiFieldError;
}
.ng-submitted .ng-invalid {
  @apply uiFieldError;
}
.uiError .ng-invalid {
  @apply uiFieldError;
}
```

### Reactive Form Requirements.

In order to be able to plug into Reactive Forms API, the directives and components have to meet
some [requirements](https://angular.io/guide/reactive-forms#reactive-forms-api-summary).

Lets make some new folders in `src`:

* ui
  + directives
  + components

> In most cases you are probably better off just copying the ui folder from the git repository into your project to
> avoid having to build the generic classes.

## UI Directives

First take a look at the input directive
on [github](https://github.com/vamuscari/custom-angular-ui-with-tailwindcss/blob/main/src/ui/directives/input.directive.ts)
to get an idea of the full script

```ts
@Directive({
  selector: `input[uiInput], textarea[uiInput]`,
  exportAs: 'uiInput',
  host: {
    class: 'uiField uiInput',
    '[disabled]': 'disabled',
    '[required]': 'required',
    '[attr.label]': 'label || null',
    '[attr.aria-invalid]': '(empty && required) ? null : errorState',
    '[attr.aria-required]': 'required',
    '[attr.aria-label]': 'label || null',
  },
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: UiInput},
    {provide: NG_VALIDATORS, multi: true, useExisting: UiInput},
  ],
})
```
The directive tag allows us to bing to selected tags. 
We can define ahead of time attribute bindings as well.
NG_VAlUE_ACCESSOR is used to provide a [ControlValueAccessor](https://angular.io/api/forms/ControlValueAccessor) for form controls.
The ControlValueAccessor defines an interface that acts as a bridge between the Angular forms API and a native element in the DOM.
multi is required if there is the possibility for more than one control, which is almost always the case.
Lastly, NG_VALIDATORS is an injection token for form validators.


Next, lets skip over some things and look at the constructor. 
We have and optional DI for parentFormGroup and a private DI for elementRef. 
Notice how the element is being pulled from the DOM and reinserted into a new div. 
This is so that when styles are attached to the input, you are actually modifying the field and not the container that sorts the field.
There is also a label attribute now that will create the label styling for you based on the component.
```ts
export class UiInput implements OnChanges, OnDestroy {
    
    //...
  
  private _labelElement: HTMLLabelElement;
  private _parentFormGroup;

  constructor(
    @Optional() _parentFormGroup: FormGroupDirective,
    private _elementRef: ElementRef<HTMLElement>
  ) {
    this._parentFormGroup = _parentFormGroup;
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
    //...
  }
}
```

The rest of the things in this file are mandatory fields required for the controlValueAccessor to work.

## UI Components

### UI Base

The `ui-base.ts` has an abstract class component called `UiBase`,
which holds most of the generic fields for the ControlValueAccessor.
The idea is that it should require a little work as possible to make a new reactive form component
that will fit the needs of whatever you are trying to accomplish.

### Extending UI Base

Extending the base class sounds messy but its not really.
As long as you don't go past a single level of inheritance everything should be just fine.
Because of inheritance we don't have to set up the boilerplate code for reactive forms every time.

```ts
export class UiDate extends UiBase<Date> {
    //....
}
```

There is type declarations for the components with specific information by any would also work if needed.
