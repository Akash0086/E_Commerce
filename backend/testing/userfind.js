import { User } from "../models/mysql/user.model.js";

const test = async () => {
  try {
    const result = await User.findByEmail("test@gmail.com");
    console.log(result);
  } catch (error) {
    console.error(error.message);
  }
};

test();