import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  update,
  remove
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDQgcypcmyO3ZvMeNFNsJH0Qf7wS1eES1k",
  authDomain: "todovibe-53dc4.firebaseapp.com",
  databaseURL: "https://todovibe-53dc4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "todovibe-53dc4",
  storageBucket: "todovibe-53dc4.firebasestorage.app",
  messagingSenderId: "211515933642",
  appId: "1:211515933642:web:176ac26eb2aed747ab8533"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const todosRef = ref(database, "todos");

const todoForm = document.getElementById("todo-form");
const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("prioritySelect");
const dueDateInput = document.getElementById("dueDateInput");
const editingIdInput = document.getElementById("editingId");
const submitButton = document.getElementById("submitButton");
const cancelEditButton = document.getElementById("cancelEdit");
const todoList = document.getElementById("todoList");
const emptyState = document.getElementById("emptyState");
const totalCountEl = document.getElementById("totalCount");
const activeCountEl = document.getElementById("activeCount");
const completedCountEl = document.getElementById("completedCount");
const progressBar = document.getElementById("progressBar");
const listCountLabel = document.getElementById("listCountLabel");
const toastEl = document.getElementById("toast");

let todos = {};
let toastTimer = null;

onValue(todosRef, (snapshot) => {
  todos = snapshot.val() || {};
  renderTodos();
});

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();
  const priority = prioritySelect.value;
  const dueDate = dueDateInput.value ? dueDateInput.value : null;
  const editingId = editingIdInput.value;

  if (!text) {
    showToast("할 일을 입력해주세요.", true);
    taskInput.focus();
    return;
  }

  if (editingId) {
    const todoRef = ref(database, `todos/${editingId}`);
    update(todoRef, {
      text,
      priority,
      dueDate
    })
      .then(() => {
        showToast("할 일이 수정되었습니다.");
        resetForm();
      })
      .catch((error) => {
        console.error("할 일 수정 실패", error);
        showToast("할 일 수정에 실패했습니다.", true);
      });
  } else {
    push(todosRef, {
      text,
      priority,
      dueDate,
      completed: false,
      createdAt: Date.now()
    })
      .then(() => {
        showToast("새로운 할 일이 등록되었습니다.");
        resetForm();
      })
      .catch((error) => {
        console.error("할 일 등록 실패", error);
        showToast("할 일 등록에 실패했습니다.", true);
      });
  }
});

cancelEditButton.addEventListener("click", () => {
  resetForm();
  showToast("수정을 취소했습니다.");
});

todoList.addEventListener("click", (event) => {
  const target = event.target;
  const actionId = target.dataset.id;

  if (target.classList.contains("todo-checkbox")) {
    const todoRef = ref(database, `todos/${target.dataset.id}`);
    update(todoRef, {
      completed: target.checked,
      completedAt: target.checked ? Date.now() : null
    }).catch((error) => {
      console.error("상태 변경 실패", error);
      showToast("상태 변경에 실패했습니다.", true);
    });
    return;
  }

  if (!actionId) {
    return;
  }

  if (target.classList.contains("edit")) {
    const todo = todos[actionId];
    if (!todo) {
      showToast("대상을 찾을 수 없습니다.", true);
      return;
    }
    taskInput.value = todo.text;
    prioritySelect.value = todo.priority || "medium";
    dueDateInput.value = todo.dueDate || "";
    editingIdInput.value = actionId;
    submitButton.textContent = "수정 저장";
    cancelEditButton.classList.remove("hidden");
    focusInput(taskInput);
    return;
  }

  if (target.classList.contains("delete")) {
    if (!confirm("정말 삭제하시겠습니까?")) {
      return;
    }
    const todoRef = ref(database, `todos/${actionId}`);
    remove(todoRef)
      .then(() => showToast("할 일을 삭제했습니다."))
      .catch((error) => {
        console.error("할 일 삭제 실패", error);
        showToast("할 일 삭제에 실패했습니다.", true);
      });
  }
});

function renderTodos() {
  const entries = Object.entries(todos).map(([id, todo]) => ({ id, ...todo }));
  entries.sort((a, b) => {
    if (!a.createdAt) return 1;
    if (!b.createdAt) return -1;
    return b.createdAt - a.createdAt;
  });

  todoList.innerHTML = "";

  if (entries.length === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
  }

  entries.forEach((todo) => {
    const item = document.createElement("li");
    item.classList.add("todo-item");
    if (todo.completed) {
      item.classList.add("completed");
    }

    item.innerHTML = `
      <div class="todo-main">
        <input type="checkbox" class="todo-checkbox" data-id="${todo.id}" ${todo.completed ? "checked" : ""}>
        <div class="todo-body">
          <p class="todo-text">${escapeHtml(todo.text)}</p>
          <div class="todo-meta">
            <span class="priority-badge priority-${todo.priority || "medium"}">
              ${getPriorityLabel(todo.priority)} 우선
            </span>
            ${todo.dueDate ? `<span class="due-date">마감: ${formatDate(todo.dueDate)}</span>` : ""}
            ${todo.createdAt ? `<span class="created-date">등록: ${formatTimestamp(todo.createdAt)}</span>` : ""}
          </div>
        </div>
      </div>
      <div class="todo-actions">
        <button class="icon-button edit" data-id="${todo.id}">수정</button>
        <button class="icon-button delete" data-id="${todo.id}">삭제</button>
      </div>
    `;

    const checkbox = item.querySelector(".todo-checkbox");
    checkbox.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    todoList.appendChild(item);
  });

  updateStats(entries);
}

function updateStats(entries) {
  const total = entries.length;
  const completed = entries.filter((todo) => todo.completed).length;
  const active = total - completed;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  totalCountEl.textContent = total;
  completedCountEl.textContent = completed;
  activeCountEl.textContent = active;
  progressBar.style.width = `${progress}%`;
  listCountLabel.textContent = `총 ${total}건`;
}

function resetForm() {
  todoForm.reset();
  prioritySelect.value = "medium";
  editingIdInput.value = "";
  submitButton.textContent = "등록하기";
  cancelEditButton.classList.add("hidden");
}

function showToast(message, isError = false) {
  if (!toastEl) return;

  toastEl.textContent = message;
  toastEl.classList.remove("hidden", "error", "show");
  void toastEl.offsetWidth;
  if (isError) {
    toastEl.classList.add("error");
  }
  toastEl.classList.add("show");

  if (toastTimer) {
    clearTimeout(toastTimer);
  }

  toastTimer = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 2500);
}

function getPriorityLabel(priority) {
  switch (priority) {
    case "high":
      return "높음";
    case "low":
      return "낮음";
    default:
      return "보통";
  }
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

function formatTimestamp(timestamp) {
  const date = new Date(Number(timestamp));
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function focusInput(element) {
  requestAnimationFrame(() => {
    element.focus();
    const value = element.value;
    element.setSelectionRange(value.length, value.length);
  });
}
