# Webpack-Composer

[![](https://img.shields.io/npm/v/@cranejs/webpack-composer)](https://www.npmjs.com/package/@cranejs/webpack-composer")
[![](https://travis-ci.com/joe223/webpack-composer.svg?branch=master&status=errored)](https://travis-ci.com/github/joe223/webpack-composer)
[![](https://img.shields.io/coveralls/github/joe223/webpack-composer/master)](https://coveralls.io/github/joe223/webpack-composer?branch=master)

Simplify the modification of webpack configuration. This repository is **WIP**, do not use it in production.

## Installation

```shell
yarn add @cranejs/webpack-composer
```
## Usage

You will get Type hint with TypeScript.

```typescript
const config = Composer({
    entry: 'src/entry.js',
    context: 'foo',
    output: {
        path: 'bar'
    },
    resolve: {
        extensions: ['.js', '.jsx', '.jsm']
    }
})
    .context('bar')
    .output.path(path.resolve(__dirname, 'dist'))
    .resolve.$delete()
    .$config()
```
