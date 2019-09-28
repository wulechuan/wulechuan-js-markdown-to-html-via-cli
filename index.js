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

const PROCESS_EXIT_CODE = {
    unkown: 1,
    invalidOutputPath: 2,
    multipleOutputPaths: 3,
    multipleSourceFilesButSingleOutputFile: 4,
    multipleConfigFilePaths: 5,
    specifiedConfigFileNotFound: 6,
    configFileReadError: 7,
    invalidValueOfInputFileCountToWarn: 8,
    userCancelledBecauseOfTooManySourceFiles: 19,
}
const CLI_ARGUMENTS_DEFAULT_VALUE = {
    from: [ './*.md', './*.MD' ],
    to: './',
    inputFileCountToWarn: 51,
    configFile: './wlc-mk-to-html.config.js',
    conciseToc: false,
    expandToc: false,
    tocItemExpandedLevel: 1,
    htmlLanguage: 'zh-hans-CN',
}

const CLI_HELP_DECSCRIPTIONS_INDENTATION_DEFAULT_WIDTH = 6
const CLI_HELP_DECSCRIPTIONS_SHOULD_LAY_RIGHTSIDE = false

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


program.name('wlc-md-to-html')


const placeHolderForALineBreakFollwedByAnIndentation = '<-line-break-and-indent-here->'

let descriptionPrefixString = `\n${' '.repeat(CLI_HELP_DECSCRIPTIONS_INDENTATION_DEFAULT_WIDTH)}`
if (CLI_HELP_DECSCRIPTIONS_SHOULD_LAY_RIGHTSIDE) {
    descriptionPrefixString = ''
}

program
    .version(
        version,

        '-v, --version',

        `${
            descriptionPrefixString
        }Print the version of this program.\n`
    )

program
    .helpOption('-h, --help', `${
        descriptionPrefixString
    }Display this help.`)

