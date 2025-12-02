import { useState, useEffect } from 'react'
import './App.css'

// 后端 API 的基础地址
const API_URL = 'http://localhost:5000/api/todos';

function App() {
  // 1. 定义状态 (State)
  const [todos, setTodos] = useState([]); // 存放待办事项列表
  const [inputText, setInputText] = useState(''); // 存放输入框的内容

  // 2. 加载页面时，自动获取数据 (R - Read)
  useEffect(() => {
    fetchTodos();
  }, []);

  // --- API 操作函数 ---

  // 获取所有待办事项
  const fetchTodos = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setTodos(data);
    } catch (error) {
      console.error("获取失败:", error);
    }
  };

  // 添加待办事项 (C - Create)
  const addTodo = async () => {
    if (!inputText.trim()) return; // 防止空输入

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText })
      });
      const newTodo = await res.json();
      
      // 更新列表：把新的一项加到列表最前面
      setTodos([newTodo, ...todos]); 
      setInputText(''); // 清空输入框
    } catch (error) {
      console.error("添加失败:", error);
    }
  };

  // 切换完成状态 (U - Update)
  const toggleTodo = async (id, currentStatus) => {
    try {
      // 发送 PUT 请求，状态取反
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus })
      });

      // 更新本地状态：找到对应的那一项，修改它的 completed 属性
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ));
    } catch (error) {
      console.error("更新失败:", error);
    }
  };

  // 删除待办事项 (D - Delete)
  const deleteTodo = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      // 更新本地状态：过滤掉被删除的那一项
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error("删除失败:", error);
    }
  };

  // --- 界面渲染 (Render) ---
  return (
    <div className="container">
      <h1>全栈待办清单</h1>
      
      {/* 输入区域 */}
      <div className="input-group">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="今天要做什么？"
          onKeyDown={(e) => e.key === 'Enter' && addTodo()} // 回车也能添加
        />
        <button onClick={addTodo} className="add-btn">添加</button>
      </div>

      {/* 列表区域 */}
      <ul className="todo-list">
        {todos.length === 0 && <p className="empty-tip">暂无待办，快去添加一个吧！</p>}
        
        {todos.map(todo => (
          <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            
            {/* 点击文字切换状态 */}
            <span onClick={() => toggleTodo(todo.id, todo.completed)}>
              {todo.text}
            </span>

            {/* 删除按钮 */}
            <button onClick={() => deleteTodo(todo.id)} className="delete-btn">
              删除
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App