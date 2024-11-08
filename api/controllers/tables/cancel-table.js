/**
 *
 * @author Mohan <mohan@studioq.co.in>
 *
 */
const idempotencyKeyMap = new Map();

const DataService = require('../../services/DataService');

module.exports = async function update(request, response) {
  const post_request_data = request.body;
  const profileId = request.user.profile_members;
  let request_query = request.allParams();
  let _response_object = {};
  let filtered_post_data = {};
  const { payPending, orederExpired, refundRequest, refundSuccess, paymentSuccess } = paymentStatusCode;
  const { pending, approved, reject, bookingClosed, cancelled } = tableStatusCode;
  const { inactive } = statusCode;
  console.log("inactive".inacive)

  const validStatusCodes = [cancelled];
  const data = ['id'];
  filtered_post_data = _.pick(post_request_data, [...data]);
  // const filtered_post_keys = Object.keys(filtered_post_data);
  let input_attributes = [
    { name: 'id', required: true, number: true, min: 1 },
    { name: 'status', required: true, number: true, min: 1 },
  ];

  filtered_post_data.status = cancelled;

  // Check if status is valid
  if (!validStatusCodes.includes(filtered_post_data.status)) {
    _response_object.errors = [{
      message: 'Invalid status. Valid status codes are ' + validStatusCodes.join(', ') + '.'
    }];
    _response_object.count = 1;
    return response.status(400).json(_response_object);
  }

  async function updateCancelTable(id, data, callback) {
    Tables.update({ id }, data, async function (err, data) {
      if (err) {
        await errorBuilder.build(err, function (error_obj) {
          _response_object.errors = error_obj;
          _response_object.count = error_obj.length;
          return response.status(500).json(_response_object);
        });
      } else {

        callback(data);
      }
    });
  };

  function isTableExist(id, callback) {
    Tables.findOne(
      {
        id,
        status: { '!=': _.get(sails, 'config.custom.statusCode.inactive') }
      },
      function (err, data) {
        UtilsService.throwIfErrorElseCallback(err, response, 400, () => {
          if (!data) {
            _response_object.message = 'No data found with the given id.';
            return response.status(404).json(_response_object);
          } else {

            if (filtered_post_data.status === cancelled && data.status === cancelled) {
              return response.badRequest({ error: 'Table is already cancelled, and users will receive their refunds shortly.' });
            }
            callback(data);
          }
        });
      });
  };

  async function sendResponse(details) {
    Object.assign(_response_object, {
      message: 'Deleted successfully.',
      details
    });

    return response.ok(_response_object);
  };



  async function requestRefund(data) {
    if (data && Array.isArray(data)) {
      const result = [];

      for (const item of data) {
        if (item.table_id) {
          console.log("item")
          // Update all records where table_id matches item.table_id
          const updatedBookings = await DataService.updateRecord(
            {
              modelName: "TableBooking",
              matchCriteria: {table_id: item.table_id, payment_id:item.payment_id },
              values: {status: refundRequest}
            }
          )
    
          result.push({ item, updatedBookings });

          await DataService.initiateRefund({
            userId: profileId,
            tableId: parseInt(item.table_id),
          });

        } else {
          console.warn('mapBookedData - table_id not found for item:', item);
          continue; // Skip to the next item if table_id is not present
        }
      }
      return result;
    }
    return [];
  }


  validateModel.validate(null, input_attributes, filtered_post_data, async function (valid, errors) {
    if (valid) {
      await UtilsService.fieldsFormatter({ parseInt: ['id'] }, filtered_post_data);
      isTableExist(request_query.id, async function (user_detail) {

        await updateCancelTable(user_detail.id, _.omit(filtered_post_data, ['id']), async function (data) {
          let updatedData = _.omit(data);

          const bookedList = await DataService.paidBooking(updatedData[0].id)
          console.log("bookedList",bookedList)
          // const bookedList = await paidBooking(updatedData[0].id)
          await requestRefund(bookedList)
            .then(result => console.log('Result:'))
            .catch(error => console.error('Error:'));
          const countRecordsCriteria = {
            created_by: ProfileMemberId(request),
            status: { '!=': [inactive, cancelled] }
          };

          const totalTablesCount = await DataService.countRecord({
            criteria: countRecordsCriteria,
            modelName: 'Tables'
          });

          const updateRecordCriteria = {
            id: ProfileMemberId(request),

          };
          const updateRecordData = {
            table_count: totalTablesCount,

          };

          const updatedDataCount = await DataService.updateRecord({
            matchCriteria: updateRecordCriteria,
            values: updateRecordData,
            modelName: 'ProfileMembers'
          });

          console.log('totalTablesCount', totalTablesCount, updatedDataCount)

          sendResponse(updatedData[0]);
        });
      });
    } else {
      _response_object.errors = errors;
      _response_object.count = errors.length;
      return response.status(400).json(_response_object);
    }
  });
};