program
    .option(
        '-i, --from  [globs]',

        `${
            descriptionPrefixString
        }Any glob that:${
            placeHolderForALineBreakFollwedByAnIndentation
        }  - matches \`.md\` or \`.MD\` files;${
            placeHolderForALineBreakFollwedByAnIndentation
        }  - matches folders containing \`.md\` or \`.MD\` files;${
            placeHolderForALineBreakFollwedByAnIndentation
        }  - is a comma-separated values of above.${
            placeHolderForALineBreakFollwedByAnIndentation
        }Note that multiple presents of this argument is also allowed.${
            placeHolderForALineBreakFollwedByAnIndentation
        }${
            getStringOfADefaultValueForPrintingInCLIHelp(
                `[ '${CLI_ARGUMENTS_DEFAULT_VALUE.from.join('\', \'')}' ]`
            )
        }\n`,

        collectSourceGlobsInCLIArguments
    )

    .option(
        '-o, --to  [path]',

        `${
            descriptionPrefixString
        }Path of folder for output .html files. A single asterisk(*)${
            placeHolderForALineBreakFollwedByAnIndentation
        }is allowed at the beginning of the path, meaning the rest${
            placeHolderForALineBreakFollwedByAnIndentation
        }part of this path string will treat as a sub path to each${
            placeHolderForALineBreakFollwedByAnIndentation
        }and very source path. This is the ONLY special sign allowed${
            placeHolderForALineBreakFollwedByAnIndentation
        }in this path string. No question marks("?") are allowed.${
            placeHolderForALineBreakFollwedByAnIndentation
        }No asterisks are allowed in any other places of this string.${
            placeHolderForALineBreakFollwedByAnIndentation
        }Note that you MUST quote the path string if it starts with${
            placeHolderForALineBreakFollwedByAnIndentation
        }an asterisk sign. Otherwise the operating system might first${
            placeHolderForALineBreakFollwedByAnIndentation
        }expand it as a glob, then pass resolved items to this program.${
            placeHolderForALineBreakFollwedByAnIndentation
        }${
            getStringOfADefaultValueForPrintingInCLIHelp(CLI_ARGUMENTS_DEFAULT_VALUE.to)
        }\n`,
        processArgumentOfOutputPath
    )

    .option(
        '-C, --config-file  [path]',

        `${
            descriptionPrefixString
        }Specify a \`.js\` file to configure the conversions.${
            placeHolderForALineBreakFollwedByAnIndentation
        }${
            getStringOfADefaultValueForPrintingInCLIHelp(CLI_ARGUMENTS_DEFAULT_VALUE.configFile)
        }\n`,
        processArgumentOfConfigFilePath
    )

    .option(
        '-n, --input-file-count-to-warn  [path]',

        `${
            descriptionPrefixString
        }Specify a number as a so-called "safe" limitation of${
            placeHolderForALineBreakFollwedByAnIndentation
        }the count of resovled source files. If too many source${
            placeHolderForALineBreakFollwedByAnIndentation
        }files are found. The the program pauses and prompt user${
            placeHolderForALineBreakFollwedByAnIndentation
        }to decide where it should go on or quit.${
            placeHolderForALineBreakFollwedByAnIndentation
        }If set to zero, then it means never prompt no matter${
            placeHolderForALineBreakFollwedByAnIndentation
        }how many source files are discovered.${
            placeHolderForALineBreakFollwedByAnIndentation
        }${
            getStringOfADefaultValueForPrintingInCLIHelp(CLI_ARGUMENTS_DEFAULT_VALUE.inputFileCountToWarn)
        }\n`,
        processArgumentOfConfigFilePath
    )

    .option(
        '-2, --concise-toc',

        `${
            descriptionPrefixString
        }When presents, the max level of the TOC items in an HTML is${
            placeHolderForALineBreakFollwedByAnIndentation
        }limited to 2. This makes the TOC more concise and clean.${
            placeHolderForALineBreakFollwedByAnIndentation
        }Be aware that this way all deeper levels of TOC items are${
            placeHolderForALineBreakFollwedByAnIndentation
        }NEVER visible. They are hidden via CSS rules.\n`,
    )

    .option(
        '-e, --expand-toc',

        `${
            descriptionPrefixString
        }If the browser window is wide enough, expand the TOC panel when${
            placeHolderForALineBreakFollwedByAnIndentation
        }an HTML just loads. Note that either way, the TOC panel can${
            placeHolderForALineBreakFollwedByAnIndentation
        }ALWAYS toggle manually. Also Note that to expand the TOC panel${
            placeHolderForALineBreakFollwedByAnIndentation
        }is NOT the same thing as to expand an item of the TOC panel.\n`,
    )

    .option(
        '-E, --toc-item-expanded-level  [level]',

        `${
            descriptionPrefixString
        }If the browser window is wide enough, TOC items are collapsable${
            placeHolderForALineBreakFollwedByAnIndentation
        }and expandable, if it contains a nested TOC list. This option${
            placeHolderForALineBreakFollwedByAnIndentation
        }decides how many levels of TOC items are expanded by default.${
            placeHolderForALineBreakFollwedByAnIndentation
        }Note the all expandable items can ALWASY toggle manually.${
            placeHolderForALineBreakFollwedByAnIndentation
        }${
            getStringOfADefaultValueForPrintingInCLIHelp(CLI_ARGUMENTS_DEFAULT_VALUE.tocItemExpandedLevel)
        }\n`,
    )

    .option(
        '-l, --html-language  [language]',
        `${
            descriptionPrefixString
        }Specified the value of the "lang" attribute of the <html>${
            placeHolderForALineBreakFollwedByAnIndentation
        }tag inside a generated HTML file.${
            placeHolderForALineBreakFollwedByAnIndentation
        }${
            getStringOfADefaultValueForPrintingInCLIHelp(CLI_ARGUMENTS_DEFAULT_VALUE.htmlLanguage)
        }\n`,
    )

    .option(
        '-D, --debug',
        `${
            descriptionPrefixString
        }To enable debugging mode.\n`
    )


