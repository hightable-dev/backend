/**
 * @author mohan <mohan@studioq.co.in>
 */

/* global _, Tables, moment, errorBuilder, validateModel */
/**
 * Order of intresest Dont change this order
 * 
 const IntrestOrder = [
  { "orderby": 1, "name": "Startups" },
  { "orderby": 2, "name": "Leadership" },
  { "orderby": 3, "name": "AI" },
  { "orderby": 4, "name": "Investing" },
  { "orderby": 5, "name": "GenZ" },
  { "orderby": 6, "name": "Alumni" },
  { "orderby": 7, "name": "Coffee" },
  { "orderby": 8, "name": "Dinner" },
  { "orderby": 9, "name": "Lunch" },
  { "orderby": 10, "name": "Books" },
  { "orderby": 11, "name": "Dating" },
  { "orderby": 12, "name": "Networking" },
  { "orderby": 13, "name": "Movies" },
  { "orderby": 14, "name": "Commedy" },
  { "orderby": 15, "name": "Technology" },
  { "orderby": 16, "name": "Learning" },
  { "orderby": 17, "name": "Mentors" },
  { "orderby": 18, "name": "Wine Lovers" },
  { "orderby": 19, "name": "Creators" },
  { "orderby": 20, "name": "Sustainability" },
  { "orderby": 21, "name": "Science & Tech" },
  { "orderby": 22, "name": "Art & Philosophy" },
  { "orderby": 23, "name": "Culture" },
  { "orderby": 24, "name": "Music" },
  { "orderby": 25, "name": "Debating" },
  { "orderby": 26, "name": "Influncers" },
  { "orderby": 27, "name": "Human Library" },
  { "orderby": 28, "name": "Tarot and Healers" },
  { "orderby": 29, "name": "Wellness" },
  { "orderby": 30, "name": "Travellers" },
  { "orderby": 31, "name": "Others" },
  { "orderby": 32, "name": "Open to all" }
  Relationships
  Taboo
  F&B
  In the shoes of

]
 */






module.exports = async function create(request, response) {
  const post_request_data = request.body;
  const {name , orderby } =  post_request_data;
  var _response_object = {};
  var filtered_post_data = _.pick(post_request_data, ['name', 'orderby']);
  
  // Add types to input attributes
  var input_attributes = [
    { name: 'name', required: true, type: 'string' },
    { name: 'orderby', required: true, type: 'number' },
  ];

  // const existingInterestOrder = await Interests.findOne({ orderby });
  const existingInterest = await Interests.findOne({ name });
  if (existingInterest?.name) {
    return response.badRequest({ error: `Interest with this name '${name}' already exists.` });
  }

  if (existingInterest?.orderby) {
    return response.badRequest({ error: `Interest with this orderby '${orderby}' already exists.` });
  }

  const sendResponse = (message, details) => {
    _response_object.message = message;
    _response_object.details = details; // Include details in the response
    return response.ok(_response_object);
  };

  const createInterest = async (post_data) => {
    await Interests.create(post_data, async function (err, createdTable) {
      if (createdTable) {
        sendResponse("Table created successfully.", createdTable);
      } else {
        await errorBuilder.build(err, function (error_obj) {
          _response_object.errors = error_obj;
          _response_object.count = error_obj.length;
          return response.serverError(_response_object);
        });
      }
    });
  };

  validateModel.validate(Interests, input_attributes, filtered_post_data, function (valid, errors) {
    if (valid) {
      createInterest(filtered_post_data);
    } else {
      _response_object.errors = errors;
      _response_object.count = errors.length;
      return response.badRequest(_response_object);
    }
  });
};





