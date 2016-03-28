function processFiles(files) {
    var file = files[0];
    var reader = new FileReader();
	reader.onload = function (e) { 
         try {
	
        json_syntax_analis(e.target.result);
		} catch(e) {
  alert(e.message)
}

    };
    reader.readAsText(file);
}
 function add(stringInner){
    var output = document.getElementById("fileOutput");   
    output.innerHTML += stringInner;
 }