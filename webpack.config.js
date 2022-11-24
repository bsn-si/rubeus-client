/* eslint-disable */
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin")
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin")
const ReactRefreshTypeScript = require("react-refresh-typescript")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CopyPlugin = require("copy-webpack-plugin")
const webpack = require("webpack")
const path = require("path")

require("dotenv").config()
const { env } = process

module.exports = () => {
  const isDevelopment = env.NODE_ENV === "development"
  const isProduction = env.NODE_ENV === "production"
  const isExtension = env.EXTENSION === "true"

  return ({
    mode: isProduction ? "production" : "development",
    devtool: isProduction ? false : "source-map",
    entry: "./src/index.tsx",
  
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: require.resolve("ts-loader"),
              options: {
                getCustomTransformers: () => ({
                  before: [isDevelopment && ReactRefreshTypeScript()].filter(Boolean),
                }),
                transpileOnly: isDevelopment,
              },
            },
          ],
        },

        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
  
        {
          test: /\.pcss$/i,
          include: path.resolve(__dirname, "src"),
          exclude: /node_modules/,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            "postcss-loader",
          ]
        },
  
        {
          test: /\.(png|jpe?g|gif|svg|webp|ico)$/i,
          type: isProduction ? "asset" : "asset/resource",
        },
        {
          test: /\.(woff2?|eot|ttf|otf)$/i,
          type: "asset/resource",
        },
      ],
    },
  
    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js"],
      alias: {
        path: false,
        fs: false,
      },
    },

    optimization: {
      minimize: false,
    },
  
    devServer: {
      port: 8080,
      hot: true,
    },
  
    output: {
      assetModuleFilename: "assets/[hash][ext][query]",
      path: path.resolve(__dirname, "build"),
      hashFunction: "xxhash64",
      filename: "[name].js",
      publicPath: "",
      clean: true,
    },

    experiments: {
      asyncWebAssembly: true,
      syncWebAssembly: true,
    },
  
    plugins: [
      isDevelopment && new ReactRefreshWebpackPlugin(),
      // new BundleAnalyzerPlugin(),
      new MiniCssExtractPlugin({
        filename: "[name].bundle.css",
        chunkFilename: "[id].css"
      }),
      
      new CopyPlugin({
        patterns: [
          "public/logo.png",
          isExtension && "manifest.json",
          isExtension && { context: "public/icons", from: "*", to: "icons" },
        ].filter(Boolean),

        options: {
          concurrency: 100,
        },
      }),

      new HtmlWebpackPlugin({
        title: "Rubeus Client",
        template: "./src/index.html",
      }),
      
      new ForkTsCheckerWebpackPlugin(),

      new webpack.DefinePlugin({
        "process.env.RPC_URL": JSON.stringify(env.RPC_URL),
        "process.env.CONTRACT": JSON.stringify(env.CONTRACT),
        "process.env.EXTENSION": JSON.stringify(env.EXTENSION),
      }),
    ].filter(Boolean),
  })
}
