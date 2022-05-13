#!/bin/sh

# -------------------------------------------------------
#           特定版本之【产品依赖包】
# -------------------------------------------------------

echo

echo  -e  "\e[0;31m===== npm i    \e[97;41m特定版本\e[0;31m之【产品依赖包】 ============================\e[0;0m"

echo

# chalk 不能更新至第 5 或更晚的版本。因为自第 5 版始， chalk 仅支持 ES Module 语法。
# globby 不能更新至第 12 或更晚的版本。因为自第 12 版始， globby 仅支持 ES Module 语法。

npm  i \
    'chalk@4' \
    'globby@11'





# -------------------------------------------------------
#          最末版本之【产品依赖包】
# - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# 顺便提醒，虽然一般而言 latest 版本应恰为最高版本，但并不确保。
# -------------------------------------------------------

echo
echo
echo
echo
echo

echo  -e  "\e[0;31m===== npm i    最末版本之【产品依赖包】 ============================\e[0;0m"

echo

npm  i \
    '@wulechuan/css-stylus-markdown-themes@latest' \
    '@wulechuan/generate-html-via-markdown@latest' \
    'commander@latest' \
    'fs-extra@latest' \
    'rimraf@latest'





# -------------------------------------------------------
#           特定版本之【研发依赖包】
# -------------------------------------------------------

echo
echo
echo
echo
echo

echo  -e  "\e[32m===== npm i    \e[90;102m特定版本\e[0;32m之【研发依赖包】 ============================\e[0;0m"

echo

echo '暂无。'





# -------------------------------------------------------
#          最末版本之【研发依赖包】
# - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# 顺便提醒，虽然一般而言 latest 版本应恰为最高版本，但并不确保。
# -------------------------------------------------------

echo
echo
echo
echo
echo

echo  -e  "\e[32m===== npm i    最末版本之【研发依赖包】 ============================\e[0;0m"

echo

npm  i  -D \
    '@wulechuan/cli-scripts--git-push@latest' \
    'eslint@latest'





# -------------------------------------------------------
#           更新与研发相关的数据库
# - - - - - - - - - - - - - - - - - - - - - - - - - - - -
#     例如： Browserslist:caniuse-lite
# -------------------------------------------------------

echo
echo
echo
echo
echo

echo  -e  "\e[33m===== 更新与研发相关的数据库 =======================================\e[0;0m"

echo
echo

echo  '暂无。'
# npx  browserslist@latest  --update-db





# -------------------------------------------------------
#           其他交代
# -------------------------------------------------------

echo
echo
echo
echo
echo

echo  -e  '\e[94m===== 其他交代 =====================================================\e[0;0m'

echo

echo  '暂无。'





# -------------------------------------------------------
#           结束
# -------------------------------------------------------

echo
echo
echo
echo
echo
