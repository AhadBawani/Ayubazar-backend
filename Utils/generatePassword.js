const generateRandomPassword = () => {
     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
     const passwordLength = 6;
     let randomPassword = '';

     for (let i = 0; i < passwordLength; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          randomPassword += characters.charAt(randomIndex);
     }

     return randomPassword;
};

module.exports = generateRandomPassword;