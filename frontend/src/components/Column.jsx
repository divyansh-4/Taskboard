import { Droppable } from '@hello-pangea/dnd';
import Task from './Task';

const Column = ({ column, onEditTask, onDeleteTask }) => {
  return (
    <div className="flex-1 bg-gray-100 rounded p-4">
      <h2 className="font-bold text-lg mb-4">{column.title}</h2>
      <Droppable droppableId={column.id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-2 min-h-[100px]"
          >
            {column.tasks.map((task, index) => (
              <Task
                key={task.id}
                task={task}
                index={index}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Column;