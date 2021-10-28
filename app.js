const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const moment = require("moment");

// Function untuk generate ObjectID secara random
function objectId() {
  const os = require("os");
  const crypto = require("crypto");

  const secondInHex = Math.floor(new Date() / 1000).toString(16);
  const machineId = crypto
    .createHash("md5")
    .update(os.hostname())
    .digest("hex")
    .slice(0, 6);
  const processId = process.pid.toString(16).slice(0, 4).padStart(4, "0");
  const counter = process.hrtime()[1].toString(16).slice(0, 6).padStart(6, "0");

  return secondInHex + machineId + processId + counter;
}

require("./utils/db");
const Transaction = require("./model/transaction");
const History = require("./model/history");

const app = express();
const port = process.env.PORT || 5000;

app.use(methodOverride("_method"));

// Setup EJS
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Konfigruasi flash
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

// Halaman Home
app.get("/", (req, res) => {
  res.render("home", {
    title: "HOME | ALFAS Makassar",
    layout: "layouts/main-layout",
  });
});

// Halaman Transaksi
app.get("/transactions", async (req, res) => {
  const transactions = await Transaction.find();

  // Proses Menghitung Total Herga Barang Yang Terjual Per Hari
  const profitTransactions = await Transaction.aggregate([
    { $match: {} },
    {
      $group: {
        _id: "$tanggal",
        profit: {
          $sum: "$total_bayar",
        },
      },
    },
  ]);

  // Generate date hari ini
  let date = moment().format("LL");

  res.render("transactions", {
    title: "TRANSACTION | ALFAS Makassar",
    layout: "layouts/main-layout",
    transactions,
    profitTransactions,
    date,
    msg: req.flash("msg"),
  });
});

// Halaman Form Tambah Transaksi
app.get("/transactions/add-transaction", async (req, res) => {
  res.render("add-transaction", {
    title: "TAMBAH TRANSAKSI | ALFAS Makassar",
    layout: "layouts/main-layout",
  });
});

// Proses Mengambil Data Transaksi pada halaman Form Tambah Transaksi
app.post("/transactions", async (req, res) => {
  await Transaction.insertMany(req.body, (error, result) => {
    // kirimkan flash message sebelum diredirect. Nanti di session ada yang namanya variabel msg, yang isinya "Data transaksi baru berhasil ditambahkan"
    req.flash("msg", "Data Transaksi baru berhasil ditambahkan");

    res.redirect("/transactions"); // kembali ke route app.get('/contact')
  });

  // Variabel untuk mengambil semua isi dari collection Transaction
  let getTransactions;

  const transactions = await Transaction.find();
  transactions.forEach((transaction) => {
    getTransactions = [
      {
        _id: objectId(),
        tanggal: transaction.tanggal,
        nama_barang: transaction.nama_barang,
        harga_satuan: transaction.harga_satuan,
        jumlah_barang: transaction.jumlah_barang,
        total_bayar: transaction.total_bayar,
      },
    ];
  });

  History.insertMany(getTransactions);
  console.log(getTransactions);
});

// Proses Delete Semua Transaksi
app.delete("/transactions", (req, res) => {
  Transaction.deleteMany({ tanggal: req.body.tanggal }).then((result) => {
    // kirimkan flash message sebelum diredirect. Nanti di session ada yang namanya variabel msg, yang isinya "Data contact baru berhasil ditambahkan"
    req.flash("msg", "Data transaksi yang dipilih sudah terhapus");
    res.redirect("/transactions");
  });
});

// Halaman Form Ubah Data Transaksi
app.get("/transactions/edit/:nama_barang", async (req, res) => {
  const transactions = await Transaction.findOne({
    nama_barang: req.params.nama_barang,
  });

  res.render("edit-transaction", {
    title: "FORM UBAH DATA TRANSACTION | ALFAS Makassar",
    layout: "layouts/main-layout",
    transactions,
  });
});

// Proses Ubah Data Transaksi
app.put("/transactions", async (req, res) => {
  await Transaction.updateOne(
    { _id: req.body._id },
    {
      $set: {
        nama_barang: req.body.nama_barang,
        harga_satuan: req.body.harga_satuan,
        jumlah_barang: req.body.jumlah_barang,
        total_bayar: req.body.total_bayar,
      },
    }
  ).then((result) => {
    // kirimkan flash message sebelum diredirect. Nanti di session ada yang namanya variabel msg, yang isinya "Data contact baru berhasil ditambahkan"
    req.flash("msg", "Data transaksi berhasil diubah");

    res.redirect("/transactions"); // kembali ke route app.get('/contact')
  });
});

// Halaman History transactions
app.get("/history_transactions", async (req, res) => {
  const historyTransactions = await History.aggregate([
    { $match: {} },
    {
      $group: {
        _id: "$tanggal",
        profit: { $sum: "$total_bayar" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.render("history_transactions", {
    title: "HiSTORY TRANSACTION | ALFAS Makassar",
    layout: "layouts/main-layout",
    historyTransactions,
  });
});

// Halaman History Detail Transactions
app.get("/history_detail_transactions/:_id", async (req, res) => {
  const historyTransactions = await History.find({
    tanggal: req.params._id,
  });

  res.render("history_detail_transactions", {
    title: "HISTORY DETAIL TRANSACTION | ALFAS Makassar",
    layout: "layouts/main-layout",
    historyTransactions,
  });
});

// Proses Delete All History Detail Transaction
app.delete("/history_transactions", async (req, res) => {
  History.deleteMany({ tanggal: req.body._id }).then((result) => {
    res.redirect("/history_transactions");
  });
});

// Proses Delete History Detail
app.delete("/history_detail_transactions", async (req, res) => {
  History.deleteOne({ nama_barang: req.body.nama_barang }).then((result) => {
    res.redirect("/history_transactions");
  });
});

// Halaman Form Ubah Data History Detail Transaksi
app.get("/history_detail_transactions/edit/:nama_barang", async (req, res) => {
  const history = await History.findOne({
    nama_barang: req.params.nama_barang,
  });

  res.render("edit_history_transaction", {
    title: "FORM UBAH DATA TRANSACTION | ALFAS Makassar",
    layout: "layouts/main-layout",
    history,
  });
});

// Proses Ubah Data History Detail Transaksi
app.put("/history_detail_transactions", async (req, res) => {
  await History.updateOne(
    { _id: req.body._id },
    {
      $set: {
        nama_barang: req.body.nama_barang,
        harga_satuan: req.body.harga_satuan,
        jumlah_barang: req.body.jumlah_barang,
        total_bayar: req.body.total_bayar,
      },
    }
  ).then((result) => {
    res.redirect("/history_transactions");
  });
});

// Koneksi Ke Server
app.listen(port, () => {
  console.log(`Toko Alfas App | listening at http://localhost:${port}`);
});
