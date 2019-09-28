#!/usr/bin/env node

const thisPackageJSON = require('./package.json')
const version = `v${thisPackageJSON.version.replace(/^v/, '')}`

console.log('. . . . . . . . . . . . . . . . . . . . . . . . . .')
console.log('.                                                 .')
console.log('.    Welcome to wulechuan\'s CLI tool for          .')
console.log('.    converting markdown files into HTML ones.    .')
console.log('.                                                 .')
console.log(`.    ${version}${' '.repeat(45 - version.length)}.`)
console.log('.                                                 .')
console.log('.                           wulechuan@live.com    .')
console.log('.                                   2019-09-28    .')
console.log('.                                                 .')
console.log('. . . . . . . . . . . . . . . . . . . . . . . . . .')
console.log()

const MAX_ALLOWED_SOURCE_FILES_COUNT_WITHOUT_USER_CONFIRM = 51
const PROCESS_EXIT_CODE = {
    unkown: 1,
    invalidOutputPath: 2,
    multipleOutputPaths: 3,
    multipleSourceFilesButSingleOutputFile: 4,
    multipleConfigJSONPaths: 5,
    userCancelledBecauseOfTooManySourceFiles: 19,
}
const CLI_ARGUMENTS_DEFAULT_VALUE = {
    from: './*.md',
    to: './',
    configJson: './wlc-mk-to-html.config.json',
    conciseToc: false,
    expandToc: false,
    tocItemExapndedLevel: 1,
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


const syncResolveGlobs = globby.sync
const joinPathPOSIX    = path.posix.join
const parsePath        = path.parse
const getDirNameOf     = path.dirname


const program = new commander.Command()


program
    .version(version, '-v, --version', 'Print the version of this program.\n')

const newLineIndentationOfDescriptionsInCLIHelp = `\n${' '.repeat(31)}`
program
    .option(
        '-i, --from  <globs>',
        `Globs of any of:${
            newLineIndentationOfDescriptionsInCLIHelp
        }  - one that matches \`.md\` files;${
            newLineIndentationOfDescriptionsInCLIHelp
        }  - one that matches folders containing \`.md\` files;${
            newLineIndentationOfDescriptionsInCLIHelp
        }  - a comma-separated values of above.${
            newLineIndentationOfDescriptionsInCLIHelp
        }Note that multiple presents of this argument is also allowed.${
            newLineIndentationOfDescriptionsInCLIHelp
        }${
            getStringOfADefaultValueForPrintingInCLIHelp(CLI_ARGUMENTS_DEFAULT_VALUE.from)
        }\n`,

        collectSourceGlobsInCLIArguments
    )

    .option(
        '-o, --to  <path>',
        `Path of folder for output .html files. A single asterisk(*)${
            newLineIndentationOfDescriptionsInCLIHelp
        }is allowed at the beginning of the path, meaning the rest${
            newLineIndentationOfDescriptionsInCLIHelp
        }part of this path string will treat as a sub path to each${
            newLineIndentationOfDescriptionsInCLIHelp
        }and very source path. This is the ONLY special sign allowed${
            newLineIndentationOfDescriptionsInCLIHelp
        }in this path string. No question marks("?") are allowed.${
            newLineIndentationOfDescriptionsInCLIHelp
        }No asterisks are allowed in any other places of this string.${
            newLineIndentationOfDescriptionsInCLIHelp
        }${
            getStringOfADefaultValueForPrintingInCLIHelp(CLI_ARGUMENTS_DEFAULT_VALUE.to)
        }\n`,
        processArgumentOfOutputPath
    )

    .option(
        '-C, --config-json  <path>',
        `Specify a JSON file to configure the conversions.${
            newLineIndentationOfDescriptionsInCLIHelp
        }${
            getStringOfADefaultValueForPrintingInCLIHelp(CLI_ARGUMENTS_DEFAULT_VALUE.configJson)
        }\n`,
        processArgumentOfConfigJSONPath
    )

    .option(
        '-2, --concise-toc',
        `When presents, the max level of the TOC items in an HTML is${
            newLineIndentationOfDescriptionsInCLIHelp
        }limited to 2. This makes the TOC more concise and clean.${
            newLineIndentationOfDescriptionsInCLIHelp
        }Be aware that this way all deeper levels of TOC items are${
            newLineIndentationOfDescriptionsInCLIHelp
        }NEVER visible. They are hidden via CSS rules.\n`,
    )

    .option(
        '-E, --expand-toc',
        `If the browser window is wide enough, expand the TOC panel when${
            newLineIndentationOfDescriptionsInCLIHelp
        }an HTML just loads. Note that either way, the TOC panel can${
            newLineIndentationOfDescriptionsInCLIHelp
        }ALWAYS toggle manually. Also Note that to expand the TOC panel${
            newLineIndentationOfDescriptionsInCLIHelp
        }is NOT the same thing as to expand an item of the TOC panel.\n`,
    )

    .option(
        '-L, --toc-item-expanded-level',
        `If the browser window is wide enough, TOC items are collapsable${
            newLineIndentationOfDescriptionsInCLIHelp
        }and expandable, if it contains a nested TOC list. This option${
            newLineIndentationOfDescriptionsInCLIHelp
        }decides how many levels of TOC items are expanded by default.${
            newLineIndentationOfDescriptionsInCLIHelp
        }Note the all expandable items can ALWASY toggle manually.${
            newLineIndentationOfDescriptionsInCLIHelp
        }${
            getStringOfADefaultValueForPrintingInCLIHelp(CLI_ARGUMENTS_DEFAULT_VALUE.tocItemExapndedLevel)
        }\n`,
    )

    .option(
        '-D, --debug',
        'Enable debugging mode.\n'
    )


function collectSourceGlobsInCLIArguments(value, previousValue) {
    if (!previousValue) {
        previousValue = []
    }

    const newValue = [
        ...previousValue,
        ...value.split(','),
    ].map(v => v.trim()).filter(v => !!v)
    return newValue
}

function processArgumentOfOutputPath(value, previousValue) {
    if (previousValue) {
        console.log(chalk.red('Multiple \'-o, --to\' options are NOT allowed.'))
        process.exit(PROCESS_EXIT_CODE.multipleOutputPaths)
    }

    return value
}

function processArgumentOfConfigJSONPath(value, previousValue) {
    if (previousValue) {
        console.log(chalk.red('Multiple \'-C, --config-json\' options are NOT allowed.'))
        process.exit(PROCESS_EXIT_CODE.multipleConfigJSONPaths)
    }

    return value
}

function getStringOfADefaultValueForPrintingInCLIHelp(defaultValue) {
    return chalk.blue(`(default: "${chalk.green(defaultValue)}")`)
}





program.parse(process.argv)

/*
    The program and the arguments carrier of the progarm,
    are the same object. But I prefer different var names
    for different concepts.
*/
const programArguments = program



try {
    main(programArguments)
} catch (err) {
    console.log(err.message)
    process.exit(PROCESS_EXIT_CODE.unkown)
}






function main(programArguments) {
    const filledArguments = fillDefaultValuesForAbsentArguments(programArguments)

    const shouldDebug = filledArguments.debug


    printCLIArguments(programArguments, filledArguments)


    // const options = {

    // }


    if (shouldDebug) {
        console.log()
        console.log('-------------------- debugging --------------------')
    }

    const outputPathRawValue = filledArguments['to']

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



    prepareSourceFiles(filledArguments, shouldDebug)
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
            }

            process.exit(0)
        })
}


