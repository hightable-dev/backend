// cronJob.js
const cron = require('node-cron');

const hour = 10;   // 7 PM in 24-hour format
const minute = 0; // 20 minutes past the hour

// Schedule the task to run daily at 7:20 PM
const job = cron.schedule(`${minute} ${hour} * * *`, async () => {
    console.log('Running daily profile completion calculation...');

    try {
        const users = await ProfileMembers.find({
            status: 1, profile_completion_status: { '<': [100] }
        });

        for (const item of users) {
            console.log({ id: item.id })
            await UseDataService.sendNotification({
                notification: {
                    senderId: item.id,  // Corrected `itme` to `item`
                    type: 'reminder',
                    message: 'It seems like your profile has not been completed. Tap here to complete it.',
                    receiverId: item.id,
                    followUser: null,
                    tableId: null,
                    payOrderId: '',
                    isPaid: false,
                    templateId: 'profileUpdateReminder',
                    roomName: 'Reminder',
                    creatorId: '',
                    status: 1,
                },
                pushMessage: {
                    title: 'High Table',
                }
            });
        }
       /*  // Loop through each user to calculate profile completion
        for (const user of users) {
            const result = await UseDataService.calculateProfileCompletion(user)
            // const result = calculateProfileCompletion(user);
            console.log('Daily profile completion result for user:', result);
        } */
    } catch (error) {
        console.error('Error executing daily cron job:', error);
    }
},
    {
        scheduled: true,
        timezone: "Asia/Kolkata" // Specify the timezone for IST
    }

);

// Log the job setup
console.log(`Cron job scheduled for daily execution at ${hour}:${minute}`);

// Start the job
job.start();

// Export the cron job for use in other parts of the application
module.exports = {
    job,
    // displayCurrentTime // Optional: Export the display function if you want to call it elsewhere
};





/*
 // Function to display the current time with seconds
 function displayCurrentTime() {
   const now = new Date(); // Get the current date and time
   Extract hours, minutes, and seconds
   const hours = String(now.getHours()).padStart(2, '0'); // 2-digit hour
   const minutes = String(now.getMinutes()).padStart(2, '0'); // 2-digit minute
   const seconds = String(now.getSeconds()).padStart(2, '0'); // 2-digit second
   Format the time as HH:mm:ss
   const currentTime = `${hours}:${minutes}:${seconds}`;
   console.clear(); // Clear the console before logging the new time
   console.log(currentTime); // Log the current time
 }
 // Call the function every second to display current time
 setInterval(displayCurrentTime, 1000); // Log the time every second
*/