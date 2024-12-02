

module.exports = async function (request, filtered_post_data) {
  const profileMeberid = ProfileMemberId(request);
  const profileMebmber = await UseDataService.findOneRecord({
    modelName: "ProfileMembers",
    criteria: profileMeberid,
  });

  filtered_post_data.created_by = profileMeberid;
  filtered_post_data.user_type = 12313;
  filtered_post_data.user_profile = profileMeberid;

  return profileMebmber;
};
