import {CleanWebpackPlugin} from "clean-webpack-plugin";
import CopyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "path";
import webpack from 'webpack';
import ESLintPlugin from 'eslint-webpack-plugin';

import pkg from './package.json';
import _ from "lodash";

function hash<T, V>(values: Array<T>, valueMap: (v: T) => V, keyMap: (v: T) => string = k => String(k)): { [k: string]: V } {
    return values.reduce<{ [k: string]: V }>((obj, v) => { obj[keyMap(v)] = valueMap(v); return obj; }, {});
}

function filterPlugins(p: Array<webpack.WebpackPluginInstance | boolean | null | undefined>): Array<webpack.WebpackPluginInstance> {
    return p.filter(v => Boolean(v)).map(v => v as webpack.WebpackPluginInstance);
}

interface WebpackOpts {
    mode: string;
}

export default (env: undefined, opts: WebpackOpts) => {
    console.log(`Extension Version: ${pkg.version}`);
    console.log(`Build mode: ${opts.mode}`);

    const isDev = opts.mode === "development";
    const entries: Array<string> = ['background', 'opts'];

    const config: webpack.Configuration = {
        entry: hash(entries, k => `./src/${k}.ts`),
        devtool: isDev ? "source-map" : false,
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: 'ts-loader',
                    exclude: [/node_modules/, /\.spec\.ts$/]
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                },
                {
                    test: /\.(png|jpg)$/,
                    type: 'asset/resource'
                },
                {
                    test: /\.svg$/,
                    type: 'asset',
                    use: 'svgo-loader'
                }
            ]
        },
        resolve: {
            extensions: ['.ts', '.js'],
            fallback: {
                "path": require.resolve("path-browserify")
            }
        },
        plugins: filterPlugins([
            !isDev && new CleanWebpackPlugin(),
            new webpack.DefinePlugin({
                extensionVersion: pkg.version
            }),
            new ESLintPlugin({
                files: ['./src/**/*.ts']
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: 'src/manifest.json',
                        transform: content => _.template(content.toString())(pkg)
                    }
                ]
            }),
            new HtmlWebpackPlugin({
                filename: 'opts.html',
                template: 'src/opts.html',
                chunks: ['opts']
            })
        ]),
        output: {
            filename: '[name].js',
            assetModuleFilename: 'assets/[base]',
            path: path.resolve(__dirname, `dist/${pkg.name}`)
        },
        optimization: {
            minimize: false
        }
    };

    return config;
};
