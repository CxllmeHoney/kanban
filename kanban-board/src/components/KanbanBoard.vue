<template>
  <div class="kanban-container">
    <div class="kanban-header">
      <h1>{{ board.name }}</h1>
      <div class="board-stats">
        <div class="stat">
          <i class="fas fa-list"></i>
          {{ board.columns?.length || 0 }} Columns
        </div>
        <div class="stat">
          <i class="fas fa-users"></i>
          {{ board.members?.length || 0 }} Members
        </div>
      </div>
    </div>

    <div class="columns-container">
      <!-- Columns -->
      <div v-for="column in board.columns" :key="column.id" class="column">
        <div class="column-header">
          <div v-if="editingColumn === column.id">
            <input
              v-model="editColumnName"
              @blur="updateColumnName(column)"
              @keyup.enter="updateColumnName(column)"
              class="edit-input"
              placeholder="Enter column name"
              autoFocus
            />
          </div>
          <div v-else class="column-title" @dblclick="startEditingColumn(column)">
            <h3>{{ column.name }}</h3>
            <span class="task-count">{{ column.tasks?.length || 0 }} tasks</span>
          </div>
          <div class="column-actions">
            <!-- เอาปุ่ม Edit และ Delete มาต่อกัน -->
            <button @click="startEditingColumn(column)" class="action-btn">
              <i class="fas fa-pen"></i>
              Edit
            </button>
            <button @click="deleteColumn(column.id)" class="action-btn delete">
              <i class="fas fa-trash"></i>
              Delete
            </button>
          </div>
        </div>

        <!-- Tasks Container -->
        <div
          class="tasks-container"
          @drop="onDrop($event, column.id)"
          @dragover.prevent
          @dragenter.prevent
        >
          <div
            v-for="task in column.tasks"
            :key="task.id"
            class="task"
            draggable="true"
            @dragstart="onDragStart($event, task)"
            @dragend="onDragEnd($event)"
          >
            <div class="task-header">
              <div v-if="editingTask === task.id">
                <input
                  v-model="editTaskName"
                  @blur="updateTaskName(task)"
                  @keyup.enter="updateTaskName(task)"
                  class="edit-input"
                  placeholder="Enter task name"
                />
              </div>
              <div v-else class="task-title" @dblclick="startEditingTask(task)">
                {{ task.name }}
              </div>
              <div class="task-actions">
                <button @click="showAddTagModal(task)" class="action-btn">
                  <i class="fas fa-tag"></i>
                  Tag
                </button>
                <button @click="showAssignModal(task)" class="action-btn">
                  <i class="fas fa-user-plus"></i>
                  Assign
                </button>
                <button @click="deleteTask(task.id)" class="action-btn delete">
                  <i class="fas fa-trash"></i>
                  Delete
                </button>
              </div>
            </div>

            <!-- Task Tags -->
            <div class="task-tags" v-if="task.tags?.length">
              <span v-for="tag in task.tags" :key="tag" class="tag">
                {{ tag }}
              </span>
            </div>

            <!-- Task Assignees -->
            <div class="task-assignees" v-if="task.assignees?.length">
              <div v-for="assignee in task.assignees" :key="assignee.id" class="assignee">
                <div class="assignee-avatar">
                  {{ assignee.username[0].toUpperCase() }}
                </div>
                <span class="assignee-name">{{ assignee.username }}</span>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!column.tasks?.length" class="empty-state">No tasks yet</div>
        </div>

        <button @click="showAddTaskModal(column)" class="add-task-btn">
          <i class="fas fa-plus"></i>
          Add Task
        </button>
      </div>

      <!-- Add Column -->
      <div class="add-column">
        <input
          v-model="newColumnName"
          placeholder="New column name"
          class="new-column-input"
          @keyup.enter="addColumn"
        />
        <button @click="addColumn" class="add-column-btn" :disabled="!newColumnName.trim()">
          <i class="fas fa-plus"></i>
          Add Column
        </button>
      </div>
    </div>

    <!-- Add Tag Modal -->
    <div v-if="showTagModal" class="modal" @click="showTagModal = false">
      <div class="modal-content" @click.stop>
        <h3>Add Tag</h3>
        <input
          v-model="newTag"
          placeholder="Enter tag name"
          class="modal-input"
          @keyup.enter="addTag"
        />
        <div class="modal-actions">
          <button @click="showTagModal = false" class="cancel-btn">Cancel</button>
          <button @click="addTag" class="submit-btn" :disabled="!newTag.trim()">Add Tag</button>
        </div>
      </div>
    </div>

    <!-- Assign Task Modal -->
    <div v-if="showAssignModal" class="modal" @click="showAssignModal = false">
      <div class="modal-content" @click.stop>
        <h3>Assign Task</h3>
        <select v-model="selectedAssignee" class="modal-select">
          <option value="">Select a member</option>
          <option v-for="member in board.members" :key="member.id" :value="member">
            {{ member.username }}
          </option>
        </select>
        <div class="modal-actions">
          <button @click="showAssignModal = false" class="cancel-btn">Cancel</button>
          <button @click="assignTask" class="submit-btn" :disabled="!selectedAssignee">
            Assign
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      editingColumn: null,
      editColumnName: '',
      editingTask: null,
      editTaskName: '',
      newColumnName: '',
      showTagModal: false,
      showAssignModal: false,
      newTag: '',
      selectedAssignee: null,
      currentTask: null,
      draggedTask: null,
    }
  },
  computed: {
    board() {
      return this.$store.state.boards.find((b) => b.id === parseInt(this.$route.params.id))
    },
  },
  methods: {
    onDragStart(event, task) {
      this.draggedTask = task
      event.target.classList.add('dragging')
    },

    onDragEnd(event) {
      event.target.classList.remove('dragging')
    },

    onDrop(event, columnId) {
      if (this.draggedTask) {
        const draggedElement = document.querySelector('.dragging')
        if (draggedElement) {
          draggedElement.classList.remove('dragging')
        }

        // Remove task from original column
        this.board.columns.forEach((column) => {
          column.tasks = column.tasks.filter((t) => t.id !== this.draggedTask.id)
        })

        // Add task to new column with animation
        const targetColumn = this.board.columns.find((c) => c.id === columnId)
        this.draggedTask.style = { animation: 'dropIn 0.3s ease-out' }
        targetColumn.tasks.push(this.draggedTask)
        this.draggedTask = null
      }
    },

    addColumn() {
      if (this.newColumnName.trim()) {
        this.board.columns.push({
          id: Date.now(),
          name: this.newColumnName,
          tasks: [],
        })
        this.newColumnName = ''
      }
    },

    deleteColumn(columnId) {
      if (confirm('Are you sure you want to delete this column?')) {
        this.board.columns = this.board.columns.filter((c) => c.id !== columnId)
      }
    },

    startEditingColumn(column) {
      this.editingColumn = column.id
      this.editColumnName = column.name
    },

    updateColumnName(column) {
      if (this.editColumnName.trim()) {
        column.name = this.editColumnName
      }
      this.editingColumn = null
    },

    showAddTaskModal(column) {
      const taskName = prompt('Enter task name:')
      if (taskName?.trim()) {
        column.tasks.push({
          id: Date.now(),
          name: taskName,
          tags: [],
          assignees: [],
        })
      }
    },

    startEditingTask(task) {
      this.editingTask = task.id
      this.editTaskName = task.name
    },

    updateTaskName(task) {
      if (this.editTaskName.trim()) {
        task.name = this.editTaskName
      }
      this.editingTask = null
    },

    deleteTask(taskId) {
      if (confirm('Are you sure you want to delete this task?')) {
        this.board.columns.forEach((column) => {
          column.tasks = column.tasks.filter((t) => t.id !== taskId)
        })
      }
    },

    showAddTagModal(task) {
      this.currentTask = task
      this.showTagModal = true
    },

    addTag() {
      if (this.newTag.trim() && !this.currentTask.tags.includes(this.newTag)) {
        this.currentTask.tags.push(this.newTag)
        this.newTag = ''
        this.showTagModal = false
      }
    },

    showAssignModal(task) {
      this.currentTask = task
      this.showAssignModal = true
    },

    assignTask() {
      if (
        this.selectedAssignee &&
        !this.currentTask.assignees.find((a) => a.id === this.selectedAssignee.id)
      ) {
        this.currentTask.assignees.push(this.selectedAssignee)
        this.$store.commit('addNotification', {
          userId: this.selectedAssignee.id,
          message: `You've been assigned to task: ${this.currentTask.name}`,
        })
        this.selectedAssignee = null
        this.showAssignModal = false
      }
    },
  },
}
</script>

