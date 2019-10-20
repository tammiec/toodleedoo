// jQuery code for manipulating the to-do items
$(() => {
  $('ul li').click(() => {
    $(this).toggleClass('checked');
  })
});
