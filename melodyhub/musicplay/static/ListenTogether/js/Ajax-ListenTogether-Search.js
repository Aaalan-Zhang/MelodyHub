$(document).ready(function() {
    $("#search-input").keyup(function() {
        var query = $(this).val();
        if (query.length >= 1) {  // Trigger search for at least 3 characters
            $.ajax({
                url: '/lt-search/',
                data: {
                    'q': query
                },
                dataType: 'json',
                success: function(data) {
                    $('#search-results').empty();
                    $.each(data, function(index, element) {
                        $('#search-results').append('<br><br>');
                        var resultDiv = $('<div>', { class: 'search-result-item' });

                        // Append an image if it exists
                        if (element.image_url) {
                            resultDiv.append($('<img>', {
                                src: element.image_url,
                                alt: 'Cover image',
                                width: '100px',  // Example dimensions
                                height: '100px'
                            }));
                        }
            
                        // Append the name of the track
                        resultDiv.append($('<div>', {
                            text: element.name,
                            class: 'track-name'
                        }));
            
                        // Append the singer's name
                        resultDiv.append($('<div>', {
                            text: element.singer,
                            class: 'singer-name'
                        }));
            
                        // Finally, append the complete result div to the search results container
                        $('#search-results').append(resultDiv);
                    });
                    // $.each(data, function(index, element) {
                    //     // var roomUrl = `/listentogether/${room.room_id}/`;
                    //     var button = $('<a>')
                    //         .attr('href', roomUrl)
                    //         .addClass('btn btn-dark')
                    //         .attr('role', 'button')
                    //         .text(room.name);
                    //     roomsList.append(button);
                    //     roomsList.append('<br><br>');  // For spacing
                    // });
                }
            });
        } else {
            $('#search-results').innerHTML = "No Search Results Found.";
        }
    });
});
