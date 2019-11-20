#!/usr/bin/env node

const thisPackageJSON = require('./package.json')
const version = `v${thisPackageJSON.version.replace(/^v/, '')}`

console.log('. . . . . . . . . . . . . . . . . . . . . . . . . .')
console.log('.                                                 .')
console.log('.    Welcome to wulechuan\'s CLI tool for          .')
console.log('.    converting markdown files into HTML ones.    .')
console.log('.                                                 .')
console.log(`.    ${version}${' '.repeat(45 -  version.length)}.`)
console.log('.                                                 .')
console.log('.               wulechuan <wulechuan@live.com>    .')
console.log('.                                   2019-11-20    .')
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
    unkownArgumentsPresent: 9,
    userCancelledBecauseOfTooManySourceFiles: 19,
}
const CLI_ARGUMENTS_DEFAULT_VALUE = {
    from: [ './*.md', './*.MD' ],
    to: './',
    inputFileCountToWarn: 51,
    configFile: './wlc-md-to-html.config.js',
    darkTheme: false,
    tocUl: false,
    conciseToc: false,
    expandToc: false,
    tocItemExpandedLevel: 1,
    htmlLanguage: 'zh-hans-CN',
}

const CLI_HELP_DECSCRIPTIONS_INDENTATION_DEFAULT_WIDTH = 6
const CLI_HELP_DECSCRIPTIONS_SHOULD_LAY_RIGHTSIDE = false
const SHOULD_PRINT_PATHS_OF_HELP_HTML_FILES_ON_DASH_DASH_HELP = true


/**
 * This option below is set to false,
 * because I've NOT figured out how to launch a browser inside this js.
 * The "https://www.npmjs.com/package/open" doesn't work for me.
 * Neither does the "https://www.npmjs.com/package/chrome-launcher".
 * Not even the 'child_process'.
 *
 * Another question is: should I launch a browser?
 */
const SHOULD_OPEN_HELP_HTML_FILES_ON_DASH_DASH_HELP = true



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
const joinPath         = path.join
const joinPathPOSIX    = path.posix.join
const parsePath        = path.parse
const getDirNameOf     = path.dirname

