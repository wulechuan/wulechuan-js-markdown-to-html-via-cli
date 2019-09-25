#!/usr/bin/env node

console.log('. . . . . . . . . . . . . . . . . . . . . . . . . .')
console.log('.                                                 .')
console.log('.    Welcome to wulechuan\'s CLI tool for          .')
console.log('.    converting markdown files into HTML ones.    .')
console.log('.                                                 .')
console.log('.                           wulechuan@live.com    .')
console.log('.                                   2019-09-26    .')
console.log('.                                                 .')
console.log('. . . . . . . . . . . . . . . . . . . . . . . . . .')
console.log()

const MAX_ALLOWED_SOURCE_FILES_COUNT_WITHOUT_USER_CONFIRM = 51
const PROCESS_EXIT_CODE = {
    invalidOutputPath: 2,
    multipleSourceFilesButSingleOutputFile: 3,
    userCancelledBecauseOfTooManySourceFiles: 19,
}

const readline = require('readline')

const stdIOReader = readline.createInterface({
    input:  process.stdin,
    output: process.stdout,
})

const chalk = require('chalk')
const path = require('path')
const globby = require('globby')

const {
    readFileSync,
    writeFileSync,
    statSync: getFileStatSync,
    mkdirpSync,
    existsSync,
} = require('fs-extra')

const commander = require('commander')
const markdownToHTMLConverter = require('@wulechuan/generate-html-via-markdown')
const thisPackageJSON = require('./package.json')


const syncResolveGlobs = globby.sync
const joinPathPOSIX    = path.posix.join
const parsePath        = path.parse
const getDirNameOf     = path.dirname


const program = new commander.Command()


program
    .version(thisPackageJSON.version, '-v, --version', 'print the version of this program')

