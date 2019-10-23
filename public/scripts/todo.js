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

// AJAX DELETE - delete task item
const deleteTask = async (taskId) => {
  try {
    await $.ajax(`/todo/delete?taskId=${taskId}`, { method: 'PUT'});
  } catch (err) {
    console.error(err);
  }
};

const updateStatus = async (taskId, important = false) => {
  try {
    //add conditional
    if (important) {
      await $.ajax(`/todo/update?taskId=${taskId}&important=${important}`, {method: 'PUT'});
    } else {
      await $.ajax(`/todo/update?taskId=${taskId}`, {method: 'PUT'});
    }
  } catch (err) {
    console.error(err);
  }
};

const updateTitle = async (taskId, taskName) => {
  try {
    await $.ajax(`/todo/update?taskId=${taskId}&taskName=${taskName}`, {method: 'PUT'});
  } catch (err) {
    console.error(err);
  }
}

// Defines listeners for individual tasks
// const toDoBehaviour = function() {
const toDoBehaviour = function(id) {
  // Mark task item as complete
  // $('.list-group-item').click(function() {
  $('#task-' + id).click(function(event) {
    const taskId = ($(this).attr('id')).split('-')[1];
    // if ($(event.target) === $(this)) {
    $(this).toggleClass('checked');
    updateStatus(taskId);
    // }
  });

  // Mark task item as important
  // $('.list-group-item').dblclick(function() {
  //   $(this).toggleClass('important');
  // });

  // $('.list-group-item span').click(function() {
  $('#task-' + id + ' .x').click(function(event) {
    const taskId = ($(this).parent().attr('id')).split('-')[1];
    // console.log('taskId', taskId);
    deleteTask(taskId);
    $(this).parent().remove();
  });

  //change the star img when clicked
  $('#task-' + id + ' .star img').click(function(event) {
    event.stopPropagation();
    console.log('id passed into parent--->', id);
    let importance = $(this).attr('src');
    const taskName = ($(this).siblings('.task-name').val());
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

  // click on the edit button to edit task
  $('#task-' + id + ' .task-name').each(function(event) {
    //Reference the Label.
    const label = $(this);
    const editButton = $(this).siblings('.edit-task');
    //Add a TextBox next to the Label.
    label.after("<input type='text' style='display:none'/>");
    //Reference the TextBox.
    const textbox = $(this).next();
    //Set the name attribute of the TextBox.
    textbox[0].name = this.id.replace("lbl", "txt");
    //Assign the value of Label to TextBox.
    textbox.val(label.html());
    //When Label is clicked, hide Label and show TextBox.
    editButton.click(function (event) {
      event.stopPropagation();
      $(label).hide();
      $(label).next().show();
    });
    //When focus is lost from TextBox, hide TextBox and show Label.
    textbox.keypress(function (e) {
      if (e.which === 13) {
        const taskId = ($(this).parent().attr('id')).split('-')[1];
        const taskName = $(this).val();
        updateTitle(taskId, taskName);
        $(this).hide();
        $(this).prev().html(taskName);
        $(this).prev().show();
      }
    });
});
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
        <li class="list-group-item checked" id="task-${task.id}" class="draggable" draggable="true" ondragstart="drag(event)">
          <span class='task-name'>${task.title}</span>
          <span class='x'>&#x2715</span>
          <span class='star'><img class="marked-important" src="${imgSrc}"></span>
          <span class='edit-task'>
          <img src="../images/edit.png"></span>
        </li>
      `);
    } else if (task.status_id === 1) {
      $('#' + task.key).append(`
        <li class="list-group-item" id="task-${task.id}" class="draggable" draggable="true" ondragstart="drag(event)">
          <span class='task-name'>${task.title}</span>
          <span class='x'>&#x2715</span>
          <span class='star'><img class="marked-important" src="${imgSrc}"></span>
          <span class='edit-task'><img src="../images/edit.png"></span>
        </li>
      `);
    }
  }
};

// loads all tasks from database
const loadTasks = function() {
  $.get('/todo', function(tasks) {
    renderTasks(tasks);
    //new, putting into a loop
    for (let task of tasks) {
      toDoBehaviour(task.id);
    }
  });
};

// Document Ready
$(() => {

  loadTasks();

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
          <li class="list-group-item" id="task-${cat[0].taskId}" class="draggable" draggable="true" ondragstart="drag(event)">
          <span class='task-name'>${inputTask.val()}</span>
          <span class='x'>&#x2715</span>
          <span class='star'><img class="marked-important" src="../images/not-important.png"></span>
          <span class='edit-task'><img src="../images/edit.png"></span>
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
});
