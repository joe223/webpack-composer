import type { Configuration } from 'webpack'

type DynamicExtends<T> = {
    [K in keyof T]: T[K] extends (string | number | boolean)
        ? PropEditor<T, K>
        : PropEditor<T, K> & DynamicExtends<T[K]>
}

type PropEditor<T, K extends keyof T> = {
    (value: T[K]): WebpackConfig
    delete (): WebpackConfig
}

type WebpackConfig = DynamicExtends<Configuration> & {
    genConfig: () => Configuration
}

const KEY_GEN_CONFIG = 'genConfig'
const KEY_DELETE = 'delete'
const RESERVED_PROP_NAME = [
    KEY_GEN_CONFIG
]

export default function Composer (options: Configuration = {}) {
    let propChain = []

    const propSetter = value => {
        let currentProp = options
        let propName = propChain.shift()

        while (propName
            && Reflect.has(currentProp, propName)
            && propChain.length
        ) {
            currentProp = Reflect.get(currentProp, propName)
            propName = propChain.shift()
        }

        while (propName) {
            const propValue = propChain.length
                ? Object.create({})
                : value

            Reflect.set(currentProp, propName, propValue)
            currentProp = Reflect.get(currentProp, propName)
            propName = propChain.shift()
        }

        propChain = []

        return new Proxy(propSetter, handler) as WebpackConfig
    }

    const handler = {
        get (target, key) {
            if (RESERVED_PROP_NAME.indexOf(key) === -1) {
                propChain.push(key)
            }

            switch (key) {
                case KEY_GEN_CONFIG: {
                    return () => options
                }
                case KEY_DELETE: {
                    // TODO
                    return () => options
                }
                default: {
                    return new Proxy(propSetter, handler)
                }
            }
        }
    }

    return new Proxy(propSetter, handler) as WebpackConfig
}
