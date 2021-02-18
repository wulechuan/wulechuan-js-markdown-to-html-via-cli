/**
 * Please refer to:
 * https://github.com/wulechuan/wulechuan-js-generate-html-via-markdown#%E5%85%A5%E5%8F%A3%E5%8F%82%E6%95%B0
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
