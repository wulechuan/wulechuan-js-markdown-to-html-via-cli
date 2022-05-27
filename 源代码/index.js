#!/usr/bin/env node

const 本工具之PackageJSON = require('../package.json')
const 本工具之版本字符串 = `v${本工具之PackageJSON.version.replace(/^v/, '')}`

console.log('. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .')
console.log('.                                                             .')
console.log('.  此乃吴乐川设计的命令行工具，                               .')
console.log('.  用以批量将 MarkDown 格式的文件逐一转化为 HTML 格式之文件。 .')
console.log('.                                                             .')
console.log(`.  ${本工具之版本字符串}${' '.repeat(45 -  本工具之版本字符串.length)}              .`)
console.log('.                                                             .')
console.log('.                                吴乐川 <wulechuan@live.com>  .')
console.log('.                                                 2022-05-27  .')
console.log('.                                                             .')
console.log('. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .')
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
    用以搜寻待处理MarkDown文件之匹配规则列表: [ './*.md', './*.MD' ],
    若MarkDown文件数量大于该值则提醒操作者: 51,
    配置项文件之路径: [
        './吴乐川MarkDown转HTML之配置.js',
        './wlc-md-to-html.config.js',
    ],
    产出HTML的路径规则: './',
    输出的HTML应采用幽暗配色: false,
    文章纲要列表应采用UL标签而非OL标签: false,
    为求文章纲要列表简洁明了故意仅显示两层条目以至于较深层级条目形同作废: false,
    浏览器打开HTML文章最初之时若浏览器窗口足够宽大则直接展开文章纲要列表之面板: false,
    浏览器打开HTML文章最初之时文章纲要列表中凡层级深于该值之条目均应收叠: 1,
    产出之HTML文件之Html标签之语言属性之取值: 'zh-hans-CN',
}

const 命令行中打印的帮助信息之缩进空格默认数 = 6
// const CLI_HELP_DECSCRIPTIONS_SHOULD_LAY_RIGHTSIDE = false
const 当命令行给出杠杠Help这一选项时应在命令行环境中打印HTML版本之帮助文件之文件路径 = true





const 命令行环境中人类输入之读取机之制造机 = require('readline')

const 命令行环境中人类输入之读取机 = 命令行环境中人类输入之读取机之制造机.createInterface({
    input:  process.stdin,
    output: process.stdout,
})

const 彩色粉笔工具 = require('chalk')
const path = require('path')
const globby = require('globby')
const fsExtra = require('fs-extra')

const {
    readFileSync,
    writeFileSync,
    statSync: getFileStatSync,
    mkdirpSync,
    existsSync,
} = fsExtra

const 命令行程序制造机 = require('commander')
const 吴乐川GenerateHtmlViaMarkdown工具现成提供的一枚转换器 = require('@wulechuan/generate-html-via-markdown')



const syncResolveGlobs = globby.sync
const joinPath         = path.join
const joinPathPOSIX    = path.posix.join
const parsePath        = path.parse
const getDirNameOf     = path.dirname

const thisPackageRootFolderPath = path.dirname(require.resolve('.'))

const 本程序 = new 命令行程序制造机.Command()



本程序.name('wlc-md-to-html')



const 用于暂代换行符及其后续若干缩进空白的字符串 = '<-该处应为换行符和若干缩进空白->' // 用以辅助统一各解释文本之格式。
const 本工具任何命令行参数之解释文本之统一前缀 = `\n${' '.repeat(命令行中打印的帮助信息之缩进空格默认数)}` // 同样用以辅助统一各解释文本之格式。
// if (CLI_HELP_DECSCRIPTIONS_SHOULD_LAY_RIGHTSIDE) {
//     本工具任何命令行参数之解释文本之统一前缀 = ''
// }

本程序
    .version(
        本工具之版本字符串,

        '-v, --version',

        `${
            本工具任何命令行参数之解释文本之统一前缀
        }Print the version of this program, that is "${本工具之版本字符串}".\n`
    )

本程序
    .helpOption(
        '-h, --help',

        `${
            本工具任何命令行参数之解释文本之统一前缀
        }Display this help.`
    )

