/* Disabling browser back button as this is an SPA */
history.pushState(null, null, location.href);
    window.onpopstate = function () {
        history.go(1);
};


/* Model */
var Question = function(data) {
    this.id = data.id;
    this.question = data.question;
    this.posted_by = data.posted_by;
}

var Choice = function(data) {
    this.id = data.id;
    this.question_id = data.question_id;
    this.choice_order = data.choice_order;
    this.choice = data.choice;
    this.votes = data.votes;
}


/* View Model */
var ViewModel = function() {
    var self = this;

    // If mobile device
    if (window.innerWidth < 400) {
        document.getElementById("main-header").style.height = "150px"
        document.getElementById("main-header-text").style.margin = "0px"
        document.getElementById("header-buttons").style.position = "relative";
        document.getElementById("header-buttons").style.right = "0px";
        document.getElementById("header-buttons").style.flexFlow = "column wrap";
        document.getElementById("header-buttons").style.alignItems = "center";
        document.getElementById("header-buttons").style.justifyContent = "center";

        document.getElementById("post-question-button").innerText = "Post Question";
        document.getElementById("post-question-button").style.height = "35px";
        document.getElementById("post-question-button").style.width = "200px";
        document.getElementById("post-question-button").style.marginBottom = "10px";

        document.getElementById("logout-button").style.height =  "35px";
        document.getElementById("logout-button").style.width =  "200px";

        document.getElementById("choices-div").style.width =  "85%";

        document.getElementById("post-question-page-buttons-div").style.margin =  "75px 5px";
        document.getElementById("submit-button").style.marginRight =  "10px";
        document.getElementById("cancel-button").style.marginLeft =  "10px";
    }

    // If iPad
    if (window.innerWidth > 400 && window.innerWidth < 800) {
        document.getElementById("header-buttons").style.right = "10px";
        document.getElementById("post-question-button").style.width = "130px";
        document.getElementById("logout-button").style.width =  "130px";
    }

    // This is bound to visible property for post question page elements
    self.questionsListPage = ko.observable(true);
    self.postQuestionPage = ko.observable(false);
    self.questionDetailsPage = ko.observable(false);

    // Data bound to the post question text area value
    self.question = ko.observable("");
    self.choice1 = ko.observable("");
    self.choice2 = ko.observable("");
    self.choice3 = ko.observable("");
    self.choice4 = ko.observable("");

    // Data bound to the question details page
    self.displayQuestion = ko.observable();
    self.displayPostedBy = ko.observable();

    // This is data bound to the questions being displayed on the questions list page
    self.questionsList = ko.observableArray([]);

    // This is data bound to the choices being displayed on the question details page
    self.choicesList = ko.observableArray([]);

    // This will hold the current logged in user
    // Will be used to determine if the delete question option is to be shown
    self.currentUser = ko.observable();

    // Test data
    // self.questionsList = ko.observableArray([{"id": 1, "posted_by": "Me","question": "Testssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssaaaaa"},
    //                                          {"id": 2, "posted_by": "MeAgain!","question": "Test"},
    //                                          {"id": 2, "posted_by": "MeAgain!","question": "Test"},
    //                                          {"id": 2, "posted_by": "MeAgain!","question": "Test"},
    //                                          {"id": 2, "posted_by": "MeAgain!","question": "Test"},
    //                                          {"id": 2, "posted_by": "MeAgain!","question": "Test"},
    //                                          {"id": 2, "posted_by": "MeAgain!","question": "Test"},
    //                                          {"id": 2, "posted_by": "MeAgain!","question": "Test"}
    //                                         ]);


    self.loadQuestions = function() {

        // Clearing out any existing questions from the list
        self.questionsList.removeAll();

        var questionsEndPoint = "/v1/questions/";

        var requestTimeOut = setTimeout(function(){
            window.alert("Failed to get response from API!");
        }, 20000);

        // Making AJAX request to questions end point
        $.getJSON( questionsEndPoint )
            .done(function( questionsResponseJSON ) {
                clearTimeout(requestTimeOut);
                questionsResponseJSON.questions.forEach( function(question) {
                    self.questionsList.push(new Question(question));
                });
            })
            .fail(function( jqxhr, textStatus, error ) {
                clearTimeout(requestTimeOut);
                window.alert("Failed to get response from API!");
            });


        // Get the current user
        var getCurrentUserEndPoint = "/v1/getcurrentuser";

        var requestTimeOutGetCurrentUser = setTimeout(function(){
            window.alert("Failed to get response from API!");
        }, 20000);

        // Making AJAX request to questions end point
        $.getJSON( getCurrentUserEndPoint )
            .done(function( questionsResponseJSON ) {
                clearTimeout(requestTimeOutGetCurrentUser);
                self.currentUser(questionsResponseJSON.username);
            })
            .fail(function( jqxhr, textStatus, error ) {
                clearTimeout(requestTimeOutGetCurrentUser);
                window.alert("Failed to get response from API!");
            });
    };

    self.loadQuestions();



    self.postQuestion = function() {
        self.questionsListPage(false);
        self.questionDetailsPage(false);
        self.postQuestionPage(true);
    };

    self.postQuestionCancel = function() {
        self.questionDetailsPage(false);
        self.postQuestionPage(false);
        self.questionsListPage(true);
    };


    self.postQuestionSubmit = function() {

        if (self.question() === "") {
            window.alert("Please enter a question to post.");
            return;
        }

        if (self.choice1 === "" && self.choice2 === "" && self.choice3 === "" && self.choice4 === "") {
            window.alert("Please enter at least one choice for the question.");
            return;
        }

        var postQuestionObject = {}
        postQuestionObject["question"] = self.question();
        postQuestionObject["choice1"] = self.choice1();
        postQuestionObject["choice2"] = self.choice2();
        postQuestionObject["choice3"] = self.choice3();
        postQuestionObject["choice4"] = self.choice4();

        var postQuestionEndPoint = "/v1/postquestion/";

        var requestTimeOut = setTimeout(function(){
            window.alert("Failed to contact the API!");
        }, 20000);

        // Making AJAX request to POST question end point
        // Assign handlers immediately after making the request,
        // and remember the jqxhr object for this request
        var jqxhr = $.post( postQuestionEndPoint, JSON.stringify(postQuestionObject) )
                    .done(function(postQuestionResponseJSON) {
                        clearTimeout(requestTimeOut);
                        if (postQuestionResponseJSON.status === "success") {
                            window.alert("Question posted successfully!");
                            self.loadQuestions();
                        }
                        else {
                            window.alert("Failed to post question!" );
                        }
                    })
                    .fail(function() {
                        clearTimeout(requestTimeOut);
                        window.alert( "Failed to post question!" );
                    });

                    self.questionDetailsPage(false);
                    self.postQuestionPage(false);
                    self.questionsListPage(true);

                    self.question("");
                    self.choice1("");
                    self.choice2("");
                    self.choice3("");
                    self.choice4("");
    };


    self.loadChoicesAndVotes = function(questionId) {

        // Empty any choices votes previously loaded
        self.choicesList.removeAll();

        var getChoicesVotesEndPoint = "/v1/questions/" + questionId;

        var requestTimeOut = setTimeout(function(){
            window.alert("Failed to get response from API!");
        }, 20000);

        // Making AJAX request to GET choices and votes end point
        $.getJSON( getChoicesVotesEndPoint )
            .done(function( choicesResponseJSON ) {
                clearTimeout(requestTimeOut);
                if (choicesResponseJSON.status === "fail") {
                    window.alert("Failed to get response from API!");
                }
                else {
                    choicesResponseJSON.choices.forEach( function(choice) {
                        self.choicesList.push(new Choice(choice));
                    });

                    /* Get the figure elements by their ids and
                       alter their sizes based on votes count */
                    self.choicesList().forEach( function(choice, index) {
                        var size = 125 + (10 * choice.votes) > 250 ? 250 : 125 + (10 * choice.votes);
                        document.getElementById("ball"+(index+1)+"Id").style.height = size + "px";
                        document.getElementById("ball"+(index+1)+"Id").style.width = size + "px";
                    });

                    // If mobile device
                    if (window.innerWidth < 400) {
                        document.getElementById("choices-and-balls").style.display =  "flex";
                        document.getElementById("choices-and-balls").style.flexFlow =  "column wrap";
                        document.getElementById("choices-and-balls").style.alignItems =  "center";
                        document.getElementById("choices-and-balls").style.justifyContent =  "center";

                        document.getElementById("choice1Id").style.width =  "250px";
                        document.getElementById("choice2Id").style.width =  "250px";
                        document.getElementById("choice3Id").style.width =  "250px";
                        document.getElementById("choice4Id").style.width =  "250px";
                        document.getElementById("choice4Id").style.marginBottom =  "30px";

                        document.getElementById("ball1Id").style.position =  "relative";
                        document.getElementById("ball2Id").style.position =  "relative";
                        document.getElementById("ball3Id").style.position =  "relative";
                        document.getElementById("ball4Id").style.position =  "relative";

                        document.getElementById("ball1Id").style.right =  "0px";
                        document.getElementById("ball2Id").style.right =  "0px";
                        document.getElementById("ball3Id").style.right =  "0px";
                        document.getElementById("ball4Id").style.right =  "0px";

                        document.getElementById("ball3Id").style.top =  "0px";
                        document.getElementById("ball4Id").style.top =  "0px";

                        document.getElementById("ball1Id").style.marginBottom =  "8px";
                        document.getElementById("ball2Id").style.marginBottom =  "8px";
                        document.getElementById("ball3Id").style.marginBottom =  "8px";

                        document.getElementById("question-details-page-buttons-div").style.marginTop =  "25px";
                    }

                    // If iPad
                    if (window.innerWidth > 400 && window.innerWidth < 800) {
                        document.getElementById("ball1Id").style.right =  "250px";
                        document.getElementById("ball2Id").style.right =  "50px";
                        document.getElementById("ball3Id").style.right =  "250px";
                        document.getElementById("ball4Id").style.right =  "50px";
                    }

                }
            })
            .fail(function( jqxhr, textStatus, error ) {
                clearTimeout(requestTimeOut);
                window.alert("Failed to get response from API!");
            });
    };

    self.questionSelected = function(questionJSON) {
        self.displayQuestion(questionJSON["question"]);
        self.displayPostedBy(questionJSON["posted_by"]);

        var questionId = questionJSON["id"];

        self.loadChoicesAndVotes(questionId);

        self.questionsListPage(false);
        self.postQuestionPage(false);
        self.questionDetailsPage(true);
    };

    self.questionDetailsBack = function() {
        self.displayQuestion(null);
        self.displayPostedBy(null);
        self.choicesList.removeAll();

        self.questionDetailsPage(false);
        self.postQuestionPage(false);
        self.questionsListPage(true);
    };

    self.choiceIdName = function(index) {
        return 'choice'+(index+1)+'Id';
    };

    self.choiceClassName = function(index) {
        return 'choice'+(index+1)+'-style';
    };

    self.ballIdName = function(index) {
        return 'ball'+(index+1)+'Id';
    };



    self.castVote = function(choiceJSON) {

        var choiceID = choiceJSON["id"];
        var questionId = choiceJSON["question_id"];

        // Check if this user has not already cast a vote and then register his/her vote
        var getUserStatusEndPoint = "/v1/userstatus/" + questionId;

        var requestTimeOutGetUserStatus = setTimeout(function(){
            window.alert("Failed to get response from API!");
        }, 20000);

        // For casting vote
        var voteObject = {}
        voteObject["choice_id"] = choiceID;
        voteObject["question_id"] = questionId;

        var castVoteEndPoint = "/v1/castvote/";

        var requestTimeOutCastVote = setTimeout(function(){
            window.alert("Failed to contact the API!");
        }, 40000);


        // Making AJAX request to GET user status end point
        $.getJSON( getUserStatusEndPoint )
            .done(function( userStatusResponseJSON ) {
                clearTimeout(requestTimeOutGetUserStatus);
                if (userStatusResponseJSON.status === "fail") {
                    clearTimeout(requestTimeOutCastVote);
                    window.alert("Failed to get response from API!");
                }
                else if (userStatusResponseJSON.status === "alreadyVoted") {
                    clearTimeout(requestTimeOutCastVote);
                    window.alert("You have aready cast you vote for this question.\nAs this is an anonymous poll, you are not allowed to change you vote.");
                    return;
                }
                else if (userStatusResponseJSON.status === "goodToVote") {

                    // Cast users vote

                    // Making AJAX request to cast vote end point
                    // Assign handlers immediately after making the request,
                    // and remember the jqxhr object for this request
                    var jqxhr = $.post( castVoteEndPoint, JSON.stringify(voteObject) )
                                .done(function(castVoteResponseJSON) {
                                    clearTimeout(requestTimeOutCastVote);
                                    if (castVoteResponseJSON.status === "success") {
                                        window.alert("Your vote has been casted successfully!");
                                        self.loadChoicesAndVotes(questionId);
                                    }
                                    else {
                                        window.alert("Failed to cast vote!" );
                                    }
                                })
                                .fail(function() {
                                    clearTimeout(requestTimeOutCastVote);
                                    window.alert( "Failed to cast vote!" );
                                });
                }
            })
            .fail(function( jqxhr, textStatus, error ) {
                clearTimeout(requestTimeOutGetUserStatus);
                clearTimeout(requestTimeOutCastVote);
                window.alert("Failed to get response from API!");
            });
    };



    self.deleteQuestion = function(questionJSON) {
        var questionId = questionJSON["id"];

        var deleteQuestionObject = {}
        deleteQuestionObject["question_id"] = questionId;

        var deleteQuestionEndPoint = "/v1/deletequestion/";

        var requestTimeOut = setTimeout(function(){
            window.alert("Failed to contact the API!");
        }, 20000);

        // Making AJAX request to POST question end point
        // Assign handlers immediately after making the request,
        // and remember the jqxhr object for this request
        var jqxhr = $.post( deleteQuestionEndPoint, JSON.stringify(deleteQuestionObject) )
                    .done(function(deletetQuestionResponseJSON) {
                        clearTimeout(requestTimeOut);
                        if (deletetQuestionResponseJSON.status === "success") {
                            window.alert("Question deleted successfully!");
                            self.loadQuestions();
                        }
                        else if (deletetQuestionResponseJSON.status == "notAuthorized") {
                            window.alert("You are not authorized to delete this question!");
                        }
                        else {
                            window.alert("Failed to delete question!" );
                        }
                    })
                    .fail(function() {
                        clearTimeout(requestTimeOut);
                        window.alert( "Failed to delete question!" );
                    });
    };



    self.logout = function() {
        var logoutEndPoint = "/v1/logout";

        var requestTimeOut = setTimeout(function(){
            window.alert("Failed to contact the API!");
        }, 20000);

        // Making AJAX request to logout endpoint
        // Assign handlers immediately after making the request,
        // and remember the jqxhr object for this request
        var jqxhr = $.post( logoutEndPoint )
                    .done(function(logoutResponseJSON) {
                        clearTimeout(requestTimeOut);
                        if (logoutResponseJSON.status === "success") {
                            window.location.href =  "/v1/showLogin";
                        }
                        else {
                            window.alert("Logout failed!" );
                        }
                    })
                    .fail(function() {
                        clearTimeout(requestTimeOut);
                        window.alert( "Failed to contact the API!");
                    });
    };
}



var vm = new ViewModel();
ko.applyBindings(vm);
