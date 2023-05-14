
# Adding Prettier

```shell
npm install -D prettier prettier-plugin-tailwindcss
```

Prettier can depend on the editor that you use so I wont go into too much detail on its setup.
You can run prettier from the cli in any npm project by adding the following.
Go to your package.json and add the following: 
```json
{
  "scripts": {
    "prettier": "prettier --write \"src/app/**/*.html\""
  }
}
```
I highly recommend reading the [docs](https://prettier.io/docs/en/configuration.html) and setting up your own custom configurations
