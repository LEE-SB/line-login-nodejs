"use strict";

require("dotenv").config();

// ライブラリのインポート。
const express = require("express");
const app = express();
const line_login = require("line-login");
const session = require("express-session");
const session_options = {
    secret: process.env.LINE_LOGIN_CHANNEL_SECRET,
    resave: false,
    saveUninitialized: false
}
app.use(session(session_options));

// 認証の設定。
const login = new line_login({
    channel_id: process.env.LINE_LOGIN_CHANNEL_ID,
    channel_secret: process.env.LINE_LOGIN_CHANNEL_SECRET,
    callback_url: process.env.LINE_LOGIN_CALLBACK_URL,
    scope: "openid profile",
    prompt: "consent",
    bot_prompt: "normal"
});

// サーバー起動設定。
app.listen(process.env.PORT || 5000, () => {
    console.log(`server is listening to ${process.env.PORT || 5000}...`);
});

// 認証フローを開始するためのルーター設定。
app.get("/auth", login.auth());

// ユーザーが承認したあとに実行する処理のためのルーター設定。
app.get("/callback", login.callback(
    (req, res, next, token_response) => {
        console.log("success callback");
        res.json(token_response);
        // 認証フロー成功時
//        login.get_friendship_status(token_response.access_token).then((response) => {
//            res.json(response);
//        })
    },(req, res, next, error) => {
        console.log("failure callback");
        // 認証フロー失敗時
        res.status(400).json(error);
    }
));

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.get("/", (req, res) => {
    res.render(__dirname + "/index");
})
