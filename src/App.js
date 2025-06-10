import React, { useState, useEffect, useRef, useCallback } from 'react';

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newTodoText, setNewTodoText] = useState('');
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [editingTodoText, setEditingTodoText] = useState('');

  // useRef to manage ongoing fetches for cleanup
  const abortControllerRef = useRef(null);

  // Function to simulate API call
  const fetchTodos = useCallback(async (abortSignal = null) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API delay
      const response = await new Promise(resolve => setTimeout(() => {
        // Simulate successful fetch with some dummy data
        const dummyData = [
          { id: 1, text: 'Learn React Hooks', completed: false },
          { id: 2, text: 'Build a Todo App', completed: true },
          { id: 3, text: 'Understand useEffect', completed: false },
        ];
        resolve({
          ok: true,
          json: () => Promise.resolve(dummyData)
        });
      }, 1000));

      if (!response.ok) {
        throw new Error('Failed to fetch todos.');
      }

      const data = await response.json();
      // Check if the fetch was aborted after the promise resolves
      if (abortSignal && abortSignal.aborted) {
        console.log('Fetch aborted.');
        return;
      }
      setTodos(data);
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Fetch aborted due to component unmount or re-fetch.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []); // useCallback to memoize the function, preventing unnecessary re-creation

  // 1. useEffect for fetching data on component mount
  useEffect(() => {
    abortControllerRef.current = new AbortController();
    fetchTodos(abortControllerRef.current.signal);

    // Cleanup function for aborting ongoing fetch if component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchTodos]); // fetchTodos is a dependency, but it's memoized with useCallback

  // Add Todo
  const handleAddTodo = (e) => {
    e.preventDefault();
    if (newTodoText.trim() === '') return;
    const newTodo = {
      id: todos.length > 0 ? Math.max(...todos.map(todo => todo.id)) + 1 : 1,
      text: newTodoText,
      completed: false,
    };
    setTodos([...todos, newTodo]);
    setNewTodoText('');
  };

  // Delete Todo
  const handleDeleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // Edit Todo - start editing
  const handleEditTodo = (todo) => {
    setEditingTodoId(todo.id);
    setEditingTodoText(todo.text);
  };

  // Edit Todo - save changes
  const handleSaveEdit = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, text: editingTodoText } : todo
    ));
    setEditingTodoId(null);
    setEditingTodoText('');
  };

  // Edit Todo - cancel editing
  const handleCancelEdit = () => {
    setEditingTodoId(null);
    setEditingTodoText('');
  };

  // Toggle Todo completion
  const handleToggleComplete = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  // 2. Controlled trigger for fetching data
  const handleManualFetch = () => {
    // Abort any existing fetch before starting a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    fetchTodos(abortControllerRef.current.signal);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h1>Todo List</h1>

      <button
        onClick={handleManualFetch}
        disabled={loading}
        style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px' }}
      >
        {loading ? 'Fetching...' : 'Manually Fetch Todos'}
      </button>

      {loading && <p>Loading todos...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <form onSubmit={handleAddTodo} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Add a new todo"
          style={{ padding: '10px', marginRight: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '70%' }}
        />
        <button
          type="submit"
          style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Add Todo
        </button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.length === 0 && !loading && !error && <p>No todos found. Add some!</p>}
        {todos.map(todo => (
          <li
            key={todo.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px',
              borderBottom: '1px solid #eee',
              backgroundColor: todo.completed ? '#e6ffe6' : 'white'
            }}
          >
            {editingTodoId === todo.id ? (
              <>
                <input
                  type="text"
                  value={editingTodoText}
                  onChange={(e) => setEditingTodoText(e.target.value)}
                  style={{ flexGrow: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button
                  onClick={() => handleSaveEdit(todo.id)}
                  style={{ marginLeft: '10px', padding: '8px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  style={{ marginLeft: '5px', padding: '8px 12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span
                  style={{ textDecoration: todo.completed ? 'line-through' : 'none', flexGrow: 1, cursor: 'pointer' }}
                  onClick={() => handleToggleComplete(todo.id)}
                >
                  {todo.text}
                </span>
                <button
                  onClick={() => handleEditTodo(todo)}
                  style={{ marginLeft: '10px', padding: '8px 12px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  style={{ marginLeft: '5px', padding: '8px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;