function fillDefaultValuesForAbsentArguments(programRawArguments) {
    /*
        I purposely avoid to use the "default value" option of
        the `program.option()` method, is because I'd like to
        control:
          - the way the default values are printed in the CLI
            help.
          - printing of the raw arguments
    */

    const filledArguments = {}

    filledArguments.debug = !!programRawArguments.debug

    if (programRawArguments.from) {
        filledArguments.from = programArguments.from
    } else {
        filledArguments.from = [ CLI_ARGUMENTS_DEFAULT_VALUE.from ]
    }

    if (programRawArguments.to) {
        filledArguments.to = programArguments.to
    } else {
        filledArguments.to = CLI_ARGUMENTS_DEFAULT_VALUE.to
    }

    if (programRawArguments.configJson) {
        filledArguments.configJson = programArguments.configJson
    } else {
        filledArguments.configJson = CLI_ARGUMENTS_DEFAULT_VALUE.configJson
    }

    if ('conciseToc' in programRawArguments) {
        filledArguments.conciseToc = programRawArguments.conciseToc
    } else {
        filledArguments.conciseToc = CLI_ARGUMENTS_DEFAULT_VALUE.conciseToc
    }

    if ('expandToc' in programRawArguments) {
        filledArguments.expandToc = programRawArguments.expandToc
    } else {
        filledArguments.expandToc = CLI_ARGUMENTS_DEFAULT_VALUE.expandToc
    }

    if ('tocItemExapndedLevel' in programRawArguments) {
        filledArguments.tocItemExapndedLevel = programRawArguments.tocItemExapndedLevel
    } else {
        filledArguments.tocItemExapndedLevel = CLI_ARGUMENTS_DEFAULT_VALUE.tocItemExapndedLevel
    }

    filledArguments.ignoredArguments = programRawArguments.args

    return filledArguments
}

