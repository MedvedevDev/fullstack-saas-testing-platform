import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import api from "../api/axios";
import type { Task } from "../types/task";

const TasksKanbanPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const columns = {
    TODO: {
      title: "To Do",
      bg: "bg-gray-50/50",
      border: "border-gray-200",
      icon: AlertCircle,
      iconColor: "text-slate-500",
    },
    IN_PROGRESS: {
      title: "In Progress",
      bg: "bg-blue-50/50",
      border: "border-blue-100",
      icon: Clock,
      iconColor: "text-blue-500",
    },
    DONE: {
      title: "Done",
      bg: "bg-green-50/50",
      border: "border-green-100",
      icon: CheckCircle2,
      iconColor: "text-green-500",
    },
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get("/tasks");
      setTasks(response.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const movedTask = tasks.find((t) => t.id === draggableId);
    if (!movedTask) return;

    const updatedTasks = tasks.map((t) =>
      t.id === draggableId
        ? { ...t, status: destination.droppableId as any }
        : t,
    );
    setTasks(updatedTasks);

    try {
      await api.put(`/tasks/${draggableId}`, {
        ...movedTask,
        status: destination.droppableId,
      });
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to save move. Reverting...");
      fetchTasks();
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-flow-text-muted">
        Loading board...
      </div>
    );

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-flow-text-main">Task Board</h2>
          <p className="text-sm text-flow-text-muted">
            Drag tasks to update status
          </p>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto pb-4">
          {Object.entries(columns).map(([columnId, col]) => (
            <div
              key={columnId}
              className={`flex flex-col h-full min-w-[300px] rounded-xl border ${col.border} ${col.bg}`}
            >
              <div className="p-4 border-b border-white/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <col.icon className={`h-5 w-5 ${col.iconColor}`} />
                  <h3 className="font-bold text-flow-text-main">{col.title}</h3>
                  <span className="bg-white px-2 py-0.5 rounded text-xs font-bold text-gray-500 shadow-sm border border-gray-100">
                    {tasks.filter((t) => t.status === columnId).length}
                  </span>
                </div>
              </div>

              <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 p-3 space-y-3 transition-colors ${
                      snapshot.isDraggingOver ? "bg-white/50" : ""
                    }`}
                  >
                    {tasks
                      .filter((task) => task.status === columnId)
                      .map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white p-4 rounded-lg shadow-sm border border-flow-border group hover:shadow-md transition-all ${
                                snapshot.isDragging
                                  ? "rotate-2 shadow-xl ring-2 ring-flow-blue/20"
                                  : ""
                              }`}
                              style={provided.draggableProps.style}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                                    task.priority === "HIGH"
                                      ? "bg-red-50 text-red-600 border-red-100"
                                      : task.priority === "MEDIUM"
                                        ? "bg-amber-50 text-amber-600 border-amber-100"
                                        : "bg-green-50 text-green-600 border-green-100"
                                  }`}
                                >
                                  {task.priority}
                                </span>
                                {task.project?.name && (
                                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 max-w-[100px] truncate">
                                    {task.project.name}
                                  </span>
                                )}
                              </div>
                              <h4 className="font-medium text-flow-text-main text-sm mb-2 leading-relaxed">
                                {task.title}
                              </h4>
                              <div className="text-xs text-flow-text-muted flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                                <span>
                                  {new Date(
                                    task.createdAt,
                                  ).toLocaleDateString()}
                                </span>

                                {/* FIX: Dynamic Avatar */}
                                <div
                                  className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm ring-2 ring-white"
                                  style={{
                                    backgroundColor: task.assignee
                                      ? "#EEF2FF"
                                      : "#F1F5F9",
                                    color: task.assignee
                                      ? "#4F46E5"
                                      : "#64748B",
                                  }}
                                  title={
                                    task.assignee
                                      ? `${task.assignee.firstName} ${task.assignee.lastName}`
                                      : "Unassigned"
                                  }
                                >
                                  {task.assignee
                                    ? `${task.assignee.firstName[0]}${task.assignee.lastName[0]}`
                                    : "?"}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default TasksKanbanPage;
