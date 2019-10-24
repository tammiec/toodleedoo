// jQuery code for manipulating the to-do items

// // creates HTML for each to-do list
// const createListCard = function(obj) {
//   return `
//   <div class='card-deck'>
//     <div class="card">
//       <h5 class="card-header">To ${category.name}</h5>
//       <div class="card-body">
//         <ul class="list-group list-group-flush"></ul>
//       </div>
//     </div>
//   `;
// };

const deleteTask = async (taskId) => {
  try {
    if (taskId !== undefined) {
      await $.ajax(`/todo/delete?taskId=${taskId}`, { method: 'PUT'});
    }
  } catch (err) {
    console.log(err);
  }
};


const updateStatus = async (taskId, important = false) => {
  try {
    if (important) {
      await $.ajax(`/todo/update?taskId=${taskId}&important=${important}`, {method: 'PUT'});
    } else {
      await $.ajax(`/todo/update?taskId=${taskId}`, {method: 'PUT'});
    }
  } catch (err) {
    console.error(err);
  }
};

const handleChecked = (ob) => {
  ob.each(function() {
    let id = $(this)[0].id.split('-')[1];

    deleteTask(id);
    $(this).remove();
  });
};


const updateTask = async (taskId, taskName, taskDesc) => {
  try {
    await $.ajax(`/todo/update?taskId=${taskId}&taskName=${taskName || null}&taskDesc=${taskDesc || null}`, {method: 'PUT'});
  } catch (err) {
    console.error(err);
  }
};

//when the ARCHIVED link is clicked it calls this function
const showArchived = () => {
  loadTasks('/todo?archived=true');
  $('#hideMe').slideUp('slow');
  $('#burger').prop('checked', false);
};

// Defines listeners for individual tasks
// const toDoBehaviour = function() {
const toDoBehaviour = function(id) {
  // Mark task item as complete
  // $('.list-group-item').click(function() {
  $(`#task-${id} .checkbox`).click(function(event) {
    event.stopPropagation();
    $(this).toggleClass('checked');
    $(this).parent().toggleClass('checked-todo');
    updateStatus(id);
    if ($(this).hasClass('checked')) {
      $(this).attr('src', '../images/checked.png');
    } else {
      $(this).attr('src', '../images/not-checked.png');
    }
  });


  //the undo button appears in the archived view,
  //when clicked, sets status_id = 1 and removes todo from the DOM
  $('#task-' + id + ' .undo').click(function(event) {
    event.stopPropagation();
    // let taskId = 'task-' + id;
    updateStatus(id);
    $(this).parent().remove();
  });

  $('#task-' + id + ' .x').click(function(event) {
    event.stopPropagation()
    const taskId = ($(this).parent().attr('id')).split('-')[1];
    // console.log('taskId', taskId);
    deleteTask(taskId);
    $(this).parent().remove();
  });

  //change the star img when clicked
  $('#task-' + id + ' .star img').click(function(event) {
    event.stopPropagation();
    let importance = $(this).attr('src');
    if (importance === '../images/not-important.png') {
      //call updateStatus with 'true' as a string
      updateStatus(id, 'true');
      importance = '../images/important-a.png';
    } else {
      //call updateStatus with 'false' as a string
      updateStatus(id, 'false');
      importance = '../images/not-important.png';
    }
    $(this).attr('src', importance);
  });

  // // click on the edit button to edit task
  // $('#task-' + id + ' .task-name').each(function(event) {
  //   //Reference the Label.
  //   const label = $(this);
  //   const editButton = $(this).siblings('.edit-task');
  //   //Add a TextBox next to the Label.
  //   label.after("<input type='text' style='display:none'/>");
  //   //Reference the TextBox.
  //   const textbox = $(this).next();
  //   //Set the name attribute of the TextBox.
  //   textbox[0].name = this.id.replace("lbl", "txt");
  //   //Assign the value of Label to TextBox.
  //   textbox.val(label.html());
  //   //When Label is clicked, hide Label and show TextBox.
  //   editButton.click(function (event) {
  //     event.stopPropagation();
  //     $(label).hide();
  //     $(label).next().show();
  //   });
  //   //When focus is lost from TextBox, hide TextBox and show Label.
  //   textbox.keypress(function (e) {
  //     if (e.which === 13) {
  //       const taskId = ($(this).parent().attr('id')).split('-')[1];
  //       const taskName = $(this).val();
  //       updateTitle(taskId, taskName);
  //       $(this).hide();
  //       $(this).prev().html(taskName);
  //       $(this).prev().show();
  //     }
  //   });
  // });
};

