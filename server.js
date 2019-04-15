const express = require("express");
const mongo = require("mongodb");
const mongoose = require("mongoose");
const cors = require("cors");
const isUrl = require("is-url");

const app = express();
const port = process.env.PORT || 3000;

const Schema = mongoose.Schema;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });

const URL = mongoose.model(
	"URL",
	new Schema({
		originalUrl: {
			type: String,
			required: true,
		},
	}),
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", (req, res) => {
	res.sendFile(`${process.cwd()}/views/index.html`);
});

app.get("/api/:shortUrl", async (req, res, next) => {
	try {
		const shortUrl = await URL.findById(req.params.shortUrl);
		if (shortUrl) res.redirect(`${shortUrl.originalUrl}`);
		else res.status(404).send("404: The URL you provided does not exist.");
	} catch (error) {
		next(error);
	}
});

app.post("/api/shorturl/new", async (req, res, next) => {
	try {
		const { url } = req.body;
		if (isUrl(url)) {
			const alreadyInDB = await URL.findOne({ originalUrl: url });

			if (alreadyInDB)
				res.json({
					original_URL: alreadyInDB.originalUrl,
					short_url: alreadyInDB._id,
				});
			else {
				const newURL = await URL.create({
					originalUrl: url,
				});
				res.json({
					original_URL: newURL.originalUrl,
					short_url: newURL._id,
				});
			}
		} else res.json({ error: "Invalid URL" });
	} catch (error) {
		next(error);
	}
});

app.get("/api/hello", (req, res) => {
	res.json({ greeting: "hello API" });
});

app.listen(port, () => {
	console.log("Node.js listening ...");
});
