const path = require('path')
const chalk = require('chalk')

const {
    existsSync,
    readFileSync,
    writeFileSync,
} = require('fs-extra')

const readMeFileNames = [
    'ReadMe.md',
    './文档/说明书/en-US/ReadMe.md',
]

const nameOfFileThatContainsCLISplashScreen = '源代码/index.js'

const regExpForMatchingSplashScreenDate = /(\.\s{20})(\d{4}-\d{2}-\d{2})/
const regExpForMatchingVersionSentence = /(Print the version of this program, that is "v?)([^"]+)(")/











const joinPath = path.join
// const joinPathPOSIX = path.posix.join

const currentVersionOfThisPackage = require('../../package.json').version
const thisPackageRootFolderPath = path.dirname(require.resolve('../../package.json'))
// console.log('thisPackageRootFolderPath:', thisPackageRootFolderPath)


updateDateInSplashScreen(
    nameOfFileThatContainsCLISplashScreen,
    regExpForMatchingSplashScreenDate
)

updateVersionsInReadMeFiles(
    readMeFileNames,
    currentVersionOfThisPackage,
    regExpForMatchingVersionSentence
)













function updateDateInSplashScreen(fileName, regExpForMatchingSplashScreenDate) {
    const filePath = joinPath(thisPackageRootFolderPath, fileName)
    if (!existsSync(filePath)) {
        throw new Error(chalk.red(`\nJavascript file not found:\n    "${
            chalk.yellow(filePath)
        }"`))
    }

    let fileContentString = readFileSync(filePath).toString()
    const matchingResult = fileContentString.match(regExpForMatchingSplashScreenDate)
    if (!matchingResult) {
        console.log(new Error(chalk.red(`\nSplash screen not found in file "${
            chalk.yellow(filePath)
        }"`)))
        return
    }

    const [ , , mentionedDateString ] = matchingResult
    console.log(`\nFile "${chalk.green(filePath)}":\n    mentioned date: ${chalk.cyan(mentionedDateString)}`)

    const today = new Date()

    const monthValue = today.getMonth() + 1
    const dateValue  = today.getDate()

    const monthString = monthValue > 9 ? `${monthValue}` : `0${monthValue}`
    const dateString  = dateValue  > 9 ? `${dateValue}`  : `0${dateValue}`
    const todayString = `${today.getFullYear()}-${monthString}-${dateString}`

    if (mentionedDateString === todayString) {
        console.log('    No need to update the date in the splash screen.')
    } else {
        fileContentString = fileContentString.replace(
            regExpForMatchingSplashScreenDate,
            `$1${todayString}`
        )

        writeFileSync(filePath, fileContentString)

        console.log(`    ${
            chalk.rgb(255, 255, 255)('Updated to')
        } ${
            chalk.green(todayString)
        }`)
    }
}


function updateVersionsInReadMeFiles(readMeFileNames, currentVersionOfThisPackage, regExpForMatchingVersionSentence) {
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
            console.log(`\nFile "${chalk.green(filePath)}":\n    mentioned version: ${chalk.cyan(mentionedVersion)}`)

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
}
