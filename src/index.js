const { Telegraf, session } = require("telegraf");
const { message } = require("telegraf/filters");

const fs = require("node:fs");

const bot = new Telegraf("6046137995:AAGA9aTIq1uoA7HV_VDpqHdrdHOtZw5dkC8");
const createUser = {};
bot.start((ctx) => {
  ctx.telegram.sendMessage(
    ctx.chat.id,
    "Hello" +
      " " +
      ctx.from.first_name +
      ", " +
      `Welcome to Block Gyan chat bot service.\nPlease select any of the option given below`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "About Blockgyan", callback_data: "about" },
            { text: "Our services", callback_data: "service" },
          ],
          [{ text: "Create Account", callback_data: "account" }],
        ],
      },
    }
  );
});


//while user search using keyboard//
bot.hears(/(hi|hello|hlo)/i, (ctx) => ctx.reply("Hello from Block Gyan"));

bot.hears(/(blockgyan|blockgyn)/i, (ctx) =>
  ctx.reply(
    "BlockGyan offers a wide range of educational resources, including tutorials, webinars, and courses on blockchain technology and cryptocurrency. We aim to empower individuals and businesses with knowledge in the rapidly evolving blockchain industry."
  )
);

bot.hears(/(service|services|servic)/i, (ctx) => {
  ctx.reply(
    "BlockGyan provides a range of services to cater to your needs. Our services include digital marketing, consultancy, and data analysis. We also offer educational resources and training programs in blockchain technology and cryptocurrency."
  );
});

bot.hears(/(account|create)/i, (ctx) => {
  createUser.userId = ctx.message.from.id;
  ctx.telegram.sendMessage(
    ctx.chat.id,
    "To create an account, we required your name, email address, and desired password.\n Do you want to create an account?",

    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Yes, Create My Account !", callback_data: "create" }],
          [{ text: "Not Now", callback_data: "back" }],
        ],
      },
    }
  );
  
});



//inline keyboard actions //

bot.action("about", (ctx) => {
  ctx.deleteMessage();
  ctx.telegram.sendMessage(
    ctx.chat.id,
    "BlockGyan offers a wide range of educational resources, including tutorials, webinars, and courses on blockchain technology and cryptocurrency. We aim to empower individuals and businesses with knowledge in the rapidly evolving blockchain industry.",
    {
      reply_markup: {
        inline_keyboard: [[{ text: "Go back to menu", callback_data: "back" }]],
      },
    }
  );
});

bot.action("service", (ctx) => {
  ctx.deleteMessage();
  ctx.telegram.sendMessage(
    ctx.chat.id,
    "BlockGyan provides a range of services to cater to your needs. Our services include digital marketing, consultancy, and data analysis. We also offer educational resources and training programs in blockchain technology and cryptocurrency.",
    {
      reply_markup: {
        inline_keyboard: [[{ text: "Go back to menu", callback_data: "back" }]],
      },
    }
  );
});
bot.action("account", (ctx) => {
  ctx.deleteMessage();
  ctx.telegram.sendMessage(
    ctx.chat.id,
    "To create an account, we required your name, email address, and desired password.\n Do you want to create an account?",

    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Yes, Create My Account !", callback_data: "create" }],
          [{ text: "Not Now", callback_data: "back" }],
        ],
      },
    }
  );
});

bot.action("back", (ctx) => {
  ctx.deleteMessage();
  ctx.telegram.sendMessage(
    ctx.chat.id,
    "Please select any of the option given below",
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "About Blockgyan", callback_data: "about" },
            { text: "Our services", callback_data: "service" },
          ],
          [{ text: "Create Account", callback_data: "account" }],
        ],
      },
    }
  );
});

function validateUser(email) {
  let data = JSON.parse(fs.readFileSync("db.json", "utf-8"));

  return data.users.find((user) => user.email == email);
}

function validateEmail(email) {
  // Basic email validation using a regular expression
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailPattern.test(email);
}

function validatePassword(password) {
  // Simple password validation

  return password.length >= 6; // Minimum password length of 6 characters
}

bot.action("create", (ctx) => {
  console.log(ctx.from);
  ctx.deleteMessage();
  createUser.userId = ctx.from.id;
  ctx.reply("Please provide your name");
});

bot.on("text", (ctx) => {
  if (createUser.userId && !createUser.name) {
    createUser.name = ctx.message.text;
    ctx.reply("Please provide your email address:");
  } else if (createUser.name && !createUser.email) {
    const email = ctx.message.text;
    if (validateEmail(email)) {
      console.log("checking")
      if (!validateUser(email)) {
        createUser.email = email;
        ctx.reply("Please choose a password:");
      } else {
        ctx.reply("This email already registered. Please try another");
        console.log(email);
      }
    } else {
      ctx.reply("Invalid email address. Please provide a valid email.");
    }
  } else if (createUser.email && !createUser.password) {
    const password = ctx.message.text;
    if (validatePassword(password)) {
      createUser.password = password;

      // it Stores user details in db.json file

      let data = JSON.parse(fs.readFileSync("db.json", "utf-8"));
      data.users.push(createUser);
      const userDetails = JSON.stringify(data);
      fs.writeFile("db.json", userDetails, (err) => {
        if (err) {
          console.error("Error writing to db.json:", err);
          ctx.reply(
            "Oops! An error occurred while creating your account. Please try again later."
          );
        } else {
          ctx.reply(
            `Account creation successful!\nName: ${createUser.name}\nEmail: ${createUser.email}\nPassword: ${createUser.password}`
          );
        }

        // Reset user object for the next account creation
        createUser.userId = null;
        createUser.username = null;
        createUser.email = null;
        createUser.password = null;
      });
    } else {
      ctx.reply(
        "Invalid password. Please choose a password with a minimum length of 6 characters."
      );
    }
  }
});




bot.launch();