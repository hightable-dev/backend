// ./roles/manager.js
module.exports = async function (request, filtered_post_data, input_attributes) {
  if (!filtered_post_data.created_for) {
    throw new Error("created_for is required");
  }

  const profileMebmber = await UseDataService.findOneRecord({
    modelName: "ProfileMembers",
    criteria: filtered_post_data.created_for,
  });

  input_attributes.push({ name: "created_by", required: true });
  filtered_post_data.admin_id = ProfileAdminOrManagerId(request);
  filtered_post_data.created_by = filtered_post_data.created_for;
  filtered_post_data.user_profile = filtered_post_data.created_for;

  return profileMebmber;
};
