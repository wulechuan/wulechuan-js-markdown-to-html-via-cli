#!/usr/bin/env node

const thisPackageJSON = require('../package.json')
const version = `v${thisPackageJSON.version.replace(/^v/, '')}`

console.log('. . . . . . . . . . . . . . . . . . . . . . . . . . . . .')
console.log('.                                                       .')
console.log('.  此乃吴乐川设计的命令行工具，                         .')
console.log('.  用以批量将 MarkDown 格式逐一转化为 HTML 格式之文件。 .')
console.log('.                                                       .')
console.log(`.  ${version}${' '.repeat(45 -  version.length)}        .`)
console.log('.                                                       .')
console.log('.                         吴乐川 <wulechuan@live.com>   .')
console.log('.                                          2021-07-18   .')
console.log('.                                                       .')
console.log('. . . . . . . . . . . . . . . . . . . . . . . . . . . . .')
console.log()

const 进程异常退出之代码集 = {
    未知错误: 1,
    命令行中给出的输出路径无效: 2,
    命令行中给出的输出路径配置项不止一个: 3,
    匹配的MarkDown文件不止一个但输出的HTML却是唯一: 4,
    命令行中给出的配置文件不止一个: 5,
    命令行中给出的配置文件不存在: 6,
    配置项文件读取失败: 7,
    配置项中给出的关于源文件过多之警告的限额值无效: 8,
    命令行中出现了未知参数项: 9,
    因匹配的MarkDown文件数量过多用户决定退出本程序: 19,
}

const 命令行参数各项之默认值 = {
    from: [ './*.md', './*.MD' ],
    to: './',
    inputFileCountToWarn: 51,
    configFiles: [
        './吴乐川MarkDown转HTML之配置.js',
        './wlc-md-to-html.config.js',
    ],
    darkTheme: false,
    tocUl: false,
    conciseToc: false,
    expandToc: false,
    tocItemExpandedLevel: 1,
    htmlLanguage: 'zh-hans-CN',
}

