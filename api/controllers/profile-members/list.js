
module.exports = async function list(request, response) {
  const currentDate = new Date();
  const formattedDate = dateService.ddmmyyyy_hhmm(currentDate);
  const userType = request.user.types[0];
  const request_query = request.allParams();

  const { pending, cancelled } = sails.config.custom.tableStatusCode;
  const { inactive } = sails.config.custom.statusCode;


  const filtered_query_data = _.pick(request_query, [
    'page', 'sort', 'limit', 'search', 'date', 'to', 'category', 'status', 'created_by', 'type'
  ]);
  let { page, limit, search, date: from_date, to: to_date, category, status, created_by, type } = filtered_query_data;
  const input_attributes = [
    { name: 'page', number: true, min: 1 },
    { name: 'limit', number: true, min: 1 },
  ];

  const tablesPhoto = sails.config.custom.filePath.tablesMedia;
  const tablesVideo = sails.config.custom.filePath.tablesVideo;

  const sendResponse = (items, total) => {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    return response.ok({
      message: 'Request form list retrieved successfully.',
      meta: {
        count: items.length,
        total: total,
        page: pageNum,
        limit: limitNum,
        media: tablesPhoto,
        video: tablesVideo,
      },
      items: items,
    });
  };




  function buildCriteria(search, category, from_date, to_date) {
    let criteria = {
    };
    if (status) {
      criteria.status = status;
    }

    // criteria.event_date = { '>=': formattedDate };
    /***
     * Ex Current date is 16 Aug 2024 12:50 Pm
     * Event Dates Followed by
     * 16-08-2024 05:03 Not listed
     * 16-08-2024 12:49 Not listed
     * 16-08-2024 14:03 listed
     * 31-08-2024 14:03 listed
     */

    if (category) criteria.category = category;


    if (search) {
      const searchValue = search.trim();
      const lookupFields = ['first_name', 'last_name'];
      const searchVariations = [
        searchValue.toLowerCase(),
        _.capitalize(searchValue),
        searchValue.toUpperCase(),
      ];

      const searchCriteria = lookupFields.map((field) => ({
        or: searchVariations.map((variation) => ({ [field]: { contains: variation } })),
      }));

      criteria.or = criteria.or || [];
      criteria.or.push(...searchCriteria);
    }
    return criteria;
  }

  async function decryptPhoneNumber(item) {
    if (item.phone) {
      try {
        item.phone = await new Promise((resolve, reject) => {
          phoneEncryptor.decrypt(item.phone, function (decrypted_text) {
            if (decrypted_text) {
              resolve(decrypted_text);
            } else {
              reject('Phone decryption failed');
            }
          });
        });
      } catch (error) {
        console.error(`Error decrypting phone for item ID ${item.id}:`, error);
      }
    }
  }

  async function processBookingCounts(items) {
    const userBookingCounts = new Map();
  
    // Calculate tables hosted and total booked counts for each item
    for (const item of items) {
      if (item) {
        try {
          const totalTablesCount = await Tables.count({ created_by: item.id });
          item.tablesHosted = totalTablesCount;
  
          const totalBookedCount = await TableBooking.count({ user_id: item.id });
          userBookingCounts.set(item.id, (userBookingCounts.get(item.id) || 0) + totalBookedCount);
        } catch (error) {
          console.error(`Error processing booking counts for item ID ${item.id}:`, error);
        }
      }
    }
  
    // Assign booking counts to items
    for (const item of items) {
      item.tablesBooked = userBookingCounts.get(item.id) || 0;
    }
  }
  

  async function processItem(item, managerPhoto) {
    if (item) {
      // Count total tables created by the admin
      try {
        const totalTablesCount = await Tables.count({ admin_id: item.id });
        item.tablesCreated = totalTablesCount;
      } catch (error) {
        console.error(`Error counting tables for admin ID ${item.id}:`, error);
      }

      // Set photo path or null if not available
      item.photo = item.photo ? managerPhoto + item.photo : null;
    }
  }



  validateModel.validate(null, input_attributes, filtered_query_data, async function (valid, errors) {
    if (valid) {
      try {
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;
        const criteria = buildCriteria(search, category, from_date, to_date);

        // Fetch items and total count in parallel
        const [items, totalItems] = await Promise.all([
          ProfileMembers.find({ where: criteria })
            .skip(skip)
            .limit(limit),
          ProfileMembers.count({ where: criteria })
        ]);
        await processBookingCounts(items);
        await Promise.all(items.map(decryptPhoneNumber));

        sendResponse(items, totalItems);
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
