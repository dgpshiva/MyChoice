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

        var questionsEndPoint = "http://localhost:5000/v1/questions/";

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

        postQuestionObject = {}
        postQuestionObject["question"] = self.question();
        postQuestionObject["choice1"] = self.choice1();
        postQuestionObject["choice2"] = self.choice2();
        postQuestionObject["choice3"] = self.choice3();
        postQuestionObject["choice4"] = self.choice4();

        var postQuestionEndPoint = "http://localhost:5000/v1/postquestion/";

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
                        }
                        else {
                            window.alert("Failed to post question!" );
                        }

                    })
                    .fail(function() {
                        clearTimeout(requestTimeOut);
                        window.alert( "Failed to post question!" );
                    });

        self.loadQuestions();

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

        var getChoicesVotesEndPoint = "http://localhost:5000/v1/questions/" + questionId;

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

    self.choiceClassName = function(index) {
        return 'choice'+(index+1)+'-style';
    };

    self.ballClassName = function(index) {
        return 'ball'+(index+1);
    };

    self.ballIdName = function(index) {
        return 'ball'+(index+1)+'Id';
    };



    self.castVote = function(choiceJSON) {

        choiceID = choiceJSON["id"];
        questionId = choiceJSON["question_id"];

        // Check if this user has not already cast a vote and then register his/her vote
        var getUserStatusEndPoint = "http://localhost:5000/v1/userstatus/" + questionId;

        var requestTimeOutGetUserStatus = setTimeout(function(){
            window.alert("Failed to get response from API!");
        }, 20000);

        // For casting vote
        var voteObject = {}
        voteObject["choice_id"] = choiceID;
        voteObject["question_id"] = questionId;

        var castVoteEndPoint = "http://localhost:5000/v1/castvote/";

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
                                    }
                                    else {
                                        window.alert("Failed to cast vote!" );
                                    }
                                })
                                .fail(function() {
                                    clearTimeout(requestTimeOutCastVote);
                                    window.alert( "Failed to cast vote!" );
                                });

                    self.loadChoicesAndVotes(questionId);
                }
            })
            .fail(function( jqxhr, textStatus, error ) {
                clearTimeout(requestTimeOutGetUserStatus);
                clearTimeout(requestTimeOutCastVote);
                window.alert("Failed to get response from API!");
            });
    };



    self.logout = function() {
        var logoutEndPoint = "http://localhost:5000/v1/logout";

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
