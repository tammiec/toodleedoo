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
  })
});
