const mongoose = require("mongoose");

// mongoose.connect("mongodb://127.0.0.1:27017/tokoAlfas", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   useCreateIndex: true,
// });

// Membuat Schema
const History = mongoose.model("History", {
  tanggal: {
    type: String,
    // required: true,
  },
  nama_barang: {
    type: String,
    // required: true,
  },
  harga_satuan: {
    type: String,
    // required: true,
  },
  jumlah_barang: {
    type: String,
    // required: true,
  },
  total_bayar: {
    type: Number,
    minimum: 0,
    exclusiveMaximum: 10000000,
    // required: true,
  },
});

// Menambah 1 data
// const history = new History({
//   _id: 1,
//   tanggal: "2021-07-30",
//   nama_barang: "Rokok",
//   harga_satuan: "20000",
//   jumlah_barang: "1",
//   total_bayar: "20000",
// });

// Simpan ke collections
// history.save().then((result) => console.log(result));

module.exports = History;
