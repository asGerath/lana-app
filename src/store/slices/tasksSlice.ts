import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialTasksState } from '@/features/tasks/initialState';
import { ColumnId, TaskNode, TaskTree } from '@/features/tasks/types';

type CreateTaskPayload = {
  task: TaskNode;
};

type UpdateTaskPayload = {
  id: string;
  changes: Partial<Omit<TaskNode, 'id' | 'createdBy' | 'createdAt'>>;
};

type DeleteTaskPayload = {
  id: string;
};

type MoveTaskPayload = {
  taskId: string;
  sourceColumnId: ColumnId;
  destinationColumnId: ColumnId;
  sourceIndex: number;
  destinationIndex: number;
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: initialTasksState,
  reducers: {
    setTasksLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setTasksError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    setBoardState: (state, action: PayloadAction<TaskTree>) => {
      state.board = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },

    setSelectedStatus: (
      state,
      action: PayloadAction<ColumnId | 'all'>,
    ) => {
      state.selectedStatus = action.payload;
    },

    createTask: (state, action: PayloadAction<CreateTaskPayload>) => {
      const { task } = action.payload;

      state.board.tasksById[task.id] = task;
      state.board.columns[task.status].taskIds.push(task.id);
    },

    updateTask: (state, action: PayloadAction<UpdateTaskPayload>) => {
      const { id, changes } = action.payload;
      const currentTask = state.board.tasksById[id];

      if (!currentTask) return;

      const previousStatus = currentTask.status;
      const nextStatus = changes.status ?? previousStatus;

      state.board.tasksById[id] = {
        ...currentTask,
        ...changes,
        updatedAt: Date.now(),
        version: currentTask.version + 1,
      };

      if (previousStatus !== nextStatus) {
        state.board.columns[previousStatus].taskIds =
          state.board.columns[previousStatus].taskIds.filter(
            (taskId) => taskId !== id,
          );

        state.board.columns[nextStatus].taskIds.push(id);
      }
    },

    deleteTask: (state, action: PayloadAction<DeleteTaskPayload>) => {
      const { id } = action.payload;
      const task = state.board.tasksById[id];

      if (!task) return;

      state.board.columns[task.status].taskIds =
        state.board.columns[task.status].taskIds.filter(
          (taskId) => taskId !== id,
        );

      delete state.board.tasksById[id];
    },

    toggleFavorite: (state, action: PayloadAction<{ id: string }>) => {
      const task = state.board.tasksById[action.payload.id];

      if (!task) return;

      task.favorite = !task.favorite;
      task.updatedAt = Date.now();
      task.version += 1;
    },

    moveTask: (state, action: PayloadAction<MoveTaskPayload>) => {
      const {
        taskId,
        sourceColumnId,
        destinationColumnId,
        sourceIndex,
        destinationIndex,
      } = action.payload;

      const sourceTasks = [...state.board.columns[sourceColumnId].taskIds];
      const destinationTasks =
        sourceColumnId === destinationColumnId
          ? sourceTasks
          : [...state.board.columns[destinationColumnId].taskIds];

      sourceTasks.splice(sourceIndex, 1);
      destinationTasks.splice(destinationIndex, 0, taskId);

      if (sourceColumnId === destinationColumnId) {
        state.board.columns[sourceColumnId].taskIds = destinationTasks;
      } else {
        state.board.columns[sourceColumnId].taskIds = sourceTasks;
        state.board.columns[destinationColumnId].taskIds = destinationTasks;
        state.board.tasksById[taskId].status = destinationColumnId;
        state.board.tasksById[taskId].updatedAt = Date.now();
        state.board.tasksById[taskId].version += 1;
      }
    },

    clearTasksState: (state) => {
      state.board = initialTasksState.board;
      state.search = '';
      state.selectedStatus = 'all';
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setTasksLoading,
  setTasksError,
  setBoardState,
  setSearch,
  setSelectedStatus,
  createTask,
  updateTask,
  deleteTask,
  toggleFavorite,
  moveTask,
  clearTasksState,
} = tasksSlice.actions;

export const tasksReducer = tasksSlice.reducer;