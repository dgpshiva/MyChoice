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

    // This is data bound to the questions being displayed in the web page
    self.questionsList = ko.observableArray([{"id": 1, "posted_by": "Me","question": "Testssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssaaaaa"},
                                             {"id": 2, "posted_by": "MeAgain!","question": "Test"},
                                             {"id": 2, "posted_by": "MeAgain!","question": "Test"},
                                             {"id": 2, "posted_by": "MeAgain!","question": "Test"},
                                             {"id": 2, "posted_by": "MeAgain!","question": "Test"},
                                             {"id": 2, "posted_by": "MeAgain!","question": "Test"},
                                             {"id": 2, "posted_by": "MeAgain!","question": "Test"},
                                             {"id": 2, "posted_by": "MeAgain!","question": "Test"}
                                            ]);
    //self.questionsList = ko.observableArray([]);

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

    //self.loadQuestions();

    self.questionSelected = function() {
        console.log("In here!");
    };

    self.postQuestion = function() {
        self.postQuestionPage(true);
        document.getElementById("header-text").style.width = "100%";
    };

    self.postQuestionCancel = function() {
        self.postQuestionPage(false);
    };

    self.postQuestionSubmit = function() {
        self.postQuestionPage(false);
    };
}


var vm = new ViewModel();
ko.applyBindings(vm);
