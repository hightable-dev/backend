/**
 * Media resizing and uploading service.//
 */

/* global _ */

var async = require("async");
var fs = require("fs");
var AWS = require("aws-sdk");
var sharp = require("sharp");
var ffmpeg = require("fluent-ffmpeg");

var bucket = sails.config.conf.aws.bucket_name;
var endpoint = new AWS.Endpoint(sails.config.conf.aws.endpoint);
var aws_options = {
    apiVersion: '2006-03-01',
    endpoint: endpoint,
    accessKeyId: sails.config.conf.aws.access_key_id,
    secretAccessKey: sails.config.conf.aws.secret_access_key
};
var s3 = new AWS.S3(aws_options);

// Resize and upload photos
async function resizeAndUploadPhoto(data, filePath, filename, sizes, callback, additionalParams) {
    console.log("sizessizessizes 1",sizes)

    try {
        const uploadPromises = sizes.map(async (size) => {
            let fileKey = `${filePath}/${filename.replace(/\.[^/.]+$/,`_${size.width}x${size.height}.webp`)}`;
            
            if (size === 'Original') {
                const uploadParams = {
                    Bucket: bucket,
                    Key: fileKey,
                    ACL: 'public-read',
                    Body: data,
                    ...additionalParams
                };
                await s3.putObject(uploadParams).promise();
                console.log(`Successfully uploaded2 ${fileKey}`);
            } else {
                const resizedData = await sharp(data).resize(size).webp().toBuffer();
                const uploadParams = {
                    Bucket: bucket,
                    Key: fileKey,
                    ACL: 'public-read',
                    Body: resizedData,
                    ...additionalParams
                };
                await s3.putObject(uploadParams).promise();
                console.log(`Successfully uploaded3 ${fileKey}`);
            }
        });

        await Promise.all(uploadPromises);
        callback(null, 'All images uploaded successfully');
    } catch (err) {
        console.error('Error in resizeAndUploadPhoto:', err);
        callback(err);
    }
}

// Resize and upload video
async function resizeAndUploadVideo(file, filePath, filename, sizes, callback) {
    console.log("sizessizessizes 2",sizes)
    try {
        const uploadPromises = sizes.map(async (size) => {
            let outputFilename = filename.replace(/\.[^/.]+$/, `-${size.width}x${size.height}.mp4`); // Ensure .mp4 extension

            await new Promise((resolve, reject) => {
                ffmpeg(file.fd)
                    .outputFormat('mp4') // Ensure output format is MP4
                    .size(`${size.width}x${size.height}`)
                    .videoCodec('libx264') // Use the H.264 codec for MP4
                    .audioCodec('aac') // Optional: Ensure audio is encoded (if needed)
                    .on('end', () => resolve())
                    .on('error', reject)
                    .save(outputFilename);
            });

            const uploadParams = {
                Bucket: bucket,
                Key: `${filePath}/${outputFilename}`,
                ACL: 'public-read',
                Body: fs.createReadStream(outputFilename)
            };
            await s3.putObject(uploadParams).promise();
            console.log(`Successfully uploaded ${outputFilename}`);

            // Clean up the temporary file
            fs.unlinkSync(outputFilename);
        });

        await Promise.all(uploadPromises);
        callback(null, 'All videos uploaded successfully');
    } catch (err) {
        console.error('Error in resizeAndUploadVideo:', err);
        callback(err);
    }
}

// Main function to handle media upload
exports.S3file = function (file, filePath, filename, sizes, callback, res) {
    fs.readFile(file.fd, async function (err, data) {
        if (err) {
            console.error(`Error reading file ${filename}:`, err);
            return callback(err);
        }

        // Determine the file type and generate the correct filename extension
        let finalFilename = filename;
        if (file.type.startsWith('video')) {
            console.log("file.type1. video", file.type, filename)
            finalFilename = filename.replace(/\.[^/.]+$/, ".mp4");
            await resizeAndUploadVideo(file, filePath, finalFilename, sizes, callback);
        } else if (file.type.startsWith('image')) {
            console.log("file.type2. image", file.type, filename)

            finalFilename = filename.replace(/\.[^/.]+$/, ".webp");
            await resizeAndUploadPhoto(data, filePath, finalFilename, sizes, callback);
        } else {
            // For non-image/video files, use the original filename
            const uploadParams = {
                Bucket: bucket,
                Key: `${filePath}/${filename}`,
                ACL: 'public-read',
                Body: data
            };
            await s3.putObject(uploadParams).promise();
            console.log(`Successfully uploaded1 ${filename}`);
            callback(null, 'File uploaded successfully');
        }
    });
};

// Delete files from S3
exports.deleteFromS3 = async function (photo_keys, callback) {
    var params = {
        Bucket: bucket,
        Delete: {
            Objects: photo_keys
        }
    };
    await s3.deleteObjects(params).promise();
    console.log('Successfully deleted files:', photo_keys);
    callback(null, 'Files deleted successfully');
};
