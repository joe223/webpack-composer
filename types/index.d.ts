import type { Configuration } from 'webpack';
declare type DynamicExtends<T> = {
    [K in keyof T]: T[K] extends (string | number | boolean) ? PropEditor<T, K> : PropEditor<T, K> & DynamicExtends<T[K]>;
};
declare type PropEditor<T, K extends keyof T> = {
    (value: T[K]): WebpackConfig;
    $delete(): WebpackConfig;
};
declare type WebpackConfig = DynamicExtends<Configuration> & {
    $config: () => Configuration;
};
export default function Composer(options?: Configuration): WebpackConfig;
export {};
