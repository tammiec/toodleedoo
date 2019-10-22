const showRegister = () => {
  $("#login").removeClass('select');
  $("#register").addClass('select');
  $("#login-form").hide();
  $("#register-form").show();
};

const showLogin = () => {
  $("#register").removeClass('select');
  $("#login").addClass('select');
  $("#register-form").hide();
  $("#login-form").show();
};

$(() => {
  $('#register-form').hide();

  let hash = window.location.hash;
  console.log(hash);

  if (hash.length > 0) {
    if (hash === '#register-form') {
      showRegister();
    }
  };

  $(".tab").click(function() {
    var x = $(this).attr('id');
    if (x === 'register') {
      showRegister();
    } else {
      showLogin();
    };
  });
});
