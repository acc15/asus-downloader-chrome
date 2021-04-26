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
                    test: /\.svg$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[name].[ext]'
                            }
                        },
                        {
                            loader: 'svgo-loader'
                        }
                    ]
                }
            ]
        },
        resolve: {
            extensions: ['.ts', '.js'],
            fallback: {
                "path": require.resolve("path-browserify")
            }
        },
        plugins: [
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
                    },
                    {
                        from: 'src/icon*.png',
                        to: '[name][ext]'
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
