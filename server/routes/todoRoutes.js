// server/routes/todoRoutes.js

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs/promises'); // 引入 Node.js 的文件系统模块 (使用 promises 版本)

// 定义数据库文件的路径
const DB_PATH = path.join(__dirname, 'todos.json');

// --- 数据库操作的核心函数 ---

// 读取 JSON 文件内容
async function readTodos() {
    try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // 如果文件不存在，则返回一个空数组
        if (error.code === 'ENOENT') {
            return []; 
        }
        throw error;
    }
}

// 写入 JSON 文件内容
async function writeTodos(todos) {
    const data = JSON.stringify(todos, null, 2); // null, 2 用于美化 JSON 格式
    await fs.writeFile(DB_PATH, data, 'utf-8');
}

// ------------------------------------------------------------------

// GET /api/todos - 获取所有待办事项 (查)
router.get('/', async (req, res) => {
    try {
        const todos = await readTodos();
        // 简单排序 (可选)
        const sortedTodos = todos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(sortedTodos);
    } catch (err) {
        console.error('读取失败:', err);
        res.status(500).json({ message: '查询失败' });
    }
});

// POST /api/todos - 创建待办事项 (增)
router.post('/', async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ message: '待办事项内容不能为空' });
    }

    // 构造要插入的数据
    const newTodo = {
        id: Date.now().toString(), 
        text,
        completed: false,
        createdAt: new Date().toISOString()
    };

    try {
        // 1. 读取现有数据
        const todos = await readTodos(); 
        
        // 2. 添加新数据
        todos.push(newTodo);
        
        // 3. 写入文件
        await writeTodos(todos); 

        // 4. 返回新创建的对象
        res.status(201).json(newTodo);
    } catch (err) {
        console.error('写入失败:', err);
        res.status(500).json({ message: '创建失败', error: err.toString() });
    }

});

// server/routes/todoRoutes.js

// ... (GET 和 POST 路由在前面) ...

// PUT /api/todos/:id - 更新待办事项 (改)
router.put('/:id', async (req, res) => {
    // 1. 从 URL 参数获取待办事项的 ID
    const todoId = req.params.id; 
    // 2. 从请求体获取要更新的数据（例如 { completed: true } 或 { text: '新内容' }）
    const updates = req.body; 

    try {
        const todos = await readTodos();
        // 3. 找到需要更新的事项的索引
        const index = todos.findIndex(t => t.id === todoId);

        if (index === -1) {
            return res.status(404).json({ message: '待办事项未找到' });
        }

        // 4. 更新数据：使用扩展运算符 (...) 合并旧数据和新数据
        const updatedTodo = {
            ...todos[index],
            ...updates
        };

        // 确保 ID 和创建时间不被意外修改
        updatedTodo.id = todos[index].id; 
        
        // 5. 替换数组中的旧数据
        todos[index] = updatedTodo;

        // 6. 写入文件
        await writeTodos(todos);

        // 7. 返回更新后的对象
        res.json(updatedTodo);
    } catch (err) {
        console.error('更新失败:', err);
        res.status(500).json({ message: '更新失败', error: err.toString() });
    }
});

// server/routes/todoRoutes.js

// ... (GET, POST, PUT 路由在前面) ...

// DELETE /api/todos/:id - 删除待办事项 (删)
router.delete('/:id', async (req, res) => {
    // 1. 从 URL 参数获取待办事项的 ID
    const todoId = req.params.id; 

    try {
        const todos = await readTodos();

        // 2. 过滤出不等于该 ID 的所有事项（即删除该事项）
        const initialLength = todos.length;
        const newTodos = todos.filter(t => t.id !== todoId);

        if (newTodos.length === initialLength) {
            return res.status(404).json({ message: '待办事项未找到' });
        }

        // 3. 写入新的数组（已删除后的数组）
        await writeTodos(newTodos);

        // 4. 返回成功状态，通常不返回内容
        res.status(204).send(); // 204 No Content 是删除成功常用的状态码
    } catch (err) {
        console.error('删除失败:', err);
        res.status(500).json({ message: '删除失败', error: err.toString() });
    }
});

module.exports = router;


module.exports = router;