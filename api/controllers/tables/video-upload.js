const { name } = require("ejs");
const fs = require("fs");

module.exports = async function updateFile(request, response) {
  try {
    const post_request_data = request.body;
    // const logged_in_user = request.user;
    let filtered_post_data = {};
    // filtered_post_data = logged_in_user;
    let request_query = request.allParams();

    let requestdata = _.pick(request_query, ['id']);
    let insert_data = {};

    let _response_object = {};

    let input_attributes = [
      { name: 'id', required: true}

    ];
    console.log("77777777777",request_query)

    // Function to send a successful response
    const sendResponse = (details) => {
      _response_object.message = "media uploaded successfully";
      var meta = {};
      meta["media"] = {
        path:
          "https://s3." +
          sails.config.conf.aws.region +
          ".amazonaws.com/" +
          sails.config.conf.aws.bucket_name,
        folder: Tables.attributesMeta.media.s3_folder_video,
      };
      meta["media"].example =
        meta["media"].path +
        "/" +
        meta["media"].folder +
        "/" +
        "/user-209.mp4";
      _response_object["meta"] = meta;
      _response_object["details"] = _.cloneDeep(details);
        details.video =  sails.config.custom.filePath.tablesMedia +  details.video;
      _response_object.details = { ...details };
      return response.ok(_response_object);
    };

    // Function to handle file upload
    const uploadFiles = async (media, callback) => {
      try {
        const path = require("path");
        const filename =
          "media" +
          Number(new Date()) +
          "-" +
          Math.floor(Math.random() * 9999999999 + 1) +
          path.extname(media.filename);
        const file_path = Tables.attributesMeta.media.s3_folder_video;

        insert_data.media = filename;

        await fileUpload.S3file(
          media,
          file_path,
          filename,
          [256, 512],
          async function (err, done) {
            if (err) {
              err.field = "media";
              throw err; // Throw the error to be caught later
            } else {
              console.log("ndfjgnhujfnuj", done);
              if (done) {
                return callback(filename);
              }
            }
          }
        );
      } catch (err) {
        throw err; // Throw the error to be caught later
      }
    };
    // Function to add a record
    const addRecord = async (post_data) => {
      console.log("qeryqyewruqew",post_data)
      try {
        const updatedRecordDetails = await Tables.update(
          { id: requestdata?.id },
          { video: post_data.media }
        );

        sendResponse(updatedRecordDetails);
      } catch (err) {
        err.field = 'media';
        throw err; // Throw the error to be caught later
      }
    };

    // Add the filename to the table row.
    validateModel.validate(
      Tables,
      input_attributes,
      requestdata,
      async function (valid, errors) {
        if (valid) {
          if (
            request._fileparser &&
            request._fileparser.upstreams &&
            request._fileparser.upstreams.length > 0
          ) {
            try {
              const uploaded_files = await new Promise((resolve, reject) => {
                request.file("media").upload(
                  {
                    maxBytes: 500000000,
                  },
                  (err, files) => {
                    if (err) {
                      err.field = "media";
                      reject(err);
                    }
                    resolve(files);
                  }
                );
              });

              if (uploaded_files.length > 0) {
                // media uploaded
                for (const uploaded_file of uploaded_files) {
                  var allowed_file_types = [
                    "media/mp4",
                    "media/m4v",
                    "media/m4v",
                    "video/mp4",
                    "video/quicktime"
                  ];
                  console.log("DHADJFHAJDSF",uploaded_file?.type)
                  if (allowed_file_types.indexOf(uploaded_file?.type) === -1) {
                    fs.unlink(uploaded_file.fd, function (err) {});
                    _response_object.errors = [
                      {
                        field: "media",
                        rules: [
                          {
                            rule: "required",
                            message:
                              "media should be only of type mp4, m4v, or m4v.",
                          },
                        ],
                      },
                    ];
                    _response_object.count = 1;
                    return response.status(400).json(_response_object);
                  } else {
                    // Uploading media

                    await uploadFiles(uploaded_file, async function (filename) {
                    });
                  }
                }
                await addRecord(insert_data);

              } else {
                _response_object.errors = [
                  {
                    field: "media",
                    rules: [
                      {
                        rule: "required",
                        message: "media cannot be empty.",
                      },
                    ],
                  },
                ];
                _response_object.count = 1;
                return response.status(400).json(_response_object);
              }
            } catch (err) {
              err.field = "media";
              throw err; // Throw the error to be caught later
            }
          } else {
            _response_object.errors = [
              {
                field: "media",
                rules: [
                  {
                    rule: "required",
                    message: "media cannot be empty.",
                  },
                ],
              },
            ];
            _response_object.count = 1;
            return response.status(400).json(_response_object);
          }
        } else {
          _response_object.errors = errors;
          _response_object.count = errors.length;
          return response.status(400).json(_response_object);
        }
      }
    );
  } catch (err) {
    // Handle the error here
    console.error(err);
    if (!response.headersSent) {
      response.status(500).json({ error: 'Internal Server Error' });
    }
  }
};
