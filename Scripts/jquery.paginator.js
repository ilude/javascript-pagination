(function($) {
    $.fn.paginate = function(data, options) {
		var defaults = {  
			innerTemplateName: "iLude.Template",  
			itemsPerPage: 10,
			tableMode: false,
			scrollToTop: true
		};  
		var options = $.extend(defaults, options);  
	  options.selector = this.selector;
    return this.each(function() {
      var output = $(this);
			
			var pageCount = 1;
			var pageIndex = 1;
			var template;
			options.tableMode = (this.tagName.toLowerCase() === "table");
			if(options.tableMode) {
				// get the orginal template. In this case the TR inside the TBODY tags
				var templateBody = output.find("tbody");
				template = templateBody.html();
        templateBody.attr("id", options.innerTemplateName)
				templateBody.hide()
				
				// remove any existing page bodies
				var bodies = output.find("tbody.iludePage")
				bodies.remove()
			}
			else {
				// get the orginal template.
				template = $(this).html();
	
				if(!$(this).hasClass("pagination")){
					$(this).addClass("pagination");
				}
	
				// add the template back to the output so we can use it next time.
				var innerTemplate = CreateElement("div", options.innerTemplateName);
				innerTemplate.hide();
				innerTemplate.append(template);
				output.html(innerTemplate);
				
				// remove any existing page bodies
				var bodies = output.find("div.iludePage")
				bodies.remove()
			}
			
			var page = CreateElement((options.tableMode) ? "tbody" : "div", "page" + pageIndex);
			page.addClass("iludePage").data("index", pageIndex);
			
			if(options.tableMode) {
	        if(!$.browser.msie || ($.browser.msie && $.browser.version >= 8.0)) {
  			    page.css("display", "table-row-group");
	        }
			}
			
			page.show();
			output.append(page);
			
			jQuery.each(data, function(index, item) {
				var line = template;

				// loop through the properties of the current json object
				for (property in item) {
					// find the property name pattern in the line and replace it with the current json objects property value
					var temp = line.replace(new RegExp("\\$\{" + property + "\}", "ig"), item[property]);
					temp = temp.replace(new RegExp("\\$\%7B" + property + "\%7D", "ig"), item[property]);
					
					// replace the current line with the updated one from the line above.
					line = temp;
				}

				var count = index + 1;
				
				// set ${#} to the item count
				var temp = line.replace(new RegExp("\\$\{\\#\}", "ig"), count);
				line = temp;
				
				// set ${p#} to the to the item count on this page
				temp = line.replace(new RegExp("\\$\{p\\#\}", "ig"), pageCount);
				line = temp;
				
				// clear out any property patterns that we did not receive data for
				temp = line.replace(new RegExp("\\$\{.+?\}", "ig"), '');
				line = temp;
				
				// add the current line to the output.
				page.append(line);
				
				pageCount++;
				
				var mod = count % options.itemsPerPage;
				if(mod == 0 && count < data.length){
					pageIndex++;
					pageCount = 1;
					page = CreateElement((options.tableMode) ? "tbody" : "div", "page" + pageIndex);
					page.addClass("iludePage").data("index", pageIndex);
					if(options.tableMode) {
				    if(!$.browser.msie || ($.browser.msie && $.browser.version >= 8.0)) {
	            page.css("display", "table-row-group");
            }
					}
					page.hide();
					output.append(page);
				}
			});

      var nav = $("div#navigation.pagination").remove();
      
      if(pageIndex > 1) {
        var nav = CreateElement("div", "navigation");
        nav.addClass("disableSelection");
        nav.addClass("pagination");
        
        var prev = CreateElement("span", "prev");
        prev.html('PREV');
  	        
	      nav.append(prev);
  			
        for(var i=1; i<=pageIndex; i++) {
          var item = CreateElement("span", i);
          item.addClass("pageSelector");
          item.addClass("current");
          item.html(i);
  			
          if(i > 1) {
	          item.addClass("clickable");
	          item.bind("click", {options: options}, ClickPage);
	          item.removeClass("current");
          }
  				
          nav.append(item);
          nav.disableTextSelect();
        }
  			
			  var next = CreateElement("span", "next");
        next.addClass("clickable");
        next.html("NEXT");
        next.bind("click", {options: options}, NextClick);
			
        nav.append(next);
        output.after(nav);
	    }
    });
  }

	function BindNavigation(index, options) {
	  var pageCount = $(".pagination#navigation").find(".pageSelector").length;
		if(index == pageCount && $("#next").hasClass("clickable")){
			$("#next").unbind('click', NextClick)
			  .removeClass('clickable');
		}
		if(index < pageCount && !$("#next").hasClass("clickable")) {
			$("#next").bind("click", {options: options}, NextClick)
			  .addClass("clickable");
		}
		
		if(index == 1 && $("#prev").hasClass("clickable")) {
			$("#prev").unbind("click", PrevClick)
			  .removeClass("clickable");
		}
		else if(index > 1 && !$("#prev").hasClass("clickable")) {
			$("#prev").bind("click", {options: options}, PrevClick)
			  .addClass("clickable");
		}
		
		$(".pagination#navigation").find(".current")
			.bind("click", {options: options}, ClickPage)
			.addClass("clickable")
			.removeClass("current")
			
		$(".pagination#navigation").find("#" + (index))
			.unbind("click", ClickPage)
			.removeClass("clickable")
			.addClass("current");
	}
	
	function ClickPage(event) {
	  event.preventDefault();
	
		var pageIndex = parseInt($(this).html());
		
		$(".iludePage").hide();
		$(event.data.options.selector).find("#page" + pageIndex).show();
		BindNavigation(pageIndex, event.data.options);
		
		if(event.data.options.scrollToTop) {
		  $('html, body').animate({scrollTop:0}, 'fast');
		}
		
		return false;
	}
	
	function NextClick(event) {
	  event.preventDefault();
	
		var pageIndex = GetSelectedPageIndex();
		var nextIndex = pageIndex + 1;
		
		$(".iludePage").hide();
		$(event.data.options.selector).find("#page" + nextIndex).show();
		BindNavigation(nextIndex, event.data.options);
		
		if(event.data.options.scrollToTop) {
		  $('html, body').animate({scrollTop:0}, 'fast');
		}
		
		return false;
	}
	
	function PrevClick(event) {
	  event.preventDefault();
	
		var pageIndex = GetSelectedPageIndex();
		var nextIndex = pageIndex - 1;
		
		$(".iludePage").hide();
		$(event.data.options.selector).find("#page" + nextIndex).show();
		BindNavigation(nextIndex, event.data.options);
		
		if(event.data.options.scrollToTop) {
		  $('html, body').animate({scrollTop:0}, 'fast');
		}
		
		return false;
	}
	
	function GetSelectedPageIndex(){
		var pageIndex = 0;
		
		pageIndex = $(".pagination#navigation").find(".current").html();
		
		return parseInt(pageIndex);
	}
	
	function CreateElement(type, id){
		var element = jQuery(document.createElement(type));
		if(typeof(id) != "undefined") {
			element.attr("id", id);
		}
		
		return element;
	}
	
	if ($.browser.mozilla) {
        $.fn.disableTextSelect = function() {
            return this.each(function() {
                $(this).css({
                    'MozUserSelect' : 'none'
                });
            });
        };
        $.fn.enableTextSelect = function() {
            return this.each(function() {
                $(this).css({
                    'MozUserSelect' : ''
                });
            });
        };
    } else if ($.browser.msie) {
        $.fn.disableTextSelect = function() {
            return this.each(function() {
                $(this).bind('selectstart.disableTextSelect', function() {
                    return false;
                });
            });
        };
        $.fn.enableTextSelect = function() {
            return this.each(function() {
                $(this).unbind('selectstart.disableTextSelect');
            });
        };
    } else {
        $.fn.disableTextSelect = function() {
            return this.each(function() {
                $(this).bind('mousedown.disableTextSelect', function() {
                    return false;
                });
            });
        };
        $.fn.enableTextSelect = function() {
            return this.each(function() {
                $(this).unbind('mousedown.disableTextSelect');
            });
        };
    }
	
	
})(jQuery);

