const path = require('path');

module.exports = {
    mode: "production",
    entry: {
        "background": path.resolve(__dirname, "src/background/index.ts"),
        "youtube": path.resolve(__dirname, "src/youtube/index.ts"),
        "popup": path.resolve(__dirname, "src/popup/index.ts")
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        path: path.resolve(__dirname, "dist"),
    },
};