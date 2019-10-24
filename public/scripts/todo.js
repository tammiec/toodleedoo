// creates list items for existing tasks
const renderTasks = function(tasks) {
  for (let task of tasks) {
    let imgSrc = '../images/not-important.png';
    if (task.important) {
      imgSrc = '../images/important-a.png';
    }
    if (task.status_id === 2) {
      $('#' + task.key).append(`
        <li class="list-group-item checked-todo" id="task-${task.id}" class="draggable" draggable="true" ondragstart="drag(event)" data-toggle="modal" data-target="#taskModal" data-name="${task.title}" data-desc="${task.description}">
          <img class='checkbox checked' src="../images/checked.png">
          <span id="task-text-${task.id}" class='task-name'>${task.title}</span>
          <span class='x'>&#x2715</span>
          <span class='star'><img class="marked-important" src="${imgSrc}"></span>
        </li>
      `);
    } else if (task.status_id === 1) {
      $('#' + task.key).append(`
        <li class="list-group-item" id="task-${task.id}" class="draggable" draggable="true" ondragstart="drag(event)" data-toggle="modal" data-target="#taskModal" data-name="${task.title}" data-desc="${task.description}">
          <img class='checkbox' src="../images/not-checked.png">
          <span id="task-text-${task.id}" class='task-name'>${task.title}</span>
          <span class='x'>&#x2715</span>
          <span class='star'><img class="marked-important" src="${imgSrc}"></span>
        </li>
      `);
    } else if (task.status_id === 3) {
      $('#' + task.key).append(`
        <li class="list-group-item" id="task-${task.id}" class="draggable" draggable="true" ondragstart="drag(event)" data-toggle="modal" data-target="#taskModal" data-name="${task.title}" data-desc="${task.description}">
          <img class='undo' src="../images/undo2.png">
          <span class='task-name'>${task.title}</span>

          <span class='star'><img class="marked-important" src="${imgSrc}"></span>
        </li>
      `);
    }
  }
};


// loads all tasks from database
const loadTasks = function(route) {

  //added: empties all ul before adding li elements
  //this is to accomodate the archived view functionality
  $('.refill').each(function() {
    $(this).empty();
  });

  $.get(route, function(tasks) {

    renderTasks(tasks);
    //new, putting into a loop
    for (let task of tasks) {
      toDoBehaviour(task.id);
    }
  });
};

loadTasks('/todo');
