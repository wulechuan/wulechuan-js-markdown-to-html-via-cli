# 吴乐川的将 MarkDown 文件转换为 HTML 文件的命令行工具


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




## 安装方法

```bash
npm    i    -g    @wulechuan/markdown-to-html-via-cli
```


## 用法


### 命令行参数说明


```bash
Usage: wlc-md-to-html [options]

Options:
  -v, --version                           Print the version of this program.

  -i, --from  [globs]                     Globs of any of:
                                            - one that matches `.md` files;
                                            - one that matches folders containing `.md` files;
                                            - a comma-separated values of above.
                                          Note that multiple presents of this argument is also allowed.
                                          (default: "./*.md")

  -o, --to  [path]                        Path of folder for output .html files. A single asterisk(*)
                                          is allowed at the beginning of the path, meaning the rest
                                          part of this path string will treat as a sub path to each
                                          and very source path. This is the ONLY special sign allowed
                                          in this path string. No question marks("?") are allowed.
                                          No asterisks are allowed in any other places of this string.
                                          (default: "./")

  -C, --config-json  [path]               Specify a `.js` file to configure the conversions.
                                          (default: "./wlc-mk-to-html.config.js")

  -2, --concise-toc                       When presents, the max level of the TOC items in an HTML is
                                          limited to 2. This makes the TOC more concise and clean.
                                          Be aware that this way all deeper levels of TOC items are
                                          NEVER visible. They are hidden via CSS rules.

  -e, --expand-toc                        If the browser window is wide enough, expand the TOC panel when
                                          an HTML just loads. Note that either way, the TOC panel can
                                          ALWAYS toggle manually. Also Note that to expand the TOC panel
                                          is NOT the same thing as to expand an item of the TOC panel.

  -E, --toc-item-expanded-level  [level]  If the browser window is wide enough, TOC items are collapsable
                                          and expandable, if it contains a nested TOC list. This option
                                          decides how many levels of TOC items are expanded by default.
                                          Note the all expandable items can ALWASY toggle manually.
                                          (default: "1")

  -l, --html-language  [language]         Specified the value of the "lang" attribute of the <html>
                                          tag inside a generated HTML file.
                                          (default: "zh-hans-CN")

  -D, --debug                             To enable debugging mode.

  -h, --help                              output usage information

```




### 示例集

-   在命令行环境中打印一些简略的帮助信息：

    ```bash
    wlc-md-to-html    --help
    ```

-   默认情况下，本工具会扫描当前文件夹内的所有 `.md` 文件，但不会递归扫描子文件夹中的内容（想想看，`node_modules` 文件夹中可能存在非常多的 `.md` 文件）。同时，输出的 HTML 文件也会位于同一文件夹中。

    ```bash
    wlc-md-to-html
    ```

-   要在每个源 markdown 文件所在的文件夹内，创建一个名为 “html” 的子文件夹，并将该 markdown 文件对应的 HTML 文件生成在该子文件夹中，可以这样做。注意输出路径的起始有一个星号（`*`）。

    ```bash
    wlc-md-to-html    -i markdowns/*.md    -o "*/html/"
    ```

-   将所有 HTML 文件统统输出至同一个文件夹中：

    ```bash
    wlc-md-to-html    -i ./**/*.md    -o ~/articles/html/
    ```

-   默认情况下，本工具会扫描当前文件夹内的所有 `.md` 文件，但不会递归扫描子文件夹中的内容。

    ```bat
    wlc-md-to-html    -o C:\articles\
    ```



## 未来计划

暂无。


## 许可证类型

WTFPL

> 注意：
>
> 我未研究过许可证的约束。因此姑且声明为 WTFPL 类型。但实际上该许可证类型可能与我采用的开源模块有冲突。

