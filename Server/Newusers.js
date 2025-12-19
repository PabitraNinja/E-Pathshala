
const mongoose = require('mongoose');
const User = require('./models/user.js'); // Adjust path

mongoose.connect('mongodb://localhost:27017/eduhub', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function insertUsers() {
  const users = [
    {
      username: "ayush123",
      name: "Ayush Prasad",
      email: "ayush@example.com",
      password: "Test@1234",
      passwordConfirm: "Test@1234",
      mobile: "123-456-7890",
      role: "student"
    },
    {
      username: "ravi456",
      name: "Ravi Kumar",
      email: "ravi@example.com",
      password: "Test@1234",
      passwordConfirm: "Test@1234",
      mobile: "234-567-8901",
      role: "instructor"
    }
  ];

  for (let user of users) {
    const newUser = new User(user);
    await newUser.save(); // hashes password automatically
    console.log(`Inserted ${user.username}`);
  }

  mongoose.connection.close();
}

insertUsers();
