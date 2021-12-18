const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// An array of post document ids.
let currentPosts_ids = [];
// Start the main function and log any errors.

const urlencoderParser = bodyParser.urlencoded({ extended: false });

let localDatabaseLink;
let cloudDatabaseLink;

const app = express();
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/saved', function(req, res) {
    res.sendFile(__dirname + '/saved.html');
})

app.listen(3000, () => {
    console.log('App listening on port 3000');
});

app.post('/databases_post', urlencoderParser, function (req, res) {
    localDatabaseLink = req.body.local_database
    cloudDatabaseLink = req.body.cloud_database
    res.redirect('/saved')

    main().catch(err => console.log(err));
})

async function main() {
    // This creates a connection to our local mongodb server and opens the portfolio-blog database by default.
    const localDatabase = await mongoose.createConnection(localDatabaseLink);
    // This creates a connection to our Atlas mongodb server and opens the postsBackup database by default.
    const cloudDatabase = await mongoose.createConnection(cloudDatabaseLink);

    const Schema = new mongoose.Schema({});

    const Post = localDatabase.model("Post", Schema, "posts");
    const BackupPost = cloudDatabase.model("BackupPost", Schema, "backupPosts");

    Post.find({}, function(error,document) {
        BackupPost.collection.insertMany(document, { ordered:false }, (error) => {
            console.log(error);
        });
    });

    const printAllPosts = () => {
        Post.find({}, (error, posts) => {
            if(error)
                console.log(error);

            posts.map(post => {
                if(!(currentPosts_ids.includes(post.id)))
                    console.log(post);
                currentPosts_ids.push(post.id);
            })
        })
    }

    printAllPosts();
}