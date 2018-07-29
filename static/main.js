/* Model */
var Question = function(data) {
    this.id = data.id;
    this.question = data.question;
    this.posted_by = data.posted_by;
}

/* View Model */
var ViewModel = function() {
    var self = this;

    // This is bound to visible property for post question page elements
    self.postQuestionPage = ko.observable(false);

    // Data bound to the post question text area value
    self.question = ko.observable();
    self.choice1 = ko.observable();
    self.choice2 = ko.observable();
    self.choice3 = ko.observable();
    self.choice4 = ko.observable();

    // This is data bound to the questions being displayed in the web page
    self.questionsList = ko.observableArray([]);

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
        self.postQuestionPage(true);
    };

    self.postQuestionCancel = function() {
        self.postQuestionPage(false);
    };

    self.postQuestionSubmit = function() {

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

        self.postQuestionPage(false);

        self.question(null);
        self.choice1(null);
        self.choice2(null);
        self.choice3(null);
        self.choice4(null);
    };

    self.questionSelected = function(data) {
        console.log(data);
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
    }
}


var vm = new ViewModel();
ko.applyBindings(vm);
