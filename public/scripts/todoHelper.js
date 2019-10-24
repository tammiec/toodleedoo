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

//when the ARCHIVED link is clicked it calls this functin
const showArchived = () => {
  loadTasks('/todo?archived=true');
  $('#hideMe').slideUp('slow');
  $('#burger').prop('checked', false);
};

// AJAX GET - Get category from server
const getCategory = async () => {
  const inputTask = $('#inputTask');
  console.log('theinputTYPE:', typeof inputTask.val());
  try {
    const cat = await $.ajax('/category?input=' + inputTask.val(), { method: 'GET' });
    $('#' + cat[0].key).append(`
      <li class="list-group-item" id="task-${cat[0].taskId}" class="draggable" draggable="true" ondragstart="drag(event)" data-toggle="modal" data-target="#taskModal" data-name="${inputTask.val()}" data-task-desc="">
        <img class='checkbox' src="../images/not-checked.png">
        <span id="task-text-${cat[0].taskId}" class='task-name'>${inputTask.val()}</span>
        <span class='x'>&#x2715</span>
        <span class='star'><img class="marked-important" src="../images/not-important.png"></span>
      </li>`
    );
    $('#inputTask').val('');
    toDoBehaviour(cat[0].taskId);
  } catch (err) {
    console.error(err);
  }
};

