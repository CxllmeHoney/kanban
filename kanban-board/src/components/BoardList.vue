<template>
  <div class="board-list-container">
    <!-- Header Section -->
    <div class="board-header">
      <div class="header-content">
        <h1>My Boards</h1>
        <p>Organize and manage your projects with ease</p>
      </div>
    </div>

    <!-- Create Board Section -->
    <div class="create-board-section">
      <div class="create-board-card">
        <input v-model="newBoardName" placeholder="Enter board name..." class="board-input" />
        <button @click="createBoard" class="create-btn" :disabled="!newBoardName.trim()">
          <i class="fas fa-plus"></i>
          Create Board
        </button>
      </div>
    </div>

    <!-- Boards Grid -->
    <div class="boards-grid">
      <div v-for="board in boards" :key="board.id" class="board-card">
        <div class="board-card-content" @click="$router.push(`/board/${board.id}`)">
          <div class="board-info">
            <h3>{{ board.name }}</h3>
            <p>{{ board.members.length }} members</p>
          </div>

          <!-- Board Stats -->
          <div class="board-stats">
            <div class="stat">
              <i class="fas fa-list"></i>
              {{ board.columns?.length || 0 }} columns
            </div>
            <div class="stat">
              <i class="fas fa-users"></i>
              {{ board.members.length }} collaborators
            </div>
          </div>

          <!-- Members Preview -->
          <div class="members-preview">
            <div
              v-for="member in board.members.slice(0, 3)"
              :key="member.id"
              class="member-avatar"
              :title="member.username"
            >
              {{ member.username[0].toUpperCase() }}
            </div>
            <div v-if="board.members.length > 3" class="member-avatar more">
              +{{ board.members.length - 3 }}
            </div>
          </div>
        </div>

        <!-- Board Actions -->
        <div class="board-actions">
          <button class="action-btn edit" @click.stop="startEditingBoard(board)" title="Edit">
            <i class="fas fa-pen"></i>
            Edit
          </button>
          <button class="action-btn invite" @click.stop="showInviteModal(board)" title="Invite">
            <i class="fas fa-user-plus"></i>
            Invite
          </button>
          <button class="action-btn delete" @click.stop="deleteBoard(board.id)" title="Delete">
            <i class="fas fa-trash"></i>
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="editingBoard" class="modal" @click="editingBoard = null">
      <div class="modal-content" @click.stop>
        <h3>Edit Board</h3>
        <input
          v-model="editBoardName"
          class="edit-input"
          placeholder="Enter new board name"
          @keyup.enter="updateBoardName(editingBoard)"
        />
        <div class="modal-actions">
          <button @click="editingBoard = null" class="cancel-btn">Cancel</button>
          <button @click="updateBoardName(editingBoard)" class="save-btn">Save</button>
        </div>
      </div>
    </div>

    <!-- Invite Modal -->
    <div v-if="showInvite" class="modal" @click="showInvite = false">
      <div class="modal-content" @click.stop>
        <h3>Invite Members</h3>
        <div class="invite-form">
          <input v-model="inviteEmail" class="invite-input" placeholder="Enter email address" />
          <button @click="inviteMember" class="invite-btn" :disabled="!inviteEmail">
            <i class="fas fa-paper-plane"></i>
            Send Invite
          </button>
        </div>
        <div class="current-members" v-if="currentBoard?.members.length">
          <h4>Current Members</h4>
          <div class="members-list">
            <div v-for="member in currentBoard.members" :key="member.id" class="member-item">
              <div class="member-avatar">{{ member.username[0].toUpperCase() }}</div>
              <span>{{ member.username }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      newBoardName: '',
      editingBoard: null,
      editBoardName: '',
      showInvite: false,
      inviteEmail: '',
      currentBoard: null,
    }
  },
  computed: {
    boards() {
      return this.$store.state.boards
    },
  },
  methods: {
    createBoard() {
      if (this.newBoardName.trim()) {
        this.$store.dispatch('createBoard', { name: this.newBoardName })
        this.newBoardName = ''
      }
    },
    startEditingBoard(board) {
      this.editingBoard = board.id
      this.editBoardName = board.name
    },
    updateBoardName(board) {
      this.$store.commit('updateBoard', {
        id: board.id,
        name: this.editBoardName,
      })
      this.editingBoard = null
    },
    deleteBoard(boardId) {
      if (confirm('Are you sure you want to delete this board?')) {
        this.$store.commit('deleteBoard', boardId)
      }
    },
    showInviteModal(board) {
      this.currentBoard = board
      this.showInvite = true
    },
    inviteMember() {
      const user = this.$store.state.users.find((u) => u.email === this.inviteEmail)
      if (user) {
        this.currentBoard.members.push(user)
        this.$store.commit('addNotification', {
          userId: user.id,
          message: `You've been invited to board: ${this.currentBoard.name}`,
        })
        this.showInvite = false
        this.inviteEmail = ''
      } else {
        alert('User not found')
      }
    },
  },
}
</script>

<style scoped>
.board-list-container {
  min-height: 100vh;
  background: #f8fafc;
  padding-bottom: 2rem;
}

.board-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 3rem 2rem;
  color: white;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
}

.header-content h1 {
  font-size: 2.5rem;
  margin: 0;
  margin-bottom: 0.5rem;
}

.header-content p {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

.create-board-section {
  max-width: 1200px;
  margin: -2rem auto 2rem;
  padding: 0 2rem;
}

.create-board-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  align-items: center;
}

.board-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.board-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  outline: none;
}

.create-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.create-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.create-btn:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.boards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.board-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.board-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
}

.board-card-content {
  padding: 1.5rem;
  cursor: pointer;
}

.board-info h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #2d3748;
}

.board-info p {
  margin: 0.5rem 0;
  color: #718096;
  font-size: 0.875rem;
}

.board-stats {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #718096;
  font-size: 0.875rem;
}

.members-preview {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.member-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 0.875rem;
}

.member-avatar.more {
  background: #718096;
}

.board-actions {
  display: flex;
  border-top: 1px solid #e2e8f0;
  padding: 1rem;
  gap: 0.5rem;
  background: #f8fafc;
}

.action-btn {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
}

.action-btn.edit {
  background: #4299e1;
}
.action-btn.invite {
  background: #48bb78;
}
.action-btn.delete {
  background: #f56565;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.edit-input {
  width: calc(100% - 2rem); /* ลบ padding ออกจากความกว้าง */
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  margin: 1rem 0;
  font-size: 1rem;
  box-sizing: border-box; /* เพิ่ม box-sizing เพื่อรวม padding ในความกว้าง */
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.invite-form {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  width: 100%;
}

.invite-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
}

.invite-btn {
  padding: 0.75rem 1.5rem;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  white-space: nowrap; /* ป้องกันข้อความแตก */
  transition: all 0.2s ease;
}

.invite-btn i {
  font-size: 0.9rem;
}

.invite-btn:hover {
  background: #3182ce;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.invite-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.current-members {
  margin-top: 2rem;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content h1 {
    font-size: 2rem;
  }

  .create-board-card {
    flex-direction: column;
  }

  .create-btn {
    width: 100%;
    justify-content: center;
  }

  .boards-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0 1rem;
  }
}
</style>