<style scoped>
.kanban-container {
  min-height: 100vh;
  background: #f1f5f9;
  padding: 1rem;
}

.kanban-header {
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kanban-header h1 {
  margin: 0;
  font-size: 1.8rem;
  color: #1e293b;
}

.board-stats {
  display: flex;
  gap: 1.5rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.9rem;
}

.columns-container {
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding: 0.5rem;
  min-height: calc(100vh - 180px);
}

.column {
  background: #f8fafc;
  border-radius: 12px;
  width: 320px;
  min-width: 320px;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 200px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.column-header {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.column-title {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.column-title h3 {
  margin: 0;
  font-size: 1rem;
  color: #1e293b;
}

.task-count {
  font-size: 0.8rem;
  color: #64748b;
}

.tasks-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.task {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.task:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.task.dragging {
  opacity: 0.5;
  background: #f1f5f9;
}

.task-header {
  display: flex;
  flex-direction: column; /* เปลี่ยนเป็นแนวตั้ง */
  gap: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 0.75rem;
}

.task-title {
  font-weight: 500;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.column-actions {
  display: flex;
  gap: 0.25rem; /* ลด gap ระหว่างปุ่มให้น้อยลง */
  align-items: center;
}

.action-btn {
  padding: 0.4rem 0.8rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #64748b;
  transition: all 0.2s ease;
  font-size: 0.85rem;
}

.action-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e0;
  color: #1e293b;
}

.action-btn.delete {
  color: #ef4444;
  border-color: #fecaca;
}

.action-btn.delete:hover {
  background: #fee2e2;
  border-color: #ef4444;
  color: #dc2626;
}

.action-btn i {
  font-size: 0.9rem;
}

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.tag {
  background: #e0e7ff;
  color: #4338ca;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.task-assignees {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.assignee {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.assignee-avatar {
  width: 24px;
  height: 24px;
  background: #6366f1;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 500;
}

.assignee-name {
  font-size: 0.85rem;
  color: #64748b;
}

.add-task-btn {
  margin: 1rem;
  padding: 0.75rem;
  background: white;
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.add-task-btn:hover {
  border-color: #6366f1;
  color: #6366f1;
  background: #f5f3ff;
}

.add-column {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  width: 320px;
  min-width: 320px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-self: flex-start;
  border: 2px dashed #e2e8f0;
}

.new-column-input {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
}

.add-column-btn {
  padding: 0.75rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.add-column-btn:hover:not(:disabled) {
  background: #4f46e5;
  transform: translateY(-1px);
}

.add-column-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  color: #94a3b8;
  padding: 2rem 0;
  font-size: 0.9rem;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  width: 90%;
  max-width: 320px; /* ลดขนาดลงจาก 400px */
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  margin: 0 1rem; /* เพิ่ม margin เพื่อให้มี space ด้านข้าง */
}

.modal-content h3 {
  margin: 0 0 1rem 0;
  color: #1e293b;
}

.modal-input {
  width: 100%;
  box-sizing: border-box; /* ป้องกันการล้น */
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}
.modal-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  background-color: white;
  cursor: pointer;
}

.modal-select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}

.cancel-btn,
.submit-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: #e2e8f0;
  color: #475569;
}

.submit-btn {
  background: #6366f1;
  color: white;
}

.cancel-btn:hover {
  background: #cbd5e1;
}

.submit-btn:hover:not(:disabled) {
  background: #4f46e5;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.edit-input {
  width: 100%;
  padding: 0.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
}

.edit-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* Custom Scrollbar */
.tasks-container::-webkit-scrollbar {
  width: 6px;
}

.tasks-container::-webkit-scrollbar-track {
  background: transparent;
}

.tasks-container::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.columns-container::-webkit-scrollbar {
  height: 8px;
}

.columns-container::-webkit-scrollbar-track {
  background: transparent;
}

.columns-container::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 4px;
}

/* Animations */
@keyframes dropIn {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media screen and (max-width: 768px) {
  .kanban-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .board-stats {
    justify-content: center;
  }

  .task-header {
    flex-direction: column;
    align-items: stretch;
  }

  .task-actions {
    justify-content: flex-end;
    margin-top: 0.5rem;
  }

  .modal-content {
    width: 95%;
    margin: 0 1rem;
  }

  .action-btn {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
  }
}

@media screen and (max-width: 480px) {
  .modal-content {
    width: calc(100% - 2rem);
    max-width: none;
    margin: 0 1rem;
  }
}

/* Focus States */
.action-btn:focus,
.add-task-btn:focus,
.add-column-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);
}

/* Active States */
.action-btn:active,
.add-task-btn:active,
.add-column-btn:active {
  transform: translateY(1px);
}

/* Empty Column State */
.column:empty::after {
  content: 'No tasks yet';
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  color: #94a3b8;
  font-size: 0.9rem;
}

/* Loading States (if needed) */
.loading {
  opacity: 0.7;
  pointer-events: none;
  position: relative;
}

.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 2px solid #cbd5e0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
