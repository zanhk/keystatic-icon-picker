import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import util from "node:util";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import TerserPlugin from "terser-webpack-plugin";
import webpack from "webpack";
import FixStyleOnlyEntriesPlugin from "webpack-remove-empty-scripts";

const require = createRequire(import.meta.url);
const { version } = require("../package.json");

const webpackAsync = util.promisify(webpack);

const runWebpack = async (config) => {
	try {
		const stats = await webpackAsync(config);
		console.log(stats.toString({ colors: true }));
		if (stats.hasErrors()) {
			throw new Error("Webpack build failed");
		}
	} catch (error) {
		console.error("Error during webpack build:", error);
		process.exit(1);
	}
};

(async () => {
	const banner = new webpack.BannerPlugin(
		`Icon Picker ${version} MIT | https://github.com/AppoloDev/icon-picker`,
	);

	console.log("Starting CSS build...");
	// CSS
	await runWebpack({
		mode: "production",
		entry: {
			default: path.resolve("./src/scss/themes/icon-picker.default.scss"),
			"bootstrap-5": path.resolve(
				"./src/scss/themes/icon-picker.bootstrap-5.scss",
			),
		},
		output: {
			path: path.resolve("./dist/themes"),
		},
		module: {
			rules: [
				{
					test: /\.scss$/,
					use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
				},
			],
		},
		plugins: [
			banner,
			new FixStyleOnlyEntriesPlugin(),
			new MiniCssExtractPlugin({
				filename: "[name].min.css",
			}),
		],
	});

	console.log("Starting JS build...");
	// JS
	await runWebpack({
		mode: "production",
		entry: {
			"icon-picker.min": path.resolve("./src/js/IconPicker.js"),
		},
		output: {
			path: path.resolve("./dist"),
			library: {
				name: "IconPicker",
				export: "default",
				type: "umd2",
			},
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					exclude: /node_modules/,
					use: {
						loader: "babel-loader",
						options: {
							presets: ["@babel/preset-env"],
						},
					},
				},
			],
		},
		plugins: [
			banner,
			new webpack.SourceMapDevToolPlugin({
				filename: "icon-picker.min.map",
			}),
		],
		optimization: {
			minimizer: [
				new TerserPlugin({
					extractComments: false,
				}),
			],
		},
	});

	console.log("Build completed. Checking output...");
	try {
		const distContents = await fs.readdir(path.resolve("./dist"));
		console.log("Contents of dist folder:", distContents);
	} catch (error) {
		console.error("Error reading dist folder:", error);
	}
})().catch((error) => {
	console.error("Unhandled error during build:", error);
	process.exit(1);
});
