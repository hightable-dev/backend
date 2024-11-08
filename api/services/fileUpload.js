/**
 *
 * @author Magesh <magesh@studioq.co.in>
 *
 */

/* global _ */

/**
 * Return a unique identifier with the given `len`.
 *
 *     utils.uid(10);
 *     // => 'FDaS435D2z'
 *
 * @param {Number} len
 * @return {String}
 * @api private
 */

var async = require("async");
//AWS bucket options
var bucket = sails.config.conf.aws.bucket_name;

// Resize photo and converting them to streams. Then upload it to s3
exports.S3 = async function(photo, file_path, filename, sizes, callback, additional_param={}) {
    var fs = require('fs');
    var AWS = require('aws-sdk');

    var endpoint = new AWS.Endpoint(sails.config.conf.aws.endpoint);
    var aws_options = {
        apiVersion: '2006-03-01',
        endpoint: endpoint,
        accessKeyId: sails.config.conf.aws.access_key_id,
        secretAccessKey: sails.config.conf.aws.secret_access_key
    };
    var s3 = new AWS.S3(aws_options);
    const sharp = require('sharp');
    additional_param = _.isObject({additional_param})?additional_param:{};
    fs.readFile(photo.fd, async function(err, data){
        sizes.forEach(async function (size, key) {
            if(size === 'Original'){
                var upload_params = {
                    Bucket: bucket,
                    Key: file_path + '/' + size + '/' + filename,
                    ACL: 'public-read',
                    Body: data,
                    ...additional_param
                };
                await s3.putObject(upload_params, async function(err, upload_data){
                    if(err){
                        //error
                        return callback(err);
                    }else if(key === ((sizes.length)-1)){
                        return callback(err,true);
                    }else{
                        return callback(err,false);
                    }
                });
            }else{
                await sharp(data).resize(size).toBuffer().then(async resized_data => {
                    var upload_params = {
                        Bucket: bucket,
                        Key: file_path + '/' + size + '/' + filename,
                        ACL: 'public-read',
                        Body: resized_data,
                        ...additional_param
                    };
                    await s3.putObject(upload_params, async function(err, upload_data){
                        if(err){
                            //error
                            return callback(err);
                        }else if(key === ((sizes.length)-1)){
                            return callback(err,true);
                        }else{
                            return callback(err,false);
                        }
                    });
                }).catch(async err => {
                    //error
                    return callback(err);
                });
            }
        }, function (err) {
            return callback(err);
        });
    });
};


exports.S3file = async function(file, file_path, filename,sizes,callback,res) {
    var fs = require('fs');
    var AWS = require('aws-sdk');
    var endpoint = new AWS.Endpoint(sails.config.conf.aws.endpoint);
    var aws_options = {
        apiVersion: '2006-03-01',
        endpoint: endpoint,
        accessKeyId: sails.config.conf.aws.access_key_id,
        secretAccessKey: sails.config.conf.aws.secret_access_key
    };
    var s3 = new AWS.S3(aws_options);
    const sharp = require('sharp');
    fs.readFile(file.fd, async function(err, data){
        var upload_params = {
            Bucket: bucket,
            Key: file_path + '/' + filename,
            ACL: 'public-read',
            Body: data
        };
        await s3.putObject(upload_params, async function(err, upload_data){
            if(err){
                //error
                return callback;
            }else{
                return callback;
            }
        });
    });
};
//Delete files from s3
exports.deleteFromS3 = async function(photo_keys, callback) {
    var fs = require('fs');
    var AWS = require('aws-sdk');
    var endpoint = new AWS.Endpoint(sails.config.conf.aws.endpoint);
    var aws_options = {
        apiVersion: '2006-03-01',
        endpoint: endpoint,
        accessKeyId: sails.config.conf.aws.access_key_id,
        secretAccessKey: sails.config.conf.aws.secret_access_key
    };
    var s3 = new AWS.S3(aws_options);
    var params = {
        Bucket: bucket,
        Delete: {
            Objects: photo_keys
        }
    };
    await s3.deleteObjects(params, function(err, data) {
        if(err) {
            return callback(err);
        }else{
            return callback(err,true);
        }
    });
};