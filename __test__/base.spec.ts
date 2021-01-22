import type { Configuration } from 'webpack'
import Composer from '../src'

const path = require('path')
const composer = (baseOpt: Configuration): Composer => ({}) as Composer
type Composer = {
    entry: Entry
    [key: string]: any
}
type Entry = (opt: EntryOpt) => Composer
type EntryOpt = Configuration.entry

// Usage 1:
composer({
    entry: 'src/entry.js'
})
    .output.path.set(path.resolve(__dirname, 'dist'))
    .output.filename.set('[name].js')
    .resolve.extensions.set(['.js', '.jsx', '.jsm'])
    .resolve.alias.set({
        styles: path.resolve(__dirname, '../src/styles'),
        'react-dom': '@hot-loader/react-dom'
    })
    .rules.indexOf(0).exclude.set(/node_modules/)

// Usage 2:
composer({
    entry: 'src/entry.js'
})
    .output.path(path.resolve(__dirname, 'dist'))
    .output.filename('[name].js')
    .resolve.extensions(['.js', '.jsx', '.jsm'])
    .resolve.alias({
        styles: path.resolve(__dirname, '../src/styles'),
        'react-dom': '@hot-loader/react-dom'
    })
    .rules.indexOf(0).exclude(/node_modules/)
    .rules.push({
        test: /.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
    })
    .resolve.alias.delete()

// Usage 3:
composer({
    entry: 'src/entry.js'
})
    .entry('src/index.js')
    .output({
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    })
    .resolve({
        extensions: ['.js', '.jsx', '.jsm'],
        alias: {
            styles: path.resolve(__dirname, '../src/styles'),
            'react-dom': '@hot-loader/react-dom'
        }
    })
    .module
        .rules([
            {
                test: /.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.(jpg|png)$/,
                use: 'file-loader'
            }
        ])
        .noParse((content) => /jquery|lodash/.test(content))
        .unsafeCache(false)

Composer()
    .module.rules.$push({
        test: /\.(jpg|png)$/,
        use: 'file-loader'
    }, 'file')
    // We know rules is Array
    .module.rules.$find('file').test(/\.(jpg|png|gif|webp)$/)
