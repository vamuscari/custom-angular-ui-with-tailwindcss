# Custom Angular UI With Tailwindcss

This project was made to show how to build your own ui components in angular with tailwindcss. 
Set up a new angular project or jump into one that you already have. 
Why do this at all? well if Angular Material fits your needs then go for that. The problem with Angular Material is the moment you want some sort of custom styling then angular material is the worst to work with.
From my experience at this point. I won't even use AM anymore because it tends to be all or nothing kind of system and it's better to just do the leg work up front and save yourself a lot of pain down the road.


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

I recommend installing the [prettier](https://tailwindcss.com/blog/automatic-class-sorting-with-prettier) plugin, because tailwind does have a order it is supposed to be written in.

I also recommend installing tailwind forms. Its the easiest way to get to keep formatting consistent when making using input.

## UI Directives

Lets make some new folders in `src`:
* ui
  + directives
  + components

We are going to start with the input directive.