本程序
    .option(
        '-i, --from  [globs]',

        `${
            本工具任何命令行参数之解释文本之统一前缀
        }Any glob that:${
            用于暂代换行符及其后续若干缩进空白的字符串
        }  - matches \`.md\` or \`.MD\` files;${
            用于暂代换行符及其后续若干缩进空白的字符串
        }  - matches folders containing \`.md\` or \`.MD\` files;${
            用于暂代换行符及其后续若干缩进空白的字符串
        }  - is a comma-separated values of above.${
            用于暂代换行符及其后续若干缩进空白的字符串
        }${彩色粉笔工具.green('Note that multiple presents of this argument are also allowed.')}${
            用于暂代换行符及其后续若干缩进空白的字符串
        }${
            取得某命令行参数之默认值之彩色字符串以用于对应的解释文本中_该参数之合规取值须为列表(
                命令行参数各项之默认值.用以搜寻待处理MarkDown文件之匹配规则列表
            )
        }\n`,

        collectValuesOfTheSourceGlobsArgumentsInCLI
    )

    .option(
        '-o, --to  [path]',

        `${
            本工具任何命令行参数之解释文本之统一前缀
        }Path of folder for output \`.html\` files. A single ${彩色粉笔工具.red('asterisk')}(${彩色粉笔工具.red('*')})${
            用于暂代换行符及其后续若干缩进空白的字符串
        }is allowed at the beginning of the path, meaning the rest${
            用于暂代换行符及其后续若干缩进空白的字符串
        }part of this path string will treat as a sub path to each${
            用于暂代换行符及其后续若干缩进空白的字符串
        }and very source path. This is the ONLY special sign allowed${
            用于暂代换行符及其后续若干缩进空白的字符串
        }in this path string. No question marks("?") are allowed.${
            用于暂代换行符及其后续若干缩进空白的字符串
        }No asterisks are allowed in any other places of this string.${
            用于暂代换行符及其后续若干缩进空白的字符串
        }${彩色粉笔工具.red('Note that you MUST quote the path string if it starts with')}${
            用于暂代换行符及其后续若干缩进空白的字符串
        }${彩色粉笔工具.red('an asterisk sign. Otherwise the operating system might first')}${
            用于暂代换行符及其后续若干缩进空白的字符串
        }${彩色粉笔工具.red('expand it as a glob, then pass resolved items to this program.')}${
            用于暂代换行符及其后续若干缩进空白的字符串
        }${
            取得某命令行参数之默认值之彩色字符串以用于对应的解释文本中_该参数之合规取值须为字符串(
                命令行参数各项之默认值.产出HTML的路径规则
            )
        }\n`,

        处理命令行参数值_输出路径之设计规则
    )

    .option(
        '-C, --config-file  [path]',

        `${
            本工具任何命令行参数之解释文本之统一前缀
        }Specify a \`.js\` file for fully controlling the converter${
            用于暂代换行符及其后续若干缩进空白的字符串
        }utilized by this program internally.${
            用于暂代换行符及其后续若干缩进空白的字符串
        }${
            取得某命令行参数之默认值之彩色字符串以用于对应的解释文本中_该参数之合规取值须为字符串(
                命令行参数各项之默认值.配置项文件之路径[0]
            )
        }${
            用于暂代换行符及其后续若干缩进空白的字符串
        }${
            取得某命令行参数之默认值之彩色字符串以用于对应的解释文本中_该参数之合规取值须为字符串(
                命令行参数各项之默认值.配置项文件之路径[1]
            )
        }\n`,

        处理命令和参数值_配置项文件之路径
    )

    .option(
        '-n, --input-file-count-to-warn  [path]',

        `${
            本工具任何命令行参数之解释文本之统一前缀
        }Specify a number as a so-called "safe" limitation of the${
            用于暂代换行符及其后续若干缩进空白的字符串
        }the count of resovled source files. If too many source${
            用于暂代换行符及其后续若干缩进空白的字符串
        }files are found, then this program pauses and prompt user${
            用于暂代换行符及其后续若干缩进空白的字符串
        }to decide whether it should go on or quit. Setting this to${
            用于暂代换行符及其后续若干缩进空白的字符串
        }zero means never prompt user and always process all discovered${
            用于暂代换行符及其后续若干缩进空白的字符串
        }source files, no matter how many there are.${
            用于暂代换行符及其后续若干缩进空白的字符串
        }${
            取得某命令行参数之默认值之彩色字符串以用于对应的解释文本中_该参数之合规取值须为非字符串非列表(
                命令行参数各项之默认值.若MarkDown文件数量大于该值则提醒操作者
            )
        }\n`,

        处理命令和参数值_配置项文件之路径
    )

    .option(
        '-d, --dark-theme',

        `${
            本工具任何命令行参数之解释文本之统一前缀
        }If presents, the default dark-colored theme is applied to all${
            用于暂代换行符及其后续若干缩进空白的字符串
        }HTML files, instead of the light-colored theme. ${彩色粉笔工具.red('But the effect')}${
            用于暂代换行符及其后续若干缩进空白的字符串
        }${彩色粉笔工具.red('of this argument will be overrided by the configurations, if')}${
            用于暂代换行符及其后续若干缩进空白的字符串
        }${彩色粉笔工具.red(`any, in the configuration file, which is loaded via the "${彩色粉笔工具.green('-C')}"`)}${
            用于暂代换行符及其后续若干缩进空白的字符串
        }${彩色粉笔工具.red(`or "${彩色粉笔工具.green('--config-file')}" arguments.`)}\n`
    )

    .option(
        '-U, --toc-ul',

        `${
            本工具任何命令行参数之解释文本之统一前缀
        }When presents, the lists in TOC are <ul>s instead of <ol>s.\n`
    )

    .option(
        '-2, --concise-toc',

        `${
            本工具任何命令行参数之解释文本之统一前缀
        }When presents, the max level of the TOC items in an HTML is${
            用于暂代换行符及其后续若干缩进空白的字符串
        }limited to ${彩色粉笔工具.green(2)}. This makes the TOC more concise and clean.${
            用于暂代换行符及其后续若干缩进空白的字符串
        }${彩色粉笔工具.red('Be aware that this way all deeper levels of TOC items are')}${
            用于暂代换行符及其后续若干缩进空白的字符串
        }${彩色粉笔工具.red('NEVER visible. They are hidden via CSS rules.')}\n`
    )

    .option(
        '-e, --expand-toc',

        `${
            本工具任何命令行参数之解释文本之统一前缀
        }If the browser window is wide enough, expand the TOC panel when${
            用于暂代换行符及其后续若干缩进空白的字符串
        }an HTML just loads. Note that either way, the TOC panel can${
            用于暂代换行符及其后续若干缩进空白的字符串
        }ALWAYS toggle manually. Also Note that to expand the TOC panel${
            用于暂代换行符及其后续若干缩进空白的字符串
        }is NOT the same thing as to expand an item of the TOC panel.\n`
    )

    .option(
        '-E, --toc-item-expanded-level  [level]',

        `${
            本工具任何命令行参数之解释文本之统一前缀
        }If the browser window is wide enough, TOC items are collapsable${
            用于暂代换行符及其后续若干缩进空白的字符串
        }and expandable, if it contains a nested TOC list. This option${
            用于暂代换行符及其后续若干缩进空白的字符串
        }decides how many levels of TOC items are expanded by default.${
            用于暂代换行符及其后续若干缩进空白的字符串
        }Note the all expandable items can ALWASY toggle manually.${
            用于暂代换行符及其后续若干缩进空白的字符串
        }${
            取得某命令行参数之默认值之彩色字符串以用于对应的解释文本中_该参数之合规取值须为非字符串非列表(
                命令行参数各项之默认值.浏览器打开HTML文章最初之时文章纲要列表中凡层级深于该值之条目均应收叠
            )
        }\n`
    )

    .option(
        '-l, --html-language  [language]',
        `${
            本工具任何命令行参数之解释文本之统一前缀
        }Specified the value of the "lang" attribute of the <html>${
            用于暂代换行符及其后续若干缩进空白的字符串
        }tag inside a generated HTML file.${
            用于暂代换行符及其后续若干缩进空白的字符串
        }${
            取得某命令行参数之默认值之彩色字符串以用于对应的解释文本中_该参数之合规取值须为字符串(命令行参数各项之默认值.产出之HTML文件之Html标签之语言属性之取值)
        }\n`
    )

    .option(
        '-D, --debug',
        `${
            本工具任何命令行参数之解释文本之统一前缀
        }To enable debugging mode.\n`
    )



