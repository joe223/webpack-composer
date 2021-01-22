import Composer from '../../src'
const path = require('path')

describe('Proxy', () => {
    test('init', () => {
        const config = Composer({
            entry: 'src/entry.js',
            context: 'foo',
        }).$config()

        expect(config).toEqual({
            entry: 'src/entry.js',
            context: 'foo',
        })
    })

    test('deleter', () => {
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
            .entry.$delete()
            .output.path.$delete()
            .resolve.$delete()
            .$config()

        expect(config).toEqual({
            context: 'foo',
            output: {}
        })
    })

    test('setter', () => {
        const config = Composer({
            entry: 'src/entry.js',
            context: 'foo',
        })
            .context('bar')
            .output({
                path: 'foo'
            })
            .output.iife(false)
            .output.path(path.resolve(__dirname, 'dist'))
            .output.filename('[name].js')
            .output({
                path: path.resolve(__dirname, 'lib'),
                iife: true,
                filename: '[name].[ext]'
            })
            .resolve.extensions(['.js', '.jsx', '.jsm'])
            .resolve.alias({
                styles: path.resolve(__dirname, '../src/styles'),
                'react-dom': '@hot-loader/react-dom'
            })
            .$config()

        expect(config).toEqual({
            entry: 'src/entry.js',
            context: 'bar',
            output: {
                path: path.resolve(__dirname, 'lib'),
                iife: true,
                filename: '[name].[ext]'
            },
            resolve: {
                extensions: ['.js', '.jsx', '.jsm'],
                alias: {
                    styles: path.resolve(__dirname, '../src/styles'),
                    'react-dom': '@hot-loader/react-dom'
                }
            }
        })
    })
})