const thisPackageRootFolderPath = path.dirname(require.resolve('.'))

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
        }Print the version of this program, that is "${version}".\n`
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
        }${chalk.green('Note that multiple presents of this argument are also allowed.')}${
            placeHolderForALineBreakFollwedByAnIndentation
        }${
            ofAnArrayValueGetTheCLIHelpPrintingStringOfItsDefaultValue(
                CLI_ARGUMENTS_DEFAULT_VALUE.from
            )
        }\n`,

        collectValuesOfTheSourceGlobsArgumentsInCLI
    )

    .option(
        '-o, --to  [path]',

        `${
            descriptionPrefixString
        }Path of folder for output \`.html\` files. A single ${chalk.red('asterisk')}(${chalk.red('*')})${
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
        }${chalk.red('Note that you MUST quote the path string if it starts with')}${
            placeHolderForALineBreakFollwedByAnIndentation
        }${chalk.red('an asterisk sign. Otherwise the operating system might first')}${
            placeHolderForALineBreakFollwedByAnIndentation
        }${chalk.red('expand it as a glob, then pass resolved items to this program.')}${
            placeHolderForALineBreakFollwedByAnIndentation
        }${
            ofAStringValueGetTheCLIHelpPrintingStringOfItsDefaultValue(
                CLI_ARGUMENTS_DEFAULT_VALUE.to
            )
        }\n`,

        processArgumentOfOutputPath
    )

    .option(
        '-C, --config-file  [path]',

        `${
            descriptionPrefixString
        }Specify a \`.js\` file for fully controlling the converter${
            placeHolderForALineBreakFollwedByAnIndentation
        }utilized by this program internally.${
            placeHolderForALineBreakFollwedByAnIndentation
        }${
            ofAStringValueGetTheCLIHelpPrintingStringOfItsDefaultValue(
                CLI_ARGUMENTS_DEFAULT_VALUE.configFile
            )
        }\n`,

        processArgumentOfConfigFilePath
    )

    .option(
        '-n, --input-file-count-to-warn  [path]',

        `${
            descriptionPrefixString
        }Specify a number as a so-called "safe" limitation of the${
            placeHolderForALineBreakFollwedByAnIndentation
        }the count of resovled source files. If too many source${
            placeHolderForALineBreakFollwedByAnIndentation
        }files are found, then this program pauses and prompt user${
            placeHolderForALineBreakFollwedByAnIndentation
        }to decide whether it should go on or quit. Setting this to${
            placeHolderForALineBreakFollwedByAnIndentation
        }zero means never prompt user and always process all discovered${
            placeHolderForALineBreakFollwedByAnIndentation
        }source files, no matter how many there are.${
            placeHolderForALineBreakFollwedByAnIndentation
        }${
            ofANonStringValueGetTheCLIHelpPrintingStringOfItsDefaultValue(
                CLI_ARGUMENTS_DEFAULT_VALUE.inputFileCountToWarn
            )
        }\n`,

        processArgumentOfConfigFilePath
    )

    .option(
        '-d, --dark-theme',

        `${
            descriptionPrefixString
        }If presents, the default dark-colored theme is applied to all${
            placeHolderForALineBreakFollwedByAnIndentation
        }HTML files, instead of the light-colored theme. ${chalk.red('But the effect')}${
            placeHolderForALineBreakFollwedByAnIndentation
        }${chalk.red('of this argument will be overrided by the configurations, if')}${
            placeHolderForALineBreakFollwedByAnIndentation
        }${chalk.red(`any, in the configuration file, which is loaded via the "${chalk.green('-C')}"`)}${
            placeHolderForALineBreakFollwedByAnIndentation
        }${chalk.red(`or "${chalk.green('--config-file')}" arguments.`)}\n`,
    )

    .option(
        '-U, --toc-ul',

        `${
            descriptionPrefixString
        }When presents, the lists in TOC are <ul>s instead of <ol>s.\n`,
    )

    .option(
        '-2, --concise-toc',

        `${
            descriptionPrefixString
        }When presents, the max level of the TOC items in an HTML is${
            placeHolderForALineBreakFollwedByAnIndentation
        }limited to ${chalk.green(2)}. This makes the TOC more concise and clean.${
            placeHolderForALineBreakFollwedByAnIndentation
        }${chalk.red('Be aware that this way all deeper levels of TOC items are')}${
            placeHolderForALineBreakFollwedByAnIndentation
        }${chalk.red('NEVER visible. They are hidden via CSS rules.')}\n`,
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
            ofANonStringValueGetTheCLIHelpPrintingStringOfItsDefaultValue(
                CLI_ARGUMENTS_DEFAULT_VALUE.tocItemExpandedLevel
            )
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
            ofAStringValueGetTheCLIHelpPrintingStringOfItsDefaultValue(CLI_ARGUMENTS_DEFAULT_VALUE.htmlLanguage)
        }\n`,
    )

    .option(
        '-D, --debug',
        `${
            descriptionPrefixString
        }To enable debugging mode.\n`
    )

program.on('--help', () => {
    // console.log('thisPackageRootFolderPath:', thisPackageRootFolderPath)

    const existingHelpHTMLs = [
        'ReadMe.html',
        'ReadMe.zh-hans-CN.html',
    ].reduce((allExistingHelps, subPath) => {
        const fullPath = joinPath(thisPackageRootFolderPath, subPath)
        if (existsSync(fullPath)) {
            allExistingHelps.push({
                subPath,
                fullPath,
            })
        }

        return allExistingHelps
    }, [])

    if (existingHelpHTMLs.length > 0) {
        if (SHOULD_PRINT_PATHS_OF_HELP_HTML_FILES_ON_DASH_DASH_HELP) {
            let englishPhrase = 'any of'
            if (existingHelpHTMLs.length === 1) {
                englishPhrase = 'this doc'
            } else if (existingHelpHTMLs.length === 2) {
                englishPhrase = 'either of'
            }

            console.log()
            console.log('-'.repeat(51))
            console.log()
            console.log(`Please also refer to ${englishPhrase}:`)
            existingHelpHTMLs.forEach(help => console.log(`    ${help.fullPath}`))
        }

        if (SHOULD_OPEN_HELP_HTML_FILES_ON_DASH_DASH_HELP) {
            // if (true) {
            //     const childProcess = require('child_process')
            //     existingHelpHTMLs.forEach(help => {
            //         childProcess.exec(`start  chrome  "${help.fullPath}"`)
            //     })
            // } else if (true) {
            //     const open = require('open')
            //     const openingOptions = null // { app: 'chrome' }
            //     existingHelpHTMLs.forEach(async help => {
            //         await open(help.fullPath, openingOptions)
            //     })
            // } else {
            //     const chromeLauncher = require('chrome-launcher')

            //     existingHelpHTMLs.forEach(help => {
            //         chromeLauncher.launch({
            //             startingUrl: help.fullPath,
            //         }).then(chrome => {
            //             console.log(`Chrome debugging port running on ${chrome.port}`)
            //         })
            //     })
            // }
        }
    }
})

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

function collectValuesOfTheSourceGlobsArgumentsInCLI(value, previousValue) {
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

function ofAStringValueGetTheCLIHelpPrintingStringOfItsDefaultValue(defaultStringValue) {
    return (`(${
        chalk.rgb(255, 255, 255)('default')
    }: ${
        chalk.green(`'${defaultStringValue}'`)
    })`)
}

function ofAnArrayValueGetTheCLIHelpPrintingStringOfItsDefaultValue(defaultArrayValue) {
    const valuesString = defaultArrayValue.map(v => chalk.green(`'${v}'`)).join(', ')
    return (`(${
        chalk.rgb(255, 255, 255)('default')
    }: ${
        chalk.blue(`[ ${valuesString} ]`)
    })`)
}

function ofANonStringValueGetTheCLIHelpPrintingStringOfItsDefaultValue(defaultNonStringValue) {
    return (`(${
        chalk.rgb(255, 255, 255)('default')
    }: ${
        chalk.yellow(defaultNonStringValue)
    })`)
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
    if (filledArguments.unknownArguments.length > 0) {
        console.log(chalk.red('Unknown arguments are NOT allowed.'))

        console.log(chalk.yellow('You might:'))

        console.log(`  - ${
            chalk.yellow(`forgot to use "${
                chalk.green('-i')
            }", "${
                chalk.green('--from')
            }", "${
                chalk.green('-o')
            }" or "${
                chalk.green('--to')
            }" arguments\n    to lead a value.`)
        }`)

        console.log(`  - ${
            chalk.yellow(`forgot to quote the value of "${
                chalk.green('-o')
            }" or "${
                chalk.green('--to')
            }" argument.`)
        }`)

        process.exit(PROCESS_EXIT_CODE.unkownArgumentsPresent)
    }

    const options = combinArgumentsWithConfigFile(filledArguments)


    const { shouldDebug } = options



    if (shouldDebug) {
        console.log()
        console.log('-------------------- debugging --------------------')
    }

    const outputPathRawValue = options.outputPath

    let outputPathShouldBeRelativeToInputFileLocations = false
    let outputPathRawValue2 = outputPathRawValue

    if (
        outputPathRawValue2.match(/^"/) && outputPathRawValue2.match(/"$/) ||
        outputPathRawValue2.match(/^'/) && outputPathRawValue2.match(/'$/)
    ) {
        /*
            In some situations, for example the npm "scripts" running inside Nodejs,
            quoting marks are NOT unwrapped automatically.
         */
        outputPathRawValue2 = outputPathRawValue2.slice(1, outputPathRawValue2.length - 1)
    }

    if (outputPathRawValue2.match(/^\*/)) {
        outputPathShouldBeRelativeToInputFileLocations = true
        outputPathRawValue2 = outputPathRawValue2.replace(/^\*[\\/]*/, '')
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
                if (
                    !outputPathShouldBeRelativeToInputFileLocations &&
                    outputPathLooksLikeSingleHTMLFilePath &&
                    sourceFilePaths.length > 1
                ) {
                    console.log(chalk.red('Should not convert multiple source files into single output file.'))
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
        the `program.option()` method, because I'd like to
        control:
          - the way the default values are printed in the CLI
            help.
          - printing of the raw arguments that are provided,
            without those filled-in default values of those
            absent arguments.
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
        filledArguments.configFile = programArguments.configFile
        filledArguments.configFileIsSpecifiedInCLI = true
    } else {
        filledArguments.configFile = CLI_ARGUMENTS_DEFAULT_VALUE.configFile
        filledArguments.configFileIsSpecifiedInCLI = false
    }

    if ('darkTheme' in programRawArguments) {
        filledArguments.darkTheme = !!programRawArguments.darkTheme
        filledArguments.darkThemeIsDemandedViaCLI = filledArguments.darkTheme
    } else {
        filledArguments.darkTheme = CLI_ARGUMENTS_DEFAULT_VALUE.darkTheme
        filledArguments.darkThemeIsDemandedViaCLI = false
    }

    if ('tocUl' in programRawArguments) {
        filledArguments.tocUl = !!programRawArguments.tocUl
    } else {
        filledArguments.tocUl = CLI_ARGUMENTS_DEFAULT_VALUE.tocUl
    }

    if ('conciseToc' in programRawArguments) {
        filledArguments.conciseToc = !!programRawArguments.conciseToc
    } else {
        filledArguments.conciseToc = CLI_ARGUMENTS_DEFAULT_VALUE.conciseToc
    }

    if ('expandToc' in programRawArguments) {
        filledArguments.expandToc = !!programRawArguments.expandToc
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


    filledArguments.unknownArguments = programRawArguments.args

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
        'darkTheme',
        'darkThemeIsDemandedViaCLI',
        'tocUl',
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

    const unknownArgumentsCount = rawArguments.args.length

    if (unknownArgumentsCount > 0) {
        const unknownArgumentsPrintingName = `args (${unknownArgumentsCount})`

        if (unknownArgumentsCount <= 100) {
            rawArgumentsToPrint[unknownArgumentsPrintingName] = rawArguments.args
        } else {
            rawArgumentsToPrint[unknownArgumentsPrintingName] = rawArguments.args.slice(0, 99)
            rawArgumentsToPrint[unknownArgumentsPrintingName].push[`< and ${unknownArgumentsCount - 99} more >`]
        }
    }



    const filledArgumentsToPrint = {}
    argumentKeysInPrintingOrder.forEach(key => {
        filledArgumentsToPrint[key] = filledArguments[key]
    })

    const unknownArgumentsPrintingName = `unknownArguments (${unknownArgumentsCount})`
    if (unknownArgumentsCount <= 100) {
        filledArgumentsToPrint[unknownArgumentsPrintingName] = filledArguments.unknownArguments
    } else {
        filledArgumentsToPrint[unknownArgumentsPrintingName] = filledArguments.unknownArguments.slice(0, 99)
        filledArgumentsToPrint[unknownArgumentsPrintingName].push[`< and ${unknownArgumentsCount - 99} more >`]
    }

    console.log()
    console.log('Provided arguments:')
    console.log(rawArgumentsToPrint)
    console.log()
    console.log('Resolved arguments:')
    console.log(filledArgumentsToPrint)
    console.log()
}

function combinArgumentsWithConfigFile(filledArguments, cwd) {
    const options = {
        shouldDebug:                                       filledArguments.debug,
        sourceGlobs:                                       filledArguments.from,
        outputPath:                                        filledArguments.to,
        configFileIsSpecifiedInCLI:                        filledArguments.configFileIsSpecifiedInCLI,
        shouldUseCSSOfDefaultDarkThemeAccordingToArgument: filledArguments.darkTheme,
        cssOfDefaultDarkThemeIsDemandedViaCLI:             filledArguments.darkThemeIsDemandedViaCLI,
        promptUserIfSourceFileCountExceedsThisNumber:      filledArguments.inputFileCountToWarn,
    }

    const conversionOptions = {
        articleTOCListTagNameIsUL: filledArguments.tocUl,
    }

    const manipulationsOverHTML = {
        htmlTagLanguage: filledArguments.htmlLanguage,
    }

    const manipulationsOverHTML0 = {}

    if (options.shouldUseCSSOfDefaultDarkThemeAccordingToArgument) {
        manipulationsOverHTML0.internalCSSFileNameOfTheme        = 'wulechuan-styles-for-html-via-markdown.default-dark--no-toc.min.css'
        manipulationsOverHTML0.internalCSSFileNameOfThemeWithTOC = 'wulechuan-styles-for-html-via-markdown.default-dark--with-toc.min.css'
    }

    const behavioursOfBuiltInTOC = {
        shouldShowOnlyTwoLevelsOfTOCItemsAtMost:                filledArguments.conciseToc,
        atBeginingShouldCollapseAllTOCItemsOfLevelsGreaterThan: filledArguments.tocItemExpandedLevel,
        atBeginingShouldExpandTOCWhenWindowIsWideEnough:        filledArguments.expandToc,
    }

    if (!cwd) {
        cwd = process.cwd()
    }

    const configFilePath = joinPath(cwd, filledArguments.configFile)
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

    if (!optionsForConverter.conversionOptions) {
        optionsForConverter.conversionOptions = {}
    }

    if (!optionsForConverter.manipulationsOverHTML) {
        optionsForConverter.manipulationsOverHTML = {}
    }

    if (!optionsForConverter.behavioursOfBuiltInTOC) {
        optionsForConverter.behavioursOfBuiltInTOC = {}
    }

    optionsForConverter.conversionOptions = {
        ...optionsForConverter.conversionOptions,
        ...conversionOptions,
    }

    optionsForConverter.manipulationsOverHTML = {
        ...manipulationsOverHTML0,
        ...optionsForConverter.manipulationsOverHTML,
        ...manipulationsOverHTML,
    }

    optionsForConverter.behavioursOfBuiltInTOC = {
        ...optionsForConverter.behavioursOfBuiltInTOC,
        ...behavioursOfBuiltInTOC,
    }

    options['options for @wulechuan/generate-html-via-markdown'] = optionsForConverter

    if (options.shouldDebug) {
        console.log('decided options:', options)
    }

    if (options.cssOfDefaultDarkThemeIsDemandedViaCLI) {
        const finallyCSS1IsNotOfCLIDemandedTheme = optionsForConverter.manipulationsOverHTML.internalCSSFileNameOfTheme        !== manipulationsOverHTML0.internalCSSFileNameOfTheme
        const finallyCSS2IsNotOfCLIDemandedTheme = optionsForConverter.manipulationsOverHTML.internalCSSFileNameOfThemeWithTOC !== manipulationsOverHTML0.internalCSSFileNameOfThemeWithTOC
        if (finallyCSS1IsNotOfCLIDemandedTheme || finallyCSS2IsNotOfCLIDemandedTheme) {
            console.log()
            console.log(chalk.yellow(`WARNING: According to the finalized configuration,\nthe "${
                chalk.green('-d')
            }" or "${
                chalk.green('-dark-theme')
            }" will ${chalk.red('NOT')} take effect!`))
            console.log()
        }
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

            promptUserWhenThereAreTooManySourceFiles().then(userInput => {
                stdIOReader.close()
                if (userInput.match(/^(y|yes)$/i)) {
                    resolvePromise(sourceFilePaths)
                } else {
                    console.log(chalk.yellow('All right! I WON\'T DO IT!'))
                    rejectPromise('User cancelled because way too many source files were discovered.')
                }
            })
        }
    })
}

function promptUserWhenThereAreTooManySourceFiles() {
    return new Promise(promptUserOnce).catch(promptUserWhenThereAreTooManySourceFiles)
}

function promptUserOnce(resolve, reject) {
    stdIOReader.question(
        chalk.red(`Are you sure to process them all? [${chalk.yellow('y')}/${chalk.yellow('n')}] `),
        userInput => {
            if (userInput.match(/^(y|n|yes|no)$/i)) {
                resolve(userInput)
            } else {
                reject('User input invalid. Must match /^(y|n|yes|no)$/i')
            }
        }
    )
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

    const sourceFileExtIsLegal = [
        'md',
        'markdown',
    ].includes(sourceFileExt.toLowerCase())

    if (!sourceFileExtIsLegal) {
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
