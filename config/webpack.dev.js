import { createRequire } from "node:module";
import path from "node:path";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import webpack from "webpack";

const require = createRequire(import.meta.url);
const { version } = require("../package.json");

export default {
	mode: "development",

	cache: false,

	entry: {
		"dist/icon-picker.min": path.resolve("./src/js/IconPicker.js"),
		"dist/themes/bootstrap-5.min": path.resolve(
			"./src/scss/themes/icon-picker.bootstrap-5.scss",
		),
		"dist/themes/default.min": path.resolve(
			"./src/scss/themes/icon-picker.default.scss",
		),
	},

	output: {
		filename: "[name].js",
		publicPath: "/",
		library: {
			type: "umd",
			name: "IconPicker",
			export: "default",
			umdNamedDefine: true,
		},
	},

	devServer: {
		static: ".",
		hot: false,
	},

	module: {
		rules: [
			{
				test: /\.js$/,
				use: "babel-loader",
			},
			{
				test: /\.scss$/,
				use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
			},
		],
	},

	plugins: [
		new MiniCssExtractPlugin({
			filename: "[name].css",
		}),
		new webpack.DefinePlugin({
			VERSION: JSON.stringify(version),
		}),
	],
};
