# Wulechuan's CLI Tool for Converting Markdown Files into HTML Files


## Multilingual Editions of this Article

- [简体中文版文档](./ReadMe.zh-hans-CN.md)




## NPM Page

<dl>
<dt>Package Name</dt>
<dd>

[@wulechuan/markdown-to-html-via-cli](https://www.npmjs.com/package/@wulechuan/markdown-to-html-via-cli)

</dd>
<dt>Author</dt>
<dd><p>wulechuan (南昌吴乐川)</p></dd>
</dl>




## Introduction

Yet another tool for converting MarkDown files into corresponding HTML files, but with gorgeous themes applied to the output HTML by default. The HTML includes both CSS rules and Javascript codes. **Thus, when deliver your article with the help of this tool, a single HTML file would be enough.**

> The Javascript codes are for the behviours of the table of contents(TOC) part.

> Note that although all CSS and Javascript contents are embeded, images are still external resources to the HTML.

This tool utilizes the ecosystem of the famous tool, "[markdownIt](https://www.npmjs.com/package/markdown-it)".

**You provide a set of markdown file paths, you get another set of HTML files.**

No need to provide literally anything, you get a full featured HTML. Including gorgeous themes, and responsive layout fitting all sizes of screens, and TOC with smart behaviours, and the pretty "back-to-top" button(an anchor in fact).


### Built-in Themes

The CSS file for the built-in theming is from another NPM package of mine, named "[@wulechuan/css-stylus-markdown-themes](https://www.npmjs.com/package/@wulechuan/css-stylus-markdown-themes)". See some pictures of an example article with the default theme applied [there](https://github.com/wulechuan/wulechuan-themes-for-htmls-via-markdowns/blob/master/docs/refs/en-US/application-examples.md).


## Installation

```bash
npm    i    -g    @wulechuan/markdown-to-html-via-cli
```


## Usage

### CLI Arguments

Coming soon.


### Examples

-   ```bash
    wlc-md-to-html    --help
    ```

-   ```bash
    wlc-md-to-html
    ```

-   ```bash
    wlc-md-to-html    -i markdowns/*.md    -o "*/html/"
    ```

-   ```bash
    wlc-md-to-html    -i ./**/*.md    -o ~/articles/html/
    ```

-   ```bat
    wlc-md-to-html    -o C:\articles\
    ```


## TODOS

Nothing at present.



## License

WTFPL

> NOTE:
>
> I'm not an expert about license types. So I temporarily use WTFPL. But I guess this type of license might conflict with the ones used by those npm packages I'm utilizing.

