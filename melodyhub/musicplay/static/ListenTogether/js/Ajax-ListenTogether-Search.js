<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<script>
$(document).ready(function() {
    $("#search-input").keyup(function() {
        var query = $(this).val();
        if (query.length > 2) {  // Trigger search for at least 3 characters
            $.ajax({
                url: '{% url "search" %}',
                data: {
                    'term': query
                },
                dataType: 'json',
                success: function(data) {
                    $('#search-results').empty();
                    $.each(data, function(index, element) {
                        $('#search-results').append($('<div>', {
                            text: element.name  // Adjust according to your data fields
                        }));
                    });
                }
            });
        } else {
            $('#search-results').empty();
        }
    });
});
</script>
