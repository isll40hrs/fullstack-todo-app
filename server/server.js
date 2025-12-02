// server/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

// 中间件
app.use(cors()); 
app.use(express.json());

// ----------------------------------------------------
// 【移除 Mongoose 连接代码】
// ----------------------------------------------------

// 引入路由
const todoRoutes = require('./routes/todoRoutes');
app.use('/api/todos', todoRoutes); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    // 成功启动，且不再需要等待 MongoDB 连接.现在使用的是FS文件系统存储
    console.log(`服务器运行在端口 ${PORT}，使用原生FS文件存储。`);
});