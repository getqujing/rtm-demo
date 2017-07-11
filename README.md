### 说明

这是一个关于如何跟待客的实时聊天接口对接的demo，接口的详情请参考[官方文档](https://developer.getdaike.com)

接入实时接口需要先有一个开放的工单，所以对接时的推荐步骤为：

1. 先调用[创建工单API](https://developer.getdaike.com/public-api/#api_2)创建一个工单，或者通过[工单历史](https://developer.getdaike.com/public-api/#api_5)来得到一个未关闭的工单，通过工单历史也可以获得跟用户的全部聊天记录
2. 拿到工单ID后，通过[创建聊天API](https://developer.getdaike.com/public-api/#api_6)得到websocket的入口
3. 接入chats接口返回的endpoint，就可以跟服务器实时通信了，具体的消息内容跟格式请参考[RTM API](https://developer.getdaike.com/rtm-api/)
4. 当客服在后台关闭一个工单时，需要用户这边进行确认，流程为：客服关闭工单；用户确认关闭工单；或用户重新打开工单。具体的通信格式请参考RTM API的[工单状态改变事件](https://developer.getdaike.com/rtm-api/#_3)


### demo介绍

由于待客的web api并不支持通过ajax跨域访问，所以对于一般的网页应用，需要服务器配合处理跟待客服务器的通信，并返回得到的endpoint给前端，之后前端就可以正常通过websocket连接待客了

`server.js`即承担了这样一个中转的角色，启动服务器的命令：

```bash
npm i node-fetch
node server.js SECRET APP_ID
```

参数中的secret和app_id可以在待客的后台得到

启动后访问`http://127.0.0.1:8000`就可以看到页面了，在这里可以尝试提交对话或者恢复一个之前的对话，具体的实现可以参考`index.html`中的代码