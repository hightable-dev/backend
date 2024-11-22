module.exports = {
//   beforeCreate: function (user, callback) {
//     user.uu_id = shortid.generate(user);
//     if (user.password) {
//         bcrypt.hash(user.password, SALT_WORK_FACTOR, function (err, hash) {
//             user.password = hash;
//             return callback();
//         });
//     } else {
//         return callback();
//     }
// },

  /*
  serachTerm = input for searc
  items = listing data
  columns= db columns to find input
  */
  multiColumnSearch: function (searchTerm, items, columns) {
    const lowercaseSearchTerm = searchTerm.toLowerCase();
    return items.filter(item => {
      return columns.some(column => {
        const value = item[column];
        // if (typeof value === 'string' && value.toLowerCase().includes(lowercaseSearchTerm)) {
        if (value.toLowerCase().includes(lowercaseSearchTerm)) {
          return true;
        }
        return false;
      });
    });
  },


  // add expiry date
  applyFilterConditions: function (data, conditions,status) {
    return data.filter(item => {
      return conditions.every(condition => {
        const [key, value] = Object.entries(condition)[0];
        if (key in item) {
          // If the value is an array, check if the item's value is included in the array
          if (Array.isArray(value)) {
            return value.includes(item[key]);
          } else if (typeof value === 'function') {
            // If the value is a function, invoke it passing the item's value
            return value(item[key]);
          } else {
            // Otherwise, check for strict equality
            return item[key] === value;
          }
        }
        return false;
      }) && item.status !== 0 && (status === undefined || item.status === status);
    });
  },
  applyFilterConditionsAdmin: function (data, conditions) {
    return data.filter(item => {
      return conditions.every(condition => {
        const [key, value] = Object.entries(condition)[0];
        if (key in item) {
          // If the value is an array, check if the item's value is included in the array
          if (Array.isArray(value)) {
            return value.includes(item[key]);
          } else if (typeof value === 'function') {
            // If the value is a function, invoke it passing the item's value
            return value(item[key]);
          } else {
            // Otherwise, check for strict equality
            return item[key] === value;
          }
        }
        return false;
      });
    });
  },


  filterDataItems: function (data, filterData) {
    data.forEach(item => {
      filterData.forEach(field => {
        delete item[field];
      });
    });
    return data;
  },

  
  paginateData: function (data, pageNumber, limitNumber) {
    const skip = (pageNumber - 1) * limitNumber;
    const paginatedData = data.slice(skip, skip + limitNumber);
    return paginatedData;
  },


  calculateSum: function (objects, columnName) {
    let totalSum = 0;
    for (const obj of objects) {
      totalSum += obj[columnName] || 0;
    }
    return totalSum;
  }
  

};

/* ====== Removed and updated ====== */
// multiColumnSearch: function(searchTerm, items) {
//   const lowercaseSearchTerm = searchTerm.toLowerCase();
//   return items.filter(item => {
//     return Object.values(item).some(value => {
//       if (typeof value === 'string' && value.toLowerCase().includes(lowercaseSearchTerm)) {
//         return true;
//       }
//       return false;
//     });
//   });
// },

/*  Function to apply filter conditions
applyFilterConditions: function(data, conditions) {
return data.filter(item => {
  return conditions.every(condition => {
    const [key] = Object.keys(condition);
    if (key in item) {
      if (Array.isArray(condition[key])) {
        return condition[key].includes(item[key]);
      } else {
        return item[key] === condition[key];
      }
    }
    return false;
  });
});
},  */
// added conditon status !==0 
// applyFilterConditions: function(data, conditions, status) {
//   return data.filter(item => {
//     return conditions.every(condition => {
//       const [key] = Object.keys(condition);
//       if (key in item) {
//         if (Array.isArray(condition[key])) {
//           return condition[key].includes(item[key]);
//         } else {
//           return item[key] === condition[key];
//         }
//       }
//       return false;
//     }) && item.status !== 0 && (status === undefined || item.status === status);
//   });
// },
