const chalk = require('chalk')
const path = require('path')
const globby = require('globby')

const {
    readFileSync,
    writeFileSync,
    statSync: getFileStatSync,
    mkdirpSync,
} = require('fs-extra')

const commander = require('commander')
const markdownToHTMLConverter = require('@wulechuan/generate-html-via-markdown')
const thisPackageJSON = require('./package.json')


const syncResolveGlobs = globby.sync
const joinPathPOSIX    = path.posix.join
const parsePath        = path.parse
const getDirNameOf     = path.dirname
const getFileNameOf    = path.basename
const formatPath       = path.format


const program = new commander.Command()

// They are the same object, but I prefer different var names of different concepts.
const programArguments = program

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
    .option(
        '-D, --debug',
        'To enable debugging mode.'
    )



program.parse(process.argv)

// if (program.debug) {
//     console.log(Object.keys(program).filter(k => {
//         return !k.startsWith('_') && k !== 'rawArgs' && k !== 'options'
//     }).reduce((o, k) => { o[k] = program[k]; return o }, {}))
// }



const sourceFilePaths = syncResolveGlobs(programArguments['from'])
    .filter(filterOutSomeIllegalSourceFiles)
    .map(rawPath => rawPath.replace(/\\/g, '/'))

if (program.debug) {
    console.log('sourceFilePaths:', sourceFilePaths)
}

if (sourceFilePaths.length > 512) {
    throw new Error('Way too many input files (' + sourceFilePaths.length + ' in total) provided.')
}

const outputPathRawValue = programArguments['to']

let outputPathShouldBeRelativeToInputFileLocations = false
let outputPathRawValue2 = outputPathRawValue
if (outputPathRawValue.match(/^\*/)) {
    outputPathShouldBeRelativeToInputFileLocations = true
    outputPathRawValue2 = outputPathRawValue.replace(/^\*[\\/]*/, '')
}


if (outputPathRawValue2.match(/[*?]/)) {
    throw new Error('Invalid output folder path:\n    "' + outputPathRawValue2 + '"')
}

if (sourceFilePaths.length === 0) {
    console.log('Zero source files provided. Nothing to do.')
} else {
    const validOutputPath = outputPathRawValue2

    const thereIsOnlyOneSourceFile = sourceFilePaths.length === 1

    const outputPathLooksLikeSingleHTMLFilePath = !!validOutputPath.match(/.+\.html$/i)
    if (outputPathLooksLikeSingleHTMLFilePath && sourceFilePaths.length > 1) {
        throw new Error('Can not conver multiple source files into single output file.')
    }

    sourceFilePaths.forEach(sourceFilePath => {
        processOneSourceFile(
            sourceFilePath,
            validOutputPath,
            outputPathShouldBeRelativeToInputFileLocations,
            outputPathLooksLikeSingleHTMLFilePath,
            thereIsOnlyOneSourceFile
        )
    })
}









function collectSourceGlobs(value, previousValue) {
    const newValue = [
        ...previousValue,
        ...value.split(','),
    ].map(v => v.trim()).filter(v => !!v)
    return newValue
}

function filterOutSomeIllegalSourceFiles(sourceFilePath) {
    const sourceFileStat = getFileStatSync(sourceFilePath)
    const sourceFileSizeInBytes = sourceFileStat.size

    if (sourceFileSizeInBytes > 1e6) {
        console.log(chalk.yellow(`ERROR: Source file way too large (${
            chalk.magenta(sourceFileSizeInBytes)
        } ${
            chalk.green('Bytes')
        }`))
        console.log('    Involved file: "' + chalk.yellow(sourceFilePath) + '"')
        console.log(chalk.bgRed.white(' SKIPPED '))
        return false
    }

    const sourceFilePathComponents = parsePath(sourceFilePath)
    const sourceFileExt = sourceFilePathComponents.ext.replace(/^\./, '')

    if ([
        'jpg',
        'jpeg',
        'gif',
        'png',
        'bmp',
        'tif',
        'tiff',
        'raw',
        'ai',
        'psd',
        'exr',
        'tga',
        'iso',
        'zip',
        'rar',
        '7z',
        'wav',
        'ac3',
        'eac3',
        'acc',
        'ape',
        'flac',
        'mov',
        'qt',
        'avi',
        'divx',
        'xvid',
        'f4v',
        'ts',
        'vob',
        'dat',
        'mkv',
        '3gp',
        'ra',
        'rm',
        'rmvb',
        'vc1',
        'ask',
        'wmv',
        'wma',
        'dts',
        'dtshd',
        'mpe',
        'mpg',
        'mpeg',
        'mp4',
        'mpa',
        'mp3',
        'ogg',
        'webp',
        'wenm',
        'gif',
        'exe',
        'bin',
    ].includes(sourceFileExt)) {
        console.log(chalk.yellow(`WARNING: Invalid source file type: "${
            chalk.magenta(sourceFileExt)
        }"`))
        console.log('    Involved file: "' + chalk.yellow(sourceFilePath) + '"')
        console.log(chalk.bgRed.white(' SKIPPED '))
        return
    }

    return true
}

function processOneSourceFile(
    sourceFilePath,
    validOutputPath,
    outputPathShouldBeRelativeToInputFileLocations,
    outputPathLooksLikeSingleHTMLFilePath,
    thereIsOnlyOneSourceFile
) {
    if (thereIsOnlyOneSourceFile && outputPathLooksLikeSingleHTMLFilePath) {
        convertOneFile(sourceFilePath, validOutputPath)
        return
    }



    const sourceFilePathComponents = parsePath(sourceFilePath)
    let outputFileName
    if (outputPathLooksLikeSingleHTMLFilePath) {
        outputFileName = getFileNameOf(validOutputPath)
    } else {
        outputFileName = `${sourceFilePathComponents.name}.html`
    }


    let outputFolderPath = validOutputPath

    if (outputPathShouldBeRelativeToInputFileLocations) {
        outputFolderPath = joinPathPOSIX(sourceFilePathComponents.dir, validOutputPath)
    }

    const outputHTMLFilePath = formatPath({
        dir: outputFolderPath,
        base: outputFileName,
    })

    convertOneFile(sourceFilePath, outputHTMLFilePath)
}

function convertOneFile(sourceFilePath, outputHTMLFilePath) {
    console.log()
    console.log('-'.repeat(51))
    console.log('from: "' + chalk.bgMagenta.black(sourceFilePath)   + '"')
    console.log('  to: "' + chalk.bgGreen.black(outputHTMLFilePath) + '"')

    const sourceFileContentString = readFileSync(sourceFilePath).toString()
    const htmlContentString = markdownToHTMLConverter(sourceFileContentString)

    mkdirpSync(getDirNameOf(outputHTMLFilePath))

    writeFileSync(
        outputHTMLFilePath,
        htmlContentString
    )

    console.log('-'.repeat(15))
    console.log(chalk.green('Done'))
}
