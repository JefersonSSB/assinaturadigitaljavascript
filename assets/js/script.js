$(function(){

	var body = $('body'),
		stage = $('#stage'),
		back = $('a.back');

	/* Step 1 */

	$('#step1 .encrypt').click(function(){
		body.attr('class', 'encrypt');

		// Go to step 2
		step(2);
	});

	$('#step1 .decrypt').click(function(){
		body.attr('class', 'decrypt');
		step(2);
	});


	/* Step 2 */


	$('#step2 .button').click(function(){
		// Trigger the file browser dialog
		$(this).parent().find('input').click();
	});


	// Set up events for the file inputs

	var file = null;

	$('#step2').on('change', '#encrypt-input', function(e){

		// Has a file been selected?

		if(e.target.files.length!=1){
			alert('Selecione um arquivo para criptografar!');
			return false;
		}

		file = e.target.files[0];

		if(file.size > 5242*5242){
			alert('Escolha arquivos menores que 5 MB, caso contrário, você pode travar seu navegador.');
			return;
		}

		step(3);
	});

	$('#step2').on('change', '#decrypt-input', function(e){

		if(e.target.files.length!=1){
			alert('Selecione um arquivo para descriptografar!');
			return false;
		}

		file = e.target.files[0];
		step(3);
	});


	/* Step 3 */


	$('a.button.process').click(function(){

		var input = $(this).parent().find('input'),
			a = $('#step4 a.download'),
			password = input.val();

		input.val('');

		if(password.length<5){
			alert('Digite uma chave mais longa!');
			return;
		}

		// The HTML5 FileReader object will allow us to read the 
		// contents of the	selected file.

		var reader = new FileReader();

		if(body.hasClass('encrypt')){

			// Encrypt the file!

			reader.onload = function(e){

				// Use the CryptoJS library and the AES cypher to encrypt the 
				// contents of the file, held in e.target.result, with the password
				var secretPassword = CryptoJS.SHA1(password.toString()).toString(CryptoJS.enc.Base64) ;

				var encrypted = CryptoJS.AES.encrypt(e.target.result, secretPassword);

				// The download attribute will cause the contents of the href
				// attribute to be downloaded when clicked. The download attribute
				// also holds the name of the file that is offered for download.
				
				
				document.getElementById("private password info").innerHTML = "Chave Publica";
				document.getElementById("private password more info").innerHTML = 'Chave que devera ser usada para descriptografar o arquivo. Escreva ou lembre-se.';
				document.getElementById("private password").innerHTML = '<h3>' + secretPassword + '</h3>';
				a.attr('href', 'data:application/octet-stream,' + encrypted);
				a.attr('download', file.name + '.criptografado');

				step(4);
			};

			// This will encode the contents of the file into a data-uri.
			// It will trigger the onload handler above, with the result

			reader.readAsDataURL(file);
		}
		else {

			// Decrypt it!
			document.getElementById("private password info").innerHTML = '';
			document.getElementById("private password more info").innerHTML = '';
			document.getElementById("private password").innerHTML = '';

			reader.onload = function(e){

				var decrypted = CryptoJS.AES.decrypt(e.target.result, password)
										.toString(CryptoJS.enc.Latin1);

				if(!/^data:/.test(decrypted)){
					alert("Chave publica ou arquivo inválido! Por favor, tente novamente.");
					return false;
				}
				
				

				a.attr('href', decrypted);
				a.attr('download', file.name.replace('.criptografado',''));

				step(4);
			};

			reader.readAsText(file);
		}
	});


	/* The back button */


	back.click(function(){

	document.location.reload(true);
		step(1);
	});


	// Helper function that moves the viewport to the correct step div

	function step(i){

		if(i == 1){
			back.fadeOut();
		}
		else{
			back.fadeIn();
		}

		// Move the #stage div. Changing the top property will trigger
		// a css transition on the element. i-1 because we want the
		// steps to start from 1:

		stage.css('top',(-(i-1)*100)+'%');
	}

});
