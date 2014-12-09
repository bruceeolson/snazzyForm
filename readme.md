# snazzyForm jQuery plugin

**snazzyForm** is a package that provides consistent behavior and styling for NCMEC forms.  It is most useful for multi-part forms.  

The package includes a css file, LESS files, button images, and two jQuery plugins.  In some cases it might make sense to use ONLY the css/LESS part of the package if all you want is styling consistency.  The **snazzyForm** jQuery plugins provide a number of features that can be useful (see below).

**Requires** : jQuery and the [jquery.validate](http://jqueryvalidation.org/documentation) plugin

### Features

* css/LESS for form styling
* button images (e.g. back, continue, submit, add, delete)
* field validation using **jquery.validate**
* auto loading of select.stateAbbrev dropdowns
* auto placement of **Continue**, **Submit**, and **Back** buttons on the form
* auto-populates the form for testing
* helperWidget to toggle help messages in the form
* multiple sub-forms are tabbed and scrolled horizontally
* sub-forms are individually validated before scrolling to the next sub-form
* choose AJAX or normal form submission

### Caveat

You may notice that the LESS and JS source code contains some erroneous stuff.  That's because it was extracted from a larger project and hasn't been cleaned up entirely yet.

The LESS compiler generates the **main.css** file.  Obviously you can modify the LESS files as you like and recompile using a LESS compiler.

### Getting Started

Copy the entire **snazzyForm** directory into your project so that your page can reference the **css**, **js**, and image assets.

The plugin instantiates on a DOM container that has one or more `<form>` children.  The `<form>` children are herineafter referred to as **sub-forms**.  The example below has two sub-forms.

To instantiate the sub-forms container as follows:  

	$('#example').snazzyForm({url:'/submitForm.php'})  // the form is POSTed to /submitForm.php
	
**Example**

~~~~html
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>snazzyForm example</title>

<link rel="stylesheet" type="text/css" href="snazzyForm/css/main.css"/>
<link href="//fonts.googleapis.com/css?family=Arimo:400,700,400italic,700italic" rel="stylesheet" type="text/css"/>
<script src="//use.edgefonts.net/amaranth.js"></script>
</head>

<body>
        
    <div id="example" style="width:350px; margin:0 auto;">
	
		<!-- ******************* contact sub-form ******************* -->                    
        <form data-steplabel="contact" class="step">
        	<div class="helpWidget">
            	<p>Put some help message here.</p>
            </div>
        	<input type="hidden" name="action" value="faonForm"/>
            
            <label>Name:</label>
            <input type="text" name="name" class="required" />
                                            
            <div class="radioList">
                <label><input type="radio" name="sex" value="male">&nbsp;Male</label>
                <label><input type="radio" name="sex" value="female">&nbsp;Female</label>
            </div>
                                            
            <div>              
				<label>State:</label>
				<select class="stateAbbrev" name="state"></select>
            </div>
                        
            <label>Email:</label>
            <input type="text" name="email" class="email required"/>
        </form>
		<!-- ******************* contact sub-form ******************* -->                    
        
		<!-- ******************* message sub-form ******************* -->                    
        <form data-steplabel="message" class="step">
        	<label class="alignTop">Message</label>
        	<textarea name="message"></textarea>
        </form>
		<!-- ******************* message sub-form ******************* -->                    
		
    </div>  <!-- #example -->
        
<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
<script type="text/javascript" src="snazzyForm/js/jquery.form.validate.min.js"></script>
<script type="text/javascript" src="snazzyForm/js/jquery.snazzyForm.js"></script>
<script>
$(function() { 
	$('#example').snazzyForm({
							  url:'/missingkids/ajax.php',
							  confirmationHtml : '<p>Thanks for submitting the form!</p>'
	}); 
});
</script>
</body>
</html>
~~~~				

On DOM ready the plugin is instructed to instantiate the #example container which has two sub-forms.
	
Note that the plugin is instantiated with an object.  The **url** property of that object is REQUIRED.  The table belows shows all of the valid attributes of the instantiation object.

Property | Type	| Default | Notes
---------|------|---------|--------
url 	| string | REQUIRED | the url to post the form to
ajax	| boolean | true | true means do an ajax post
hideBackButton	| boolean | false | true means do not show Back buttons
confirmationHtml | string | empty string | the html to render after the form was submitted successfully
beforeInit | function | false | function to run before initializing the form
afterInit | function | false | function to run after initializing the form
beforeSubmit | function | false | fn to run before submitting the form.  It must return a boolean.  True means submit.  False means don't submit.
onSubmitSuccess | function | false | fn to run if AJAX submission returns **success**
onSubmitError | function | false | fn t run if AJAX submission returns **error**


snazzyForm performs the following initiation steps:

* calls beforeInit()
* builds the header tabs ( if there are two or more sub-forms )
* turns on field validation for each sub-form
* adds control buttons to the form ( continue, back, submit )
* the first sub-form gets an input[data-action=continue] button
* the last sub-form gets an input[data-action=submit] button
* the other sub-forms get a continue button and a input[data-action=back] button
* loads any select.stateAbbrev dropdowns
* activates .helpWidgets
* auto-populates the form if told to do so
* calls afterInit()

### AJAX submissions

AJAX submissions require that the backend returns a JSON object with the following structure:

`{"status":"success|error" [, "messages":["msg1","msg2"] ] }`

### Helper Methods

Use **autoPopulate** to pre-load form fields while testing.

	$('#example').snazzyForm('autoPopulate',{ 
											name : 'Judy Contact',
											state : 'MD',
											email : 'jncmec@ncmec.org'
										})
	

Use **insertStates** to populate a select field with state options.

	$('#example select.stateAbbrev').snazzyForm('insertStates')
	
snazzyForm does this automatically when it initializes a form however if you have extensions that dynamically add fields after initialization then this method can be used to load the `<select>` element with state `<option>` elements.
	

