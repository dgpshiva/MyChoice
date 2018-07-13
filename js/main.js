/* View Model */
var ViewModel = function() {
    var self = this;

    self.postQuestionPage = ko.observable(false);
    self.question = ko.observable();

    self.postQuestion = function() {
        self.postQuestionPage(true);
        document.getElementById("header-text").style.width = "100%";
    }

    self.postQuestionCancel = function() {
        self.postQuestionPage(false);
    }

    self.postQuestionSubmit = function() {
        self.postQuestionPage(false);

    }
}




var vm = new ViewModel();
ko.applyBindings(vm);
