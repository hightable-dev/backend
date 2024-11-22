

module.exports = async function createReportHost(req, res) {
    let filteredPostData, responseObject = {};
    const postRequestData = req.body;
   const {table_id} = req.body ;
    filteredPostData = _.pick(postRequestData, ['table_id', 'table_complaint']);
    const reportTable = 4 ; 
    const inputAttr = [
        { name: 'table_complaint' },
        { name: 'table_id', required: true },
        { name: 'creator_id', required: true },
        { name: 'user_id', required: true },
        { name: 'status', required: true },
        { name: 'status_glossary', required: true }
    ];


   const checkReportExist = await ReportTable.findOne({user_id : ProfileMemberId(req), table_id : filteredPostData.table_id })
   if(checkReportExist){
      return res.status(500).json({ error: "You already complaint to this table.", statusCode: 400 });
   }

    const insertData = async () => {
        let tableData ;
        try {
            console.log({tableId:filteredPostData.table_id,table_id})
            if (filteredPostData?.table_id) {
                tableData = await Tables.findOne({
                    id: filteredPostData.table_id,
                });

            }
            if (!tableData) {
                return { error: "No tables found", status: 400 };
            }
            filteredPostData = {
                ...filteredPostData,
                creator_id :tableData.created_by,
                user_id : ProfileMemberId(req),
                status : reportTable,
                status_glossary: 'reportTable'
            };
            return { success: true, data: filteredPostData };
        } catch (error) {
            console.error('Error inserting data:ReserveTable.js', error);
            return { error: 'Failed to create report.', statusCode: 500, details: error };
        }
    };

    const handleError = (error) => {
        responseObject = {
            errors: [{ message: error.message , error }],
        };
        return res.status(500).json(responseObject);
    };

    const createData = async (postData) => {
        try {
            const newData = await ReportTable.create({ ...postData });
            sendResponse(newData);
        } catch (error) {
            handleError(error);
        }
    };

    const sendResponse = (details) => {
        responseObject = {
            message: 'Your report is submitted for this table.',
            details: _.cloneDeep(details)
        };
        return res.ok(responseObject);
    };

    const dataInserted = await insertData();

    if (dataInserted.success) {
        validateModel.validate(ReportTable, inputAttr, filteredPostData, async (valid, errors) => {
            if (valid) {
                await createData(filteredPostData);

            } else {
                responseObject.errors = errors;
                responseObject.count = errors.length;
                return res.serverError(responseObject);
            }

        });
    } else {
        return res.status(dataInserted.statusCode).json({ error: dataInserted.error });
    }
}