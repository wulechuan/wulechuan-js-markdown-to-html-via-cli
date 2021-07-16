/**
 * 参阅：
 * https://gitee.com/nanchang-wulechuan/wulechuan-js-generate-html-via-markdown#%E5%85%A5%E5%8F%A3%E5%8F%82%E6%95%B0
 */

module.exports = {
    须在控制台打印详尽细节: false,

    将Markdown转换为HTML之阶段: {
        各章节标题超链接之符号字符串: '#',
        文章纲要列表应采用UL标签而非OL标签: true,
        构建文章纲要列表时自该级别之标题始: 2,
    },

    对HTML做进一步处理之阶段: {
        不应注入用于返回文章起始之按钮: true,

        /**
         * 下方参数默认取空字符串。
         *
         * 取空字符串即意味着自动从文字中第一个 <h1> 标签中提前内容文字，
         * 作为 HTML 文档的标题（ <title> ）。
         */
        产出之HTML文件之Title标签之内容字符串: '此生无悔入华夏，来世还做中国人',
    },
}
