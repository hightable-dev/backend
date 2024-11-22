
/* global _ */

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

var async = require("async");
var validator = require('validator');
var ProfanityFilter = require('bad-words');
var profanityValidator = new ProfanityFilter();
var PhoneNumber = require('awesome-phonenumber');
var moment = require("moment");

exports.validate = function (model, input_attributes, post_request_data, validate_callback) {
    const post_request_keys = Object.keys(post_request_data);
    var errors = [];
    async.forEachOf(input_attributes, function (value, key, callback) {
        try {
            if (parseInt(post_request_data[value.name]) !== 0 && post_request_data[value.name] !== false && !post_request_data[value.name] && value.required) {
                var error_obj = new Error();
                error_obj.code = "E_VIOLATES_RULES";
                if (value.message) {
                    error_obj.message = value.message;
                } else if (value.array_child) {
                    error_obj.message = value.parent_name + " cannot be empty.";
                } else {
                    error_obj.message = value.name + " cannot be empty.";
                }
                error_obj.ruleViolations = [{ rule: 'required', message: error_obj.message }];
                throw error_obj;
            } else if ((!_.isNull(post_request_data[value.name])) && (parseInt(post_request_data[value.name]) === 0 || post_request_data[value.name] === false || post_request_data[value.name] || value.custom)) {
                if (value.email) {
                    if (!validator.isEmail(post_request_data[value.name])) {
                        var error_obj = new Error();
                        error_obj.code = "E_VIOLATES_RULES";
                        if (value.message) {
                            error_obj.message = value.message;
                        } else if (value.array_child) {
                            error_obj.message = value.parent_name + " must be a valid email address";
                        } else {
                            error_obj.message = value.name + " must be a valid email address.";
                        }
                        error_obj.ruleViolations = [{ rule: 'email', message: error_obj.message }];
                        throw error_obj;
                    }
                }
                if (value.number) {
                    if (!validator.isNumeric(post_request_data[value.name].toString())) {
                        var error_obj = new Error();
                        error_obj.code = "E_VIOLATES_RULES";
                        if (value.message) {
                            error_obj.message = value.message;
                        } else if (value.array_child) {
                            error_obj.message = value.parent_name + " must be a number.";
                        } else {
                            error_obj.message = value.name + " must be a number.";
                        }
                        error_obj.ruleViolations = [{ rule: 'number', message: error_obj.message }];
                        throw error_obj;
                    }
                    if (value.positive && !(parseFloat(post_request_data[value.name]) >= 0)) {
                        var error_obj = new Error();
                        error_obj.code = "E_VIOLATES_RULES";
                        if (value.message) {
                            error_obj.message = value.message;
                        } else if (value.array_child) {
                            error_obj.message = value.parent_name + " must be greater than or equal to 0.";
                        } else {
                            error_obj.message = value.name + " must be greater than or equal to 0.";
                        }
                        error_obj.ruleViolations = [{ rule: 'min', message: error_obj.message }];
                        throw error_obj;
                    }
                    if ((value.min || parseInt(post_request_data[value.name]) === 0) && parseFloat(post_request_data[value.name]) < value.min) {
                        var error_obj = new Error();
                        error_obj.code = "E_VIOLATES_RULES";
                        if (value.message) {
                            error_obj.message = value.message;
                        } else if (value.array_child) {
                            error_obj.message = value.parent_name + " must be greater than or equal to " + value.min;
                        } else {
                            error_obj.message = value.name + " must be greater than or equal to " + value.min;
                        }
                        error_obj.ruleViolations = [{ rule: 'min', message: error_obj.message }];
                        throw error_obj;
                    }
                    if ((value.max || parseInt(post_request_data[value.name]) === 0) && parseFloat(post_request_data[value.name]) > value.max) {
                        var error_obj = new Error();
                        error_obj.code = "E_VIOLATES_RULES";
                        if (value.message) {
                            error_obj.message = value.message;
                        } else if (value.array_child) {
                            error_obj.message = value.parent_name + " must be lesser than or equal to " + value.max;
                        } else {
                            error_obj.message = value.name + " must be lesser than or equal to " + value.max;
                        }
                        error_obj.ruleViolations = [{ rule: 'max', message: error_obj.message }];
                        throw error_obj;
                    }
                } else {
                    if (value.min && post_request_data[value.name].length < value.min) {
                        var error_obj = new Error();
                        error_obj.code = "E_VIOLATES_RULES";
                        if (value.message) {
                            error_obj.message = value.message;
                        } else if (value.array_child) {
                            error_obj.message = value.parent_name + "'s length must be greater than or equal to " + value.min + " characters.";
                        } else {
                            error_obj.message = value.name + "'s length must be greater than or equal to " + value.min + " characters.";
                        }
                        error_obj.ruleViolations = [{ rule: 'min', message: error_obj.message }];
                        throw error_obj;
                    }
                    if (value.max && post_request_data[value.name].length > value.max) {
                        var error_obj = new Error();
                        error_obj.code = "E_VIOLATES_RULES";
                        if (value.message) {
                            error_obj.message = value.message;
                        } else if (value.array_child) {
                            error_obj.message = value.parent_name + " must be lesser than or equal to " + value.max + " characters.";
                        } else {
                            error_obj.message = value.name + " must be lesser than or equal to " + value.max + " characters.";
                        }
                        error_obj.ruleViolations = [{ rule: 'max', message: error_obj.message }];
                        throw error_obj;
                    }
                }
                if (value.geopoint) {
                    if (((typeof post_request_data[value.name]) !== 'string') || (!validator.isLatLong(post_request_data[value.name]))) {
                        var error_obj = new Error();
                        error_obj.code = "E_VIOLATES_RULES";
                        if (value.message) {
                            error_obj.message = value.message;
                        } else if (value.array_child) {
                            error_obj.message = value.parent_name + " must be a valid geopoint of format LAT,LNG.";
                        } else {
                            error_obj.message = value.name + " must be a valid geopoint of format LAT,LNG.";
                        }
                        error_obj.ruleViolations = [{ rule: 'geopoint', message: error_obj.message }];
                        throw error_obj;
                    }
                }
                if (value.boolean) {
                    if (!validator.isBoolean(post_request_data[value.name])) {
                        var error_obj = new Error();
                        error_obj.code = "E_VIOLATES_RULES";
                        if (value.message) {
                            error_obj.message = value.message;
                        } else if (value.array_child) {
                            error_obj.message = value.parent_name + " must be a boolean";
                        } else {
                            error_obj.message = value.name + " must be a boolean";
                        }
                        error_obj.ruleViolations = [{ rule: 'boolean', message: error_obj.message }];
                        throw error_obj;
                    }
                }
                if (value.enum) {
                    if (!(value.values.includes(post_request_data[value.name])) && !(value.values.includes(parseInt(post_request_data[value.name]))) && !(value.values.includes(parseFloat(post_request_data[value.name])))) {
                        var error_obj = new Error();
                        error_obj.code = "E_VIOLATES_RULES";
                        if (value.message) {
                            error_obj.message = value.message;
                        } else if (value.array_child) {
                            error_obj.message = value.parent_name + " must have one of the enumerated values set of " + value.values + ".";
                        } else {
                            error_obj.message = value.name + " must have one of the enumerated values set of " + value.values + ".";
                        }
                        error_obj.ruleViolations = [{ rule: 'enum', message: error_obj.message }];
                        throw error_obj;
                    }
                }
                if (value.alpha) {
                    if (!validator.isAlpha(post_request_data[value.name], 'en-IN')) {
                        var error_obj = new Error();
                        error_obj.code = "E_VIOLATES_RULES";
                        if (value.message) {
                            error_obj.message = value.message;
                        } else if (value.array_child) {
                            error_obj.message = value.parent_name + " must contains only alphabets.";
                        } else {
                            error_obj.message = value.name + " must contains only alphabets.";
                        }
                        error_obj.ruleViolations = [{ rule: 'alpha', message: error_obj.message }];
                        throw error_obj;
                    }
                }
                if (value.phone) {
                    let pn = new PhoneNumber(post_request_data[value.name], 'CA');
                    if (!pn.isValid()) {
                        var error_obj = new Error();
                        error_obj.code = "E_VIOLATES_RULES";
                        if (value.message) {
                            error_obj.message = value.message;
                        } else if (value.array_child) {
                            error_obj.message = value.parent_name + " must be a valid phone number.";
                        } else {
                            error_obj.message = value.name + " must be a valid phone number.";
                        }
                        error_obj.ruleViolations = [{ rule: 'phone', message: error_obj.message }];
                        throw error_obj;
                    }
                }
                if (value.mobile) {
                    let pn = new PhoneNumber(post_request_data[value.name], 'CA');
                    if (!pn.isMobile()) {
                        var error_obj = new Error();
                        error_obj.code = "E_VIOLATES_RULES";
                        if (value.message) {
                            error_obj.message = value.message;
                        } else if (value.array_child) {
                            error_obj.message = value.parent_name + " must be a valid mobile number.";
                        } else {
                            error_obj.message = value.name + " must be a valid mobile number.";
                        }
                        error_obj.ruleViolations = [{ rule: 'mobile', message: error_obj.message }];
                        throw error_obj;
                    }
                }
                if (value.alphanumeric) {
                    if (!validator.isAlphanumeric(post_request_data[value.name], 'en-IN')) {
                        var error_obj = new Error();
                        error_obj.code = "E_VIOLATES_RULES";
                        if (value.message) {
                            error_obj.message = value.message;
                        } else if (value.array_child) {
                            error_obj.message = value.parent_name + " must contains only alpha numeric characters.";
                        } else {
                            error_obj.message = value.name + " must contains only alpha numeric characters.";
                        }
                        error_obj.ruleViolations = [{ rule: 'alphanumeric', message: error_obj.message }];
                        throw error_obj;
                    }
                }
                if (value.alphanumeric_underscore) {
                    if (!_.isRegExp(/^[A-Za-z][A-Za-z0-9]*(?:_[A-Za-z0-9]+)*$/)) {
                        var error_obj = new Error();
                        error_obj.code = "E_VIOLATES_RULES";
                        if (value.message) {
                            error_obj.message = value.message;
                        } else if (value.array_child) {
                            error_obj.message = value.parent_name + " must start with alpha numeric characters (underscores allowed in between).";
                        } else {
                            error_obj.message = value.name + " must start with alpha numeric characters (underscores allowed in between).";
                        }
                        error_obj.ruleViolations = [{ rule: 'alphanumeric_underscore', message: error_obj.message }];
                        throw error_obj;
                    }
                }
                if (value.atleast_fields) {
                    if (value.atleast_field_values && (_.intersection(post_request_keys, value.atleast_field_values)).length === 0) {
                        var error_obj = new Error();
                        error_obj.code = "E_VIOLATES_RULES";
                        if (value.message) {
                            error_obj.message = value.message;
                        } else if (value.array_child) {
                            error_obj.message = value.parent_name + " must at-least have one of the values of " + value.atleast_field_values + ".";
                        } else {
                            error_obj.message = value.name + " must at-least have one of the values of " + value.atleast_field_values + ".";
                        }
                        error_obj.ruleViolations = [{ rule: 'required', message: error_obj.message }];
                        throw error_obj;
                    }
                }
                if (value.time) {
                   let time = post_request_data[value.name].split(':');
                    if (time.length !== 2 || _.isNaN(parseInt(time[0])) || _.isNaN(parseInt(time[1])) || parseInt(time[0]) < 0 || parseInt(time[0]) > 23 || parseInt(time[1]) < 0 || parseInt(time[1]) > 59) {
                        var error_obj = new Error();
                        error_obj.code = "E_VIOLATES_RULES";
                        if (value.message) {
                            error_obj.message = value.message;
                        } else if (value.array_child) {
                            error_obj.message = value.parent_name + " must be a valid HH::MM time format.";
                        } else {
                            error_obj.message = value.name + " must be a valid HH::MM time format.";
                        }
                        error_obj.ruleViolations = [{ rule: 'time', message: error_obj.message }];
                        throw error_obj;
                    }
                }
                if (value.json) {
                    if (!validator.isJSON(post_request_data[value.name])) {
                        var error_obj = new Error();
                        error_obj.code = "E_VIOLATES_RULES";
                        if (value.message) {
                            error_obj.message = value.message;
                        } else if (value.array_child) {
                            error_obj.message = value.parent_name + " must be a valid JSON.";
                        } else {
                            error_obj.message = value.name + " must be a valid JSON.";
                        }
                        error_obj.ruleViolations = [{ rule: 'json', message: error_obj.message }];
                        throw error_obj;
                    }
                }
                if (value.isdate) {
                    var valid = moment(post_request_data[value.name], "DD.MM.YYYY", true).isValid()
                    if (!valid)
                        var error_obj = new Error();
                    error_obj.code = "E_VIOLATES_RULES";
                    if (value.message) {
                        error_obj.message = value.message;
                    } else if (value.array_child) {
                        error_obj.message = value.parent_name + " must be a date. ie: date have to be in a DD.MM.YYYY format";
                    } else {
                        error_obj.message = value.name + " must be a date. ie: date have to be in a DD.MM.YYYY format";
                    }
                    error_obj.ruleViolations = [{ rule: 'date', message: error_obj.message }];
                    throw error_obj;
                }
                if (value.istime) {
                    var valid = moment(post_request_data[value.name], "HH:mm", true).isValid()
                    if (!valid)
                        var error_obj = new Error();
                    error_obj.code = "E_VIOLATES_RULES";
                    if (value.message) {
                        error_obj.message = value.message;
                    } else if (value.array_child) {
                        error_obj.message = value.parent_name + " must be a time. ie: time have to be in a HH:mm format";
                    } else {
                        error_obj.message = value.name + " must be a time. ie: time have to be in a HH:mm format";
                    }
                    error_obj.ruleViolations = [{ rule: 'date', message: error_obj.message }];
                    throw error_obj;
                }
                if (value.isdatetime) {
                    var valid = moment(post_request_data[value.name], "DD.MM.YYYY HH:mm", true).isValid()
                    if (!valid)
                        var error_obj = new Error();
                    error_obj.code = "E_VIOLATES_RULES";
                    if (value.message) {
                        error_obj.message = value.message;
                    } else if (value.array_child) {
                        error_obj.message = value.parent_name + " must be a date. ie: date have to be in a DD.MM.YYYY HH:mm format";
                    } else {
                        error_obj.message = value.name + " must be a date. ie: date have to be in a DD.MM.YYYY HH:mm format";
                    }
                    error_obj.ruleViolations = [{ rule: 'date', message: error_obj.message }];
                    throw error_obj;
                }
                if (value.beforedate) {
                    var date = new Date();
                    if (value.date) {
                        date = value.date;
                    }
                    if (!validator.isBefore(post_request_data[value.name], String(date))) {
                      let printable_date = date.getFullYear().toString() + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0')
                        var error_obj = new Error();
                        error_obj.code = "E_VIOLATES_RULES";
                        if (value.message) {
                            error_obj.message = value.message;
                        } else if (value.array_child) {
                            error_obj.message = value.parent_name + " must be lesser than " + printable_date + ".";
                        } else {
                            error_obj.message = value.name + " must be lesser than " + printable_date + ".";
                        }
                        error_obj.ruleViolations = [{ rule: 'beforedate', message: error_obj.message }];
                        throw error_obj;
                    }
                }
                if (value.afterdate) {
                    var date = new Date();
                    if (value.date) {
                        date = value.date;
                    }
                    if (!validator.isAfter(post_request_data[value.name], String(date))) {
                       let printable_date = date.getFullYear().toString() + '-' + (date.getMonth() + 1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0')
                        var error_obj = new Error();
                        error_obj.code = "E_VIOLATES_RULES";
                        if (value.message) {
                            error_obj.message = value.message;
                        } else if (value.array_child) {
                            error_obj.message = value.parent_name + " must be greater than " + printable_date + ".";
                        } else {
                            error_obj.message = value.name + " must be greater than " + printable_date + ".";
                        }
                        error_obj.ruleViolations = [{ rule: 'afterdate', message: error_obj.message }];
                        throw error_obj;
                    }
                }
                if (value.array) {
                    if (!(_.isArray(post_request_data[value.name]))) {
                        var error_obj = new Error();
                        error_obj.code = "E_VIOLATES_RULES";
                        if (value.message) {
                            error_obj.message = value.message;
                        } else if (value.array_child) {
                            error_obj.message = value.parent_name + " must be an array.";
                        } else {
                            error_obj.message = value.name + " must be an array.";
                        }
                        error_obj.ruleViolations = [{ rule: 'array', message: error_obj.message }];
                        throw error_obj;
                    } else if (value.min_values && post_request_data[value.name].length < value.min_values) {
                        var error_obj = new Error();
                        error_obj.code = "E_VIOLATES_RULES";
                        if (value.message) {
                            error_obj.message = value.message;
                        } else if (value.array_child) {
                            error_obj.message = value.parent_name + " must contains atleast " + value.min_values + " values";
                        } else {
                            error_obj.message = value.name + " must contains atleast " + value.min_values + " values";
                        }
                        error_obj.ruleViolations = [{ rule: 'min_values', message: error_obj.message }];
                        throw error_obj;
                    } else if (value.uniq) {
                        var array_values = _.get(value, 'strict', false) ? _.map(post_request_data[value.name], _.toString) : post_request_data[value.name];
                        if (!_.eq(new Set(array_values).size, _.size(array_values))) {
                            var error_obj = new Error();
                            error_obj.code = "E_VIOLATES_RULES";
                            if (value.message) {
                                error_obj.message = value.message;
                            } else if (value.array_child) {
                                error_obj.message = value.parent_name + " Has to be uniq.";
                            } else {
                                error_obj.message = value.name + " Has to be uniq.";
                            }
                            error_obj.ruleViolations = [{ rule: 'uniq', message: error_obj.message }];
                            throw error_obj;
                        }
                    }
                    else if (value.individual_rule) {
                       let sub_filtered_post_data = {};
                       let sub_input_attributes = [];
                        post_request_data[value.name].forEach(function (sub_value, sub_key) {
                            sub_filtered_post_data[sub_key] = sub_value;
                           let sub_rule = Object.assign({}, value.individual_rule);
                            sub_rule.name = sub_key;
                            sub_rule.array_child = true;    
                            sub_rule.parent_name = value.name;
                            if (value.individual_rule.message) {
                                sub_rule.message = value.individual_rule.message;
                            }
                            sub_input_attributes.push(sub_rule);
                        });
                        validateModel.validate(null, sub_input_attributes, sub_filtered_post_data, function (sub_valid, sub_errors) {
                            if (!sub_valid) {
                                var error_obj = new Error();
                                error_obj.code = "E_VIOLATES_RULES";
                                if (value.message) {
                                    error_obj.message = value.message;
                                } else {
                                    error_obj.message = value.name + " must be a valid array.";
                                }
                                error_obj.ruleViolations = [{ rule: 'array', message: error_obj.message, errors: sub_errors }];
                                throw error_obj;
                            }
                        });
                    }
                }
                if (value.profanity) {
                    if (profanityValidator.isProfane(post_request_data[value.name])) {
                        var error_obj = new Error();
                        error_obj.code = "E_VIOLATES_RULES";
                        if (value.message) {
                            error_obj.message = value.message;
                        } else if (value.array_child) {
                            error_obj.message = value.parent_name + " has some offensive language.";
                        } else {
                            error_obj.message = value.name + " has some offensive language.";
                        }
                        error_obj.ruleViolations = [{ rule: 'profanity', message: error_obj.message }];
                        throw error_obj;
                    }
                }
                if (value.letter) {
                    if (!(!_.isEmpty(post_request_data[value.name]) && post_request_data[value.name].length === 1 && post_request_data[value.name].match(/[a-z]/i))) {
                        var error_obj = new Error();
                        error_obj.code = "E_VIOLATES_RULES";
                        if (value.message) {
                            error_obj.message = value.message;
                        } else if (value.array_child) {
                            error_obj.message = value.parent_name + " Have to be a valid alphabet character ie:(a to z).";
                        } else {
                            error_obj.message = value.name + " Have to be a valid alphabet character ie:(a to z).";
                        }
                        error_obj.ruleViolations = [{ rule: 'letter', message: error_obj.message }];
                        throw error_obj;
                    }
                }
                if (value.custom) {
                    if (value.result) {
                        var error_obj = new Error();
                        error_obj.code = "E_VIOLATES_RULES";
                        if (value.message) {
                            error_obj.message = value.message;
                        } else if (value.array_child) {
                            error_obj.message = value.parent_name + " Custom validation is not successfull.";
                        } else {
                            error_obj.message = value.name + " Custom validation is not successfull.";
                        }
                        error_obj.ruleViolations = [{ rule: _.get(value, 'rule', 'invalid'), message: error_obj.message }];
                        throw error_obj;
                    }
                }
            }
            if (model) {
                var ModelValidation = model.validate(value.name, post_request_data[value.name]);
            }
        } catch (err) {
            if (err.code) {
                var error = {};
                if (value.isParam) {
                    error['parameter'] = value.name;
                }
                else {
                    error['field'] = value.name;
                }
                switch (err.code) {
                    case 'E_VIOLATES_RULES':
                        error.rules = err.ruleViolations;
                        break;
                    case 'E_REQUIRED':
                        error.rules = [{ rule: 'required', message: err.message }];
                        break;
                    case 'E_TYPE':
                        error.rules = [{ rule: err.expectedType, message: err.message }];
                        break;
                    case 'E_HIGHLY_IRREGULAR':
                        error.rules = [{ rule: 'irregular', message: err.message }];
                        break;
                    default:
                        error.rules = [{ rule: 'unexpected', message: err.message }];
                        break;
                }
                errors.push(error);
            }
        }
        callback();
    }, function (err) {
        validate_callback(errors.length === 0, errors);
    });
};
