/**
 *
 * @author Mohan <mohan@studioq.co.in>
 *
 */

module.exports = async function update(request, response) {
  const post_request_data = request.body;
  const { id: tableId } = post_request_data;
  let request_query = request.allParams();
  let _response_object = {};
  let filtered_post_data = {};
  const { cancelled, payPending, refundRequest, paymentSuccess, bookingConfirmationPendingByCreator } = UseDataService;;

  const validStatusCodes = [cancelled];
  const data = ["id"];
  filtered_post_data = _.pick(post_request_data, [...data]);
  // const filtered_post_keys = Object.keys(filtered_post_data);
  let input_attributes = [
    { name: "id", required: true, number: true, min: 1 },
    { name: "status", required: true, number: true, min: 6 },
  ];

  const checkIsOwnerTable = await Tables.findOne({
    id: tableId,
    created_by: ProfileMemberId(request),
  });
  if (!checkIsOwnerTable) {
    return response.serverError({ error: "You don't have access to cancel the table." });
  }

  filtered_post_data.status = cancelled;

  // Check if status is valid
  if (!validStatusCodes.includes(filtered_post_data.status)) {
    _response_object.errors = [
      {
        message:
          "Invalid status. Valid status codes are " +
          validStatusCodes.join(", ") +
          ".",
      },
    ];
    _response_object.count = 1;
    return response.badRequest(_response_object);
  }

  async function updateCancelTable(id, data, callback) {
    await Tables.update({ id }, data, async function (err, data) {
      if (err) {
        await errorBuilder.build(err, function (error_obj) {
          _response_object.errors = error_obj;
          _response_object.count = error_obj.length;
          return response.serverError(_response_object);
        });
      } else {
        callback(data);
      }
    });
  }

  function isTableExist(id, callback) {
    Tables.findOne(
      {
        id,
        status: { "!=": _.get(sails, "config.custom.statusCode.inactive") },
      },
      function (err, data) {
        UtilsService.throwIfErrorElseCallback(err, response, 400, () => {
          if (!data) {
            _response_object.message = "No data found with the given id.";
            return response.notFound(_response_object);
          } else {
            if (
              filtered_post_data.status === cancelled &&
              data.status === cancelled
            ) {
              return response.badRequest({
                error:
                  "Table is already cancelled, and users will receive their refunds shortly.",
              });
            }
            callback(data);
          }
        });
      }
    );
  }

  async function sendResponse(details, bookedList) {
    Object.assign(_response_object, {
      message: "Deleted successfully.",
      // details,
    });

    response.ok(_response_object);
  
    if (bookedList?.length > 0) {
      const notificationPromises = bookedList.map(async item => {
        const msg = await UseDataService.messages({ tableId: details.id, userId: item.user_id });

        return UseDataService.sendNotification({
          notification: {
            senderId: data.userId,
            type: "tableCancel",
            message: msg.CancelTableMsg,
            receiverId: item.user_id,
            followUser: null,
            tableId: details.id,
            payOrderId: "",
            isPaid: true,
            templateId: "tableCancel",
            roomName: "TableCancel_",
            creatorId: data.userId,
            status: 1, // approved
          },
          pushMessage: {
            title: "High Table",
            tableId: details.id,
          },
        });
      });

      // Wait for all notifications to be sent
      await Promise.all(notificationPromises);
    } else {
      console.log('No bookings');
    }

    await UseDataService.cancelBookingIfTableCancelByHost(details.id);

    await requestRefund(bookedList);

    process.nextTick(() => {
      const relativePath = SwaggerGenService.getRelativePath(__filename);
      const capitalizeFirstLetter = (str) => {
        if (typeof str !== "string" || str.length === 0) return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
      };
      SwaggerGenService.generateJsonFile({
        key: `/${relativePath}`,
        Tags: capitalizeFirstLetter(relativePath.split("/")[0]),
        Description: `Delete data of ${capitalizeFirstLetter(
          relativePath.split("/")[0]
        )} - ${relativePath.split("/")[1]}`,
        body: {},
        required_data: input_attributes,
        response: _response_object,
      });
    });

    return;
  }

  async function requestRefund(data) {
    if (data && Array.isArray(data)) {
      const result = [];

      for (const item of data) {
        if (item.table_id) {
          // Update all records where table_id matches item.table_id
          const updatedBookings = await TableBooking.update({
            table_id: item.table_id,
            payment_id: item.payment_id,
            status :paymentSuccess
          }).set({ status: refundRequest, status_glossary: "refundRequest" });

          await TableBooking.update({
            table_id: item.table_id,
            payment_id: item.payment_id,
            status :payPending
          }).set({ status: cancelled, status_glossary: "refundRequest" });


          result.push({ item, updatedBookings });


        } else {
          console.warn("mapBookedData - table_id not found for item:", item);
          continue; // Skip to the next item if table_id is not present
        }
      }

      data.forEach(async itemData => {
        await UseDataService.initiateRefund({
          userId: ProfileMemberId(request),
          tableId: parseInt(itemData.table_id),
        });
      });

      return result;
    }
    return [];
  }

  validateModel.validate(null, input_attributes, filtered_post_data, async function (valid, errors) {
    if (valid) {
      await UtilsService.fieldsFormatter(
        { parseInt: ["id"] },
        filtered_post_data
      );
      isTableExist(request_query.id, async function (user_detail) {
        await updateCancelTable(
          user_detail.id,
          _.omit(filtered_post_data, ["id"]),
          async function (data) {
            let updatedData = _.omit(data);

            const bookingList = await UseDataService.bookingDataForCreator({
              tableId: updatedData[0].id,
              userId: ProfileMemberId(request),
              status: [payPending, paymentSuccess, bookingConfirmationPendingByCreator]
            });

            await UseDataService.countTablesHosted(ProfileMemberId(request));
            sendResponse(updatedData[0], bookingList);
          }
        );
      });
    } else {
      _response_object.errors = errors;
      _response_object.count = errors.length;
      return response.badRequest(_response_object);
    }
  }
  );
};
