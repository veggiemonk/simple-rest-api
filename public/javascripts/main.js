$(function(){
  $('#search').on('keyup', function(e){
    if(e.keyCode === 13) { //enter key
      var parameters = { search: $(this).val() };
      $.get( '/users/?'+ parameters, function(data) {
        $('#results').html(data);
      });
    };
  });
});

