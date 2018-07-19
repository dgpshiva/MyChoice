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

    self.questionSelected = function() {
        console.log("In here!");
    };

    self.postQuestion = function() {
        self.postQuestionPage(true);
    };

    self.postQuestionCancel = function() {
        self.postQuestionPage(false);
    };

    self.postQuestionSubmit = function() {
        self.postQuestionPage(false);

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
                        alert(data);
                    })
                    .fail(function() {
                        clearTimeout(requestTimeOut);
                        alert( "Failed to post question!" );
                    });
    };
}


var vm = new ViewModel();
ko.applyBindings(vm);
