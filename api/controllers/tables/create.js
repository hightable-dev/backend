/**
 *
 * @author mohan <mohan@studioq.co.in>
 *
 */
/* global _, Tables, moment, errorBuilder, validateModel */

module.exports = async function create(request, response) {
  const {
    standard,
    premium,
    pending,
    approved,
  } = UseDataService;

  const post_request_data = request.body;
  let _response_object = {};
  let filtered_post_data = _.pick(post_request_data, [
    "type",
    "media",
    "min_seats",
    "max_seats",
    "title",
    "category",
    "address",
    "description",
    "event_date",
    "price",
    "tags",
    "created_by",
    "status",
    "location",
    "phone",
    "user_type",
    "event_done_flag",
    "city",
    "state",
    "pincode",
    "district",
    "user_profile",
    "video",
    "format_geo_address",
    "created_for",
    "table_expense",
    "exclusions",
    "inclusion",
    "location_details"
  ]);
  let input_attributes = [
    { name: "type", required: true, number: true },
    { name: "media" },
    { name: "video" },
    { name: "description", required: true },
    { name: "title", required: true },
    { name: "min_seats" },
    { name: "max_seats" },
    { name: "category", required: true },
    { name: "phone" },
    { name: "tags" },
    { name: "address", required: true },
    { name: "city" },
    { name: "event_date", required: true },
    { name: "status" },
    { name: "location", required: true },
    { name: "location_details" },
    { name: "user_type" },
    { name: "event_done_flag" },
    { name: "state" },
    { name: "pincode" },
    { name: "district" },
    { name: "user_profile" },
    { name: "format_geo_address" },
    { name: "table_expense", required: true },
    { name: "created_for" },
    { name: "price" },
    { name: "inclusion" },
    { name: "exclusions" },
  ];

  if (filtered_post_data.type === premium) {
    input_attributes.push({ name: "price", required: true });
  }

  // let adminProfileId;
  // let profileMeberid;
  let profileMebmber;

  switch (UserType(request)) {
    case roles.admin:
      if (!filtered_post_data.created_for) {
        return response.status(400).json({
          error: "created_for is required",
        });
      }

      profileMebmber = await UseDataService.tableCreateByAdmin(request, filtered_post_data, input_attributes);
      break;
    case roles.manager:
      profileMebmber = await UseDataService.tableCreateByManager(request, filtered_post_data, input_attributes);
      break;
    case roles.member:
      profileMebmber = await UseDataService.tableCreateByMember(request, filtered_post_data);
      break;
    default:
      return response.status(403).json({ error: "Invalid user role" });
  }

  if (!profileMebmber) {
    return response.status(404).json({ error: "User not found" });
  } else {
    const full_name = `${profileMebmber.first_name} ${profileMebmber.last_name}`;
    filtered_post_data.full_name = full_name;
  }

  const geoData = await UseDataService.locationUtils
    .extractLocationDetails({
      x: filtered_post_data.location.lat,
      y: filtered_post_data.location.lng,
    })

  console.log('GEO DATA 123', { geoData })

  if (filtered_post_data.location) {
    try {
      // Fetch detailed location using the first service
      const { detailedLocation } = await UseDataService.locationUtils.locationDetails({
        x: filtered_post_data.location.lat,
        y: filtered_post_data.location.lng,
      });
      filtered_post_data.location_details = detailedLocation;

      // Extract location details using the second service
      const { state, city, pincode, formattedAddress, district } = await UseDataService.locationUtils.extractLocationDetails({
        x: filtered_post_data.location.lat,
        y: filtered_post_data.location.lng,
      });

      // Assign extracted location details to filtered_post_data
      filtered_post_data.state = state;
      filtered_post_data.city = city;
      filtered_post_data.pincode = pincode;
      filtered_post_data.format_geo_address = formattedAddress;
      filtered_post_data.district = district;

    } catch (error) {
      console.error('Error fetching location details:', error);
      // Handle error accordingly, e.g., set a flag or throw an error
    }
  }
  /*   const findNullLocation = await Tables.find({ location_details: null });
    console.log({ findNullLocation });
  
    for (const table of findNullLocation) {
      if (table.location && table.location.lat && table.location.lng) {
        try {
          const { detailedLocation } = await UseDataService.locationUtils.extractLocationDetails({
            x: table.location.lat,
            y: table.location.lng,
          });
  
          // Update the table with the new location details
          await Tables.updateOne({ id: table.id }).set({ location_details: detailedLocation });
          console.log(`Updated table with ID: ${table.id}`);
        } catch (error) {
          console.error(`Error updating location details for table ID: ${table.id}`, error);
        }
      } else {
        console.log(`No valid location data for table ID: ${table.id}`);
      }
    }
   */
  // filtered_post_data.admin_id = adminProfileId;
  const sendResponse = async (message, details) => {
    _response_object.message = message;
    _response_object.details = details; // Include details in the response

    response.ok(_response_object);

    /******* Update Table count after table created *******/
    await UseDataService.countTablesHosted(ProfileMemberId(request))

    process.nextTick(() => {
      const relativePath = SwaggerGenService.getRelativePath(__filename);
      const capitalizeFirstLetter = (str) => {
        if (typeof str !== "string" || str.length === 0) return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
      };
      SwaggerGenService.generateJsonFile({
        key: `/${relativePath}`,
        Tags: capitalizeFirstLetter(relativePath.split("/")[0]),
        Description: `Create a table ${capitalizeFirstLetter(
          relativePath.split("/")[0]
        )} - ${relativePath.split("/")[1]}`,
        body: {},
        required_data: input_attributes,
        response: _response_object,
      });
    });

    return;
  };

  const createTables = async (post_data) => {
    post_data.event_date = UseDataService.dateHelper(
      post_data.event_date,
      "DD-MM-YYYY HH:mm",
      "YYYY-MM-DD HH:mm"
    );

    await Tables.create(post_data, async function (err, createdTable) {
      if (createdTable) {
        const followers = await Followers.find({
          creator_profile_id: createdTable?.created_by,
        });

        if (followers.length > 0) {
          for (const data of followers) {
            const user = await Users.findOne({
              profile_members: data?.follower_profile_id,
            });

            const msg = await UseDataService.messages({ tableId: createdTable?.id, userId: data.user_id });

            if (createdTable?.status === approved) {
              await UseDataService.sendNotification({
                notification: {
                  senderId: ProfileMemberId(request),
                  type: "TableCreate",
                  message: msg?.tableCreateMsg,
                  receiverId: user?.profile_members,
                  followUser: null,
                  tableId: createdTable?.id,
                  payOrderId: "",
                  isPaid: false,
                  templateId: "createTable",
                  roomName: "TableCreate_",
                  creatorId: null,
                  status: 1, // approved
                },
                pushMessage: {
                  title: "High Table",
                  // message: msg?.tableCreateMsg,
                  payOrderId: '',
                  tableId: createdTable?.id,
                },
              });
            }
          }
        }

        sendResponse("Table created successfully.", createdTable);
      } else {
        await errorBuilder.build(err, function (error_obj) {
          _response_object.errors = error_obj;
          _response_object.count = error_obj.length;
          return response.status(500).json(_response_object);
        });
      }
    });
  };

  validateModel.validate(
    Tables,
    input_attributes,
    filtered_post_data,
    async function (valid, errors) {
      filtered_post_data.user_type = UserType(request);

      if (filtered_post_data.category) {
        filtered_post_data.category = parseInt(filtered_post_data.category);
      }
      console.log("type usertype 242", typeof (UserType(request)), UserType(request))
      const lastEntry = await StandardTable.find()
        .limit(1)
        .sort([{ created_at: "DESC" }]);
      const standardTableLatestPrice = lastEntry[0].price;
      if (filtered_post_data.type === standard) {
        filtered_post_data.status = approved;
        filtered_post_data.price = standardTableLatestPrice; // Set price to 99 for standard type
      }
      if (filtered_post_data.type === premium) {
        filtered_post_data.status = pending;
      }

      if (valid) {
        createTables(filtered_post_data);

      } else {
        _response_object.errors = errors;
        _response_object.count = errors.length;
        return response.status(400).json(_response_object);
      }
    }
  );
};