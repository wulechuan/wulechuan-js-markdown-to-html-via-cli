/** Please refer to:
 * https://www.npmjs.com/package/@wulechuan/generate-html-via-markdown#arguments
 */

module.exports = {
    conversionOptions: {
        headingPermanentLinkSymbolChar: '#',
        articleTOCBuildingHeadingLevelStartsFrom: 2,
        articleTOCListTagNameIsUL: true,
    },

    manipulationsOverHTML: {
        shouldNotInsertBackToTopAnchor: true,

        htmlTitleString: 'Hello world',

        desiredReplacementsInHTML: [
            {
                from: /\s+href="([^#])/gi,
                to: ' target="_blank" href="$1',
            },
        ],
    },
}
