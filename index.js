const mongoose = require('mongoose');
// An array of post document ids.
let currentPosts_ids = [];
// Start the main function and log any errors.
main().catch(err => console.log(err));


async function main() {
    // This creates a connection to our local mongodb server and opens the portfolio-blog database by default.
    const localDatabase = await mongoose.createConnection('mongodb://localhost:27017/portfolio-blog');
    // This creates a connection to our Atlas mongodb server and opens the postsBackup database by default.
    const cloudDatabase = await mongoose.createConnection('mongodb+srv://zacharyperales:zacharyperales666@cluster0.u8yqr.mongodb.net/postsBackup?retryWrites=true&w=majority');
    const Schema = new mongoose.Schema({});

    const Post = localDatabase.model("Post", Schema, "posts");
    const BackupPost = cloudDatabase.model("BackupPost", Schema, "backupPosts");

    Post.find({}, function(error,document) {
        BackupPost.collection.insertMany(document, { ordered:false }, (error) => {
            console.log(error.message);
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
    setTimeout(main, 10000);
}
