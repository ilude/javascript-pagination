(function($) {
	$.fn.repeater = function(data, options) {
		var defaults = {  
			innerTemplateName: "iLudeTemplate", 
			tableMode: false
		};
		var options = $.extend(defaults, options);  

		return this.each(function() {
			var output = $(this);

			var template;
			if(this.tagName == "TABLE" || options.tableMode) {
				options.tableMode = true;
				// get the orginal template. In this case the TR inside the TBODY tags
				var templateBody = output.find("tbody#" + options.innerTemplateName);
				if(templateBody.length == 0) {
					templateBody = output.find("tbody");
					templateBody.attr("id", options.innerTemplateName)
					templateBody.hide()
				}

				template =  templateBody.html();

				// remove any existing page bodies
				var bodies = output.find("tbody.iludePage")
				bodies.remove()
			}
			else {
				var templateBody = output.find("#" + options.innerTemplateName);
				if(templateBody.length == 0) {
					// get the orginal template.
					templateBody = $(this).clone();

					// add the template back to the output so we can use it next time.
					var innerTemplate = CreateElement("div", options.innerTemplateName);
					innerTemplate.append(templateBody.html());
					innerTemplate.hide();

					output.html(innerTemplate);
			    }

				template = templateBody.html();

				// remove any existing page bodies
				var bodies = output.find("div.iludePage")
				bodies.remove()
			}
			
			var page = CreateElement((options.tableMode) ? "tbody" : "div", "page");
			page.addClass("iludePage");
			
			if(options.tableMode) {
				page.css("display", "table-row-group");
			}
			else{
				page.show();
			}
			
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
				
				// clear out any property patterns that we did not receive data for
				temp = line.replace(new RegExp("\\$\{.+?\}", "ig"), '');
				line = temp;
				
				// add the current line to the output.
				page.append(line);
			});
		});
    }
	
	function CreateElement(type, id){
		var element = jQuery(document.createElement(type));
		if(typeof(id) != "undefined") {
			element.attr("id", id);
		}
		
		return element;
	}
})(jQuery);

