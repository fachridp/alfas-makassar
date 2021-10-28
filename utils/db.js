const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://fachri:panasonic003@cluster-for-github.hluhx.mongodb.net/tokoAlfas?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});