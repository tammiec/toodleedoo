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

  const photoImg = $('#profile-photo');
  const photoBtn = $('#photo-upload');
  photoImg.on('click', e => {
    photoBtn.trigger('click');
  });
  photoBtn.on('change', e => {
    const input = e.target;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = e => photoImg.attr('src', e.target.result);
      reader.readAsDataURL(input.files[0]);
    }
  });

});
