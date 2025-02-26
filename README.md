# 基于node.js的局域网图片分享服务

## 功能介绍

- 实现局域网内图片分享
- 查看图片 保存图片
- 主机日志打印 包括 时间 ip 请求方式 文件
- 对于短时间多次请求的ip进行拦截
- 移动端适配
- 点击图片进行下载(随机)
- 分发一个api用于获取签文



## **各个文件功能**

1. images 图片文件夹

2. node_modules node模块存放

3. src 静态网页存放

4. data 储存数据

5. access.log 日志

6. package.json 服务器信息

7. package-lock.json node下载依赖清单

8. server.js服务器核心

## 使用

- 确保您的电脑安装了node.js 经试验此服务可以在v14.18.2.版本下运行
- 确保你的电脑配置好了node.js的环境
- 打开server.js文件 并在我的ip中写入本机ip
- 在server目录中打开终端运行```node server.js```
- 或者点击包内"*一键启动*"脚本
- 默认在本地5001端口启动可在```server.js```内修改
- 启动之后局域网内可凭本机ip+5001端口在浏览器中访问到服务器
- images内除涩涩.jpg文件其余都可删除
- 具体信息可查看控制台

## api部分

格式

{
{
    "请求状态": "请求状态",
    "status": {
        "code": 200,
        "message": "状态"
    },
    "returnRequest": {
        "fortune": {
        求签内容
        },
        "currentTime":time,
        "clientIp":ip
    }
}
}

## 查看网站效果

抱歉 目前网站已经停止维护 幸而部署并不困难 如果有兴趣可以自行部署查看



## 最后



假如你喜欢这个创意请帮忙点个star 谢谢喵！

​																								 -云散·飞花
