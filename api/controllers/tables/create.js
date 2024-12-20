module.exports = async function (request, response) {
  let keysToPick, filtered_post_data, input_attributes, payload_attributes;
  const post_request_data = request.body;
  const {
    standard,
    premium,
    pending,
    approved,
  } = UseDataService;
  let newData = null;

  input_attributes = [
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
    { name: "location_details", required: true },
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
  /* add if any field is added from backend like user_id */
  payload_attributes = [
    ...input_attributes,
  ]

  if (post_request_data.type === premium) {
    input_attributes.push({ name: "price", required: true });
  }

  // Filter data function
  async function insertFilteredPostData() {
    keysToPick = payload_attributes.map((attr) => attr.name);
    filtered_post_data = _.pick(post_request_data, keysToPick);
    filtered_post_data.status = pending;
    filtered_post_data.event_date = UseDataService.dateHelper(
      filtered_post_data.event_date,
      "DD-MM-YYYY HH:mm",
      "YYYY-MM-DD HH:mm"
    );

    let profileMebmber;

    switch (UserType(request)) {
      case roles.admin:
        input_attributes.push({ name: "created_for", required: true })

        profileMebmber = await UseDataService.tableCreateByAdmin(
          request,
          filtered_post_data,
          input_attributes
        );
        break;
      case roles.manager:
        profileMebmber = await UseDataService.tableCreateByManager(
          request,
          filtered_post_data,
          input_attributes
        );
        break;
      case roles.member:
        profileMebmber = await UseDataService.tableCreateByMember(
          request,
          filtered_post_data
        );
        break;
      default:
        // return response.status(403).json({ error: "Invalid user role" });
        throw ({
          ...UseDataService.errorMessages.invalidRole,
        });
    }

    if (!profileMebmber) {
      throw ({
        ...UseDataService.errorMessages.invalidUser,
      });
    } else {
      const full_name = `${profileMebmber.first_name} ${profileMebmber.last_name}`;
      filtered_post_data.full_name = full_name;
    }

    if (post_request_data.location) {
      try {
        // Fetch detailed location using the first service
        const { detailedLocation } =
          await UseDataService.locationUtils.locationDetails({
            x: filtered_post_data.location.lat,
            y: filtered_post_data.location.lng,
          });
        filtered_post_data.location_details = detailedLocation;

        const { locality, postal_code, sublocality_level_2, sublocality_level_1, administrative_area_level_3, formatted_address, sublocality_level_3 } = detailedLocation;

        // Assign extracted location details to filtered_post_data
        filtered_post_data.state = administrative_area_level_3;

        if (sublocality_level_1) {
          filtered_post_data.city = sublocality_level_1;

        } else if (sublocality_level_2) {
          filtered_post_data.city = sublocality_level_2;

        } else if (sublocality_level_3) {
          filtered_post_data.city = sublocality_level_3;

        }

        filtered_post_data.pincode = postal_code;
        filtered_post_data.format_geo_address = formatted_address;
        filtered_post_data.district = locality;

      } catch (error) {
        throw new Error("Error fetching location details:", error);
        // Handle error accordingly, e.g., set a flag or throw an error
      }
    }

    return filtered_post_data;
  }

  try {
    // Prepare data
    await insertFilteredPostData();

    // Create data
    newData = await UseDataService.dataCreate(request, response, {
      modelName: Tables,
      inputAttributes: input_attributes,
      payloadData: payload_attributes,
      postData: filtered_post_data,
      path: SwaggerGenService.getRelativePath(__filename),
    });
  } catch (e) {
    // Handle errors
    return response.serverError({
      ...UseDataService.errorMessages.createTables,
      error: e.message,
    });

  } finally {
    // Log in finally block
    await UseDataService.countTablesHosted(ProfileMemberId(request));
    if (newData) {
      const followers = await Followers.find({
        creator_profile_id: newData?.created_by,
      });

      if (followers.length > 0) {
        for (const data of followers) {
          const user = await Users.findOne({
            profile_members: data?.follower_profile_id,
          });

          const msg = await UseDataService.messages({ tableId: newData?.id, userId: data.user_id });

          if (newData?.status === approved) {
            await UseDataService.sendNotification({
              notification: {
                senderId: ProfileMemberId(request),
                type: "TableCreate",
                message: msg?.tableCreateMsg,
                receiverId: user?.profile_members,
                followUser: null,
                tableId: newData?.id,
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
                tableId: newData?.id,
              },
            });
          }
        }
      }
    }

    sails.log.info("finallyblock", { newData });
  }
};
