#!/bin/bash

. ./bash-tools/wulechuan-git-push-to-single-origin.sh

echo
echo -e "\e[32m开始\e[0m"
# echo

wulechuan-git-push-to-single-origin  --should-skip=false \
    --git-origin-name='gitee-吴乐川' \
    --git-origin-display-name='码云：吴乐川' \
    --git-origin-display-name-color='red'

wulechuan-git-push-to-single-origin  --should-skip=false \
    --git-origin-name='aliyun-吴乐川' \
    --git-origin-display-name='阿里云：吴乐川' \
    --git-origin-display-name-color='green'

wulechuan-git-push-to-single-origin  --should-skip=false \
    --git-origin-name='github-吴乐川' \
    --git-origin-display-name='GitHub：吴乐川' \
    --git-origin-display-name-color='yellow'

echo
echo -e "\e[42;30m Git 推送至所有源：结束 \e[0;0m"
echo
