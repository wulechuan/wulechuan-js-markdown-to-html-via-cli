# [未完工] 吴乐川的将 MarkDown 文件转换为 HTML 文件的命令行工具

本工具尚未完工。

## Multilingual Editions of this Article

- [English version of this ReadMe](./ReadMe.md)




## NPM 页

<dl>
<dt>NPM 包名</dt>
<dd>

[@wulechuan/markdown-to-html-via-cli](https://www.npmjs.com/package/@wulechuan/markdown-to-html-via-cli)

</dd>
<dt>作者</dt>
<dd><p>南昌吴乐川</p></dd>
</dl>





## 简介

本工具借助 [markdownIt](https://www.npmjs.com/package/markdown-it) 生态的工具集，可将一组 MarkDown 文件转化成对应的 HTML 文件。本工具还在输出的完整 HTML 内容中，内嵌了精美的 CSS 样式集和 Javascript 代码。**故，当你借助本工具来制作你的文章的可分发版本时，单一的完整 HTML 文档即可独立运转。**

> 其中的 Javascript 代码用于控制【文章纲要列表】之行为。

> 尽管样式和脚本均已完整包含其中，但图片文件仍为改 HTML 文档的外部资源，须正确对应引用路径。

**简而言之，给出一组 MarkDown 文件的路径，得到一组 HTML 文件。**

不须带任何参数，即可轻松获得一份华丽的 HTML 文档。其自带精美主题，宽窄屏全自适应排版。包含文章纲要列表，“返回顶部”按钮（实则链接）等等。


### 内嵌样式

内嵌样式来源于本人创建和维护的另一项目，即《[@wulechuan/css-stylus-markdown-themes](https://www.npmjs.com/package/@wulechuan/css-stylus-markdown-themes)》。其文档中亦有若干截图，直观展示一篇文档在应用默认样式后之样貌。见 [该文档](https://github.com/wulechuan/wulechuan-themes-for-htmls-via-markdowns/blob/master/docs/refs/zh-hans-CN/application-examples.md)。



## 用法

### 示例

-   ```bash
    wlc-md-to-html
    ```

-   ```bash
    wlc-md-to-html   -i md/*.md  -o "*/html/"
    ```

-   ```bat
    wlc-md-to-html   -o   C:\articles\
    ```



## 未来计划

暂无。


## 许可证类型

WTFPL

> 注意：
>
> 我未研究过许可证的约束。因此姑且声明为 WTFPL 类型。但实际上该许可证类型可能与我采用的开源模块有冲突。