本程序.on('--help', () => {
    // console.log('thisPackageRootFolderPath:', thisPackageRootFolderPath)

    const existingHelpHTMLs = [
        'ReadMe.html',
        './文档集/说明书/en-US/ReadMe.html',
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
        if (当命令行给出杠杠Help这一选项时应在命令行环境中打印HTML版本之帮助文件之文件路径) {
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



格式化所有命令行参数之解释文本(本程序)



function 格式化所有命令行参数之解释文本(program) {
    const 每行首部缩进空格之数 = 命令行中打印的帮助信息之缩进空格默认数

    // if (CLI_HELP_DECSCRIPTIONS_SHOULD_LAY_RIGHTSIDE) {
    //     每行首部缩进空格之数 = program.options.reduce((maxFlagsStringLength, option) => {
    //         return Math.max(maxFlagsStringLength, option.flags.length + 2)
    //     }, 19)
    // }

    program.options.forEach(option => {
        option.description = option.description.replace(
            new RegExp(用于暂代换行符及其后续若干缩进空白的字符串, 'g'),
            `\n${' '.repeat(每行首部缩进空格之数)}`
        )
    })
}

function collectValuesOfTheSourceGlobsArgumentsInCLI(本次采集到的新值, 之前已经采集到的取值) {
    if (!之前已经采集到的取值) {
        之前已经采集到的取值 = []
    }

    const 合并的值 = [
        ...之前已经采集到的取值,
        ...本次采集到的新值.split(',').map(v => v.trim()).filter(v => !!v),
    ]

    return 合并的值
}

function 处理命令行参数值_输出路径之设计规则(本次采集到的新值, 之前已经采集到的取值) {
    if (之前已经采集到的取值) {
        console.log(彩色粉笔工具.red('“-o, --to”这一参数不允许多次出现！'))
        process.exit(进程异常退出之代码集.命令行中给出的输出路径配置项不止一个)
    }

    return 本次采集到的新值
}

function 处理命令和参数值_配置项文件之路径(本次采集到的新值, 之前已经采集到的取值) {
    if (之前已经采集到的取值) {
        console.log(彩色粉笔工具.red('“-C, --config-json”这一参数不允许多次出现！'))
        process.exit(进程异常退出之代码集.命令行中给出的配置文件不止一个)
    }

    return 本次采集到的新值
}

function 取得某命令行参数之默认值之彩色字符串以用于对应的解释文本中_该参数之合规取值须为字符串(默认字符串值) {
    return (`(${
        彩色粉笔工具.rgb(255, 255, 255)('默认值')
    }： ${
        彩色粉笔工具.green(`'${默认字符串值}'`) // 绿色
    })`)
}

function 取得某命令行参数之默认值之彩色字符串以用于对应的解释文本中_该参数之合规取值须为列表(作为默认值的列表) {
    const 默认值之完整字符串 = 作为默认值的列表.map(某值 => 彩色粉笔工具.green(`'${某值}'`)).join(', ')
    return (`(${
        彩色粉笔工具.rgb(255, 255, 255)('默认值')
    }： ${
        彩色粉笔工具.blue(`[ ${默认值之完整字符串} ]`) // 蓝色
    })`)
}

function 取得某命令行参数之默认值之彩色字符串以用于对应的解释文本中_该参数之合规取值须为非字符串非列表(默认值) {
    return (`(${
        彩色粉笔工具.rgb(255, 255, 255)('默认值')
    }： ${
        彩色粉笔工具.yellow(默认值) // 黄色
    })`)
}





本程序.parse(process.argv)

try {
    启动程序(本程序)
} catch (err) {
    console.log(err.message)
    process.exit(进程异常退出之代码集.未知错误)
}





function 启动程序(程序) {
    const 采集到的所有标准命令行参数集 = 程序.opts()
    const 采集到的所有非标准命令行参数集 = 程序.args
    const 以默认值补齐缺漏后的完整参数集 = 用默认值填补缺省的命令行参数(采集到的所有标准命令行参数集)

    // console.log('\n采集到的所有标准命令行参数集', 采集到的所有标准命令行参数集)
    // console.log('\n采集到的所有非标准命令行参数集', 采集到的所有非标准命令行参数集)
    // console.log('\nfilledArguments', filledArguments)

    打印采集到的命令行参数集以及最终裁定的参数集(采集到的所有标准命令行参数集, 采集到的所有非标准命令行参数集, 以默认值补齐缺漏后的完整参数集)



    if (采集到的所有非标准命令行参数集.length > 0) {
        console.log(彩色粉笔工具.red('Unknown arguments are NOT allowed.'))

        console.log(彩色粉笔工具.yellow('You might:'))

        console.log(`  - ${
            彩色粉笔工具.yellow(`forgot to use "${
                彩色粉笔工具.green('-i')
            }", "${
                彩色粉笔工具.green('--from')
            }", "${
                彩色粉笔工具.green('-o')
            }" or "${
                彩色粉笔工具.green('--to')
            }" arguments\n    to lead a value.`)
        }`)

        console.log(`  - ${
            彩色粉笔工具.yellow(`forgot to quote the value of "${
                彩色粉笔工具.green('-o')
            }" or "${
                彩色粉笔工具.green('--to')
            }" argument.`)
        }`)

        process.exit(进程异常退出之代码集.命令行中出现了未知参数项)
    }

    const options = combinArgumentsWithConfigFile(以默认值补齐缺漏后的完整参数集)



    const { shouldDebug } = options



    if (shouldDebug) {
        console.log()
        console.log('-------------------- debugging --------------------')
    }

    const 各输出HTML文件之路径设计规则_甲 = options.outputPath

    let 各HTML输出文件之路径系相对于其源Markdown文件之路径者而非绝对路径 = false
    let 各输出HTML文件之路径设计规则_乙 = 各输出HTML文件之路径设计规则_甲

    if (
        各输出HTML文件之路径设计规则_乙.match(/^"/) && 各输出HTML文件之路径设计规则_乙.match(/"$/) ||
        各输出HTML文件之路径设计规则_乙.match(/^'/) && 各输出HTML文件之路径设计规则_乙.match(/'$/)
    ) {
        /*
            In some situations, for example the npm "scripts" running inside Nodejs,
            quoting marks are NOT unwrapped automatically.
         */
        各输出HTML文件之路径设计规则_乙 = 各输出HTML文件之路径设计规则_乙.slice(1, 各输出HTML文件之路径设计规则_乙.length - 1)
    }

    if (各输出HTML文件之路径设计规则_乙.match(/^\*/)) { // 若规则以星号（即“*”）打头
        各HTML输出文件之路径系相对于其源Markdown文件之路径者而非绝对路径 = true
        各输出HTML文件之路径设计规则_乙 = 各输出HTML文件之路径设计规则_乙.replace(/^\*[\\/]*/, '') // 剔除该打头的星号。
    }

    if (各输出HTML文件之路径设计规则_乙.match(/[*?]/)) { // 若剔除打头星号后，发现剩余部分仍存在星号，则报错。
        console.log(彩色粉笔工具.red(`Invalid output folder path:\n    "${彩色粉笔工具.yellow(各输出HTML文件之路径设计规则_乙)}"`))
        process.exit(进程异常退出之代码集.命令行中给出的输出路径无效)
    }



    搜集所有Markdown源文件(options)
        .catch(reason => {
            console.log()
            console.log(彩色粉笔工具.red(reason))
            process.exit(进程异常退出之代码集.因匹配的MarkDown文件数量过多用户决定退出本程序)
        })
        .then(搜集到的所有Markdown文件之路径 => {
            if (shouldDebug) {
                console.log('-'.repeat(51))
            }



            if (搜集到的所有Markdown文件之路径.length === 0) {
                console.log('Zero source files provided. Nothing to do.')
            } else {
                const validOutputPath = 各输出HTML文件之路径设计规则_乙

                const 有且仅有一个源Markdown文件 = 搜集到的所有Markdown文件之路径.length === 1

                const 输出HTML文件路径之设计规则看起来像是描述了唯一一个HTML文件 = !!validOutputPath.match(/.+\.html$/i)
                if (
                    !各HTML输出文件之路径系相对于其源Markdown文件之路径者而非绝对路径 &&
                    输出HTML文件路径之设计规则看起来像是描述了唯一一个HTML文件 &&
                    搜集到的所有Markdown文件之路径.length > 1
                ) {
                    console.log(彩色粉笔工具.red('Should not convert multiple source files into single output file.'))
                    process.exit(进程异常退出之代码集.匹配的MarkDown文件不止一个但输出的HTML却是唯一)
                }

                搜集到的所有Markdown文件之路径.forEach((sourceFilePath, i) => {
                    处理单个源Markdown文件(
                        sourceFilePath,
                        validOutputPath,
                        各HTML输出文件之路径系相对于其源Markdown文件之路径者而非绝对路径,
                        输出HTML文件路径之设计规则看起来像是描述了唯一一个HTML文件,
                        有且仅有一个源Markdown文件,
                        options
                    )

                    console.log(彩色粉笔工具.green(`Done (${i + 1}/${搜集到的所有Markdown文件之路径.length})`))
                })

                console.log(彩色粉笔工具.green(
                    [
                        '',
                        '',
                        '* * * * * * *',
                        '*   完毕！  *',
                        '* * * * * * *',
                    ].join('\n')
                ))
            }

            process.exit(0)
        })
}



function 用默认值填补缺省的命令行参数(采集到的所有标准命令行参数集) {
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

    const 采集到的 = 采集到的所有标准命令行参数集 // 在该函数具备不妨采用简短的名称
    const 默认的 = 命令行参数各项之默认值 // 在该函数具备不妨采用简短的名称
    const 补齐后的 = {} // 以默认值补齐缺漏后的完整参数集，在该函数具备不妨采用简短的名称

    补齐后的.debug = !!采集到的.debug

    if (采集到的.用以搜寻待处理MarkDown文件之匹配规则列表) {
        补齐后的.用以搜寻待处理MarkDown文件之匹配规则列表 = 采集到的.用以搜寻待处理MarkDown文件之匹配规则列表
    } else {
        补齐后的.用以搜寻待处理MarkDown文件之匹配规则列表 = 默认的.用以搜寻待处理MarkDown文件之匹配规则列表
    }

    if (采集到的.产出HTML的路径规则) {
        补齐后的.产出HTML的路径规则 = 采集到的.产出HTML的路径规则
    } else {
        补齐后的.产出HTML的路径规则 = 默认的.产出HTML的路径规则
    }

    if ('inputFileCountToWarn' in 采集到的) {
        补齐后的.若MarkDown文件数量大于该值则提醒操作者 = parseInt(采集到的.若MarkDown文件数量大于该值则提醒操作者)
        if (!(补齐后的.若MarkDown文件数量大于该值则提醒操作者 >= 0)) {
            console.log(
                彩色粉笔工具.red('Invalid value of "-n, --input-file-count-to-warn"'),
                彩色粉笔工具.yellow(补齐后的.若MarkDown文件数量大于该值则提醒操作者)
            )
            process.exit(进程异常退出之代码集.配置项中给出的关于源文件过多之警告的限额值无效)
        }
    } else {
        补齐后的.若MarkDown文件数量大于该值则提醒操作者 = 默认的.若MarkDown文件数量大于该值则提醒操作者
    }

    if ('configFile' in 采集到的) {
        补齐后的.configFile = 采集到的.configFile
        补齐后的.configFileIsSpecifiedInCLI = true
    } else {
        补齐后的.configFile = 默认的.配置项文件之路径[0]
        补齐后的.configFileIsSpecifiedInCLI = false
    }

    if ('darkTheme' in 采集到的) {
        补齐后的.输出的HTML应采用幽暗配色 = !!采集到的.输出的HTML应采用幽暗配色
        补齐后的.darkThemeIsDemandedViaCLI = 补齐后的.输出的HTML应采用幽暗配色
    } else {
        补齐后的.输出的HTML应采用幽暗配色 = 默认的.输出的HTML应采用幽暗配色
        补齐后的.darkThemeIsDemandedViaCLI = false
    }

    if ('tocUl' in 采集到的) {
        补齐后的.文章纲要列表应采用UL标签而非OL标签 = !!采集到的.文章纲要列表应采用UL标签而非OL标签
    } else {
        补齐后的.文章纲要列表应采用UL标签而非OL标签 = 默认的.文章纲要列表应采用UL标签而非OL标签
    }

    if ('conciseToc' in 采集到的) {
        补齐后的.为求文章纲要列表简洁明了故意仅显示两层条目以至于较深层级条目形同作废 = !!采集到的.为求文章纲要列表简洁明了故意仅显示两层条目以至于较深层级条目形同作废
    } else {
        补齐后的.为求文章纲要列表简洁明了故意仅显示两层条目以至于较深层级条目形同作废 = 默认的.为求文章纲要列表简洁明了故意仅显示两层条目以至于较深层级条目形同作废
    }

    if ('expandToc' in 采集到的) {
        补齐后的.浏览器打开HTML文章最初之时若浏览器窗口足够宽大则直接展开文章纲要列表之面板 = !!采集到的.浏览器打开HTML文章最初之时若浏览器窗口足够宽大则直接展开文章纲要列表之面板
    } else {
        补齐后的.浏览器打开HTML文章最初之时若浏览器窗口足够宽大则直接展开文章纲要列表之面板 = 默认的.浏览器打开HTML文章最初之时若浏览器窗口足够宽大则直接展开文章纲要列表之面板
    }

    if ('tocItemExpandedLevel' in 采集到的) {
        补齐后的.浏览器打开HTML文章最初之时文章纲要列表中凡层级深于该值之条目均应收叠 = parseInt(采集到的.浏览器打开HTML文章最初之时文章纲要列表中凡层级深于该值之条目均应收叠)
    } else {
        补齐后的.浏览器打开HTML文章最初之时文章纲要列表中凡层级深于该值之条目均应收叠 = 默认的.浏览器打开HTML文章最初之时文章纲要列表中凡层级深于该值之条目均应收叠
    }

    if ('htmlLanguage' in 采集到的) {
        补齐后的.产出之HTML文件之Html标签之语言属性之取值 = 采集到的.产出之HTML文件之Html标签之语言属性之取值
    } else {
        补齐后的.产出之HTML文件之Html标签之语言属性之取值 = 默认的.产出之HTML文件之Html标签之语言属性之取值
    }

    return 补齐后的
}

function 打印采集到的命令行参数集以及最终裁定的参数集(rawArguments, 采集到的所有非标准命令行参数集, 以默认值补齐缺漏后的完整参数集) {
    const 补齐后的 = 以默认值补齐缺漏后的完整参数集 // 在该函数具备不妨采用简短的名称

    const 依须尊照的顺序给出的各参数之名称列表 = [
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

    const 采集到的原始命令行参数之有序打印配置项集 = {}
    const 补齐后的参数集之有序打印配置项集 = {}

    依须尊照的顺序给出的各参数之名称列表.forEach(参数名 => {
        if (参数名 in rawArguments) {
            采集到的原始命令行参数之有序打印配置项集[参数名] = rawArguments[参数名]
        }
    })

    const unknownArgumentsCount = 采集到的所有非标准命令行参数集.length

    if (unknownArgumentsCount > 0) {
        const unknownArgumentsPrintingName = `args (${unknownArgumentsCount})`

        if (unknownArgumentsCount <= 100) {
            采集到的原始命令行参数之有序打印配置项集[unknownArgumentsPrintingName] = 采集到的所有非标准命令行参数集
        } else {
            采集到的原始命令行参数之有序打印配置项集[unknownArgumentsPrintingName] = 采集到的所有非标准命令行参数集.slice(0, 99)
            采集到的原始命令行参数之有序打印配置项集[unknownArgumentsPrintingName].push[`< and ${unknownArgumentsCount - 99} more >`]
        }
    }



    依须尊照的顺序给出的各参数之名称列表.forEach(key => {
        补齐后的参数集之有序打印配置项集[key] = 补齐后的[key]
    })

    const unknownArgumentsPrintingName = `unknownArguments (${unknownArgumentsCount})`
    if (unknownArgumentsCount <= 100) {
        补齐后的参数集之有序打印配置项集[unknownArgumentsPrintingName] = 补齐后的.unknownArguments
    } else {
        补齐后的参数集之有序打印配置项集[unknownArgumentsPrintingName] = 补齐后的.unknownArguments.slice(0, 99)
        补齐后的参数集之有序打印配置项集[unknownArgumentsPrintingName].push[`< and ${unknownArgumentsCount - 99} more >`]
    }

    console.log()
    console.log('由命令行给出的参数：')
    console.log(采集到的原始命令行参数之有序打印配置项集)
    console.log()
    console.log('最终裁定采用的完整配置：')
    console.log(补齐后的参数集之有序打印配置项集)
    console.log()
}

function combinArgumentsWithConfigFile(filledArguments, cwd) {
    const options = {
        shouldDebug:                                       filledArguments.debug,
        sourceGlobs:                                       filledArguments.用以搜寻待处理MarkDown文件之匹配规则列表,
        outputPath:                                        filledArguments.产出HTML的路径规则,
        configFileIsSpecifiedInCLI:                        filledArguments.configFileIsSpecifiedInCLI,
        shouldUseCSSOfDefaultDarkThemeAccordingToArgument: filledArguments.输出的HTML应采用幽暗配色,
        cssOfDefaultDarkThemeIsDemandedViaCLI:             filledArguments.darkThemeIsDemandedViaCLI,
        promptUserIfSourceFileCountExceedsThisNumber:      filledArguments.若MarkDown文件数量大于该值则提醒操作者,
    }

    const conversionOptions = {
        articleTOCListTagNameIsUL: filledArguments.文章纲要列表应采用UL标签而非OL标签,
    }

    const manipulationsOverHTML = {
        htmlTagLanguage: filledArguments.产出之HTML文件之Html标签之语言属性之取值,
    }

    const manipulationsOverHTML0 = {}

    if (options.shouldUseCSSOfDefaultDarkThemeAccordingToArgument) {
        manipulationsOverHTML0.internalCSSFileNameOfTheme        = 'wulechuan-styles-for-html-via-markdown.default-dark--no-toc.min.css'
        manipulationsOverHTML0.internalCSSFileNameOfThemeWithTOC = 'wulechuan-styles-for-html-via-markdown.default-dark--with-toc.min.css'
    }

    const behavioursOfBuiltInTOC = {
        shouldShowOnlyTwoLevelsOfTOCItemsAtMost:                filledArguments.为求文章纲要列表简洁明了故意仅显示两层条目以至于较深层级条目形同作废,
        atBeginingShouldCollapseAllTOCItemsOfLevelsGreaterThan: filledArguments.浏览器打开HTML文章最初之时文章纲要列表中凡层级深于该值之条目均应收叠,
        atBeginingShouldExpandTOCWhenWindowIsWideEnough:        filledArguments.浏览器打开HTML文章最初之时若浏览器窗口足够宽大则直接展开文章纲要列表之面板,
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
            console.log(彩色粉笔工具.red(`Error reading configuration JSON file "${
                彩色粉笔工具.yellow(configFilePath)
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

    options['专用于 @wulechuan/generate-html-via-markdown 的配置项集'] = optionsForConverter

    if (options.shouldDebug) {
        console.log('decided options:', options)
    }

    if (options.cssOfDefaultDarkThemeIsDemandedViaCLI) {
        const finallyCSS1IsNotOfCLIDemandedTheme = optionsForConverter.manipulationsOverHTML.internalCSSFileNameOfTheme        !== manipulationsOverHTML0.internalCSSFileNameOfTheme
        const finallyCSS2IsNotOfCLIDemandedTheme = optionsForConverter.manipulationsOverHTML.internalCSSFileNameOfThemeWithTOC !== manipulationsOverHTML0.internalCSSFileNameOfThemeWithTOC
        if (finallyCSS1IsNotOfCLIDemandedTheme || finallyCSS2IsNotOfCLIDemandedTheme) {
            console.log()
            console.log(彩色粉笔工具.yellow(`WARNING: According to the finalized configuration,\nthe "${
                彩色粉笔工具.green('-d')
            }" or "${
                彩色粉笔工具.green('-dark-theme')
            }" will ${彩色粉笔工具.red('NOT')} take effect!`))
            console.log()
        }
    }

    return options
}

function 搜集所有Markdown源文件(options) {
    const { shouldDebug } = options

    return new Promise((resolvePromise, rejectPromise) => {
        const { sourceGlobs } = options

        if (shouldDebug) {
            console.log('sourceGlobs:', sourceGlobs)
        }

        const 搜集到的所有Markdown文件之路径 = syncResolveGlobs(sourceGlobs)
            .filter(滤除某些不合格的源文件路径)
            .map(rawPath => rawPath.replace(/\\/g, '/')) // 将微软【视窗】系统的路径转换为【UNIX】路径

        if (shouldDebug) {
            console.log('搜集到的所有Markdown文件之路径:', 搜集到的所有Markdown文件之路径)
        }

        if (
            options.promptUserIfSourceFileCountExceedsThisNumber === 0 ||
            options.promptUserIfSourceFileCountExceedsThisNumber >= 搜集到的所有Markdown文件之路径.length
        ) {
            resolvePromise(搜集到的所有Markdown文件之路径)
        } else {
            console.log(彩色粉笔工具.red(`Way too many input files (${
                彩色粉笔工具.yellow(搜集到的所有Markdown文件之路径.length)
            } in total) were provided.\n`))

            promptUserWhenThereAreTooManySourceFiles().then(userInput => {
                命令行环境中人类输入之读取机.close()
                if (userInput.match(/^(y|yes)$/i)) {
                    resolvePromise(搜集到的所有Markdown文件之路径)
                } else {
                    console.log(彩色粉笔工具.yellow('All right! I WON\'T DO IT!'))
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
    命令行环境中人类输入之读取机.question(
        彩色粉笔工具.red(`Are you sure to process them all? [${彩色粉笔工具.yellow('y')}/${彩色粉笔工具.yellow('n')}] `),
        userInput => {
            if (userInput.match(/^(y|n|yes|no)$/i)) {
                resolve(userInput)
            } else {
                reject('User input invalid. Must match /^(y|n|yes|no)$/i')
            }
        }
    )
}

function 滤除某些不合格的源文件路径(sourceFilePath) {
    const sourceFileStat = getFileStatSync(sourceFilePath)
    const sourceFileSizeInBytes = sourceFileStat.size

    if (sourceFileSizeInBytes > 1e7) {
        console.log(彩色粉笔工具.yellow(`ERROR: Source file way too large (${
            彩色粉笔工具.magenta(sourceFileSizeInBytes)
        } ${
            彩色粉笔工具.green('Bytes')
        }`))
        console.log('    Involved file: "' + 彩色粉笔工具.yellow(sourceFilePath) + '"')
        console.log(彩色粉笔工具.bgRed.white(' SKIPPED '))
        return false
    }

    const sourceFilePathComponents = parsePath(sourceFilePath)
    const sourceFileExt = sourceFilePathComponents.ext.replace(/^\./, '')

    const sourceFileExtIsLegal = [
        'md',
        'markdown',
    ].includes(sourceFileExt.toLowerCase())

    if (!sourceFileExtIsLegal) {
        console.log(彩色粉笔工具.yellow(`WARNING: Invalid source file type: "${
            彩色粉笔工具.magenta(sourceFileExt)
        }"`))
        console.log('    Involved file: "' + 彩色粉笔工具.yellow(sourceFilePath) + '"')
        console.log(彩色粉笔工具.bgRed.white(' SKIPPED '))
        return
    }

    return true
}

function 处理单个源Markdown文件(
    源Markdown文件之路径,
    输出HTML文件之路径设计规则,
    各HTML输出文件之路径系相对于其源Markdown文件之路径者而非绝对路径,
    输出HTML文件路径之设计规则看起来像是描述了唯一一个HTML文件,
    有且仅有一个源Markdown文件,
    options
) {
    if (有且仅有一个源Markdown文件 && 输出HTML文件路径之设计规则看起来像是描述了唯一一个HTML文件) {
        将单个Markdown文件转换成单个HTML文件并写入磁盘(源Markdown文件之路径, 输出HTML文件之路径设计规则, 1, 1)
        return
    }



    const 源Markdown文件之路径之各组成成分 = parsePath(源Markdown文件之路径)
    let 输出HTML文件之文件名_不含扩展名
    if (输出HTML文件路径之设计规则看起来像是描述了唯一一个HTML文件) {
        const 输出HTML文件路径之各组成成分 = parsePath(输出HTML文件之路径设计规则)
        输出HTML文件之文件名_不含扩展名 = 输出HTML文件路径之各组成成分.name
    } else {
        输出HTML文件之文件名_不含扩展名 = 源Markdown文件之路径之各组成成分.name
    }


    let 输出HTML文件之文件夹之路径 = 输出HTML文件之路径设计规则

    if (各HTML输出文件之路径系相对于其源Markdown文件之路径者而非绝对路径) {
        输出HTML文件之文件夹之路径 = joinPathPOSIX(源Markdown文件之路径之各组成成分.dir, 输出HTML文件之路径设计规则)
    }

    if (输出HTML文件之文件夹之路径.match(/^\.[\\/]*$/)) {
        输出HTML文件之文件夹之路径 = '' // 相对路径，相对于当前运行进程的当前工作目录（即 pwd ）。
    }

    let 确保不覆盖已有文件前提下的输出HTML文件之路径
    let 已有重名HTML文件之计数 = 0

    do {
        const 为防止重名而须添加的HTML文件名后缀 = 已有重名HTML文件之计数 > 0 ? ` (${已有重名HTML文件之计数})` : ''
        确保不覆盖已有文件前提下的输出HTML文件之路径 = joinPathPOSIX(输出HTML文件之文件夹之路径, `${输出HTML文件之文件名_不含扩展名}${为防止重名而须添加的HTML文件名后缀}.html`)

        已有重名HTML文件之计数++
    } while (existsSync(确保不覆盖已有文件前提下的输出HTML文件之路径))

    将单个Markdown文件转换成单个HTML文件并写入磁盘(源Markdown文件之路径, 确保不覆盖已有文件前提下的输出HTML文件之路径, options)
}

function 将单个Markdown文件转换成单个HTML文件并写入磁盘(源Markdown文件之路径, 输出HTML文件之路径, options) {
    console.log()
    console.log('-'.repeat(51))
    console.log(`从 MarkDown 文件：\n    "${彩色粉笔工具.bgMagenta.black(源Markdown文件之路径)}"`)
    console.log(`到 HTML 文件：\n    "${彩色粉笔工具.bgGreen.black(输出HTML文件之路径)}"`)

    const 转换器专用的配置项集 = options['专用于 @wulechuan/generate-html-via-markdown 的配置项集']

    // if (options.shouldDebug) {
    //     console.log(转换器专用的配置项集)
    // }

    const Markdown文件内容全文 = readFileSync(源Markdown文件之路径).toString()
    const HTML内容全文 = 吴乐川GenerateHtmlViaMarkdown工具现成提供的一枚转换器(
        Markdown文件内容全文,
        转换器专用的配置项集
    )

    mkdirpSync(getDirNameOf(输出HTML文件之路径))

    writeFileSync(
        输出HTML文件之路径,
        HTML内容全文
    )
}
