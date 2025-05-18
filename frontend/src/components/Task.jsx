import { Draggable } from '@hello-pangea/dnd';

const Task = ({ task, index, onEdit, onDelete }) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="bg-white p-3 rounded shadow"
        >
          <h3 className="font-bold">{task.title}</h3>
          {task.description && <p className="text-sm mt-1">{task.description}</p>}
          <div className="flex justify-end mt-2 space-x-2">
            <button
              onClick={() => onEdit(task)}
              className="text-blue-500 text-sm"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="text-red-500 text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default Task;