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

#### 变更

**本工具现已支持将深色主题应用于输出之 HTML 文件中。对应的命令行参数为 “`-d`” 或 “`--dark-theme`”。**



## 安装方法

```bash
npm    i    -g    @wulechuan/markdown-to-html-via-cli
```


## 用法


### 命令行参数说明


```bash
Usage: wlc-md-to-html [options]

Options:
  -v, --version
        Print the version of this program, that is "v2.0.6".

  -i, --from  [globs]
        Any glob that:
          - matches `.md` or `.MD` files;
          - matches folders containing `.md` or `.MD` files;
          - is a comma-separated values of above.
        Note that multiple presents of this argument are also allowed.
        (default: [ './*.md', './*.MD' ])

  -o, --to  [path]
        Path of folder for output `.html` files. A single asterisk(*)
        is allowed at the beginning of the path, meaning the rest
        part of this path string will treat as a sub path to each
        and very source path. This is the ONLY special sign allowed
        in this path string. No question marks("?") are allowed.
        No asterisks are allowed in any other places of this string.
        Note that you MUST quote the path string if it starts with
        an asterisk sign. Otherwise the operating system might first
        expand it as a glob, then pass resolved items to this program.
        (default: './')

  -C, --config-file  [path]
        Specify a `.js` file for fully controlling the converter
        utilized by this program internally.
        (default: './wlc-md-to-html.config.js')

  -n, --input-file-count-to-warn  [path]
        Specify a number as a so-called "safe" limitation of the
        the count of resovled source files. If too many source
        files are found. The the program pauses and prompt user
        to decide whether it should go on or quit. Setting this to
        zero means never prompt user and always process all discovered
        source files, no matter how many there are.
        (default: 51)

  -d, --dark-theme
        When presents, the default dark-colored theme is applied to all
        HTML files, instead of the light-colored theme. But the effect
        of this argument will be overrided by the settings in the configuration
        file loaded by the "-C" or "--config-file" arguments.

  -U, --toc-ul
        When presents, the lists in TOC are <ul>s instead of <ol>s.

  -2, --concise-toc
        When presents, the max level of the TOC items in an HTML is
        limited to 2. This makes the TOC more concise and clean.
        Be aware that this way all deeper levels of TOC items are
        NEVER visible. They are hidden via CSS rules.

  -e, --expand-toc
        If the browser window is wide enough, expand the TOC panel when
        an HTML just loads. Note that either way, the TOC panel can
        ALWAYS toggle manually. Also Note that to expand the TOC panel
        is NOT the same thing as to expand an item of the TOC panel.

  -E, --toc-item-expanded-level  [level]
        If the browser window is wide enough, TOC items are collapsable
        and expandable, if it contains a nested TOC list. This option
        decides how many levels of TOC items are expanded by default.
        Note the all expandable items can ALWASY toggle manually.
        (default: 1)

  -l, --html-language  [language]
        Specified the value of the "lang" attribute of the <html>
        tag inside a generated HTML file.
        (default: 'zh-hans-CN')

  -D, --debug
        To enable debugging mode.

  -h, --help
        Display this help.

```


### 用于复杂选项的配置文件

@wulechuan/generate-html-via-markdown （下称“格式转换器”）的配置项很复杂，为其所有选项设计对应的命令行参数项时不切实际的。我们可以使用一个 .js 配置文件来配置格式转换器的复杂行为。

要在命令行中指代欲采用的配置文件，须使用命令行参数项 `-C` 或 `--config-file`。二者互为别名，仅可取其一。

配置文件的内容细则见 [@wulechuan/generate-html-via-markdown#arguments](https://www.npmjs.com/package/@wulechuan/generate-html-via-markdown#arguments)。



### 示例集

-   在命令行环境中打印完整的帮助信息：

    ```bash
    wlc-md-to-html    --help
    ```

-   默认情况下，本工具会扫描当前文件夹内的所有 `.md` 文件，但不会递归扫描子文件夹中的内容（想想看，`node_modules` 文件夹中可能存在非常多的 `.md` 文件）。同时，输出的 HTML 文件也会位于同一文件夹中。

    ```bash
    wlc-md-to-html
    ```

-   下面的命令将所有 HTML 文件统统输出至同一个文件夹中。还注意到，下面故意并列使用了多次 `-i` 参数。

    ```bash
    wlc-md-to-html    -i "./**/*.md" -i "./**/*.MD" -i README.MD -i README.md   -o "/home/wulechuan/articles/html/"
    ```

-   下面的命令会针对当前文件夹内所有的 `.md` 或 `*.MD` 文件生成对应的 HTML 文件，并将所有生成的 HTML 文件至于 `"C:\articles\"` 文件夹内。

    ```bat
    wlc-md-to-html    -o C:\articles\
    ```

-   下面的命令将在每个源 `.md` 文件所在的文件夹内，创建一个名为 “html” 的子文件夹，并将该 `.md` 文件对应的 HTML 文件生成在该 “html” 子文件夹中。注意输出路径的起始有一个星号（`*`），并且输出路径必须被引号（`"`）括起来。

    ```bash
    wlc-md-to-html    -i markdowns/*.md   -o "*/html/"
    ```

-   要在每个 Markdown 源文件的“原处”生成对应的 HTML 文件，可以这样做。注意到输出路径是一个星号（`*`），且它被引号（`"`）括了起来。

    ```bash
    cd    ./tests/fake-project
    wlc-md-to-html    -i README.MD,docs/**/*.md,docs/**/*.MD    -o "*"
    ```

-   下面的命令将所有输出的 HTML 文件的语言标记为 "en-US"。

    ```bash
    wlc-md-to-html    -l "en-US"
    ```

-   下面的命令将采用一个配置文件来控制文件格式转换的细则。

    ```bash
    wlc-md-to-html    -C "/home/wulechuan/articles/my-markdown-to-my-html.config.js"
    ```






## 未来计划

暂无。


## 许可证类型

WTFPL

> 注意：
>
> 我未研究过许可证的约束。因此姑且声明为 WTFPL 类型。但实际上该许可证类型可能与我采用的开源模块有冲突。