function printCLIArguments(rawArguments, filledArguments) {
    const rawArgumentsToPrint = {}

    const argumentKeysInPrintingOrder = [
        'debug',
        'from',
        'to',
        'configJson',
        'conciseToc',
        'expandToc',
        'tocItemExapndedLevel',
    ]

    argumentKeysInPrintingOrder.forEach(key => {
        if (key in rawArguments) {
            rawArgumentsToPrint[key] = rawArguments[key]
        }
    })

    const ignoredArgumentsCount = rawArguments.args.length

    if (ignoredArgumentsCount > 0) {
        const ignoredArgumentsPrintingName = `args (${ignoredArgumentsCount})`

        if (ignoredArgumentsCount <= 100) {
            rawArgumentsToPrint[ignoredArgumentsPrintingName] = rawArguments.args
        } else {
            rawArgumentsToPrint[ignoredArgumentsPrintingName] = rawArguments.args.slice(0, 99)
            rawArgumentsToPrint[ignoredArgumentsPrintingName].push[`< and ${ignoredArgumentsCount - 99} more >`]
        }
    }



    const filledArgumentsToPrint = {}
    argumentKeysInPrintingOrder.forEach(key => {
        filledArgumentsToPrint[key] = filledArguments[key]
    })

    const ignoredArgumentsPrintingName = `ignoredArguments (${ignoredArgumentsCount})`
    if (ignoredArgumentsCount <= 100) {
        filledArgumentsToPrint[ignoredArgumentsPrintingName] = filledArguments.ignoredArguments
    } else {
        filledArgumentsToPrint[ignoredArgumentsPrintingName] = filledArguments.ignoredArguments.slice(0, 99)
        filledArgumentsToPrint[ignoredArgumentsPrintingName].push[`< and ${ignoredArgumentsCount - 99} more >`]
    }

    console.log()
    console.log('Provided arguments:')
    console.log(rawArgumentsToPrint)
    console.log()
    console.log('Resolved arguments:')
    console.log(filledArgumentsToPrint)
    console.log()
}


function prepareSourceFiles(filledArguments, shouldDebug) {
    return new Promise((resolvePromise, rejectPromise) => {
        const sourceGlobs = syncResolveGlobs(filledArguments['from'])

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
