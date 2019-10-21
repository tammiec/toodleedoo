// jQuery code for manipulating the to-do items

// creates HTML for each to-do list
const createListCard = function(obj) {
  return `
  <div class='card-deck'>
    <div class="card">
      <h5 class="card-header">To ${category.name}</h5>
      <div class="card-body">
        <ul class="list-group list-group-flush"></ul>
      </div>
    </div>
  `;
};

$(() => {
  $('.card ul li').click(function() {
    $(this).toggleClass('checked');
  })

  $('.card ul li').dblclick(function() {
    $(this).toggleClass('important');
  })

  $('.card ul li').append('<span>&#x2715</span>');

  $('.card ul li span').click(function() {
    $(this).parent().hide();
  });

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
      $('#' + cat[0].key).append(`<li class="list-group-item">${inputTask.val()}</li>`);
      // alert(cat[0].title);
      $('#inputTask').val('');
    } catch (err) {
      console.error(err);
    }
  };
});
