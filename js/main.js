/* View Model */
var ViewModel = function() {
    var self = this;

    self.postQuestionPage = ko.observable(false);

    self.postQuestion = function() {
        self.postQuestionPage(true);
        document.getElementById("header-text").style.width = "100%";
    }
}




var vm = new ViewModel();
ko.applyBindings(vm);