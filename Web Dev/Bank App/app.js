//default connections 
const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");
const bodyp = require("body-parser");
const app = express();
app.set("view engine", "ejs");
app.use(bodyp.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", function(req,res) {
    res.render("index");
});

app.get("/dashboard", function (req, res) {
    res.render("dashboard");
});

//generating random number 
function gen() {
    var acgen = Math.floor((Math.random() * 500000) + 100000);
    return acgen;
}
//global account number used to save 
var num;
var dbname = "";
mongoose.connect("mongodb://localhost:27017/bank", { useNewUrlParser: true, useUnifiedTopology: true });
//schema of accounts collection
const bankschema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "please enter name"]
    },
    accno: {
        type: Number,
        required: [true, "please enter accno"],
        unique: [true, "duplicate account number"]
    },
    address: {
        type: String,
        required: [true, "please enter your address"]
    },
    phone: {
        type: Number,
        required: [true, "please enter your phone number"],
        unique: [true, "already registered with another account"]
    },
    pin: {
        type: Number,
        maxlength: [6, "please enter a max of 6 digits"],
        minlength: [6, "please enter a min of 6 digits"],
        required: [true, "please enter your pin"]
    },
    balance: {
        type: Number
    }
});

const bank = mongoose.model("account", bankschema);
//to see if the account exists or not
app.post("/", function (req, res) {
    num = Number(req.body.accno);
    var pn = Number(req.body.pinl);
    ac = req.body.accno;
    bank.count({ accno: num, pin: pn }, function (err, result) {
        console.log(result);
        if (result === 1) {
            res.redirect("/dashboard");
        }
        else {
            var st = "ACCOUNT DOES NOT EXIST";
            res.render("index", { stat: st });
        }
    });
});
//sending data to profile 
app.get("/profile", function (req, res) {
    bank.findOne({ accno: num }, function (err, result) {
        res.render("profile", { name: _.upperFirst(result.name), address: _.upperFirst(result.address), phone: result.phone, balance: result.balance, accno: result.accno });
    });
});
//app.get all ejs files
app.get("/banking", function (req, res) {
    res.render("banking");
});
app.get("/deposit", function (req, res) {
    res.render("deposit");
});
app.get("/withdraw", function (req, res) {
    res.render("withdraw");
});
app.get("/transactions", function (req, res) {
    res.render("transactions");
});
app.get("/create", function (req, res) {
    res.render("create");
});
app.get("/withdraw", function (req, res) {
    res.render("withdraw");
});
app.post("/create", function (req, res) {
    var newdetails = new bank({
        name: req.body.name,
        address: req.body.address,
        pin: req.body.pin,
        accno: gen(),
        phone: req.body.phone,
        balance: 0
    });
    newdetails.save();
    console.log("successfully created ");
    res.redirect("/");
});
//deposit
var totamount = 0;
app.post("/deposit", function (req, res) {
    var newamount = Number(req.body.amount);
    console.log(newamount, "enter amount")
    bank.findOne({ accno: num }, function (err, result) {
        var bal = Number(result.balance);
        console.log(bal, "before depositing");
        totamount = Number(newamount + bal);
        bank.updateOne({ accno: num }, { $set: { balance: totamount } }, function (err, result) {
            console.log(totamount, "current balance");
            console.log(num);
            console.log(result);
            console.log("successfully deposited ");
            res.redirect("/banking");
        });
    });
});
//withdraw 
totamount = 0;
app.post("/withdraw", function (req, res) {
    var newamount = Number(req.body.amount);
    console.log(newamount, "enter amount")
    bank.findOne({ accno: num }, function (err, result) {
        var bal = Number(result.balance);
        console.log(bal, "before depositing");
        if (bal >= newamount) {
            totamount = Number(bal - newamount);
            bank.updateOne({ accno: num }, { $set: { balance: totamount } }, function (err, result) {
                console.log(totamount, "current balance");
                console.log(num);
                console.log(result);
                console.log("successfully withdrew ");
                res.redirect("/banking");
            });
        }
        else {
            var stat = "Balance is low ,";
            var amo = " Please withdraw a amount less than :" + Number(result.balance);
            res.render("withdraw", { stat: stat, amo: amo });
        }

    });
});

//sending money
app.post("/transactions", function (req, res) {
    var reci = req.body.reacc;
    var sendingamount = req.body.amount;
    bank.findOne({ accno: num }, function (err, result) {
        if (sendingamount > result.balance) {
            var amo = ", Please enter a amount less than : " + Number(result.balance);
            console.log("inssuficent balance");
            var stat = "Balance is low ";
            res.render("transactions", { stat: stat, amo: amo });
        }
        else {
            bank.count({ accno: reci }, function (err, result) {
                if (result === 1) {
                    bank.findOne({ accno: num }, function (err, result) {
                        var newbal = result.balance - sendingamount;
                        bank.updateOne({ accno: num }, { $set: { balance: newbal } }, function (err, result) {
                            console.log("completed successfully");
                        });
                        bank.findOne({ accno: reci }, function (err, result) {
                            var incbal = Number(result.balance) + Number(sendingamount);
                            bank.updateOne({ accno: reci }, { $set: { balance: incbal } }, function (err, result) {
                                console.log("completed successfully");
                                res.redirect("/dashboard");
                            });
                        });
                    });
                }
                else{
                    var err="Receiver Account Doesn't Exist!."
                    res.render("transactions", { err: err});
                }
            });
        }
    });
});

//setting port 3000 connection 
app.listen(3000, function (err) {
    if (err) {
        console.log(err);
    }
    else {
        console.log("connected successfully on port 3000");
    }
});