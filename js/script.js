document.addEventListener(DOMContentLoaded, function() {
    var title = window.ajaxUtils.sendGetRequest()
        
    // Convenience function for inserting innerHTML for 'select'
    var insertHtml = function (selector, html) {
        var targetElem = document.querySelector(selector);
        targetElem.innerHTML = html;
    };

    // Return substitute of '{{propName}}'
    // with propValue in given 'string'
    var insertProperty = function (string, propName, propValue) {
        var propToReplace = "{{" + propName + "}}";
            string = string
                .replace(new RegExp(propToReplace, "g"), propValue);
            return string;
    };

    var changeTitle = function(divContent) {
        insertHtml(divContent, title)
    }

    window.ajaxUtils.sendGetRequest("../Project-tile.js", change-tile(divContent))
});