// creates list items for existing tasks
const renderTasks = function(tasks) {
  for (let task of tasks) {
    let imgSrc = '../images/not-important.png';
    if (task.important) {
      imgSrc = '../images/important-a.png';
    }
    if (task.status_id === 2) {
      $('#' + task.key).append(`
        <li class="list-group-item checked-todo" id="task-${task.id}" class="draggable" draggable="true" ondragstart="drag(event)" data-toggle="modal" data-target="#exampleModal" data-task-name="${task.title}" data-task-desc="${task.description}">
          <img class='checkbox checked' src="../images/checked.png">
          <span class='task-name'>${task.title}</span>
          <span class='x'>&#x2715</span>
          <span class='star'><img class="marked-important" src="${imgSrc}"></span>
        </li>
      `);
    } else if (task.status_id === 1) {
      $('#' + task.key).append(`
        <li class="list-group-item" id="task-${task.id}" class="draggable" draggable="true" ondragstart="drag(event)" data-toggle="modal" data-target="#exampleModal" data-task-name="${task.title}" data-task-desc="${task.description}">
          <img class='checkbox' src="../images/not-checked.png">
          <span class='task-name'>${task.title}</span>
          <span class='x'>&#x2715</span>
          <span class='star'><img class="marked-important" src="${imgSrc}"></span>
        </li>
      `);
    } else if (task.status_id === 3) {
      $('#' + task.key).append(`
        <li class="list-group-item" id="task-${task.id}" class="draggable" draggable="true" ondragstart="drag(event)" data-toggle="modal" data-target="#exampleModal" data-task-name="${task.title}" data-task-desc="${task.description}">
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

// Document Ready
$(() => {


  $('#clearAll').click(function() {
    let allChecked = $('.checked-todo');
    handleChecked(allChecked);
  });


  loadTasks('/todo');

  const getCategoryBtn = $('#getCategoryBtn');
  const inputTask = $('#inputTask');

  getCategoryBtn.on('click', (e) => {
    getCategory();
  });

  inputTask.keypress(function (e) {
    if (e.which == 13) {
      getCategory();
      return false;    //<---- Add this line
    }
  });
  // AJAX GET - Get category from server
  const getCategory = async () => {
    try {
      console.log(inputTask.val());
      const cat = await $.ajax('/category?input=' + inputTask.val(), { method: 'GET' });
      console.log(cat[0]);
      console.log('#' + cat[0].key);
      // console.log(lanes);
      $('#' + cat[0].key).append(`
        <li class="list-group-item" id="task-${cat[0].taskId}" class="draggable" draggable="true" ondragstart="drag(event)" data-toggle="modal" data-target="#exampleModal" data-task-name="${inputTask.val()}" data-task-desc="">
          <img class='checkbox' src="../images/not-checked.png">
          <span class='task-name'>${inputTask.val()}</span>
          <span class='x'>&#x2715</span>
          <span class='star'><img class="marked-important" src="../images/not-important.png"></span>
        </li>`
      );
      // alert(cat[0].title);
      $('#inputTask').val('');
      // toDoBehaviour();
      toDoBehaviour(cat[0].taskId);
    } catch (err) {
      console.error(err);
    }
  };

  // Open modal with task information
  $('#exampleModal').on('show.bs.modal', function (event) {
    const button = $(event.relatedTarget);
    const taskName = button.data('task-name');
    const taskDesc = button.data('task-desc');
    const taskId = button.attr('id').split('-')[1];
    const modal = $(this);
    modal.find('.modal-title').text('Edit Task: ' + taskName);
    modal.find('.modal-body #task-name').val(taskName);
    modal.find('.modal-body #task-desc').val(taskDesc);
    modal.find('.modal-body #task-id').val(taskId);
  });

  // Defines submit task update behaviour
  const submitUpdate = function() {
    const taskId = $('#task-id').val();
    const taskName = $('#task-name').val();
    const taskDesc = $('#task-desc').val();
    console.log(taskId, taskName, taskDesc);
    updateTask(taskId, taskName, taskDesc);
    $('#exampleModal').modal('hide');
    $('#task-' + taskId + ' .task-name').replaceWith(taskName);
  };

  // Submits task update on click
  $('#update-task-btn').click(() => {
    submitUpdate();
  });

  // Submits task update when user enters
  $('.modal-body #task-name, .modal-body #task-desc').keypress((e) => {
    if (e.which === 13) {
      submitUpdate();
    }
  });

});
