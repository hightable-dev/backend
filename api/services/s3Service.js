// File: mediaProcessor.js

const async = require("async");
const fs = require("fs");
const AWS = require("aws-sdk");
const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const DataService = require("./DataService");

// AWS configuration
const bucket = sails.config.conf.aws.bucket_name;
const endpoint = new AWS.Endpoint(sails.config.conf.aws.endpoint);
const aws_options = {
    apiVersion: '2006-03-01',
    endpoint: endpoint,
    accessKeyId: sails.config.conf.aws.access_key_id,
    secretAccessKey: sails.config.conf.aws.secret_access_key
};
const s3 = new AWS.S3(aws_options);

// Video and image resolutions
// const resolution = {
//     verySmall: { width: 160, height: 90, bitrate: '100k' },
//     small: { width: 320, height: 180, bitrate: '200k' },
//     qvga: { width: 426, height: 240, bitrate: '300k' },
//     standardResolution: { width: 480, height: 270, bitrate: '400k' },
//     lowResolution: { width: 640, height: 360, bitrate: '500k' },
//     standardResolution: { width: 854, height: 480, bitrate: '1M' },
//     qhd: { width: 960, height: 540, bitrate: '1.2M' },
//     hd: { width: 1280, height: 720, bitrate: '2.5M' },
//     hdPlus: { width: 1440, height: 810, bitrate: '3M' },
//     fullHd: { width: 1920, height: 1080, bitrate: '5M' }
// };

const resolution = DataService.resolution;
// Resize and upload photos to S3
async function resizeAndUploadPhoto(data, filePath, filename, sizes, callback, additionalParams) {
    // const videoCompress = true ;
    // const photoCompress = true ;
    try {
        const uploadPromises = sizes.map(async (size) => {
            let sizeKey = size.replace(/\s+/g, '');
            let sizeConfig = resolution[sizeKey];

            if (!sizeConfig && size !== 'Original') {
                console.warn(`No configuration found for size: ${size}`);
                return; // Skip if no matching resolution configuration
            }

            let fileKey = `${filePath}/${sizeKey}/${filename.replace(/\.[^/.]+$/, '')}.webp`;

            if (size === 'Original') {
                const uploadParams = {
                    Bucket: bucket,
                    Key: fileKey,
                    ACL: 'public-read',
                    Body: data,
                    ...additionalParams
                };
                await s3.putObject(uploadParams).promise();
            } else {
                const resizedData = await sharp(data)
                    .resize(sizeConfig.width, sizeConfig.height)
                    .webp()
                    .toBuffer();

                const uploadParams = {
                    Bucket: bucket,
                    Key: fileKey,
                    ACL: 'public-read',
                    Body: resizedData,
                    ...additionalParams
                };
                await s3.putObject(uploadParams).promise();
            }
        });

        await Promise.all(uploadPromises);
        callback(null, 'All images uploaded successfully');
    } catch (err) {
        callback(err);
    }
}

// Resize and upload videos to S3
async function resizeAndUploadVideo(file, filePath, filename, sizes, callback) {

    try {
        const uploadPromises = sizes.map(async (size) => {
            let sizeKey = size.replace(/\s+/g, '');
            let sizeConfig = resolution[sizeKey];

            if (!sizeConfig) {
                console.warn(`No configuration found for size: ${size}`);
                return;
            }

            const tempDir = path.join(__dirname, 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }

            const tempFilePath = path.join(tempDir, `${filename}-${sizeKey}.mp4`);
            const outputFilename = `${filePath}/${sizeKey}/${filename.replace(/\.[^/.]+$/, `.mp4`)}`;

            // Resize video using ffmpeg
            await new Promise((resolve, reject) => {
                ffmpeg(file.fd)
                    .outputFormat('mp4')
                    .size(`${resolution[sizeKey].width}x${resolution[sizeKey].height}`)
                    .videoCodec('libx264')
                    .audioCodec('aac')
                    .on('end', resolve)
                    .on('error', (err) => {
                        reject(err);
                    })
                    .save(tempFilePath);  // Save to a temporary location
            });


            // Upload the video to S3
            const uploadParams = {
                Bucket: bucket,
                Key: outputFilename,
                ACL: 'public-read',
                Body: fs.createReadStream(tempFilePath)
            };
            await s3.putObject(uploadParams).promise();

            // Clean up the temporary file
            fs.unlinkSync(tempFilePath);
        });

        await Promise.all(uploadPromises);
        callback(null, 'All videos uploaded successfully');
    } catch (err) {
        callback(err);
    }
}

// Main function to handle media upload
exports.S3file = function (file, filePath, filename, sizes, callback, res) {
    fs.readFile(file.fd, async (err, data) => {
        if (err) {
            return callback(err);
        }

        let finalFilename = filename;
        if (file.type.startsWith('video')) {
            finalFilename = filename.replace(/\.[^/.]+$/, ".mp4");
            await resizeAndUploadVideo(file, filePath, finalFilename, sizes, callback);
        } else if (file.type.startsWith('image')) {
            finalFilename = filename.replace(/\.[^/.]+$/, ".webp");
            await resizeAndUploadPhoto(data, filePath, finalFilename, sizes, callback);
        } else {
            const uploadParams = {
                Bucket: bucket,
                Key: `${filePath}/${filename}`,
                ACL: 'public-read',
                Body: data
            };
            await s3.putObject(uploadParams).promise();
            callback(null, 'File uploaded successfully');
        }
    });
};

// Delete files from S3
exports.deleteFromS3 = async function (photoKeys, callback) {
    const params = {
        Bucket: bucket,
        Delete: {
            Objects: photoKeys.map(key => ({ Key: key }))
        }
    };
    await s3.deleteObjects(params).promise();
    callback(null, 'Files deleted successfully');
};
