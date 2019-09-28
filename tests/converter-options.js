/** Please refer to:
 * https://www.npmjs.com/package/@wulechuan/generate-html-via-markdown#arguments
 * */

module.exports = {
    shouldLogVerbosely: false,

    conversionPreparations: {
        shouldNotAutoInsertTOCPlaceholderIntoMarkdown: false,
    },

    conversionOptions: {
        shouldNotBuildHeadingPermanentLinks: false,
        headingPermanentLinkSymbolChar: '§',

        cssClassNameOfHeadingPermanentLinks: undefined,

        cssClassNameOfArticleTOCRootTag:     'markdown-article-toc',
        cssClassNameOfArticleTOCLists:       undefined, // <ul>s and <ol>s
        cssClassNameOfArticleTOCListItems:   undefined, // <li>s
        cssClassNameOfArticleTOCItemAnchors: undefined, // <a>s under <li>s
        articleTOCBuildingHeadingLevelStartsFrom: 2, // Pay attention that I take 2 as a default value.
        articleTOCListTagNameIsUL: false,
    },

    manipulationsOverHTML: {
        shouldNotInsertBackToTopAnchor: false,
        shouldNotUseInternalCSSThemingFiles: false,
        shouldUseUnminifiedVersionOfInternalCSS: false,
        shouldUseUnminifiedVersionOfInternalJavascriptIfAny: false,

        htmlTitleString: 'Hello world',

        cssClassNameOfMarkdownChiefContentWrappingArticleTag: 'markdown-article',
        cssClassNameOfBodyTagWhenMarkdownArticleHasTOC:       'markdown-article-toc-exists',
        cssClassNameOfBackToTopAnchor:                        'markdown-article-back-to-top',

        desiredReplacementsInHTML: [
            {
                from: /\s+href="([!#])/gi,
                to: ' target="_blank" href="$1',
            },
        ],
    },
}
