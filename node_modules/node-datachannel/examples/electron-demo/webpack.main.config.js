const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    /**
     * This is the main entry point for your application, it's the first file
     * that runs in the main process.
     */
    entry: './src/main.js',
    // Put your normal webpack config below here
    module: {
        rules: require('./webpack.rules'),
    },
    externals: {
        'node-datachannel': 'node-datachannel',
    },
    plugins: [
        new CopyPlugin({
            patterns: [{ from: 'node_modules/node-datachannel', to: 'node_modules/node-datachannel' }],
        }),
    ],
};
