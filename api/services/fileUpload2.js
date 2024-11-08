/**
 * Media resizing and uploading service.
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
    for (let size of sizes) {
        if (size === 'Original') {
            var uploadParams = {
                Bucket: bucket,
                Key: `${filePath}/${size}/${filename}`,
                ACL: 'public-read',
                Body: data,
                ...additionalParams
            };
            await s3.putObject(uploadParams, callback);
        } else {
            await sharp(data).resize(size).toBuffer().then(async resizedData => {
                var uploadParams = {
                    Bucket: bucket,
                    Key: `${filePath}/${size}/${filename}`,
                    ACL: 'public-read',
                    Body: resizedData,
                    ...additionalParams
                };
                await s3.putObject(uploadParams, callback);
            }).catch(callback);
        }
    }
}

// Resize and upload audio
async function resizeAndUploadAudio(file, filePath, filename, bitrates, callback) {
    for (let bitrate of bitrates) {
        var outputFilename = filename.replace('.', `-${bitrate}kbps.`);
        ffmpeg(file.fd)
            .audioBitrate(bitrate)
            .save(outputFilename)
            .on('end', async function () {
                var uploadParams = {
                    Bucket: bucket,
                    Key: `${filePath}/${outputFilename}`,
                    ACL: 'public-read',
                    Body: fs.createReadStream(outputFilename)
                };
                await s3.putObject(uploadParams, callback);
            })
            .on('error', callback);
    }
}

// Resize and upload video
async function resizeAndUploadVideo(file, filePath, filename, sizes, callback) {
    for (let size of sizes) {
        var outputFilename = filename.replace('.', `-${size.width}x${size.height}.`);
        ffmpeg(file.fd)
            .size(`${size.width}x${size.height}`)
            .save(outputFilename)
            .on('end', async function () {
                var uploadParams = {
                    Bucket: bucket,
                    Key: `${filePath}/${outputFilename}`,
                    ACL: 'public-read',
                    Body: fs.createReadStream(outputFilename)
                };
                await s3.putObject(uploadParams, callback);
            })
            .on('error', callback);
    }
}

// Main function to handle media upload
exports.S3file = async function (file, filePath, filename, sizes, callback, res) {
    fs.readFile(file.fd, async function (err, data) {
        if (err) return callback(err);

        // Determine the file type and resize/upload accordingly
        if (file.type.startsWith('image')) {
            await resizeAndUploadPhoto(data, filePath, filename, sizes, callback);
        } else if (file.type.startsWith('audio')) {
            await resizeAndUploadAudio(file, filePath, filename, sizes, callback);
        } else if (file.type.startsWith('video')) {
            await resizeAndUploadVideo(file, filePath, filename, sizes, callback);
        } else {
            var uploadParams = {
                Bucket: bucket,
                Key: `${filePath}/${filename}`,
                ACL: 'public-read',
                Body: data
            };
            await s3.putObject(uploadParams, callback);
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
    await s3.deleteObjects(params, callback);
};
