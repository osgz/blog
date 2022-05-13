---
layout: 'layouts/base.njk'
tags: blog
title: Centos 7搭建Zabbix
data: "2021-9-11"
---

# {{ title }}

### 为什么使用Zabbix

当某些指标不符合我们的需求时，我们能够在第一时间发现异常，所以监控工具需要定期的对被监控主机进行检查、信息收集等操作，当被监控主机出现异常时，能够及时报警、通知管理员，并需要记录这些异常，以便我们分析这些数据，查漏补缺，那么，一个监控工具就应该具备采集信息、存储信息、展示信息、报警通知等功能。

![](https://s3.jpg.cm/2021/09/10/ISjUhy.png)

### 当监控规模变大如何处理

当监控规模变得非常庞大时，我们可能有成千上万台设备需要监控，这时我们需要部署多套zabbix系统进行监控嘛？如果部署多套zabbix监控系统，那么监控压力将会被分摊，但是，这些监控的对象将会被尽量平均的分配到不同的监控系统中，我们无法通过统一的监控入口，去监控这些对象了，虽然分摊了监控压力，但是也增加了监控工作的复杂度。
而zabbix支持分布式监控，我们可以把成千上万的被监控对象分成不同的区域，每个区域中设置一台代理主机，区域内的每个被监控对象的信息被agent采集，提交给代理主机，在这个区域内，代理主机的作用就好比zabbix server，我们称这些代理主机为zabbix proxy,zabbix proxy再将收集到的信息同意提交给真正的zabbix server处理，这样zabbix proxy分摊了zabbix server的压力，同时，我们还能够通过统一的监控入口，监控所有的对象，当监控规模庞大到需要使用zabbix proxy时，结合下图理解一下。

![](https://s3.jpg.cm/2021/09/10/ISjunr.png)

- zabbix agent：部署在被监控主机上，负责被监控主机的数据，并将数据发送给zabbix server。
- zabbix server:负责接收agent发送的报告信息，并且负责组织配置信息、统计信息、操作数据等。
- zabbix database：用于存储所有zabbix的配置信息、监控数据的数据库。
- zabbix web：zabbix的web界面，管理员通过web界面管理zabbix配置以及查看zabbix相关监控信息，可以单独部署在独立的服务器上。
- zabbix proxy：可选组件，用于分布式监控环境中，zabbix proxy代表server端，完成局部区域内的信息收集，最终统一发往server端。

### 部署Zabbix Server端

第一步我们先打开zabbix的官网

> <a href="https://www.zabbix.com/cn/">https://www.zabbix.com/cn/</a>

点击zabbix下载的

![选择zabbix版本](https://s3.jpg.cm/2021/09/10/IShMJ6.png)

我选的这个配置是

| 类型  | 版本 | 备注 |
| :------------: | :------------: | :------------: |
| zabbix      | 5.0   | 个人感觉比较稳定吧 |
| centos      | 7   | 我本地服务器就是这个系统版本 |
| mariadb      | 已安装     | 这个也是我本地服务器已经安装了 |
| apache      | 常用    | 这个也是我本地服务器已经安装了 |

## 现在正式开始教程

```
[root@localhost ~]# cat /etc/redhat-release    查看Linux系统版本信息
CentOS Linux release 7.4.1708 (Core) 
[root@localhost ~]# systemctl stop firewalld.service        关闭防火墙
[root@localhost ~]# systemctl disable firewalld.service     开机禁止启动防火墙
[root@localhost ~]# cat /etc/selinux/config  

# This file controls the state of SELinux on the system.
# SELINUX= can take one of these three values:
#     enforcing - SELinux security policy is enforced.
#     permissive - SELinux prints warnings instead of enforcing.
#     disabled - No SELinux policy is loaded.
SELINUX=disabled                                  关闭selinux
# SELINUXTYPE= can take one of three two values:
#     targeted - Targeted processes are protected,
#     minimum - Modification of targeted policy. Only selected processes are protected. 
#     mls - Multi Level Security protection.
SELINUXTYPE=targeted 

[root@localhost ~]# 
```

上面的操作如果不出问题就可以继续下一步了，如果出现其他问题请自行去百度解决。

搭建LAMP环境,Zabbix是建立在LAMP或者LNMP环境之上，在此为了方便就使用yum安装LAMP环境

```
[root@localhost ~]# yum install -y httpd mariadb-server mariadb php php-mysql php-gd libjpeg* php-ldap php-odbc php-pear php-xml php-xmlrpc php-mhash
[root@localhost ~]# rpm -qa httpd php mariadb      安装后检查应用版本
httpd-2.4.6-89.el7.centos.x86_64
mariadb-5.5.60-1.el7_5.x86_64
php-5.4.16-46.el7.x86_64
```

在下一步就是编辑一下httpd.conf这个

```
[root@localhost ~]# vim /etc/httpd/conf/httpd.conf

ServerName www.xiaojunkang.com:80                        修改主机名，URL 这个在95行
DirectoryIndex index.html index.php                  修改首页文件格式 这个在164行
```

编辑配置PHP，配置为中国时区

```
[root@localhost ~]# vim /etc/php.ini

date.timezone = PRC  这个在878行
```

启动mysql并且加入开机自启和查看服务端口

```
[root@localhost ~]# systemctl start mariadb               启动数据库
[root@localhost ~]# systemctl enable mariadb           加入开机自启动
Created symlink from /etc/systemd/system/multi-user.target.wants/mariadb.service to /usr/lib/systemd/system/mariadb.service.
[root@localhost ~]# systemctl status mariadb           查看运行状态
● mariadb.service - MariaDB database server
   Loaded: loaded (/usr/lib/systemd/system/mariadb.service; enabled; vendor preset: disabled)
   Active: active (running) since Thu 2019-06-13 00:31:21 CST; 11s ago
 Main PID: 2490 (mysqld_safe)
   CGroup: /system.slice/mariadb.service
           ├─2490 /bin/sh /usr/bin/mysqld_safe --basedir=/usr
           └─2653 /usr/libexec/mysqld --basedir=/usr --datadir=/var/lib/mysql --plugin-dir=/usr/lib64/mysql/plugin --log-error=/var/log/mariadb/mariadb.log --pid-file=/var/run/mariadb/ma...

Jun 13 00:31:19 node2 mariadb-prepare-db-dir[2412]: MySQL manual for more instructions.
Jun 13 00:31:19 node2 mariadb-prepare-db-dir[2412]: Please report any problems at http://mariadb.org/jira
Jun 13 00:31:19 node2 mariadb-prepare-db-dir[2412]: The latest information about MariaDB is available at http://mariadb.org/.
Jun 13 00:31:19 node2 mariadb-prepare-db-dir[2412]: You can find additional information about the MySQL part at:
Jun 13 00:31:19 node2 mariadb-prepare-db-dir[2412]: http://dev.mysql.com
Jun 13 00:31:19 node2 mariadb-prepare-db-dir[2412]: Consider joining MariaDB's strong and vibrant community:
Jun 13 00:31:19 node2 mariadb-prepare-db-dir[2412]: https://mariadb.org/get-involved/
Jun 13 00:31:19 node2 mysqld_safe[2490]: 190613 00:31:19 mysqld_safe Logging to '/var/log/mariadb/mariadb.log'.
Jun 13 00:31:19 node2 mysqld_safe[2490]: 190613 00:31:19 mysqld_safe Starting mysqld daemon with databases from /var/lib/mysql
Jun 13 00:31:21 node2 systemd[1]: Started MariaDB database server.
[root@localhost ~]# netstat -lntup|grep mysqld                             查看正在使用的服务端口是否还存在
tcp        0      0 0.0.0.0:3306            0.0.0.0:*               LISTEN      2653/mysqld   
```

初始化数据库，并设置一下root用户密码

```
[root@localhost ~]# mysqladmin -u root password xiaojunkang     设置数据库密码
[root@localhost ~]# mysql -Uroot -p    登录数据库
Enter password: 
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 5
Server version: 5.5.60-MariaDB MariaDB Server

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]> CREATE DATABASE zabbix character set utf8 collate utf8_bin;     #创建zabbix数据库
Query OK, 1 row affected (0.00 sec)

MariaDB [(none)]> GRANT all ON zabbix.* TO 'zabbix'@'%' IDENTIFIED BY 'zabbix';
Query OK, 0 rows affected (0.00 sec)

MariaDB [(none)]> flush privileges;       #刷新权限
Query OK, 0 rows affected (0.00 sec)
MariaDB [(none)]> select user,host from mysql.user;
+--------+---------------------------+
| user   | host                      |
+--------+---------------------------+
| zabbix | %                         |
| root   | 127.0.0.1                 |
| root   | ::1                       |
|        | localhost                 |
| root   | localhost                 |
|        | localhost.localdomain     |
| root   | localhost.localdomain     |
+--------+---------------------------+
7 rows in set (0.00 sec)

MariaDB [(none)]> drop user ''@localhost;      # 删除空用户
Query OK, 0 rows affected (0.00 sec)

MariaDB [(none)]> select user,host from mysql.user;
+--------+----------------------------+
| user   | host                       |
+--------+----------------------------+
| zabbix | %                          |
| root   | 127.0.0.1                  |
| root   | ::1                        |
| root   | localhost                  |
|        | localhost.localdomain      |
| root   | localhost.localdomain      |
+--------+----------------------------+
6 rows in set (0.00 sec)

MariaDB [(none)]> 
```

安装zabbix，安装依赖包和组件

```
[root@localhost ~]# yum -y install net-snmp net-snmp-devel curl curl-devel libxml2 libxml2-devel libevent-devel.x86_64 javacc.noarch  javacc-javadoc.noarch javacc-maven-plugin.noarch javacc*
[root@localhost ~]# yum install php-bcmath php-mbstring -y  #安装php支持zabbix组件
[root@localhost ~]# rpm -ivh http://repo.zabbix.com/zabbix/5.0/rhel/7/x86_64/zabbix-release-5.0-1.el7.noarch.rpm     安装zabbix   yum源
[root@localhost ~]# yum install zabbix-server-mysql zabbix-web-mysql -y  安装zabbix组件
[root@localhost ~]# zcat /usr/share/doc/zabbix-server-mysql-4.0.9/create.sql.gz | mysql -uzabbix -p -h 192.168.200.157 zabbix
```

导入数据到zabbix数据库中(最后一个zabbix是数据库zabbix)，且因为用户zabbix是%(任意主机)，所以登录时需要加上当前主机ip(-h 192.168.123.212）密码是用户zabbix登陆密码zabbix

vim /etc/zabbix/zabbix_server.conf 配置数据库密码并修改一下时区

```
[root@localhost ~]# 
38:LogFile=/var/log/zabbix/zabbix_server.log
49:LogFileSize=0
72:PidFile=/var/run/zabbix/zabbix_server.pid
82:SocketDir=/var/run/zabbix
100:DBName=zabbix
116:DBUser=zabbix
124:DBPassword=zabbix      把注释打开写zabbix库的密码
356:SNMPTrapperFile=/var/log/snmptrap/snmptrap.log
473:Timeout=4
516:AlertScriptsPath=/usr/lib/zabbix/alertscripts
527:ExternalScripts=/usr/lib/zabbix/externalscripts
563:LogSlowQueries=3000
[root@localhost ~]# 
```

```
vim /etc/httpd/conf.d/zabbix.conf 修改时区
```

![修改时区](https://s3.jpg.cm/2021/09/11/IYpL6O.png)

启动zabbix服务和httpd服务并加入开机自启动

```
[root@localhost ~]# systemctl enable zabbix-server
Created symlink from /etc/systemd/system/multi-user.target.wants/zabbix-server.service to /usr/lib/systemd/system/zabbix-server.service.
[root@localhost ~]# systemctl start zabbix-server
[root@localhost ~]# systemctl start httpd
[root@localhost ~]# systemctl enable httpd
Created symlink from /etc/systemd/system/multi-user.target.wants/httpd.service to /usr/lib/systemd/system/httpd.service.
[root@localhost ~]# 
```

打开浏览器，在地址栏输入你这台服务器的ip/zabbix 例如：http://192.168.123.212/zabbix

![]()

![配置zabbix web界面](https://s3.jpg.cm/2021/09/11/IYpnNk.png)

![连接数据库](https://s3.jpg.cm/2021/09/11/IYp52e.png)

后面的设置自己看着弄，设置完之后就会出现个登陆页面，登陆进去是这样的就说明搭建成功了

![zabbix后台](https://s3.jpg.cm/2021/09/11/IYpdbr.png)

## 这个算是个粗糙的教程吧，如果内容有不足的地方请给我留言！
