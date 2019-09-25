const commander = require('commander')
const thisPackageJSON = require('./package.json')




const program = new commander.Command()

program
    .version(thisPackageJSON.version, '-v, --version', 'print the version of this program')

program
    .option(
        '-i, --from <globs>',
        'Globs for either .md files, or for folders that containing .md files, or even mixed of the two.',
        collectSourceGlobs,
        []
    )
    .option(
        '-o, --to   <path>',
        'Path of folder for output .html files.',
        '.'
    )

program.parse(process.argv)

console.log(Object.keys(program).filter(k => {
    return !k.startsWith('_') && k !== 'rawArgs' && k !== 'options'
}).reduce((o, k) => { o[k] = program[k]; return o }, {}))






function collectSourceGlobs(value, previousValue) {
    const newValue = [
        ...previousValue,
        ...value.split(','),
    ].map(v => v.trim()).filter(v => !!v)
    return newValue
}
