### Payment Process

# Step1 : book-table.js
    1a. when booking new it creates the order 
    1b. will get order id

# Step2 : pay-order.js
    2a. Using order id (reference (1b)) Make payment 
        -> Page will be redirected to payment page
    2b. will get payment id

# Step3 : capture-payment.js
    3a. Using payment id (reference (2b)) get data
    3b. For Capture Payment 
        -> Required payment_id
        -> Exact amount of Paid
    3c. Pass paymentId and amount to in the api to Capture payment
    3b. After getting data update all in the db

# STTUS CODE DETAILS
    5 -> booked
    6 -> expired
    9 -> Booked and paid

# Error
    -> Invalid params for query handled 
    -> search not found
    -> conditions mismatch


    