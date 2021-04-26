/// <reference path="./reloader.d.ts"/>

import CopyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "path";
import webpack from 'webpack';
import ChromeExtensionReloader from "webpack-chrome-extension-reloader";
import TSLintPlugin from 'tslint-webpack-plugin';

import pkg from './package.json';
import _ from "lodash";

function hash<T, V>(values: Array<T>, valueMap: (v: T) => V, keyMap: (v: T) => string = k => String(k)): { [k: string]: V } {
    return values.reduce<{ [k: string]: V }>((obj, v) => { obj[keyMap(v)] = valueMap(v); return obj; }, {});
}

interface WebpackOpts {
    mode: string;
}

export default (env: undefined, opts: WebpackOpts) => {
    console.log(`Extension Version: ${pkg.version}`);
    console.log(`Build mode: ${opts.mode}`);

    const isDev = opts.mode === "development";
    const entries: Array<string> = ['background', 'options'];

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
                    use: 'url-loader',
                },
                {
                    test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                    use: 'file-loader'
                }
            ]
        },
        resolve: {
            extensions: ['.ts', '.js']
        },
        plugins: [
            new webpack.DefinePlugin({
                extensionVersion: pkg.version
            }),
            new TSLintPlugin({
                files: ['./src/**/*.ts']
            }),
            isDev && new ChromeExtensionReloader({
                entries: hash(entries, k => k),
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: 'src/manifest.json',
                        transform: content => _.template(content.toString())(pkg)
                    },
                    {
                        from: 'src/icon*.png'
                    }
                ]
            }),
            new HtmlWebpackPlugin({
                filename: 'options.html',
                template: 'src/options.html',
                chunks: ['options']
            })
        ].filter(Boolean),
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, `dist/${pkg.name}`)
        },
        optimization: {
            minimize: false
        }
    };

    return config;
};
