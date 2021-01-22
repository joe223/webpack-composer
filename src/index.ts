import type { Configuration } from 'webpack'

type DynamicExtends<T> = {
    [K in keyof T]-?: T[K] extends (string | number | boolean)
        ? PropEditor<T, K>
        : PropEditor<T, K> & DynamicExtends<T[K]>
}

type PropEditor<T, K extends keyof T> = {
    (value: T[K]): WebpackConfig
    $delete (): WebpackConfig
}

type WebpackConfig = DynamicExtends<Configuration> & {
    $config: () => Configuration
}

const RESERVED_PROP = {
    GEN_CONFIG: '$config',
    DELETE: '$delete'
}
const NOOP = void 0
const isObject = (obj: any) => Boolean(obj && typeof obj === 'object')

export default function Composer (options: Configuration = {}) {
    let propChain: string[] = []

    const emptyPropChain = () => {
        propChain = []
    }

    const propSetter = (value: any) => {
        let currentProp = options
        let propName = propChain.shift()

        while (propName
            && propChain.length
            && Reflect.get(currentProp, propName) !== NOOP
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

        emptyPropChain()

        return new Proxy(propSetter, handler) as WebpackConfig
    }

    const propsDeleter = () => {
        let currentProp = options
        let propName = propChain.shift()

        while (propName
            && currentProp
            && propChain.length
            && Reflect.has(currentProp, propName)
        ) {
            currentProp = Reflect.get(currentProp, propName)
            propName = propChain.shift()
        }

        if (!propChain.length && isObject(currentProp) && propName) {
            Reflect.deleteProperty(currentProp, propName)
        }

        emptyPropChain()

        return new Proxy(propSetter, handler) as WebpackConfig
    }

    const handler = {
        get (target: object, key: string): WebpackConfig | (() => Configuration) {
            if (Object.values(RESERVED_PROP).indexOf(key) === -1) {
                propChain.push(key)
            }

            switch (key) {
                case RESERVED_PROP.GEN_CONFIG: {
                    return () => options
                }
                case RESERVED_PROP.DELETE: {
                    return new Proxy(propsDeleter, handler) as WebpackConfig
                }
                default: {
                    return new Proxy(propSetter, handler) as WebpackConfig
                }
            }
        }
    }

    return new Proxy(propSetter, handler) as WebpackConfig
}
