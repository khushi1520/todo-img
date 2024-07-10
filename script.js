const newTaskInput = document.getElementById("new-task");
const addTaskButton = document.getElementById("add-task");
const taskList = document.getElementById("task-list");

// Get existing tasks from local storage (if any), or create an empty array
let tasks = localStorage.getItem("tasks") ? JSON.parse(localStorage.getItem("tasks")) : [];

// Function to render tasks
function renderTasks() {
  taskList.innerHTML = ""; // Clear existing list
  tasks.forEach((task) => {
    const listItem = document.createElement("li");
    listItem.className = "task-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => toggleTaskCompletion(task));
    listItem.appendChild(checkbox);

    const taskLabel = document.createElement("label");
    taskLabel.style.width = "75%";
    taskLabel.textContent = task.text;
    listItem.appendChild(taskLabel);

    // Edit Icon
    const editIcon = document.createElement("span");
    editIcon.className = "edit-task fa fa-edit"; // Font Awesome class for edit icon
    editIcon.style.fontSize = "20px"; // Set edit icon size (optional)
    editIcon.addEventListener("click", () => {
      taskLabel.contentEditable = "true";
      taskLabel.focus();
    });
    listItem.appendChild(editIcon);

    taskLabel.addEventListener("blur", () => {
      const newText = taskLabel.textContent.trim();
      if (newText && newText !== task.text) { // Update only if text changed
        task.text = newText;
        localStorage.setItem("tasks", JSON.stringify(tasks));

        // Update displayed text (optional)
        taskLabel.textContent = newText; // Show edited text immediately (optional)
      }
      taskLabel.contentEditable = "false"; // Disable editing after blur
    });

    // File Upload Input for Image, Video, and PDF
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.style.display = task.completed ? "block" : "none";
    fileInput.accept = "image/*,video/*,application/pdf";
    fileInput.addEventListener("change", (event) => handleFileUpload(event, task));
    listItem.appendChild(fileInput);

    // File name display
    const fileNameDisplay = document.createElement("span");
    fileNameDisplay.className = "file-name";
    if (task.file) {
      fileNameDisplay.textContent = task.file.name;
    }
    listItem.appendChild(fileNameDisplay);

    // Preview for Image, Video, and PDF
    if (task.file) {
      const previewContainer = document.createElement("div");
      previewContainer.className = "file-preview";
      if (task.file.type.startsWith('image')) {
        const imagePreview = document.createElement("img");
        imagePreview.src = task.file.url;
        imagePreview.style.maxWidth = "100px";
        imagePreview.addEventListener("click", () => openPreview(task.file.url));
        previewContainer.appendChild(imagePreview);
      } else if (task.file.type.startsWith('video')) {
        const videoPreview = document.createElement("video");
        videoPreview.src = task.file.url;
        videoPreview.width = 200; // Set video preview width
        videoPreview.controls = true; // Show video controls
        previewContainer.appendChild(videoPreview);
      } else if (task.file.type === 'application/pdf') {
        const pdfPreview = document.createElement("embed");
        pdfPreview.src = task.file.url;
        pdfPreview.width = 200;
        pdfPreview.height = 200;
        pdfPreview.type = "application/pdf";
        previewContainer.appendChild(pdfPreview);
      }
      listItem.appendChild(previewContainer);
    }

    // Delete Button
    const deleteButton = document.createElement("span");
    deleteButton.className = "delete-task fa fa-trash";
    deleteButton.style.fontSize = "20px";
    deleteButton.addEventListener("click", () => deleteTask(task));
    listItem.appendChild(deleteButton);

    taskList.appendChild(listItem);

    if (task.completed) {
      listItem.classList.add("completed");
      fileInput.style.display = "block"; // Show file input if task is completed
    }
  });
}

// Function to delete a task
function deleteTask(task) {
  const taskIndex = tasks.indexOf(task); // Find the index of the task in the array
  if (taskIndex !== -1) {
    tasks.splice(taskIndex, 1); // Remove the task from the tasks array
    localStorage.setItem("tasks", JSON.stringify(tasks)); // Update local storage
    renderTasks(); // Update the displayed task list
  }
}

// Function to add a new task
function addTask() {
  const newTaskText = newTaskInput.value.trim();

  if (newTaskText) {
    const newTask = { text: newTaskText, completed: false, file: null };
    tasks.push(newTask);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
    newTaskInput.value = "";
  }
}

// Function to toggle task completion
function toggleTaskCompletion(task) {
  task.completed = !task.completed;
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
}

// Function to handle file upload
function handleFileUpload(event, task) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      task.file = { url: e.target.result, type: file.type, name: file.name }; // Save file URL, type, and name
      localStorage.setItem("tasks", JSON.stringify(tasks));
      renderTasks();
    };
    reader.readAsDataURL(file); // Read the file as a data URL
  }
}

// Function to open preview
function openPreview(url) {
  const newWindow = window.open();
  if (url.startsWith('data:image')) {
    newWindow.document.write(`<img src="${url}" style="max-width:100%">`);
  } else if (url.startsWith('data:video')) {
    newWindow.document.write(`<video src="${url}" controls style="max-width:100%">`);
  } else if (url.endsWith('.pdf')) {
    newWindow.document.write(`<embed src="${url}" type="application/pdf" width="100%" height="100%">`);
  }
}

// Attach event listener to the add task button
addTaskButton.addEventListener("click", addTask);

// Render tasks initially (if any are stored)
renderTasks();
