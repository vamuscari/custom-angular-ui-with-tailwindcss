
# Tailwind Forms

installing tailwind forms:

```shell
  npm install -D @tailwindcss/forms
```

Add the plugin to your `tailwind.config.js`


```js
// tailwind.config.js
module.exports = {
  theme: {
    // ...
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class', // only generate classes 
    }),
  ],
}
```

I prefer to not generate the global styles. 
They have a tendency to be really annoying when something is getting styled a certain way and you have no idea why.