const 命令行中打印的帮助信息之缩进空格默认数 = 6
// const CLI_HELP_DECSCRIPTIONS_SHOULD_LAY_RIGHTSIDE = false
const 当命令行给出杠杠HELP时应打印HTML版本之帮助文件之文件路径 = true





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
const descriptionPrefixString = `\n${' '.repeat(命令行中打印的帮助信息之缩进空格默认数)}`
// if (CLI_HELP_DECSCRIPTIONS_SHOULD_LAY_RIGHTSIDE) {
//     descriptionPrefixString = ''
// }

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
                命令行参数各项之默认值.from
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
                命令行参数各项之默认值.to
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
                命令行参数各项之默认值.configFiles[0]
            )
        }${
            placeHolderForALineBreakFollwedByAnIndentation
        }${
            ofAStringValueGetTheCLIHelpPrintingStringOfItsDefaultValue(
                命令行参数各项之默认值.configFiles[1]
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
                命令行参数各项之默认值.inputFileCountToWarn
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
        }${chalk.red(`or "${chalk.green('--config-file')}" arguments.`)}\n`
    )

    .option(
        '-U, --toc-ul',

        `${
            descriptionPrefixString
        }When presents, the lists in TOC are <ul>s instead of <ol>s.\n`
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
        }${chalk.red('NEVER visible. They are hidden via CSS rules.')}\n`
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
        }is NOT the same thing as to expand an item of the TOC panel.\n`
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
                命令行参数各项之默认值.tocItemExpandedLevel
            )
        }\n`
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
            ofAStringValueGetTheCLIHelpPrintingStringOfItsDefaultValue(命令行参数各项之默认值.htmlLanguage)
        }\n`
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
        './文档/说明书/en-US/ReadMe.html',
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
        if (当命令行给出杠杠HELP时应打印HTML版本之帮助文件之文件路径) {
            let englishPhrase

            if (existingHelpHTMLs.length === 1) {
                englishPhrase = 'this doc'
            } else if (existingHelpHTMLs.length === 2) {
                englishPhrase = 'either of'
            } else {
                englishPhrase = 'any of'
            }

            console.log()
            console.log('-'.repeat(51))
            console.log()
            console.log(`Please also refer to ${englishPhrase}:`)
            existingHelpHTMLs.forEach(help => console.log(`    ${help.fullPath}`))
        }
    }
})



formatDescriptionsOfAllArgumentOptions(program)



function formatDescriptionsOfAllArgumentOptions(program) {
    const newLineIndentationWidth = 命令行中打印的帮助信息之缩进空格默认数

    // if (CLI_HELP_DECSCRIPTIONS_SHOULD_LAY_RIGHTSIDE) {
    //     newLineIndentationWidth = program.options.reduce((maxFlagsStringLength, option) => {
    //         return Math.max(maxFlagsStringLength, option.flags.length + 2)
    //     }, 19)
    // }

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
        process.exit(进程异常退出之代码集.命令行中给出的输出路径配置项不止一个)
    }

    return value
}

function processArgumentOfConfigFilePath(value, previousValue) {
    if (previousValue) {
        console.log(chalk.red('Multiple \'-C, --config-json\' options are NOT allowed.'))
        process.exit(进程异常退出之代码集.命令行中给出的配置文件不止一个)
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

try {
    start(program)
} catch (err) {
    console.log(err.message)
    process.exit(进程异常退出之代码集.未知错误)
}





function start(program) {
    const programArguments = program.opts()
    const unknownArguments = program.args
    const filledArguments = fillDefaultValuesForAbsentArguments(programArguments)

    // console.log('\nprogramArguments', programArguments)
    // console.log('\nunknownArguments', unknownArguments)
    // console.log('\nfilledArguments', filledArguments)

    printCLIArguments(programArguments, unknownArguments, filledArguments)
    if (unknownArguments.length > 0) {
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

        process.exit(进程异常退出之代码集.命令行中出现了未知参数项)
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
        process.exit(进程异常退出之代码集.命令行中给出的输出路径无效)
    }



    prepareSourceFiles(options)
        .catch(reason => {
            console.log()
            console.log(chalk.red(reason))
            process.exit(进程异常退出之代码集.因匹配的MarkDown文件数量过多用户决定退出本程序)
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
                    process.exit(进程异常退出之代码集.匹配的MarkDown文件不止一个但输出的HTML却是唯一)
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
        filledArguments.from = programRawArguments.from
    } else {
        filledArguments.from = 命令行参数各项之默认值.from
    }

    if (programRawArguments.to) {
        filledArguments.to = programRawArguments.to
    } else {
        filledArguments.to = 命令行参数各项之默认值.to
    }

    if ('inputFileCountToWarn' in programRawArguments) {
        filledArguments.inputFileCountToWarn = parseInt(programRawArguments.inputFileCountToWarn)
        if (!(filledArguments.inputFileCountToWarn >= 0)) {
            console.log(
                chalk.red('Invalid value of "-n, --input-file-count-to-warn"'),
                chalk.yellow(filledArguments.inputFileCountToWarn)
            )
            process.exit(进程异常退出之代码集.配置项中给出的关于源文件过多之警告的限额值无效)
        }
    } else {
        filledArguments.inputFileCountToWarn = 命令行参数各项之默认值.inputFileCountToWarn
    }

    if ('configFile' in programRawArguments) {
        filledArguments.configFile = programRawArguments.configFile
        filledArguments.configFileIsSpecifiedInCLI = true
    } else {
        filledArguments.configFile = 命令行参数各项之默认值.configFiles[0]
        filledArguments.configFileIsSpecifiedInCLI = false
    }

    if ('darkTheme' in programRawArguments) {
        filledArguments.darkTheme = !!programRawArguments.darkTheme
        filledArguments.darkThemeIsDemandedViaCLI = filledArguments.darkTheme
    } else {
        filledArguments.darkTheme = 命令行参数各项之默认值.darkTheme
        filledArguments.darkThemeIsDemandedViaCLI = false
    }

    if ('tocUl' in programRawArguments) {
        filledArguments.tocUl = !!programRawArguments.tocUl
    } else {
        filledArguments.tocUl = 命令行参数各项之默认值.tocUl
    }

    if ('conciseToc' in programRawArguments) {
        filledArguments.conciseToc = !!programRawArguments.conciseToc
    } else {
        filledArguments.conciseToc = 命令行参数各项之默认值.conciseToc
    }

    if ('expandToc' in programRawArguments) {
        filledArguments.expandToc = !!programRawArguments.expandToc
    } else {
        filledArguments.expandToc = 命令行参数各项之默认值.expandToc
    }

    if ('tocItemExpandedLevel' in programRawArguments) {
        filledArguments.tocItemExpandedLevel = parseInt(programRawArguments.tocItemExpandedLevel)
    } else {
        filledArguments.tocItemExpandedLevel = 命令行参数各项之默认值.tocItemExpandedLevel
    }

    if ('htmlLanguage' in programRawArguments) {
        filledArguments.htmlLanguage = programRawArguments.htmlLanguage
    } else {
        filledArguments.htmlLanguage = 命令行参数各项之默认值.htmlLanguage
    }

    return filledArguments
}

function printCLIArguments(rawArguments, unknownArguments, filledArguments) {
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

    const unknownArgumentsCount = unknownArguments.length

    if (unknownArgumentsCount > 0) {
        const unknownArgumentsPrintingName = `args (${unknownArgumentsCount})`

        if (unknownArgumentsCount <= 100) {
            rawArgumentsToPrint[unknownArgumentsPrintingName] = unknownArguments
        } else {
            rawArgumentsToPrint[unknownArgumentsPrintingName] = unknownArguments.slice(0, 99)
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
    console.log('由命令行给出的参数：')
    console.log(rawArgumentsToPrint)
    console.log()
    console.log('最终决定采用的完整配置：')
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
            process.exit(进程异常退出之代码集.命令行中给出的配置文件不存在)
        }
    } else {
        try {
            configurationsFromFile = require(configFilePath)
        } catch (readFileErro) {
            console.log(chalk.red(`Error reading configuration JSON file "${
                chalk.yellow(configFilePath)
            }"`))
            process.exit(进程异常退出之代码集.配置项文件读取失败)
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

    if (sourceFileSizeInBytes > 1e7) {
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
