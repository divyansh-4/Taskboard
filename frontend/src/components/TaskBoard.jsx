import { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import Column from './Column';
import TaskForm from './TaskForm';
import { fetchTasks, updateTasks } from '../api';

const TaskBoard = () => {
  const [columns, setColumns] = useState({
    todo: { id: 'todo', title: 'To Do', tasks: [] },
    inProgress: { id: 'inProgress', title: 'In Progress', tasks: [] },
    done: { id: 'done', title: 'Done', tasks: [] }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Load tasks from backend on component mount
  useEffect(() => {
    const loadInitialTasks = async () => {
      try {
        const response = await fetchTasks();
        const { todo, inProgress, done } = response.data;
        
        setColumns({
          todo: { ...columns.todo, tasks: todo || [] },
          inProgress: { ...columns.inProgress, tasks: inProgress || [] },
          done: { ...columns.done, tasks: done || [] }
        });
      } catch (error) {
        console.error("Failed to load tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialTasks();
  }, []);

  const persistTasks = async (updatedColumns) => {
    try {
      await updateTasks({
        todo: updatedColumns.todo.tasks,
        inProgress: updatedColumns.inProgress.tasks,
        done: updatedColumns.done.tasks
      });
    } catch (error) {
      console.error("Failed to save tasks:", error);
      throw error; // Re-throw to handle in calling function if needed
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // If dropped outside the list or in same position
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    const startColumn = columns[source.droppableId];
    const finishColumn = columns[destination.droppableId];
    const task = startColumn.tasks.find(t => t.id === draggableId);

    // Moving within same column
    if (startColumn === finishColumn) {
      const newTasks = [...startColumn.tasks];
      newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, task);

      const newColumn = { ...startColumn, tasks: newTasks };
      const newColumns = { ...columns, [newColumn.id]: newColumn };

      setColumns(newColumns);
      await persistTasks(newColumns);
    } 
    // Moving to different column
    else {
      const startTasks = [...startColumn.tasks];
      startTasks.splice(source.index, 1);
      const newStartColumn = { ...startColumn, tasks: startTasks };

      const finishTasks = [...finishColumn.tasks];
      finishTasks.splice(destination.index, 0, task);
      const newFinishColumn = { ...finishColumn, tasks: finishTasks };

      const newColumns = {
        ...columns,
        [newStartColumn.id]: newStartColumn,
        [newFinishColumn.id]: newFinishColumn
      };

      setColumns(newColumns);
      await persistTasks(newColumns);
    }
  };

  const handleAddTask = async (newTask) => {
    const updatedColumns = {
      ...columns,
      todo: {
        ...columns.todo,
        tasks: [newTask, ...columns.todo.tasks]
      }
    };

    setColumns(updatedColumns);
    await persistTasks(updatedColumns);
    setShowForm(false);
  };

  const handleUpdateTask = async (updatedTask) => {
    const updatedColumns = { ...columns };
    let columnUpdated = false;

    // Find and update the task in whichever column it exists
    for (const columnId in updatedColumns) {
      const taskIndex = updatedColumns[columnId].tasks.findIndex(t => t.id === updatedTask.id);
      if (taskIndex !== -1) {
        updatedColumns[columnId].tasks[taskIndex] = updatedTask;
        columnUpdated = true;
        break;
      }
    }

    if (columnUpdated) {
      setColumns(updatedColumns);
      await persistTasks(updatedColumns);
      setShowForm(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const updatedColumns = { ...columns };
    let columnUpdated = false;

    for (const columnId in updatedColumns) {
      const taskIndex = updatedColumns[columnId].tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        updatedColumns[columnId].tasks.splice(taskIndex, 1);
        columnUpdated = true;
        break;
      }
    }

    if (columnUpdated) {
      setColumns(updatedColumns);
      await persistTasks(updatedColumns);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-semibold">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Task Management Board</h1>
        <button
          onClick={() => {
            setEditingTask(null);
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Add New Task
        </button>
      </div>

      {showForm && (
        <TaskForm
          onClose={() => setShowForm(false)}
          onSubmit={editingTask ? handleUpdateTask : handleAddTask}
          task={editingTask}
        />
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.values(columns).map(column => (
            <Column
              key={column.id}
              column={column}
              onEditTask={(task) => {
                setEditingTask(task);
                setShowForm(true);
              }}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default TaskBoard;