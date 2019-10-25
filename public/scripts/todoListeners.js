// Defines listeners for individual tasks
const toDoBehaviour = function(id) {
  // Mark task item as complete
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
    updateStatus(id);
    $(this).parent().remove();
  });

  $('#task-' + id + ' .x').click(function(event) {
    event.stopPropagation()
    const taskId = ($(this).parent().attr('id')).split('-')[1];
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

};

$('#getCategoryBtn').on('click', (e) => {

  getCategory();
});

$('#inputTask').keypress(function (e) {
  if (e.which == 13) {
    getCategory();
    return false;    //<---- Add this line
  }
});

$('#clearAll').click(function() {
  let allChecked = $('.checked-todo');
  handleChecked(allChecked);
});
