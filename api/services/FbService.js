const FB = require('fb');

module.exports = {

  /**
   * Fetch Facebook user data using the provided access token.
   * @param {string} token - The Facebook access token.
   * @returns {Promise} - Resolves with Facebook user data or rejects with an error.
   */
  fetchUserData: function (token) {

    return new Promise((resolve, reject) => {
      FB.api('me', {
        fields: ['id', 'email', 'first_name', 'last_name', 'birthday', 'about','link','picture.width(800).height(800)'],
        access_token: token
      }, function (facebook_response) {
        if (facebook_response.error) {
          // Reject the promise with the error message
          reject({ message: facebook_response.error.message, statusCode: 401 });
        } else {
          // Resolve the promise with the Facebook user data
          const content = {
            facebook_id: facebook_response.id,
            first_name: facebook_response.first_name,
            last_name: facebook_response.last_name,
            gender: facebook_response.gender,
            email: facebook_response.email,
            birthday: facebook_response.birthday,
            about: facebook_response.about,
            picture: facebook_response.picture.data.url,  // Getting profile picture URL
            link: facebook_response.link,
          };
          resolve(content);
        }
      });
    });
  }
};
