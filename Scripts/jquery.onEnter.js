(function($) {
    $.fn.onEnter = function(callback) {
        return this.each(function() {
            $(this).keypress(function(event) {
				if(event && event.which == 13 && $.isFunction(callback) {
					event.preventDefault();
				
					callback(this, event);
				}
			}
		});
    }
})(jQuery);