/**
 *
 * @author Ilanchezhian Rajendiran <ilan@studioq.co.in>
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

var async = require('async');

exports.build = function(input, callback) {
    var errors = [];
    var message = 'something went wrong.';
    var field = 'default';
    var rule = 'invalid';
    try {
        if(_.isObject(input)){
            if(input.details){
                message = input.details;
            }else if(input.message){
                message = input.message;
            }
            if(input.field){
                field = input.field;
            }
            if(input.ruleViolations && input.ruleViolations.length > 0 && input.ruleViolations[0].rule){
                rule = input.ruleViolations[0].rule;
            }
            if(input.code === 'AccessDenied'){
                rule = 'forbidden';
            }
            if(input.name === 'AdapterError'){
                switch (input.code) {
                    case 'E_UNIQUE':
                        async.forEachOf(input.attrNames, function (value, key, each_callback) {
                            if(value === 'username'){
                                errors.push({field: value, rules: [{rule: 'unique', message: 'given phone or email is already taken.'}]});
                            }else{
                                errors.push({field: value, rules: [{rule: 'unique', message: value + ' is already taken.'}]});
                            }
                            each_callback();
                        });
                        break;
                    default:
                        errors.push({field: field, rules: [{rule: rule, message: message}]});
                        break;
                }
            }else{
                errors.push({field: field, rules: [{rule: rule, message: message}]});
            }
        }else{
            errors.push({field: field, rules: [{rule: rule, message: message}]});
        }
    } catch (err) {
        errors.push({field: field, rules: [{rule: rule, message: message}]});
    }
    return callback(errors);
};
