$(() => {
  $("#new-email, #new-password").hide();
  $("#enter-password").hide();

  $(".edit").click(function() {
    $(this).next().slideToggle();
    $("#enter-password").slideDown();
  });

});
