module.exports = async function (request, response) {
    let keysToPick, filtered_post_data, input_attributes, payload_attributes;
    const post_request_data = request.body;

    input_attributes = [
        { name: "id", required: true, number: true },

    ];
    /* add if any field is added from backend like user_id */
    payload_attributes = [
        ...input_attributes,
        { name: "receiver", required: true, type: 'string' },
        { name: "read", required: true, type: 'boolean' },
    ]

    async function insertFilteredPostData() {
        keysToPick = payload_attributes.map((attr) => attr.name);
        filtered_post_data = _.pick(post_request_data, keysToPick);

        filtered_post_data.receiver = `${ProfileMemberId(request)}`;
        filtered_post_data.read = true;

        return filtered_post_data;
    }

    try {
        // Prepare data
        await insertFilteredPostData();
        const findCriteria = _.pick(filtered_post_data, ['id', 'receiver']);;
        const updateDate = _.omit(filtered_post_data, ['id', 'receiver']);

        // Create data
        await UseDataService.dataUpdate(request, response, {
            modelName: Notifications,
            payloadData: payload_attributes,
            filteredPostData: filtered_post_data,
            matchCriteria: findCriteria,
            updatePayload: updateDate,
        });
    } catch (e) {
        throw (e);
    }
};