program
    .option(
        '-i, --from <globs>',
        'Globs for either .md files, or for folders that containing .md files, or even mixed of the two.',
        collectSourceGlobsInCLIArguments,
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


function collectSourceGlobsInCLIArguments(value, previousValue) {
    const newValue = [
        ...previousValue,
        ...value.split(','),
    ].map(v => v.trim()).filter(v => !!v)
    return newValue
}






program.parse(process.argv)

// They are the same object, but I prefer different var names of different concepts.
const programArguments = program


try {
    main(programArguments)
} catch (err) {
    console.log(err.message)
    return
}






function main(programArguments) {
    const shouldDebug = programArguments.debug

    if (shouldDebug) {
        console.log()
        console.log('-------------------- debugging --------------------')
    }

    if (shouldDebug) {
        console.log(Object.keys(programArguments).filter(k => {
            return !k.startsWith('_') && k !== 'rawArgs' && k !== 'commands' && k !== 'options'
        }).reduce((o, k) => { o[k] = programArguments[k]; return o }, {}))
    }


    const outputPathRawValue = programArguments['to']

    let outputPathShouldBeRelativeToInputFileLocations = false
    let outputPathRawValue2 = outputPathRawValue
    if (outputPathRawValue.match(/^\*/)) {
        outputPathShouldBeRelativeToInputFileLocations = true
        outputPathRawValue2 = outputPathRawValue.replace(/^\*[\\/]*/, '')
    }

    if (outputPathRawValue2.match(/[*?]/)) {
        console.log(chalk.red(`Invalid output folder path:\n    "${chalk.yellow(outputPathRawValue2)}"`))
        process.exit(PROCESS_EXIT_CODE.invalidOutputPath)
    }



    prepareSourceFiles(programArguments, shouldDebug)
        .catch(reason => {
            console.log()
            console.log(chalk.red(reason))
            process.exit(PROCESS_EXIT_CODE.userCancelledBecauseOfTooManySourceFiles)
        })
        .then(sourceFilePaths => {
            if (shouldDebug) {
                console.log('-'.repeat(51))
            }


            if (sourceFilePaths.length === 0) {
                console.log('Zero source files provided. Nothing to do.')
            } else {
                const validOutputPath = outputPathRawValue2

                const thereIsOnlyOneSourceFile = sourceFilePaths.length === 1

                const outputPathLooksLikeSingleHTMLFilePath = !!validOutputPath.match(/.+\.html$/i)
                if (outputPathLooksLikeSingleHTMLFilePath && sourceFilePaths.length > 1) {
                    console.log(chalk.red('Can not conver multiple source files into single output file.'))
                    process.exit(PROCESS_EXIT_CODE.multipleSourceFilesButSingleOutputFile)
                }

                sourceFilePaths.forEach((sourceFilePath, i) => {
                    processOneSourceFile(
                        sourceFilePath,
                        validOutputPath,
                        outputPathShouldBeRelativeToInputFileLocations,
                        outputPathLooksLikeSingleHTMLFilePath,
                        thereIsOnlyOneSourceFile,
                        i + 1,
                        sourceFilePaths.length
                    )
                })

                console.log(chalk.green(
                    [
                        '',
                        '',
                        '* * * * * * * * *',
                        '*   ALL DONE!   *',
                        '* * * * * * * * *',
                    ].join('\n')
                ))

                process.exit(0)
            }
        })
}


function prepareSourceFiles(programArguments, shouldDebug) {
    return new Promise((resolvePromise, rejectPromise) => {
        let sourceGlobs = syncResolveGlobs(programArguments['from'])
        if (sourceGlobs.length === 0) {
            if (programArguments['args'].length > 0) {
                sourceGlobs = programArguments['args']
            } else {
                sourceGlobs = [
                    './*.md',
                ]
            }
        }
        if (shouldDebug) {
            console.log('sourceGlobs:', sourceGlobs)
        }


        const sourceFilePaths = syncResolveGlobs(sourceGlobs)
            .filter(filterOutSomeIllegalSourceFiles)
            .map(rawPath => rawPath.replace(/\\/g, '/'))

        if (shouldDebug) {
            console.log('sourceFilePaths:', sourceFilePaths)
        }

        if (sourceFilePaths.length <= MAX_ALLOWED_SOURCE_FILES_COUNT_WITHOUT_USER_CONFIRM) {
            resolvePromise(sourceFilePaths)
        } else {
            console.log(chalk.red(`Way too many input files (${
                chalk.yellow(sourceFilePaths.length)
            } in total) were provided.\n`))

            stdIOReader.question(
                chalk.red(`Are you sure to process them all? [${chalk.yellow('y')}/${chalk.yellow('n')}]`),
                answer => {
                    stdIOReader.close()
                    if (answer.match(/^y/i)) {
                        resolvePromise(sourceFilePaths)
                    } else {
                        console.log(chalk.red('All right! I WON\'T DO IT!'))
                        rejectPromise('User cancelled because way too many source files were provided.')
                    }
                }
            )
        }
    })
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

    let sourceFileExtIsIllegal = [
        'jpg',
        'jpeg',
        'gif',
        'png',
        'bmp',
        'pic',
        'map',
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
    ].includes(sourceFileExt)

    sourceFileExtIsIllegal = sourceFileExtIsIllegal && !!sourceFileExt.match(/^r\d{2,}/)

    if (sourceFileExtIsIllegal) {
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
    thereIsOnlyOneSourceFile,
    fileIndex,
    totalFilesCount
) {
    if (thereIsOnlyOneSourceFile && outputPathLooksLikeSingleHTMLFilePath) {
        convertOneFile(sourceFilePath, validOutputPath, 1, 1)
        return
    }



    const sourceFilePathComponents = parsePath(sourceFilePath)
    let outputFileName
    if (outputPathLooksLikeSingleHTMLFilePath) {
        const result = parsePath(validOutputPath)
        outputFileName = result.name
    } else {
        outputFileName = sourceFilePathComponents.name
    }


    let outputFolderPath = validOutputPath

    if (outputPathShouldBeRelativeToInputFileLocations) {
        outputFolderPath = joinPathPOSIX(sourceFilePathComponents.dir, validOutputPath)
    }

    if (outputFolderPath.match(/^\.[\\/]*$/)) {
        outputFolderPath = ''
    }

    let outputHTMLFilePath
    let duplicatedOutputHTMLFileNamesCount = 0

    do {
        const nameSuffix = duplicatedOutputHTMLFileNamesCount > 0 ? ` (${duplicatedOutputHTMLFileNamesCount})` : ''
        outputHTMLFilePath = joinPathPOSIX(outputFolderPath, `${outputFileName}${nameSuffix}.html`)

        duplicatedOutputHTMLFileNamesCount++
    } while (existsSync(outputHTMLFilePath))

    convertOneFile(sourceFilePath, outputHTMLFilePath, fileIndex, totalFilesCount)
}

function convertOneFile(sourceFilePath, outputHTMLFilePath, fileIndex, totalFilesCount) {
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

    console.log(chalk.green(`Done (${fileIndex}/${totalFilesCount})`))
}
