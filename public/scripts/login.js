$(() => {
  // let hash = window.location.hash;

  $('#register-form').hide();

  $(".tab").click(function() {
    var x = $(this).attr('id');
    if (x === 'register') {
      $("#login").removeClass('select');
      $("#register").addClass('select');
      $("#login-form").hide();
      $("#register-form").show();
    } else {
      $("#register").removeClass('select');
      $("#login").addClass('select');
      $("#register-form").hide();
      $("#login-form").show();
    };
  });
});
