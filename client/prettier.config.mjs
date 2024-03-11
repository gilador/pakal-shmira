const config = {
    sortingMethod: 'lineLength',
    plugins: ['./node_modules/prettier-plugin-sort-imports/dist/index.js'],
    importTypeOrder: ['NPMPackages', 'localImports'],
    printWidth: 120,
    newlineBetweenTypes: true,
    trailingComma: 'es5',
    tabWidth: 4,
    singleQuote: true,
    semi: false,
}

export default config
