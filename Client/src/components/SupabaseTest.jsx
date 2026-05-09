import { useEffect, useState } from 'react';
import { createClient } from '../utils/supabase/client';

export default function SupabaseTest() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const supabase = createClient();
    
    async function fetchTodos() {
      try {
        const { data, error } = await supabase.from('todos').select();
        if (error) throw error;
        setTodos(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTodos();
  }, []);

  if (loading) return <p>Loading todos...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <ul>
      {todos.length > 0 ? (
        todos.map((todo) => (
          <li key={todo.id}>{todo.name}</li>
        ))
      ) : (
        <li>No todos found. Make sure you have a "todos" table with a "name" column!</li>
      )}
    </ul>
  );
}
