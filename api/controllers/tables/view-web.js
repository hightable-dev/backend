module.exports = async function findOne(request, response) {
    var _response_object = {};
      const { id } = request.query;
    try {
      const table = await Tables.findOne({ id });
      if (table) {
        const user = await ProfileMembers.findOne({ id:table.created_by });
        const Totalcount = await Tables.count({ created_by:table.created_by });
        table.total_table_count = Totalcount;
        table.user_data= user;
        if (user.photo) {
            user.photo= sails.config.custom.filePath.members +  user.photo
        
        }
        if (table.media) {
            table.media= sails.config.custom.filePath.tablesMedia +  table.media
        }
        _response_object = {
          message: 'Data retrieved successfully.',
          details: table,
        };
        
        return response.ok(_response_object);
      }else{
        _response_object = {
          message: 'Data not found.',
        };
        return response.ok(_response_object);
      }

    } catch (error) {
      console.error("Error occurred while fetching item:", error);
      return response.status(500).json({ error: "Error occurred while fetching data" });
    }
  };
  