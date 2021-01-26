import type {
    Configuration,
    RuleSetRule
 } from 'webpack'

type DynamicExtends<T> = {
    [K in keyof T]-?: T[K] extends (string | number | boolean)
        ? PropEditor<T, K>
        : PropEditor<T, K> & PropFinder & DynamicExtends<T[K]>
}

type PropEditor<T, K extends keyof T> = {
    (value: T[K], alias?: string): WebpackConfig
    $delete (): WebpackConfig
}

type PropFinder = {
    $find<T>(name: string, callback: (result: T | undefined) => void): WebpackConfig;
}

type WebpackConfig = DynamicExtends<Configuration> & {
    $config: () => Configuration
}

const RESERVED_PROP = {
    GEN_CONFIG: '$config',
    DELETE: '$delete',
    FIND: '$find'
}
const NOOP = void 0
const isObject = (obj: any) => Boolean(obj && typeof obj === 'object')
const isArray = (obj: any) => Array.isArray(obj)
const ALIAS: {
    [key: string]: symbol
} = {}

export default function Composer (options: Configuration = {}) {
    let propChain: string[] = []

    const cleanPropChain = () => {
        propChain = []
    }

    const propSetter = (value: any, alias?: string) => {
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

            if (alias) {
                const aliasKey = Symbol(alias)

                ALIAS[alias] = aliasKey
                if (isObject(propValue)) {
                    Reflect.set(propValue, aliasKey, alias)
                }
            }
        }

        cleanPropChain()

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

        cleanPropChain()

        return new Proxy(propSetter, handler) as WebpackConfig
    }

    const propFinder = <T>(alias: string, callback: (item: DynamicExtends<T>) => void) => {
        let currentProp = options
        let propName = propChain.shift()

        while (propName
            && currentProp
            && Reflect.has(currentProp, propName)
        ) {
            currentProp = Reflect.get(currentProp, propName)
            propName = propChain.shift()
        }

        if (!propChain.length && isArray(currentProp) && !propName) {
            (<Array<any>>currentProp).find(item => {
                console.log(item, Reflect.get(item, ALIAS[alias]))

                if (isObject(item) && Reflect.get(item, ALIAS[alias]) === alias) {
                    try {
                        callback(item)
                    } catch (err) {
                        console.log(err)
                    }
                }
            })
        }

        cleanPropChain()

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
                case RESERVED_PROP.FIND: {
                    return new Proxy(propFinder, handler) as WebpackConfig
                }
                default: {
                    return new Proxy(propSetter, handler) as WebpackConfig
                }
            }
        }
    }

    return new Proxy(propSetter, handler) as WebpackConfig
}
