$(() => {
  $("#new-name, #new-email, #new-password, #enter-password").hide();

  $(".edit").click(function() {
    $(this).next().slideToggle(() => {
      if ($("#new-name").is(":hidden") && $("#new-email").is(":hidden") && $("#new-password").is(":hidden")) {
        $("#enter-password").slideUp();
      };
    });
    $("#enter-password").slideDown();
  });

});
