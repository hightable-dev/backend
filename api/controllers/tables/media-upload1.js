/**
 * @author mohan <mohan@studioq.co.in>
 */


const fs = require("fs");
const DataService = require("../../services/DataService");

module.exports = async function updateFile(request, response) {
  try {
    const ModelPrimary = Tables ;
    // Extract necessary data from the request
    const { allParams, _fileparser } = request;
    const { id: tableId } = allParams();

    const parseTableId = parseInt(tableId);
    
    console.log('dat',typeof(parseTableId))
    // Prepare data for processing
    const insertData = {};
    const responseObject = {};

    /**
     * change where video to image and format png, jpeg, jpg for image upload
     */
    const allowedFileTypes =sails.config.custom.fileTypes.image ; 
    /**
     * fieldName : This is used to as string key in insertData
     * Example insert_data.${fieldName} = 'some text' // this will update in database
     * Alternatively used insert_post_data[fieldName] = 'some text'
     * fieldName should match with table in the Model
     */
    const fieldName = 'media';  
    const namePrefix = 'tables'; // change users, admin, etc accordingly in the Model Names
    const s3BaseURL = `https://s3.${sails.config.conf.aws.region}.amazonaws.com/${sails.config.conf.aws.bucket_name}`;
    const s3Folder = ModelPrimary.attributesMeta[fieldName].s3_folder; // This is defined in the Model
  
    // Function to send a successful response
    const sendResponse = (details) => {
      responseObject.message = `${fieldName} uploaded successfully`;
      // responseObject.meta = {
      //   [fieldName]: {
      //     path: s3BaseURL,
      //     folder: s3Folder,
      //     example: `${s3BaseURL}/${s3Folder}/${namePrefix}-${fieldName}-777.jpeg`
      //   }
      // };
      details[0].media =  DataService.tablesPhoto +  details[0].media;
      responseObject.details = { ...details };
      return response.ok(responseObject);
    };

    // Function to handle file upload
    const uploadFiles = async (image, callback) => {
      try {
        const path = require("path");
        const filename = `${namePrefix}-${fieldName}-${parseInt (tableId)}${path.extname(image.filename)}`;
        const filePath = s3Folder;

        insertData[fieldName] = filename;

        await fileUpload.S3file(image, filePath, filename, [256, 512], async function (err, done) {
          if (err) {
            err.field = `${fieldName}`;
            throw err;
          } else {
            if (done) {
              return callback(filename);
            }
          }
        });
      } catch (err) {
        throw err;
      }
    };

    // Function to add a record
    const addRecord = async (postData) => {
      try {
        const updatedRecordDetails = await ModelPrimary.update({ id: parseInt (tableId)}, { [fieldName]: postData[fieldName] });
        sendResponse(updatedRecordDetails);
      } catch (err) {
        err.field =`${fieldName}`;
        throw err;
      }
    };

    // Validate uploaded files
    const validateUploadedFiles = async () => {
      try {
        if (!_fileparser || !_fileparser.upstreams || _fileparser.upstreams.length === 0) {
          throw { field: `${fieldName}`, message: "No files uploaded" };
        }

        const uploadedFiles = await new Promise((resolve, reject) => {
          request.file(`${fieldName}`).upload({ maxBytes: 500000000 }, (err, files) => {
            if (err) {
              err.field = `${fieldName}`;
              reject(err);
            }
            resolve(files);
          });
        });

        if (uploadedFiles.length === 0) {
          throw { field: `${fieldName}`, message: "No files uploaded" };
        }

        for (const uploadedFile of uploadedFiles) {
          if (!allowedFileTypes.includes(uploadedFile?.type)) {
            fs.unlink(uploadedFile.fd, () => {});
            throw { field: `${fieldName}`, message: `${fieldName} should be only of type jpg, png or jpeg` };
          }
          await uploadFiles(uploadedFile, async function (filename) {});
        }
        await addRecord(insertData);
      } catch (err) {
        return response.status(400).json(err); // Send error message to client
      }
    };

    // Process file upload and record addition
    await validateUploadedFiles();

  } catch (err) {
    console.error(err);
    if (!response.headersSent) {
      response.status(500).json({ error: 'Internal Server Error' });
    }
  }
};