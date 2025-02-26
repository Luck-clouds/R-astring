@echo off  

chcp 65001

title 服务器

cd %~dp0

node server.js

pause