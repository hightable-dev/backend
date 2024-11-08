/**
 * @author mohan <mohan@studioq.co.in>
 */

/* global _, ProfileManagers /sails */

module.exports = async function list(request, response) {

  var _response_object = {};
  const request_query = request.allParams();
  const filtered_query_data = _.pick(request_query, ['page', 'sort', 'limit', 'expand', 'search', 'status', 'type']);
  var row_deleted_sign = _.get(sails.config.custom.statusCode_codes, 'deleted');
  const filtered_query_keys = Object.keys(filtered_query_data);
  var input_attributes = [
    { name: 'page', number: true, min: 1 },
    { name: 'limit', number: true, min: 1 },
    { name: 'status', enum: true, values: _.values(_.pick(sails.config.custom.statusCode_codes, ['inactive', 'active'])) },
  ];
  const getUsers = async (criteria, callback) => {
    const count_query = await buildNativeQueryToGetUsersList(criteria, true).then(function (query) {
      return query;
    });
    sails.sendNativeQuery(count_query, async function (err, total) {
      if (err) {
        var error = {
          'field': 'count',
          'rules': [
            {
              'rule': 'invalid',
              'message': err.message
            }
          ]
        };
        _response_object.errors = [error];
        _response_object.count = _response_object.errors.count;
        return response.status(400).json(_response_object);
      } else if (_.get(total, 'count.rows[0].count') < 1) {
        return callback([], {}, _.get(total, 'count.rows[0].count'));
      } else {
        const list_query = await buildNativeQueryToGetUsersList(criteria, false).then(function (query) {
          return query;
        });
        sails.sendNativeQuery(list_query, async function (err, users) {
          if (err) {
            var error = {
              'field': 'items',
              'rules': [
                {
                  'rule': 'invalid',
                  'message': err.message
                }
              ]
            };
            _response_object.errors = [error];
            _response_object.count = _response_object.errors.count;
            return response.status(400).json(_response_object);
          } else {
            return callback(_.get(users, 'rows'), {}, parseInt(_.get(_.cloneDeep(total), 'rows[0].count')));
          }
        });
      }
    });
  };


  //Build and sending response
  const sendResponse = (items, details, total) => {
    _response_object.message = 'Users items retrieved successfully.';
    var meta = {};
    meta['count'] = items.length;
    meta['total'] = total;
    meta['page'] = filtered_query_data.page ? filtered_query_data.page : 1;
    meta['limit'] = filtered_query_data.limit;
    meta['photo'] = {
      path: 'https://s3.' + sails.config.conf.aws.region + '.amazonaws.com/' + sails.config.conf.aws.bucket_name,
      folder: Users.attributesMeta.photo.s3_folder,
      sizes: {
        small: 256,
        medium: 512
      }
    };
    meta['photo'].example = meta['photo'].path + '/' + meta['photo'].folder + '/' + meta['photo'].sizes.medium + `/[filename].[filetype]`;

    _response_object['meta'] = meta;
    _response_object['items'] = _.cloneDeep(items);
    if (!_.isEmpty(details)) {
      _response_object['details'] = _.cloneDeep(details);
    }
    return response.ok(_response_object);
  };

  const buildNativeQueryToGetUsersList = async (criteria, count = false) => {
    let query = `SELECT ${count ? 'COUNT(*)' : '*'} FROM "${Users.tableName}" "${Users.tableAlias}"`;
    if (_.has(criteria, 'where.name.contains')) {
      query += ` WHERE "${Users.schema.name.columnName}" LIKE '${_.get(criteria, 'where.name.contains')}%'`;
    }
    if (_.has(criteria, 'where.type')) {
      query += `${_.has(criteria, 'where.name.contains') ? ' AND' : ' WHERE'} "${Users.schema.type.columnName}" = ${_.get(criteria, 'where.type')}`;
    }
    if (_.has(criteria, 'where.status')) {
      query += `${(_.has(criteria, 'where.name.contains') || _.has(criteria, 'where.type')) ? ' AND' : ' WHERE'} "${Users.schema.status.columnName}" = ${_.get(criteria, 'where.status')}`;
    } else {
      query += `${(_.has(criteria, 'where.name.contains') || _.has(criteria, 'where.type')) ? ' AND' : ' WHERE'} "${Users.schema.status.columnName}" != ${row_deleted_sign}`;
    }

    if (count) {
      return query;
    } else {
      if (_.isArray(_.get(criteria, 'sort'))) {
        const sortFields = _.get(criteria, 'sort');
        const sortClauses = sortFields.map(field => `"${_.keys(field)[0]}" ${field[_.keys(field)[0]] === 'DESC' ? 'DESC' : 'ASC'}`);
        query += ` ORDER BY ${sortClauses.join(', ')}`;
      }
      if (_.get(criteria, 'page')) {
        query += ` OFFSET ${_.get(criteria, 'page')}`;
      }
      return `${query} LIMIT ${_.get(criteria, 'limit')}`;
    }
  };

  validateModel.validate(null, input_attributes, filtered_query_data, async function (valid, errors) {
    if (valid) {
      filtered_query_data.limit = parseInt(filtered_query_data.limit) > 0 ? parseInt(filtered_query_data.limit) : 10;
      filtered_query_data.page = parseInt(filtered_query_data.page);
      var criteria = {
        limit: filtered_query_data.limit,
        where: _.omit(filtered_query_data, ['page', 'limit', 'search', 'expand', 'sort'])
      };
      if (filtered_query_keys.includes('search')) {
        criteria.where.name = { 'contains': filtered_query_data.search };
      }
      if (filtered_query_keys.includes('type')) {
        criteria.where.type = parseInt(filtered_query_data.type);
      }
      if (filtered_query_keys.includes('status')) {
        criteria.where.status = parseInt(filtered_query_data.status);
      }
      if (filtered_query_keys.includes('page')) {
        criteria.page = (parseInt(filtered_query_data.page) - 1) * filtered_query_data.limit;
      }
      if (filtered_query_keys.includes('sort')) {
        criteria.sort = [];
        const sort_array = filtered_query_data.sort.split(',');
        if (sort_array.length > 0) {
          _.forEach(sort_array, function (value, key) {
            const sort_direction = value.split('.');
            var sort = {};
            sort[sort_direction[0]] = 'ASC';
            if (sort_direction.length > 1) {
              if (sort_direction[1] === 'desc') {
                sort[sort_direction[0]] = 'DESC';
              }
            }
            criteria.sort.push(sort);
          });
        }
      }
      //Preparing data
      await getUsers(criteria, function (users, details, total) {
        sendResponse(users, details, total);
      });
    }
    else {
      _response_object.errors = errors;
      _response_object.count = errors.length;
      return response.status(400).json(_response_object);
    }
  });

};