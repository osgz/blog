---
eleventyExcludeFromCollections: true
layout: 'layouts/base.njk'
title: 首页
pagination:
    data: collections.all
    size: 5
    alias: blog_set
    reverse: true
---  

<div class="recent-posts section">
  <h2 class="section-header">随笔<i class="ri-quill-pen-line"></i></h2>
    <div class="posts">
    {%- for blog in blog_set -%}
    <div class="post">
    <div class="time">{{ blog.data.data }}</div>
    <a href="{{ blog.url }}">{{ blog.data.title }}</a></div>
    {%- endfor -%}

<ul class="pagination">
    <li class="page-item page-previous">{% if pagination.href.previous %}<a href="{{ pagination.href.previous }}"><span aria-hidden="true">上一页</span></a>{% endif %}</li>     
    <li class="page-item page-next">{% if pagination.href.next %}<a href="{{ pagination.href.next }}"><span aria-hidden="true">下一页</span></a>{% endif %}</li>
</ul>

 