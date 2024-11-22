const fs = require("fs");
const path = require("path");
const DataService = require("../../services/DataService");

// Define global constants and file handling logic
const fileConfig = {
  media: {
    filePath: Tables.attributesMeta.media.s3_folder,
    prefix: "image",
    allowedTypes: ["image/png", "image/jpg", "image/jpeg"],
    options: DataService.resolutionNames,
    column: "media",
    sizeLimit: 10 * 1024 * 1024, // 10 MB
  },

  video: {
    filePath: Tables.attributesMeta.media.s3_folder_video,
    prefix: "video",
    allowedTypes: ["video/mp4", "video/mkv"],
    options: DataService.resolutionNames,
    column: "video",
    sizeLimit: 20 * 1024 * 1024, // 20 MB
  },
};

module.exports = async function updateFile(request, response) {
  const postKey = "media";

  try {
    const { allParams, _fileparser } = request;
    let { id: tableId, type } = allParams();

    /*<<<<<<<< MANAGER CONDITIONS  >>>>>>*/
    if (UserType(request) === roles.manager) {
    }

    /*<<<<<<<< ADMIN CONDITIONS  >>>>>>*/
    if (UserType(request) === roles.admin) {
    }

    /*<<<<<<<< MEMBER CONDITIONS  >>>>>>*/
    if (UserType(request) === roles.member) {
      const checkIsOwnerTable = await Tables.findOne({
        id: tableId,
        created_by: ProfileMemberId(request),
      });
      if (!checkIsOwnerTable) {
        return response
          .status(500)
          .json({ error: "You don't have access to the table for update." });
      }
    }

    const parseTableId = parseInt(tableId);
    type = "media";

    let insertData = {};
    if (type === "media") {
      insertData = { media: [] };
    } else if (type === "video") {
      insertData = { video: [] };
    } else {
      throw { field: "type", message: `Unsupported type: ${type}` };
    }

    let responseObject = {};

    const getFileTypeConfig = (fileType) => {
      if (!fileConfig[fileType]) {
        throw {
          field: "fileType",
          message: `Unsupported file type configuration: ${fileType}`,
        };
      }
      return fileConfig[fileType];
    };

    const formatFileTypes = (types) => {
      return types.map((type) => type.split("/")[1]).join(", ");
    };

    const uploadFiles = async (file, fileType) => {
      try {
        const settings = getFileTypeConfig(fileType);

        if (!settings.allowedTypes.includes(file.type)) {
          fs.unlink(file.fd, () => {});
          throw {
            field: settings.column,
            message: `File type mismatch: Expected ${fileType}, but got ${
              file.type
            }. Accepted file types are: ${formatFileTypes(
              settings.allowedTypes
            )}`,
          };
        }

        if (file.size > settings.sizeLimit) {
          fs.unlink(file.fd, () => {});
          throw {
            field: settings.column,
            message: `File size exceeds limit for ${fileType}. Max limit is ${(
              settings.sizeLimit /
              (1024 * 1024)
            ).toFixed(2)} MB`,
          };
        }

        if (!insertData[settings.column]) {
          insertData[settings.column] = [];
        }

        const existingFilesCount = insertData[settings.column].filter((m) =>
          m.startsWith(`${settings.prefix}-${parseTableId}`)
        ).length;

        // Determine the correct file extension
        const fileExtension = fileType === "video" ? ".mp4" : ".webp";

        const filename = `${settings.prefix}-${parseTableId}_${
          existingFilesCount + 1
        }${fileExtension}`;
        insertData[settings.column].push(filename);

        // Construct the file path correctly
        const filePath = path.join(settings.filePath, filename);

        await fileUploadService.S3file(
          file,
          settings.filePath,
          filename,
          settings.options,
          (err, done) => {
            if (err) {
              console.error(`Error uploading ${filename}:`, err);
              throw err;
            } else if (done) {
              return filename;
            }
          }
        );
      } catch (err) {
        console.error("Upload error:", err);
        throw err;
      }
    };

    const addRecord = async (postData) => {
      try {
        const updatedRecordDetails = await Tables.update(
          { id: parseTableId },
          postData
        );
        sendResponse(updatedRecordDetails);
      } catch (err) {
        console.error("Error updating record:", err);
        throw err;
      }
    };

    const validateUploadedFiles = async () => {
      try {
        if (
          !_fileparser ||
          !_fileparser.upstreams ||
          _fileparser.upstreams.length === 0
        ) {
          throw { field: `${postKey}`, message: "No files uploaded" };
        }

        const uploadedFiles = await new Promise((resolve, reject) => {
          request
            .file(`${postKey}`)
            .upload({ maxBytes: 500000000 }, (err, files) => {
              if (err) {
                reject(err);
              }
              resolve(files);
            });
        });

        if (uploadedFiles.length === 0) {
          throw { field: `${postKey}`, message: "No files uploaded" };
        }

        for (const uploadedFile of uploadedFiles) {
          const fileType = getFileType(uploadedFile.type);
          if (fileType !== type) {
            const acceptedTypes = formatFileTypes(
              fileConfig[type]?.allowedTypes || []
            );
            throw {
              field: `${postKey}`,
              message: `File type mismatch: Expected ${type}, but got ${fileType}. Accepted file types are: ${acceptedTypes}`,
            };
          }
          await uploadFiles(uploadedFile, fileType);
        }

        await addRecord(insertData);
      } catch (err) {
        console.error(err);
        if (!response.headersSent) {
          response.status(400).json({
            param_type: type,
            accepted_fields: Object.keys(insertData),
            field: err.field,
            message: err.message,
          });
        }
      }
    };

    const sendResponse = (details) => {
      responseObject.message = "Files uploaded successfully";
      responseObject.meta = {
        ...sails.config.custom.s3_bucket_options,
        example_photo: {
          hd:
            sails.config.custom.s3_bucket_options.table_photo.hd +
            "image-1_1.webp",
          standardResolution:
            sails.config.custom.s3_bucket_options.table_photo.hd +
            "image-1_1.webp",
        },
      };
      responseObject.details = details[0];
      return response.ok(responseObject);
    };

    await validateUploadedFiles();
  } catch (err) {
    console.error(err);
    if (!response.headersSent) {
      response.status(500).json({ error: "Internal Server Error" });
    }
  }
};

function getFileType(mimeType) {
  if (mimeType.startsWith("image")) {
    return "media";
  } else if (mimeType.startsWith("video")) {
    return "video";
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
}
