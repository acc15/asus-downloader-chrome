/// <reference path="./reloader.d.ts"/>

import path from 'path';
import webpack from 'webpack';

import ChromeExtensionReloader from 'webpack-chrome-extension-reloader';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from "html-webpack-plugin";

const config: webpack.Configuration = {
    entry: {
        background: './src/background.ts',
        options: "./src/options.ts"
    },
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
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
        extensions: ['.tsx', '.ts', '.js']
    },
    plugins: [
        new ChromeExtensionReloader({
            entries: {
                background: 'background',
                options: 'options'
            }
        }),
        new CopyWebpackPlugin(['src/manifest.json', 'src/icon.png']),
        new HtmlWebpackPlugin({
            filename: 'options.html',
            template: 'src/options.html',
            chunks: ['options']
        })
    ],
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    }
};

export default config;