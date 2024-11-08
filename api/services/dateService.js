module.exports = {
  ddmmyyyy_hhmm: function ddmmyyyy_hhmm(date) {
    console.log("datedate", date)
    const day = String(date?.getDate()).padStart(2, '0');
    const month = String(date?.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date?.getFullYear();
    const hours = String(date?.getHours()).padStart(2, '0');
    const minutes = String(date?.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  },
};