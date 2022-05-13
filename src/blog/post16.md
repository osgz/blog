---
layout: 'layouts/base.njk'
tags: blog
title: 用Notion和Vercel部署你的个人博客
data: "2022-3-12"
---

# {{title}}

部署静态博客的平台层出不穷，对于一个正常人来讲，部署一个博客也早已不再是一件难事，一台虚拟主机/云服务器+域名+程序=博客。但是本文将通过 Nobelium 和 Vercel，搭建一个博客和绑定个人域名的操作过程。

虽然我再用 Eleventy 作为博客的静态网页生成工具，但我觉得 Nobelium 这个平台也是一个不错的选择，这个适合那些仅仅是需一个很简单的书写博客的平台的博主。

![部署成功后的效果](https://s6.jpg.cm/2022/03/12/L2QM06.png)

如果你能够跟着操作，那么你能够拥有一个外观不错的个人博客，并且你可以在 Notion 上撰写你的博客文章，内容会自动同步到你所搭建的个人博客中。如果你在使用 Notion 记录一些学习笔记/生活记录又或者是其他文章，通过 Nobelium 是一个不错的分享内容的方式。

那我们就开始部署自己的静态博客，首先我们打开 Nobelium 提供的 Notion 模板，复制这个模板到自己的 Notion Workspace 中。

>https://craigary.notion.site/adc3552cfc73442ab5048d4b1eb0079a?v=0f8f88a429014f4996da46ee001266d5

![复制Notion模板](https://s6.jpg.cm/2022/03/12/L2d7NL.png)

我们再把刚刚复制完的Notion模板开放访问（让别人都能访问到）

![开放访问](https://s6.jpg.cm/2022/03/12/L2dQ0f.png)

我们来到我们搭建静态的最熟悉不过的平台 Github 我们要 fork Nobelium 项目到自己 Github 仓库里

>https://github.com/craigary/nobelium

![fork Nobelium](https://s6.jpg.cm/2022/03/12/L2dlUO.png)

拷贝后就能在你的仓库看到这个项目，这就表示这个项目现在在你的仓库中了。

打开 vercel ，然后点击 Sign up 选中 [Continue with GitHub]。

![Continue with GitHub](https://s6.jpg.cm/2022/03/12/L2dEy4.png)

授权使用 Github 登陆到 Vercel，接着会弹出 [Import Git Repository]（如果没有，那么点击右上角的 [New]），选择 Nobelium 这个项目，点击 [Import]，选择个人账号，开始部署操作：

![选择 Nobelium 项目](https://s6.jpg.cm/2022/03/12/L2dk7X.png)

展开 [Environment Variables]，即环境变量，填写 NOTION_PAGE_ID，以及对应的值：

![填写环境变量](https://s6.jpg.cm/2022/03/12/L2dK3L.png)

要是不知道自己的 Notion page id，可以直接看下图

![查看自己的Notion page id](https://s6.jpg.cm/2022/03/12/L2en8z.png)

最后一步，就是点击 [Deploy]，开始部署，右侧会显示漫长的部署过程

![部署过程](https://s6.jpg.cm/2022/03/12/L2eUAQ.png)

部署完成后，点击DOMAINS下方的地址就可以看到博客网站啦！

![部署完成的样子](https://s6.jpg.cm/2022/03/12/L2ebmh.png)

要是我们上面的步骤都完成了，我们就可以在 Vercel 中打开Nobelium项目，然后选中[Domains]，添加自己的域名即可。添加后，需要去域名服务商中，设置一下解析，CNAME/IP 解析即可。

![解析域名](https://s6.jpg.cm/2022/03/12/L2euTS.png)

对了，差一点忘记讲的就是修改我们博客的配置文件了，我们仅需要打开 Github 选择 Nobelium项目 在文件列表上找到 [blog.config.js] 这个文件，打开编辑它就可以了

这里可以修改一些博客的基本信息：

```
title 填写你博客的名称
author 填写作者名称
email 你的邮箱地址（如果你觉得有必要的话）
link 你的博客地址
description 博客的描述
以及外观相关的appearance、font、lightBackground、darkBackground 配置可以进行修改。开发者的文档注释非常详细，可以直接参考文件内的注释进行修改。
```

到这里我们用Notion和Vercel部署教程就完成了。
