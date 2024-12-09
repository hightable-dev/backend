module.exports = async function (data, updateTable) {
    const { tableId, userId } = data;

    if (!tableId) {
        throw new Error(`'tableId' is required`);
    }
    try {
        let userData = null;
        let tableData = null;

        // Fetch table data
        if (tableId) {

            tableData = await Tables.findOne({
                id: tableId, // Use tableId directly after destructuring
            }).populate('created_by');

            if (tableData.event_date) {
                tableData.event_date = UseDataService.dateHelper(
                    tableData.event_date,
                    'YYYY-MM-DDTHH:mm:ss.SSSZ',
                    'DD-MM-YYYY HH:mm'
                );
            }
        }


        // If userId is present, fetch user data
        if (userId) {
            userData = await ProfileMembers.findOne({
                id: userId, // Use userId instead of tableId here
            })
        }

        const tableTitle = tableData?.title;
        const userName = userData?.first_name;
        const creatorName = tableData?.created_by?.first_name;

        // Define user messages
        const userMessages = {
            // BookTableMsg: `Congratulations! a new booking request for the '${tableTitle}' by the '${userName}'. Tap here to confirm the booking.`,
            BookTablePushMsg: `Congratulations! new booking request for the '${tableTitle}'.`,
            RefundSuccessMsg: `Refund initiated for the table '${tableTitle}'.`,
            BookingAcceptMsg: `Congratulations! Your booking request for the '${tableTitle}' has been accepted. Tap here to pay now .`,
        };

        // If no userData, replace userMessage values with "No user data available"
        if (!userData) {
            for (const key in userMessages) {
                userMessages[key] = "No user data available";
            }
        }
/* 
"Great news! Your 'Drinks and Conversations with New Friends' table has been approved by the High Table team."

We're sorry to inform you that your 'Drinks and Conversations with New Friends' table hasn't received approval from the High Table team. If you have any questions or need assistance, please reach out to admin@hightable.ai.
 */
        const creatorMessages = {
            TableApproveMsg: `Great news! Your '${tableTitle}' table has been approved by the High Table team.`,
            TableRejectMsg: `We're sorry to inform you that your '${tableTitle}' table hasn't received approval from the High Table team. If you have any questions or need assistance, please reach out to admin@hightable.ai.`,
            BookingRequestMsg: `Congratulations! You've received a booking request from '${userName}' for the '${tableTitle}'. Tap here to confirm.`,
            CancelTableMsg: `The table '${tableTitle}' you booked has been cancelled by the host. If you've paid for the table, you will get refund within 2 to 3 working days.`,
            tableCreateMsg: `New table found '${tableTitle}'`
        }

        if (!tableData) {
            for (const key in creatorMessages) {
                creatorMessages[key] = "No table data available";
            }
        }


        const errorMsg = {
            noAccessToCancelTable: '',
            noAccessToBookTable: '',

        }

        let updatedTableMessges = {}
        let convertNewTime;
        let convertNewDate;

        if (updateTable) {
            let { event_date: oldDate, address: oldVenue } = tableData;
            let { event_date: newDate, address: newVenue } = updateTable;

            convertNewTime = await UseDataService.dateHelper(
                newDate,      // This is the date string
                "DD-MM-YYYY HH:mm",          // This is the input format
                "hh:mm A"                 // This is the required output format
            );

            const convertOldTime = await UseDataService.dateHelper(
                oldDate,      // This is the date string
                "DD-MM-YYYY HH:mm",          // This is the input format
                "hh:mm A"                 // This is the required output format
            );

            convertNewDate = await UseDataService.dateHelper(
                newDate,      // This is the date string
                "DD-MM-YYYY HH:mm",          // This is the input format
                "DD-MM-YYYY"                 // This is the required output format
            );

            const convertOldDate = await UseDataService.dateHelper(
                oldDate,      // This is the date string
                "DD-MM-YYYY HH:mm",          // This is the input format
                "DD-MM-YYYY"                 // This is the required output format
            );

            // Message object to store any changes
            // let updatedTableMessges = {};

            const dateChanged = convertOldDate !== convertNewDate;
            const timeChanged = convertOldTime !== convertNewTime;
            const venueChanged = oldVenue !== newVenue;

            // const tableMsg = {
            //     dateChanged : 
            // }

            if (dateChanged || timeChanged || venueChanged) {
                userMessages.updateOnTableMsg =
                    `We would like to inform you that the ${dateChanged ? 'date' : ''
                    }${dateChanged && (timeChanged || venueChanged) ? ', ' : ''}${timeChanged ? 'time' : ''
                    }${timeChanged && venueChanged ? ', ' : ''}${venueChanged ? 'venue' : ''
                    } of the table '${tableTitle}' ${dateChanged || timeChanged || venueChanged ? 'is changed to ' : ''
                    }${dateChanged ? convertNewDate : ''
                    }${dateChanged && (timeChanged || venueChanged) ? ' | ' : ''}${timeChanged ? convertNewTime : ''
                    }${timeChanged && venueChanged ? ' | ' : ''}${venueChanged ? newVenue : ''
                    } by the host.`;
            }



            // Assigning messages to keys if changes are detected
            if (dateChanged) {
                updatedTableMessges.dateMessage = `We would like to inform you that the date of the table '${tableTitle}' is changed to '${convertNewDate}' by the host.`;
            }

            if (timeChanged) {
                updatedTableMessges.timeMessage = `We would like to inform you that the time of the table '${tableTitle}' is changed to '${convertNewTime}' by the host.`;
            }

            if (venueChanged) {
                updatedTableMessges.venueMessage = `We would like to inform you that the venue of the table '${tableTitle}' is changed to '${newVenue}' by the host.`;
            }

            // Handling combined cases (date + time, date + venue, time + venue, or all)
            if (dateChanged && timeChanged) {
                updatedTableMessges.dateTimeMessage = `We would like to inform you that the date and time of the table '${tableTitle}' are changed to '${convertNewDate} | ${convertNewTime}' by the host.`;
            }

            if (dateChanged && venueChanged) {
                updatedTableMessges.dateVenueMessage = `We would like to inform you that the date and venue of the table '${tableTitle}' are changed to '${convertNewDate} | ${newVenue}' by the host.`;
            }

            if (timeChanged && venueChanged) {
                updatedTableMessges.timeVenueMessage = `We would like to inform you that the time and venue of the table '${tableTitle}' are changed to '${convertNewTime} | ${newVenue}' by the host.`;
            }

            if (dateChanged && timeChanged && venueChanged) {
                updatedTableMessges.dateTimeVenueMessage = `We would like to inform you that the date, time, and venue of the table '${tableTitle}' are changed to '${convertNewDate} | ${convertNewTime} | ${newVenue}' by the host.`;
            }

        }

        // Define messages with null safety check
        const message = {
            ...creatorMessages,
            ...userMessages,
            ...errorMsg,

        };

        return message; // Return the constructed message object
    } catch (error) {
        throw new Error("Error fetching data for messages: " + error.message);
    }
};
