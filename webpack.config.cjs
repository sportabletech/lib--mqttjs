const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'build'),
        library: {
            type: "module",
        }
    },
    resolve: {
        fallback: {
            "url": require.resolve("url/")
        }
    },
    plugins: [
        new webpack.ProvidePlugin({ process: 'process/browser', Buffer: ['buffer', 'Buffer'] })
    ],
    experiments: {
        outputModule: true,
    }
};