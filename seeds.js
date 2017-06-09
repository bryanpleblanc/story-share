var mongoose = require("mongoose");
var Story = require('./models/story.js');
var Comment = require('./models/comment.js');

var data = [
    {
        title: "Long Shot",
        author: "Roger Stone",
        genre: "Non-Fiction",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTG1gKiLaivpa903WMTSovPsucdnnsCYZAIArJEifGUAuQKjg4f",
        description: "A story of how a young man overcame.",
        featured: true
    },
    {
        title: "Cloud's Rest",
        author: "Amanda Fey",
        genre: "Fiction",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3pyXI6tjQGeJhkKXrYHOMEKdcKFpE-Y04YNAc9Iqi9unuy0sP",
        description: "A hero saves world",
        featured: true
    },
    {
        title: "Iron Bull",
        author: "Bryan LeBlanc",
        genre: "Fiction",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZdolEzew7cQZQPWZuxt1rA6ZNBBUB22JDeWcivhwWGIbe-aom",
        description: "Dog finds himself",
        featured: true
    }
];

var comment_data = {
    text:"This is a great book",
    author:"Homer"
};



function seedDB() {
    // Remove Stories
    Story.remove({}, function(err) {
        if (err) {
            console.log("can't remove story collection");
        } else {
            console.log("removed stories");

            Comment.remove({}, function(err) {
                if (err) {
                    console.log("can't remove comments collection");
                } else {
                    console.log("removed comments");

                    //Add story from seed bank data
                    var i = 0;
                    data.forEach(function(seed) {
                        Story.create(seed, function(err, story) {
                            if(err) {
                                console.log("Can't Add Story " + i);
                            } else {
                                console.log("Added Story " + i);
                                i++;
                                //Add comments
                                Comment.create(comment_data, function(err, comment) {
                                    if(err) {
                                        console.log("can't creat comment");
                                    } else {
                                        story.comments.push(comment);
                                        story.save();
                                        console.log("comment created");

                                    };
                                }); // end comment create

                            };
                        });
                    });

                };
            });

        };
    });


};

module.exports = seedDB;
