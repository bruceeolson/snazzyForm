(function($){
	var   PLUGIN_NAME = 'snazzyForm'
		, CSS_PREFIX = "mktf"
		, STATES = [["All","Select"],["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],["CA","California"],["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],["DC","District of Columbia"],["FL","Florida"],["GA","Georgia"],["GU","Guam"],["HI","Hawaii"],["ID","Idaho"],["IL","Illinois"],["IN","Indiana"],["IA","Iowa"],["KS","Kansas"],["KY","Kentucky"],["LA","Louisiana"],["ME","Maine"],["MD","Maryland"],["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],["MS","Mississippi"],["MO","Missouri"],["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],["NH","New Hampshire"],["NJ","New Jersey"],["NM","New Mexico"],["NY","New York"],["NC","North Carolina"],["ND","North Dakota"],["MP","Northern Mariana Islands"],["OH","Ohio"],["OK","Oklahoma"],["OR","Oregon"],["PA","Pennsylvania"],["PR","Puerto Rico"],["RI","Rhode Island"],["SC","South Carolina"],["SD","South Dakota"],["TN","Tennessee"],["TX","Texas"],["UT","Utah"],["VT","Vermont"],["VI","Virgin Islands"],["VA","Virginia"],["WA","Washington"],["WV","West Virginia"],["WI","Wisconsin"],["WY","Wyoming"]]
		;
		
	if ( typeof $.fn.validate == 'undefined') {
		alert('The jquery.validate plugin is required but was not found.');
		return;
	}
	
	// add some methods to jQuery.validator()
	jQuery.validator.addMethod("stateAbbrev", function(value, element) {
		return this.optional(element) || /^[A-Z]{2}$/.test(value);
	}, "Please select a state.");
									
	jQuery.validator.addMethod("acknowledge", function(value, element) {
		return /^on$/.test(value);
	}, "You must check this box in order to continue.");
									
	jQuery.validator.addMethod("zipcodeUS", function(value, element) {
		return this.optional(element) || /\d{5}-\d{4}$|^\d{5}$/.test(value)
	}, "The specified US ZIP Code is invalid");
	
	jQuery.validator.addMethod("phoneUS", function(phone_number, element) {
		phone_number = phone_number.replace(/\s+/g, "");
		return this.optional(element) || phone_number.length > 9 &&
			phone_number.match(/^(\+?1-?)?(\([2-9]\d{2}\)|[2-9]\d{2})-?[2-9]\d{2}-?\d{4}$/);
	}, "Please specify a valid phone number");
	
	
	
	/*************  define objects to manage buttons ( back, continue, submit) *********************/
	function Button(action,data) {
		var   self = this
			, position = action == 'back' ? 'left' : 'right'
			, buttonClasses = ['mk-btn','mk-btn-'+action,'mk-btn-'+position]
			;
		this.data = data;
		this.busy = false;
		this.$button = $('<input type="button" data-action="'+action+'" class="'+buttonClasses.join(" ")+'"/>');
		this.$button.click(function() { 
			if ( !self.busy ) { 
				self.busy = true;
				self.clickEvent();
				setTimeout(function(){ self.busy = false; }, 2000);	// ignore other button clicks for 2 seconds		
			}
		});
	}
	Button.prototype.isFormValid = function() {
		if ( !this.$button.closest('form').validate().form() ) {
			alert('Please check your form for missing information.');
			return false;
		}
		else return true;
	}
	
	// BACK button
	function Button_Back(data) { Button.call(this,"back",data);	}
	Button_Back.prototype = Object.create(Button.prototype);
	Button_Back.prototype.clickEvent = function() { changeStep.call(this.data,(this.data.STEP-1)); }

	// CONTINUE button
	function Button_Continue(data) { Button.call(this,"continue",data);	}
	Button_Continue.prototype = Object.create(Button.prototype);
	Button_Continue.prototype.clickEvent = function() { 
		if ( this.isFormValid() ) changeStep.call(this.data,(this.data.STEP+1));
	}

	// SUBMIT button
	function Button_Submit(data) { Button.call(this,"submit",data);	}
	Button_Submit.prototype = Object.create(Button.prototype);
	Button_Submit.prototype.clickEvent = function() { 
		if ( this.isFormValid() ) {
			var   beforeSubmitSuccess = $.isFunction(this.data.beforeSubmit) ? this.data.beforeSubmit() : true;
			if ( beforeSubmitSuccess ) submitForm.call(this.data);
		}
	}

		  
    $.fn[PLUGIN_NAME] = function(method)
    {
        if (mp[method]) // map $('foo').myplugin('bar', 'baz') to mp.bar('baz')
        {
            return mp[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof method === 'object' || ! method)
        {
            return mp.init.apply(this, arguments); // if called without arguments, init
        }
        else
        {
            $.error('Method ' +  method + ' does not exist on $.'+PLUGIN_NAME);
        }
    };
	
	function initForm() {
		var   $form = $(this)
			, data = $form.data(mp.pluginName)
			, numSteps = $form.find('.step').length
			, stepWidth = Math.round((1/numSteps)*100)-1.5;
			;					
					
		$form.addClass(CSS_PREFIX);
		
		$form.find('.steps').css('width',100*data.STEPS+'%');
		
		// position focus to first field
		$form.find('form:first input:first').focus();
				
		// build the header step tabs and add some classes to the .step div
		$form.find('form:last').addClass('lastForm');
		var $head = $('<div class="dhead">').prependTo($form);
		$form.find('.steps >.step').each(function() {
			var   num = $(this).index()+1
				, label = $(this).data('steplabel')
				, html =  [
						'<div class="step'+num+'" '+(num==1?'active':'')+' style="width:'+stepWidth+'%">',
						'	<span class="number">'+num+'</span>',
						'	<span class="label">'+label.toUpperCase()+'</span>',
						'</div>'
						]
						;
			$(html.join("\n")).appendTo($head);
			$(this).addClass('step'+num+' '+label);			
		});
		
		if ( numSteps == 1 ) $head.remove();
		
		// create helper widgets
		$form.find('.helpWidget').each(function() {
			var content = $(this).html();
			$(this).empty();
			$('<div class="questionmark" title="click for help"/>').appendTo($(this));
			$('<div class="content">'+content+'</div>').appendTo($(this));
		});
		
		// add state option elements to the select.stateAbbrev element
		$form.find('select.stateAbbrev').html(selectStateOptions());
		
		// add buttons to all of the forms
		$form.find('form').each(function() {
			
			$(this).append('<hr/>');
			
			var   isLastStep = $(this).hasClass('lastForm')
				, isFirstStep = $(this).closest('.step').hasClass('step1')
				, B = isLastStep ? new Button_Submit(data) : new Button_Continue(data)
				, backButton = new Button_Back(data)
				, $buttons = $('<div class="buttons clearfix"/>').appendTo($(this))
				;
			$buttons.append(B.$button);
			if ( !isFirstStep && !data.hideBackButton) $buttons.append(backButton.$button);
		})
					
		// turn on form validation for all of the forms
		$form.find('form').each(function() {
			$(this).validate({ignore : '.ignore'});
		});
				
		// BINDINGS
		$form.on('click', '.helpWidget >.questionmark', function() {
			$(this).parent().find('.content').toggle();
		});
		
		// click on header takes you to previous steps ONLY
		$form.on('click', '.dhead >div', function() {
			var   data = pluginContainerData($(this)) 
				, index = $(this).find('span.number').text()*1
				;
			if ( index < data.STEP ) changeStep.call(data,index);
		});
		
	}
	
	
	function selectStateOptions () {
		var html = [];
		STATES.forEach(function(state) { html.push('<option value="'+state[0]+'">'+state[1]+'</option>'); });
		return html.join("\n");
	}
	
	function autoPopulate (O) {
		O = O || {};
		for ( var field in O ) {
			$(this).find('*[name='+field+']').val(O[field]);
			//$(this).find('select[name='+field+']').val(O[field]);
			//$(this).find('textarea[name='+field+']').val(O[field]);
		}
	}
	
	
	function changeStep (step) {
		var data = this;
		data.STEP = step;
		data.STEP_CLASS = '.step'+data.STEP
		
		var $progress = data.$FORM.find('>.dhead:eq(0)');			
		clearTimeout(data.TIMEOUT_RESIZE);
		$progress.find('div[active]').removeAttr('active');
		$progress.find(data.STEP_CLASS).attr('active','active');
		data.STEPS.animate({'margin-left': '-'+((data.STEP-1)*100)+'%'},500, function() { 
			$('html, body').animate({scrollTop: 0}, 500);
			resize.call(data);
		});	
	}
	
	function resize() {
		var   data = this
			, height = data.STEPS.find('>'+data.STEP_CLASS).height()
			;
		data.STEPS.animate({'height': (height+10)+'px'},500);		
		data.TIMEOUT_RESIZE = setTimeout(function() { resize.call(data); },2000);
	}
	
	
	function submitForm () {
		if ( this.ajax ) submitAjax.call(this);
		else submitPage.call(this);
	}
	
	function submitPage() {
		var   $form = $('<form action="'+this.url+'" method="post">');
		this.$FORM.find('form').each(function() {  
			$(this).find('input[type=hidden], input[type=text], input[type=radio], select, textarea').each(function() {
				$(this).appendTo($form);
			});
		});
		$form.submit();
	}
	
	
	function submitAjax () {
		var   data = this
			, $step = data.$STEP_SUBMIT
			, messageClass = CSS_PREFIX+'-message'
			, $message = data.$FORM.find('>.'+messageClass)
			, query = []
			, $busy = $('<p class="mk-busy">Processing ...</p>').prependTo($step)
			, R = { 
					success:false, 
					code:'', 
					error:'', 
					msg:'', 
					data:{},
					messageHtml : function() {
						var $html = $('<div/>');
						if ( $.isArray(this.msg) ) {
							var $ul = $('<ul/>').appendTo($html)
							this.msg.forEach(function(m) { $('<li>'+m+'</li>').appendTo($ul);} );
						}
						else $('<p>'+this.msg+'</p>').appendTo($html);
						return $html.html();
					}
			  }
			, messages = {
				invalidJson : 'Invalid or missing json object.',
				timeout : 'Backend timeout.'
			  }
			;
		
		function errorMessage() {
			if ( R.code == 'xhrError' ) return 'XHR request failed\n\n'+R.error+'\nMsg= '+R.msg;
			else if ( R.code == 'error' ) return R.msg;
			return messages[R.code];
		}
		
		
		// add a DOM element for displaying messages
		if ( $message.length ) $message.empty();
		else $message = $('<div class="'+messageClass+'" style="margin:20px;"/>').appendTo(data.$FORM)
		
		// create one query string from all of the forms
		data.$FORM.find('form').each(function() {  query.push($(this).serialize()); });
													
		$.ajax({
				url: data.url,
				data : query.join("&"),
				dataType:"text",
				type : 'post',
				timeout : 20000,
				error : function (xObj, error, msg) { 
					R.code = 'xhrError';
					R.error = error;
					R.msg = msg;
				},
				success : function(data) { 
				
					data = data || false;
																												
					// make sure we got a valid json response
					if ( data === false ) R.code = 'invalidJson';
					else {
					
						try {  
							R.data = $.parseJSON(data);  // tries to parse as a json object
						} catch (e) {
							R.code = 'invalidJson';
						}
					
						if ( R.code == 'invalidJson' ) return;
						else if ( R.data.status.toLowerCase() == "success") R.code = 'success';
						else {
							R.code = 'error';
							R.msg =  R.data.messages || R.data.msg || 'Backend returned Error';
						}
					}
				},
				complete : function(obj, status) { 
						$busy.remove();
						if ( status == 'timeout' ) R.code = 'timeout';
						R.success = R.code == 'success' ? true : false;
						
						if ( R.success ) R.msg = data.confirmationHtml || data.msg || data.messages;
						else if ( R.code == 'xhrError' ) R.msg = 'XHR request failed\n\n'+R.error+'\nMsg= '+R.msg;
						else if ( messages[R.code] ) R.msg = messages[R.code];
						
						if ( R.success ) {
							clearTimeout(data.TIMEOUT_RESIZE);  // no need to resize anymore					
							// remove the progress bar and footer
							data.$FORM.find('>.dhead, >.dfoot, >.steps').remove();
							$step.css('height','auto');
							data.onSubmitSuccess(R);
						}
						else data.onSubmitError(R);
				}									
		})
		
	}
	
	function showConfirmationMessage(R) {
		var  $message = this.$FORM.find('>.'+CSS_PREFIX+'-message');
		
		//alert(JSON.stringify(R));
		$message.html(R.messageHtml());
		$message.show();
	}
		
	
	function pluginContainerData($element) {
		return $element.closest('.'+CSS_PREFIX).data(PLUGIN_NAME);
	}
	

    var mp = { // public methods, externally accessible via $.readMore('foo', 'bar')
	
		pluginName : PLUGIN_NAME,

        init : function(config) {
			config = config || {};
            return this.each(function() {
				
				var $form = $(this);
												
				if ( typeof $form.data(mp.pluginName) == 'undefined' ) {  // form not initialized yet
				
					$form.hide();
					$form.addClass(CSS_PREFIX);
					$form.wrapInner('<div class="steps"/>');
										
					// create a data object for this instance
					$form.data(PLUGIN_NAME, {
						  $FORM : $form
						, STEPS : $form.find('>.steps:eq(0)')
						, $STEP_SUBMIT : $form.find('form:last')
						, STEP : 1
						, STEP_CLASS : '.step1'
						, TIMEOUT_RESIZE : 0
						, ajax : true
						, url : ''  // url to POST the form to
						, confirmationHtml : '<p>Thanks for submitting the form!</p>'
						, hideBackButton : false
						, beforeInit : false
						, afterInit : false
						, beforeSubmit : false
						, onSubmitSuccess : function(R) { showConfirmationMessage.call(this,R); }
						, onSubmitError : function(R) { alert(R.code+': \n'+R.msg); }
					});
										
					var data = $form.data(mp.pluginName);
					
					$.extend(data, config);
																	
					if ( $.isFunction(data.beforeInit) ) data.beforeInit();
					initForm.call(this);
					if ( $.isFunction(data.afterInit) ) data.afterInit();
					$form.show();
					changeStep.call(data,1);
				}
			})
		},
		
		insertStates : function() { 
            return this.each(function() { $(this).html(selectStateOptions()); });		
		},
			
		autoPopulate : function(O) {
            return this.each(function() { autoPopulate.call(this,O); });		
		}
    };
	
})(jQuery);