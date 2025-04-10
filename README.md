# template

vscode 配置文件

## 安装插件

```
esbenp.prettier-vscode
dbaeumer.vscode-eslint
stylelint.vscode-stylelint
```

## 配置文件

settings.json

```json
{
  "editor.formatOnSave": false,
  "css.validate": false,
  "less.validate": false,
  "scss.validate": false,
  "eslint.debug": false,
  "stylelint.validate": ["css", "scss", "less", "postcss"],

  "editor.codeActionsOnSave": [
    "source.fixAll",
    "source.fixAll.stylelint"
    // "source.organizeImports"
  ],

  "typescript.validate.enable": true,
  "typescript.tsdk": "node_modules/typescript/lib",
  "prettier.enable": true,
  "[typescriptreact]": {
    "editor.defaultFormatter": "vscode.typescript-language-features",
    "editor.formatOnSave": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "[less]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[html]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[wxml]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "prettier.documentSelectors": ["**/*.wxml"],
  "files.associations": {
    "*.wxml": "wxml",
    "*.wxss": "css",
    "*.wxs": "javascript"
  },
  "files.eol": "\n",
  "cSpell.words": [
    "Animationfinish",
    "backtop",
    "bindcontact",
    "bindgetuserinfo",
    "bindopensetting",
    "bindtap",
    "commonent",
    "datetime",
    "getuserinfo",
    "Linechange",
    "Longpress",
    "Miniprogram",
    "navs",
    "swiper",
    "tabbar",
    "virtualtext",
    "Wechat",
    "weimob"
  ]
}
```
