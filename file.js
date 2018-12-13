var params={
    speedX:0.0,
    speedY:0.0
};
  // Vertex shader program

  var vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;

  // Fragment shader program

  var fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;

function readSingleFile(evt,textId,callback) {
    //Retrieve the first (and only!) File from the FileList object
    var f = evt.target.files[0]; 
    var cache;
    if (f) {
      var r = new FileReader();
      r.onload = function(e) { 
          var contents = e.target.result;
        // alert( "Got the file.n" 
        //       +"name: " + f.name + "n"
        //       +"type: " + f.type + "n"
        //       +"size: " + f.size + " bytesn"
        //       + "starts with: " + contents.substr(1, contents.indexOf("n"))
        // );  

        console.log('cache inside read',textId);
        var textArea = document.getElementById(textId);
        textArea.value = e.target.result;
        cache= e.target.result;
        // var lines=cache.split('\n');
        // for(var line=0;line<lines.length;line++){
        //     console.log(lines[line]);
        // }
        callback(textId);
      }
      r.readAsText(f);
      console.log('cache after read');

    } else { 
      alert("Failed to load file");
    }
    console.log('cache',cache);
  }


  function saveTextAsFile(textAreaId,filenameId)
  {
    var textToWrite = document.getElementById(textAreaId).value;
    var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
      var fileNameToSaveAs = document.getElementById(filenameId).value;

      var downloadLink = document.createElement("a");
      downloadLink.download = fileNameToSaveAs;
      downloadLink.innerHTML = "Download File";
        console.log('hte file is ',filenameId,fileNameToSaveAs);
      downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
  };

function readTextArea(textareaId){
    console.log('inside callback cache');
    var textArea = document.getElementById(textareaId);
    var lines=textArea.value.split('\n');
    for(var line=0;line<lines.length;line++){
        console.log(lines[line]);
        getParameters(params,lines[line]);
    }
}


function loadParameters(evt){  
    console.log('load parame');
    readSingleFile(evt,'paramsarea',readTextArea);
}

function loadVertexShader(evt){
    console.log('load vertex');
    readSingleFile(evt,'vertexarea',function(cache){
        console.log('inside callback vertex');
        vsSource=cache;
        var lines=cache.split('\n');
        for(var line=0;line<lines.length;line++){
            console.log(lines[line]);
        }
    });
}

function loadFragmentShader(evt){
    console.log('load frag');
    readSingleFile(evt,'fragmentarea',function(cache){
        console.log('inside callback frag');
        fsSource=cache;
        var lines=cache.split('\n');
        for(var line=0;line<lines.length;line++){
            console.log(lines[line]);
        }
    });
}

function saveParameters(evt){
    saveTextAsFile('paramsarea','paramsname');
}
function saveVertexShader(evt){
    saveTextAsFile('vertexarea','vertexname');
}
function saveFragmentShader(evt){
    saveTextAsFile('fragmentarea','fragmentname');
}
function getParameters(parameters,line){
    var pair=line.split('=');
    var key=pair[0];
    var value=pair[1];
parameters[key]=value;
}

document.getElementById('paramsinput').addEventListener('change', loadParameters, false);
document.getElementById('fsinput').addEventListener('change', loadFragmentShader, false);
document.getElementById('vsinput').addEventListener('change', loadVertexShader, false);