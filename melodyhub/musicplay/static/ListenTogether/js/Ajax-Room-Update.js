function updateRooms() {
    $.ajax({
        url: 'rooms/json/',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            var roomsList = $('#rooms-list');
            var noRoomsMessage = $('#no-rooms-message');
            roomsList.empty();  // Clear existing rooms

            if (data.length === 0) {
                // If there are no rooms, show the 'No rooms available' message
                noRoomsMessage.show();
            } else {
                // Hide the 'No rooms available' message if there are rooms
                noRoomsMessage.hide();

                // Iterate through rooms and append them to the list
                $.each(data, function(i, room) {
                    var roomUrl = `/listentogether/${room.room_id}/`; // Adjust as needed
                    var button = $('<a>')
                        .attr('href', roomUrl)
                        .addClass('btn btn-dark')
                        .attr('role', 'button')
                        .text(room.name);
                    roomsList.append(button);
                    roomsList.append('<br>');  // For spacing
                });
            }
        },
        error: function(xhr, status, error) {
            console.error('Error fetching rooms:', error);
        }
    });
}