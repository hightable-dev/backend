const _ = require('lodash');

module.exports = function list(request, response) {
  const request_query = request.allParams();
  const filtered_query_data = _.pick(request_query, ['id']);
  const { id } = filtered_query_data;
  console.log({ userType: UserType(request), roles })
  const input_attributes = [
    { name: 'id', number: true, min: 1 },
  ];

  let responseObject = {};
  const sendResponse = (item) => {
    responseObject = {
      meta: {
        ...sails.config.custom.s3_bucket_options,
      },
      message: 'User retrieved successfully.',
      data: item, // return single item
    };

    response.ok(responseObject)

    return;
  };

  // Function to build the query criteria for fetching the table
  function buildCriteria() {
    return {
      id,
    };
  }

  // Validate input attributes and proceed if valid
  validateModel.validate(ProfileMembers, input_attributes, filtered_query_data, async function (valid, errors) {
    if (valid) {
      try {
        const criteria = buildCriteria();
        // Fetch table data and populate related entities
        let item = await ProfileMembers.findOne(criteria)
        // .populate('interests')
        if (item?.photo) {
          item.photo = item?.photo ? sails.config.custom.s3_bucket_options.profile_photo + item?.photo : null;
        }

        if (item?.phone) {
          item.phone = item?.phone ? UseDataService.phoneCrypto.decryptPhone(item.phone) : null;
        }
        if (item?.interests) {
          item.interests = await UseDataService.retrieveInterestsName(item?.interests);
        }

        if (!item) {
          return response.notFound({ message: 'Table not found' });
        }
    /* 
      follower data only added for members not other roles
     */
        if (UserType(request) === roles.member) {
          item.is_follower = await UseDataService.followerData({
            userId: ProfileMemberId(request),
            followerId: parseInt(id)
          })
        }

        sendResponse(item);

      } catch (error) {
        console.error('Error retrieving service requests:', error);
        return response.serverError('Server Error');
      }
    } else {
      return response.status(400).json({
        errors: errors,
        count: errors.length,
      });
    }
  });
};

// "https://s3.ap-south-1.amazonaws.com/high-table-2024/public/photo/members/members-photo-1036.png",