formatDescriptionsOfAllArgumentOptions(program)


function formatDescriptionsOfAllArgumentOptions(program) {
    let newLineIndentationWidth = CLI_HELP_DECSCRIPTIONS_INDENTATION_DEFAULT_WIDTH

    if (CLI_HELP_DECSCRIPTIONS_SHOULD_LAY_RIGHTSIDE) {
        newLineIndentationWidth = program.options.reduce((maxFlagsStringLength, option) => {
            return Math.max(maxFlagsStringLength, option.flags.length + 2)
        }, 19)
    }

    program.options.forEach(option => {
        option.description = option.description.replace(
            new RegExp(placeHolderForALineBreakFollwedByAnIndentation, 'g'),
            `\n${' '.repeat(newLineIndentationWidth)}`
        )
    })
}

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

function processArgumentOfConfigFilePath(value, previousValue) {
    if (previousValue) {
        console.log(chalk.red('Multiple \'-C, --config-json\' options are NOT allowed.'))
        process.exit(PROCESS_EXIT_CODE.multipleConfigFilePaths)
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
    printCLIArguments(programArguments, filledArguments)

    const options = combinArgumentsWithConfigFile(filledArguments)


    const { shouldDebug } = options



    if (shouldDebug) {
        console.log()
        console.log('-------------------- debugging --------------------')
    }

    const outputPathRawValue = options.outputPath

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



    prepareSourceFiles(options)
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
                        options
                    )

                    console.log(chalk.green(`Done (${i + 1}/${sourceFilePaths.length})`))
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
        filledArguments.from = CLI_ARGUMENTS_DEFAULT_VALUE.from
    }

    if (programRawArguments.to) {
        filledArguments.to = programArguments.to
    } else {
        filledArguments.to = CLI_ARGUMENTS_DEFAULT_VALUE.to
    }

    if ('inputFileCountToWarn' in programRawArguments) {
        filledArguments.inputFileCountToWarn = parseInt(programRawArguments.inputFileCountToWarn)
        if (!(filledArguments.inputFileCountToWarn >= 0)) {
            console.log(
                chalk.red('Invalid value of "-n, --input-file-count-to-warn"'),
                chalk.yellow(filledArguments.inputFileCountToWarn)
            )
            process.exit(PROCESS_EXIT_CODE.invalidValueOfInputFileCountToWarn)
        }
    } else {
        filledArguments.inputFileCountToWarn = CLI_ARGUMENTS_DEFAULT_VALUE.inputFileCountToWarn
    }

    if ('configFile' in programRawArguments) {
        filledArguments.configFileIsSpecifiedInCLI = true
        filledArguments.configFile = programArguments.configFile
    } else {
        filledArguments.configFile = CLI_ARGUMENTS_DEFAULT_VALUE.configFile
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

    if ('tocItemExpandedLevel' in programRawArguments) {
        filledArguments.tocItemExpandedLevel = parseInt(programRawArguments.tocItemExpandedLevel)
    } else {
        filledArguments.tocItemExpandedLevel = CLI_ARGUMENTS_DEFAULT_VALUE.tocItemExpandedLevel
    }

    if ('htmlLanguage' in programRawArguments) {
        filledArguments.htmlLanguage = programRawArguments.htmlLanguage
    } else {
        filledArguments.htmlLanguage = CLI_ARGUMENTS_DEFAULT_VALUE.htmlLanguage
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
        'inputFileCountToWarn',
        'configFile',
        'configFileIsSpecifiedInCLI',
        'conciseToc',
        'expandToc',
        'tocItemExpandedLevel',
        'htmlLanguage',
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

function combinArgumentsWithConfigFile(filledArguments) {
    const manipulationsOverHTML = {
        htmlTagLanguage: filledArguments.htmlLanguage,
    }

    const behaviousOfBuiltInTOC = {
        shouldShowOnlyTwoLevelsOfTOCItemsAtMost:                filledArguments.conciseToc,
        atBeginingShouldCollapseAllTOCItemsOfLevelsGreaterThan: filledArguments.tocItemExpandedLevel,
        atBeginingShouldExpandTOCWhenWindowsIsWideEnough:       filledArguments.expandToc,
    }

    const options = {
        shouldDebug: filledArguments.debug,
        sourceGlobs: filledArguments.from,
        outputPath:  filledArguments.to,
        promptUserIfSourceFileCountExceedsThisNumber: filledArguments.inputFileCountToWarn,
        'options for @wulechuan/generate-html-via-markdown': {
            manipulationsOverHTML,
            behaviousOfBuiltInTOC,
        },
    }


    const configFilePath = filledArguments.configFile
    let configurationsFromFile

    if (!existsSync(configFilePath)) {
        if (filledArguments.configFileIsSpecifiedInCLI) {
            process.exit(PROCESS_EXIT_CODE.specifiedConfigFileNotFound)
        }
    } else {
        try {
            configurationsFromFile = require(configFilePath)
        } catch (readFileErro) {
            console.log(chalk.red(`Error reading configuration JSON file "${
                chalk.yellow(configFilePath)
            }"`))
            process.exit(PROCESS_EXIT_CODE.configFileReadError)
        }
    }

    // if (options.shouldDebug) {
    //     console.log('configurationsFromFile:', configurationsFromFile)
    //     console.log()
    // }

    if (!configurationsFromFile) {
        configurationsFromFile = {}
    }

    const optionsForConverter = {
        ...configurationsFromFile,
    }

    if (!optionsForConverter.manipulationsOverHTML) {
        optionsForConverter.manipulationsOverHTML = {}
    }

    if (!optionsForConverter.behaviousOfBuiltInTOC) {
        optionsForConverter.behaviousOfBuiltInTOC = {}
    }

    optionsForConverter.manipulationsOverHTML = {
        ...optionsForConverter.manipulationsOverHTML,
        ...manipulationsOverHTML,
    }

    optionsForConverter.behaviousOfBuiltInTOC = {
        ...optionsForConverter.behaviousOfBuiltInTOC,
        ...behaviousOfBuiltInTOC,
    }

    options['options for @wulechuan/generate-html-via-markdown'] = optionsForConverter

    if (options.shouldDebug) {
        console.log('decided options:', options)
    }

    return options
}


function prepareSourceFiles(options) {
    const { shouldDebug } = options

    return new Promise((resolvePromise, rejectPromise) => {
        const { sourceGlobs } = options

        if (shouldDebug) {
            console.log('sourceGlobs:', sourceGlobs)
        }

        const sourceFilePaths = syncResolveGlobs(sourceGlobs)
            .filter(filterOutSomeIllegalSourceFiles)
            .map(rawPath => rawPath.replace(/\\/g, '/'))

        if (shouldDebug) {
            console.log('sourceFilePaths:', sourceFilePaths)
        }

        if (
            options.promptUserIfSourceFileCountExceedsThisNumber === 0 ||
            options.promptUserIfSourceFileCountExceedsThisNumber >= sourceFilePaths.length
        ) {
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
    options
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

    convertOneFile(sourceFilePath, outputHTMLFilePath, options)
}

function convertOneFile(sourceFilePath, outputHTMLFilePath, options) {
    console.log()
    console.log('-'.repeat(51))
    console.log('from: "' + chalk.bgMagenta.black(sourceFilePath)   + '"')
    console.log('  to: "' + chalk.bgGreen.black(outputHTMLFilePath) + '"')

    const optionsForConverter = options['options for @wulechuan/generate-html-via-markdown']

    // if (options.shouldDebug) {
    //     console.log(optionsForConverter)
    // }

    const sourceFileContentString = readFileSync(sourceFilePath).toString()
    const htmlContentString = markdownToHTMLConverter(
        sourceFileContentString,
        optionsForConverter
    )

    mkdirpSync(getDirNameOf(outputHTMLFilePath))

    writeFileSync(
        outputHTMLFilePath,
        htmlContentString
    )
}
