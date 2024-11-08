/**
 *
 * @author mohan<mohan@studioq.co.in>
 *
 */

var moment = require("moment");
/**
 * Return a unique identifier with the given `len`.
 *
 *     utils.uid(10);
 *     // => "FDaS435D2z"
 *
 * @param {Number} len
 * @return {String}
 * @api private
 */

exports.uid = function (len) {
  var buf = []
    , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    , charlen = chars.length;

  for (var i = 0; i < len; ++i) {
    buf.push(chars[getRandomInt(0, charlen - 1)]);
  }

  return buf.join('');
};

exports.uidLight = function (len) {
  var buf = []
    , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    , charlen = chars.length;

  for (var i = 0; i < len; ++i) {
    buf.push(chars[getRandomInt(0, charlen - 1)]);
  }

  return buf.join('');
};

/**
 * Throw error back to client`
 *
 * @param {Object} error
 * @param {Object} response
 * @return {Response}
 * @api private
 */
exports.throwIfErrorElseCallback = function (error, response, status = 500, callback = () => { }) {
  if (!_.isEmpty(error)) {
    const _response_object = {};
    errorBuilder.build(error, function (error_obj) {
      _response_object.errors = error_obj;
      _response_object.count = error_obj.length;
      return response.status(status).json(_response_object);
    });
  } else {
    callback();
  }
}

/**
 * Retuen formatted fields`
 *
 * @param {Object} config_fields
 * @return {formatted_fields}
 * @api private
 */
exports.fieldsFormatter = function (config_fields, filtered_data) {
  return new Promise((resolve, reject) => {
    const final_fields_to_validate = _.chain(config_fields).clone().values().flattenDeep().uniq().intersection(_.keys(filtered_data)).value();

    _.forEach(final_fields_to_validate, function (field) {
      if (_.chain(config_fields).get('parseInt', []).includes(field).value()) {
        filtered_data[field] = _.isArray(filtered_data[field]) ? _.map(filtered_data[field], _.parseInt) : _.parseInt(filtered_data[field]);
      }
      if (_.chain(config_fields).get('toNumber', []).includes(field).value()) {
        filtered_data[field] = _.isArray(filtered_data[field]) ? _.map(filtered_data[field], _.toNumber) : _.toNumber(filtered_data[field]);
      }
      if (_.chain(config_fields).get('date', []).includes(field).value()) {
        filtered_data[field] = _.isArray(filtered_data[field]) ? _.map(filtered_data[field], value => moment(value, 'DD.MM.YYYY HH:mm').toDate()) : moment(filtered_data[field], 'DD.MM.YYYY HH:mm').toDate();
      }
      if (_.chain(config_fields).get('time', []).includes(field).value()) {
        filtered_data[field] = _.isArray(filtered_data[field]) ? _.map(filtered_data[field], value => moment(value, 'HH:mm').format('HH:mm')) : moment(filtered_data[field], 'HH:mm').format('HH:mm');
      }
      if (_.chain(config_fields).get('uniq', []).includes(field).value()) {
        filtered_data[field] = _.uniq(filtered_data[field]);
      }
      if (_.chain(config_fields).get('toLower', []).includes(field).value()) {
        filtered_data[field] = _.toLower(filtered_data[field]);
      }
      if (_.chain(config_fields).get('boolean', []).includes(field).value()) {
        filtered_data[field] = filtered_data[field] === "false" ? false : !!filtered_data[field];
      }
      if (_.chain(config_fields).get('split', []).includes(field).value()) {
        filtered_data[field] = _.split(filtered_data[field], ",");
      }
    });
    resolve();
  });
}

/**
 * Return the image URL`
 *
 * @param {String} folder
 * @param {String} size
 * @return {String}
 * @api private
 */
exports.S3Images = function (foldername, filename, size = 'small') {
  const meta = {
    path: 'https://s3.' + sails.config.conf.aws.region + '.amazonaws.com/' + sails.config.conf.aws.bucket_name,
    folder: `public/images/${foldername}`,
    sizes: {
      small: 256,
      medium: 512
    }
  };
  return `${_.get(meta, 'path')}/${_.get(meta, 'folder')}/${_.get(meta, `sizes.${size}`)}/${filename}`;
}


/**
 * Return Application base URL`
 *
 * @param {Object} request
 * @return {String}
 * @api private
 */
exports.baseUrl = function (request) {

  const protocol = _.get(request, 'connection.encrypted') ? 'https' : 'http';
  const baseUrl = protocol + '://' + _.get(request, 'headers.host');
  return baseUrl;
}

/**
 * Return a random int, used by `utils.uid()`
 *
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 * @api private
 */

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.roundPrice = function (price) {
  return Math.round((parseFloat(price) + Number.EPSILON) * 100) / 100;
};
