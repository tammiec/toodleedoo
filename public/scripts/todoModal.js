// Renders each resource
const renderResources = function(resources) {
  for (let resource of resources) {
    console.log('render', resource);
    $('#additional-resources').append(`<li id="resource-id-${resource.id}"class="list-group-item"><a target='_blank' href="${resource.namelink[0][1]}">${resource.namelink[0][0]}</a><span class='x'>&#x2715</span></li>`)
  };
};

// AJAX DELETE - delete resource
const deleteResource = async (resourceId) => {
  try {
    await $.ajax(`/todo/resources?resourceId=${resourceId}`, { method: 'DELETE'});
  } catch (err) {
    console.log(err);
  }
};

const deleteResourceListener = function(resourceId) {
  $(`#resource-id-${resourceId} span`).click(function(event) {
    event.stopPropagation();
    deleteResource(resourceId);
    $(this).parent().remove();
  });
};

// loads resources when modal is called
const loadResources = function(taskId) {
  $.get(`/todo/resources?taskId=${taskId}`, (resources) => {
    console.log('load', resources)
    renderResources(resources);
    for (let resource of resources) {
      deleteResourceListener(resource.id);
    }
  });
};

// AJAX PUT - update task in database
const updateTask = async (taskId, taskName, taskDesc) => {
  try {
    await $.ajax(`/todo/update?taskId=${taskId}&taskName=${taskName || null}&taskDesc=${taskDesc || null}`, {method: 'PUT'});
  } catch (err) {
    console.error(err);
  }
};


// Open modal with task information
$('#taskModal').on('show.bs.modal', async function (event) {
  try {
    const button = $(event.relatedTarget);
    const taskName = button.data('name');
    const taskDesc = button.data('desc');
    const createdDate = new Date(button.data('created')).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
    const taskId = button.attr('id').split('-')[1];
    const modal = $(this);
    await loadResources(taskId);
    $('#resource-form').hide();
    $('#suggested-resource-form').hide();
    modal.find('.modal-title').text('Edit Task: ' + taskName);
    modal.find('.modal-body #task-name').val(taskName);
    modal.find('.modal-body #task-desc').val(taskDesc);
    modal.find('.modal-body #task-id').val(taskId);
    modal.find('.modal-body #task-created span').text(createdDate);
  } catch (err) {
    console.log(err);
  }
});

// Defines submit task update behaviour
const submitUpdate = function() {
  const taskId = $('#task-id').val();
  const taskName = $('#task-name').val();
  const taskDesc = $('#task-desc').val();
  // console.log(taskId, taskName, taskDesc);
  updateTask(taskId, taskName, taskDesc);
  $('#taskModal').modal('hide');
  $("#task-text-" + taskId).text(taskName);
  $('#task-' + taskId).data('desc', taskDesc);
  $('#task-' + taskId).data('name', taskName);
  const dat = $('#task-' + taskId).data('desc');
};

// Submits a new resource for a task
const submitNewResource = async function() {
  const taskId = $('#task-id').val();
  const resourceName = $('#resource-name').val();
  const resourceLink = $('#resource-link').val();
  console.log(taskId, resourceName, resourceLink)
  try {
    const resource = await $.ajax(`/todo/resources?taskId=${taskId}&resourceName=${resourceName}&resourceLink=${resourceLink}`, { method: 'POST' });
    const resourceId = resource.rows[0].id;
    $('#additional-resources').append(`<li id="resource-id-${resourceId}"class="list-group-item"><a target='_blank' href="${resourceLink}">${resourceName}</a><span class='x'>&#x2715</span></li>`);
    $('#resource-name').val('');
    $('#resource-link').val('');
    $('#resource-form').slideUp();
    deleteResourceListener(resourceId);
  } catch (err) {
    console.log(err);
  }
};

// clear all resources when modal is closed
$('#taskModal').on('hidden.bs.modal', () => {
  $('#additional-resources li').remove();
});

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

// click to expand resource form
$('#additional-resources span').click((e) => {
  const target = $(e.target);
  if (target.is('#additional-resources span')) {
    $('#resource-form').slideToggle();
  }
});

// submit resource on click
$('#submit-resource').click(() => {
  submitNewResource();
});

// AJAX POST - duplicate task for new user
const shareTask = async (email, taskId) => {
  try {
    const task = await $.ajax(`/todo/share?taskId=${taskId}&email=${email}`, {method: 'POST'});
    console.log('task:', task);
    return task
  } catch (err) {
    console.error(err);
  }
};

$('#submit-share-task').click( async () => {
  const taskId = $('#task-id').val();
  const email = $('#share-email');
  const shared = await shareTask(email.val(), taskId);
  email.val('');
  console.log(shared)
  $('#share-message').text(shared).fadeIn().delay(1000).fadeOut();
});
