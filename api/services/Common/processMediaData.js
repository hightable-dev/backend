const DataService = require("../DataService");

// File: mediaProcessor.js (or the file name you choose)
module.exports = function processMediaData({ media, video, size }) {

  const tablesPhoto = sails.config.custom.s3_bucket_options.base_url.table_photo;
  const tablesVideo = sails.config.custom.s3_bucket_options.base_url.table_video;

  if (Array.isArray(media) && media.length > 0) {
    // console.log("media[0]", media[0]);
  } else {
    // console.log("media is not an array or is empty");
  }

  if (Array.isArray(video) && video.length > 0) {
    // console.log("video[0]", video[0]);
  } else {
    // console.log("video is not an array or is empty");
  }
  // item.media = item.media ? tablesPhoto + item.media : tablesPhoto + 'tables-media-1.png';
  // size = size ? size : 'standardResolution';

  return {
    // media: media && Array.isArray(media) && media.length > 0
    // // ? size?.photo ? `${tablesPhoto}${size.photo}/${media[0]}` : `${tablesPhoto}standardResolution/${media[0]}` || ''
    // : null,

    media: media && Array.isArray(media) && media.length > 0
      ? (size?.photo ? `${tablesPhoto}${size.photo}/${media[0]}` : `${tablesPhoto}standardResolution/${media[0]}`)
      : null,
    // video: video && Array.isArray(video) && video.length > 0
    //   ? size?.video ? `${tablesVideo}${size.video}/${video[0]}` : `${tablesVideo}hd/${video[0]}` || ''
    //   : null

    video: video && Array.isArray(video) && video.length > 0
      ? (size?.video ? `${tablesVideo}${size.video}/${video[0]}` : `${tablesVideo}hd/${video[0]}`)
      : null

  };
};
