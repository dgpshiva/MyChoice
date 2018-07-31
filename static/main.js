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
        }, 8000);

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
        }, 8000);

        // Making AJAX request to questions end point
        // Assign handlers immediately after making the request,
        // and remember the jqxhr object for this request
        var jqxhr = $.post( postQuestionEndPoint, JSON.stringify(postQuestionObject) )
                    .done(function(data) {
                        clearTimeout(requestTimeOut);
                        if (data === "success") {
                            alert("Question posted successfully!");
                        }
                        else {
                            alert("Failed to post question!" );
                        }

                    })
                    .fail(function() {
                        clearTimeout(requestTimeOut);
                        alert( "Failed to post question!" );
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


    self.questionSelected = function(questionJSON) {
        self.displayQuestion(questionJSON["question"]);
        self.displayPostedBy(questionJSON["posted_by"]);

        var questionId = questionJSON["id"];

        var getChoicesVotesEndPoint = "http://localhost:5000/v1/questions/" + questionId;

        var requestTimeOut = setTimeout(function(){
            window.alert("Failed to get response from API!");
        }, 8000);

        // Making AJAX request to get choices and votes end point
        $.getJSON( getChoicesVotesEndPoint )
            .done(function( choicesResponseJSON ) {
                clearTimeout(requestTimeOut);
                if (choicesResponseJSON === "fail") {
                    window.alert("Failed to get response from API!");
                }
                else {
                    choicesResponseJSON.choices.forEach( function(choice) {
                        self.choicesList.push(new Choice(choice));
                    });
                }
            })
            .fail(function( jqxhr, textStatus, error ) {
                clearTimeout(requestTimeOut);
                window.alert("Failed to get response from API!");
            });

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

    self.ballDisplayClassName = function(index) {
        return 'ball'+(index+1)+'Display';
    };


    self.castVote = function(choiceJSON) {

        var voteObject = {}
        voteObject["choice_id"] = choiceJSON["id"];
        voteObject["question_id"] = choiceJSON["question_id"];

        var castVoteEndPoint = "http://localhost:5000/v1/castvote/";

        var requestTimeOut = setTimeout(function(){
            window.alert("Failed to contact the API!");
        }, 8000);

        // Making AJAX request to cast vote end point
        // Assign handlers immediately after making the request,
        // and remember the jqxhr object for this request
        var jqxhr = $.post( castVoteEndPoint, JSON.stringify(voteObject) )
                    .done(function(data) {
                        clearTimeout(requestTimeOut);
                        if (data === "success") {
                            alert("Vote has been casted successfully!");
                        }
                        else {
                            alert("Failed to cast vote!" );
                        }
                    })
                    .fail(function() {
                        clearTimeout(requestTimeOut);
                        alert( "Failed to cast vote!" );
                    });
    };


    self.logout = function() {
        var logoutEndPoint = "http://localhost:5000/v1/logout";

        var requestTimeOut = setTimeout(function(){
            window.alert("Failed to contact the API!");
        }, 8000);

        // Making AJAX request to logout endpoint
        // Assign handlers immediately after making the request,
        // and remember the jqxhr object for this request
        var jqxhr = $.post( logoutEndPoint )
                    .done(function(data) {
                        clearTimeout(requestTimeOut);
                        if (data === "success") {
                            window.location.href =  "/v1/showLogin";
                        }
                        else {
                            alert("Logout failed!" );
                        }
                    })
                    .fail(function() {
                        clearTimeout(requestTimeOut);
                        alert( "Failed to contact the API!");
                    });
    };
}


var vm = new ViewModel();
ko.applyBindings(vm);
