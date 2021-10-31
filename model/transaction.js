const mongoose = require("mongoose");

// mongoose.connect("mongodb://127.0.0.1:27017/tokoAlfas", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   useCreateIndex: true,
// });

// Membuat Schema
const Transaction = mongoose.model("Transaction", {
  tanggal: {
    type: String,
  },
  nama_barang: {
    type: String,
    required: true,
  },
  harga_satuan: {
    type: String,
    required: true,
  },
  jumlah_barang: {
    type: String,
    required: true,
  },
  total_bayar: {
    type: Number,
    minimum: 0,
    exclusiveMaximum: 10000000,
    required: true,
  },
});

// Menambah 1 data
// const transaction = new Transaction({
//   tanggal: fullDate,
// });

// // Simpan ke collections
// transaction.save().then((result) => console.log(result));

module.exports = Transaction;
