/** Please refer to:
 * https://www.npmjs.com/package/@wulechuan/generate-html-via-markdown#arguments
 */

module.exports = {
    conversionOptions: {
        articleTOCListTagNameIsUL: true,
    },

    manipulationsOverHTML: {
        desiredReplacementsInHTML: [
            {
                from: /\s+href="(https?:\/\/)/g,
                to: ' target="_blank" href="$1',
            },
            {
                from: /\s+href="([^"]+)\.(md|MD|Md|mD)"/g,
                to: ' href="$1.html"',
            },
        ],
    },
}
