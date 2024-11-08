const DataService = require("../../services/DataService");

module.exports = async function userDestroy(request, response) {
  const { deletedAccountTables } = tableStatusCode;
  const profileId = request.user.profile_members;
  const { payPending, orederExpired, refundRequest, refundSuccess, paymentSuccess } = paymentStatusCode;

  async function updateUserProfile(idArray) {
    console.log("destory-user", parseInt(profileId));
    const findUserProfile = await ProfileMembers.findOne({ id: profileId });
    const findUser = await Users.findOne({ profile_members: parseInt(profileId) });

    if (!findUserProfile) {
      throw new Error("User profile not found.");
    }

    if (!findUser) {
      throw new Error("User not found.");
    }

    await updateTables({ created_by: findUserProfile.id });

    findUserProfile.type = findUser.types;
    findUserProfile.deleted_user_id = findUserProfile.id;
    delete findUserProfile.id;

    return findUserProfile;
  }

  async function updateTables(data) {
    const findTables = await Tables.find(data);

    // if (!findTables || findTables.length === 0) {
    //   console.log("There are no tables for this user.");
    // }

    const updatedTables = await Promise.all(
      findTables.map(async (table) => {
        console.log("Processing table:", table);

        if (table.id) {
          console.log("tableidiidd", table.id)
          try {
            const bookedList = await paidBooking(table.id);
            console.log('bookedList', bookedList);

            if (bookedList) {
              await requestRefund(bookedList)
              .then((result) => console.log('Refund requested successfully:', result))
              .catch((error) => console.error('Error requesting refund:', error));
              await DataService.initiateRefund({
                userId: profileId,
                tableId: parseInt(table.id),
              });
            }
            return await Tables.updateOne({ id: table.id }).set({ status: deletedAccountTables });
          } catch (error) {
            console.error(`Error processing table with ID ${table.id}:`, error);
            throw new Error(`Failed to process table with ID ${table.id}`);
          }
        }
        return table;
      })
    );

    return updatedTables;
  }

  async function paidBooking(tableId) {
    try {
      const bookings = await TableBooking.find({ table_id: tableId, status: paymentSuccess });
      return bookings;
    } catch (error) {
      throw new Error('Error fetching bookings: ' + error.message);
    }
  }

  async function requestRefund(data) {
    if (data && Array.isArray(data)) {
      const result = [];

      for (const item of data) {
        if (item.table_id) {
          const updatedBookings = await TableBooking.update({ table_id: item.table_id, status : paymentSuccess})
            .set({ status: refundRequest })
            .fetch();

          result.push({ item, updatedBookings });
        } else {
          console.warn('mapBookedData - table_id not found for item:', item);
          continue;
        }
      }

      return result;
    }

    return [];
  }

  try {
    let _response_object = {};

    // Update the user profile and associated tables
    const updatedUserProfile = await updateUserProfile(profileId);
    console.log('Updated User Profile:', updatedUserProfile);

    // Create a deleted user record in DeletedAccount
    const deletedUserData = await DeletedAccount.create(updatedUserProfile);
    console.log('Deleted User Data:', deletedUserData);

    // Proceed to destroy users and profile members after table tasks are completed
    const delUser = await Users.destroy({ profile_members: profileId });
    const delUserProfile = await ProfileMembers.destroy({ id: profileId });

    if (!delUserProfile) {
      throw new Error("User profile not found.");
    }

    if (!delUser) {
      throw new Error("User not found.");
    }

    _response_object.message = 'Users and associated profile members destroyed successfully.';
    return response.status(200).json(_response_object);

  } catch (error) {
    console.error("Error occurred while destroying users and profile members:", error);
    return response.status(500).json({ error: "Error occurred while destroying users and profile members." });
  }
};
