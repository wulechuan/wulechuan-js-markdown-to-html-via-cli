const path = require('path')
const chalk = require('chalk')

const {
    existsSync,
    readFileSync,
    writeFileSync,
} = require('fs-extra')

const readMeFileNames = [
    'ReadMe.md',
    'ReadMe.zh-hans-CN.md',
]

const joinPath = path.join
// const joinPathPOSIX = path.posix.join

const currentVersionOfThisPackage = require('../package.json').version
const thisPackageRootFolderPath = path.dirname(require.resolve('../package.json'))
// console.log('thisPackageRootFolderPath:', thisPackageRootFolderPath)

const regExpForMatchingVersionSentence = /(Print the version of this program, that is "v?)([^"]+)(")/

readMeFileNames
    .map(fileName => {
        const filePath = joinPath(thisPackageRootFolderPath, fileName)
        if (!existsSync(filePath)) {
            throw new Error(chalk.red(`\nReadMe file not found:\n    "${
                chalk.yellow(filePath)
            }"`))
        }

        return filePath
    })
    .forEach(filePath => {
        let fileContentString = readFileSync(filePath).toString()
        const matchingResult = fileContentString.match(regExpForMatchingVersionSentence)
        if (!matchingResult) {
            console.log(new Error(chalk.red(`\nVersion sentence not found in file "${
                chalk.yellow(filePath)
            }"`)))
            return
        }

        const [ , , mentionedVersion ] = matchingResult
        console.log(`\nFile "${chalk.green(filePath)}":\n    mentioned veriosn: ${chalk.cyan(mentionedVersion)}`)

        if (mentionedVersion === currentVersionOfThisPackage) {
            console.log('    No need to update the version string.')
        } else {
            fileContentString = fileContentString.replace(
                regExpForMatchingVersionSentence,
                `$1${currentVersionOfThisPackage}$3`
            )

            writeFileSync(filePath, fileContentString)

            console.log(`    ${
                chalk.rgb(255, 255, 255)('Updated to')
            } ${
                chalk.green(currentVersionOfThisPackage)
            }`)
        }
    })
