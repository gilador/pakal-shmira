module.exports = {
  // For prettier 3
  sortingMethod: "lineLength",
  plugins: ["./node_modules/prettier-plugin-sort-imports/dist/index.js"],
  importTypeOrder: ["NPMPackages", "localImports"],
  newlineBetweenTypes: true,
  semi: false,
}
