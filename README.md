# Ycmd

## Фреймворк для распределенный комманды на Yargs


### Using custom configuration

You can also use `ycmd` using file configurations or in a property inside your `package.json`, and you can even use `TypeScript` and have type-safety while you are using it.

> INFO: Most of these options can be overwritten using the CLI options

You can use any of these files:

- `ycmd.config.ts`
- `ycmd.config.js`
- `ycmd.config.cjs`
- `ycmd.config.json`
- `ycmd` property in your `package.json`

> INFO: In all the custom files you can export the options either as `ycmd`, `default` or `module.exports =`

You can also specify a custom filename using the `--config` flag, or passing `--no-config` to disable config files.

[Check out all available options](https://paka.dev/npm/ycmd#module-index-export-Options).

#### Package.json

```json
"ycmd": {
  "concurrency": 20,
  "scripts": [
    "./scripts",
    "./node_modules/ycmd/scripts"
  ]
}
```

#### TypeScript / JavaScript

```js
export default {
  concurrency: 20,
  scripts: [
    "./scripts",
    "./node_modules/ycmd/scripts"
  ]
}
```
