const formatDate = (date) => {
     const currentDate = new Date(date);
     const monthNames = [
          "January", "February", "March",
          "April", "May", "June", "July",
          "August", "September", "October",
          "November", "December"
     ];

     const monthName = monthNames[currentDate.getMonth()];

     const day = currentDate.getDate();

     const year = currentDate.getFullYear();

     return `${monthName} ${day}, ${year}`;
}

module.exports = formatDate;