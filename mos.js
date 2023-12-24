Array.prototype.shuffle = function () {
    var i = this.length;
    while (i) {
        var j = Math.floor(Math.random() * i);
        var t = this[--i];
        this[i] = this[j];
        this[j] = t;
    }
    return this;
}

// invalid enter key
function invalid_enter() {
    if (window.event.keyCode == 13) {
        return false;
    }
}
var set_num = "0"
// start experiment
function start_experiment() {
    // get user name
    var name = document.getElementById("name").value.replace(" ", "_");
    if (name == "") {
        alert("Please enter your name.");
        return false;
    }

    // get setlist number
    
    var number = document.getElementsByName("set");
    for (var i = 0; i < number.length; i++) {
        if (number[i].checked) {
            set_num = number[i].value;
        }
    }
    if (set_num == "0") {
        alert("Please press the setlist number button.");
        return false;
    }
    
    // convert display
    Display();

    var method_paths = [];
    /*
        you have to customize this part
        this is an example which enables each set
        includes different number of methods.
    */
    if (set_num == "1") {
        method_paths.push(wav_dir + "set" + set_num + "/src.list");
	method_paths.push(wav_dir + "set" + set_num + "/trg.list");
	method_paths.push(wav_dir + "set" + set_num + "/converted.list");
	method_paths.push(wav_dir + "set" + set_num + "/el1.list");
	method_paths.push(wav_dir + "set" + set_num + "/sp1.list");
    } else if (set_num == "2") {
        // for seen test
        method_paths.push(wav_dir + "set" + set_num + "/src.list");
	method_paths.push(wav_dir + "set" + set_num + "/trg.list");
	method_paths.push(wav_dir + "set" + set_num + "/converted.list");
	method_paths.push(wav_dir + "set" + set_num + "/el1.list");
	method_paths.push(wav_dir + "set" + set_num + "/sp1.list");
        method_paths.push(wav_dir + "set" + set_num + "/src_text.list");
        method_paths.push(wav_dir + "set" + set_num + "/trg_text.list");
        method_paths.push(wav_dir + "set" + set_num + "/converted_text.list");
        method_paths.push(wav_dir + "set" + set_num + "/el1_text.list");
        method_paths.push(wav_dir + "set" + set_num + "/sp1_text.list");                
    }
    /*
        end
    */

    var fileListData = makeFileList(method_paths);
    file_list = fileListData.files;
    textMap = fileListData.texts;
    outfile = name + "_set" + set_num + ".csv";
    scores = (new Array(file_list.length)).fill(0);
    eval = document.getElementsByName("eval");
    init();
}

// convert display
function Display() {
    if (set_num == "1") {
        document.getElementById("Display1").style.display = "none";
        document.getElementById("Display2").style.display = "block";
        document.getElementById("Display3").style.display = "none";
    } else if (set_num == "2") {
        document.getElementById("Display1").style.display = "none";
        document.getElementById("Display2").style.display = "none";
        document.getElementById("Display3").style.display = "block";
    }
}

// load text file
function loadText(filename) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", filename, false);
    xhr.send(null);
    var list = xhr.responseText.split(/\r\n|\r|\n/);
    list.pop();
    
    if (filename.includes("_text.list")) {
        var fileMap = {};
        list.forEach(function(line) {
            var parts = line.split(':');
            fileMap[parts[0]] = parts[1];
        });
        return fileMap;
    } else {
        return list;
    }
}

// make file list
function makeFileList(method_paths) {
    var files = [];
    var texts = {};
    for (var i = 0; i < method_paths.length; i++) {
        var result = loadText(method_paths[i]);
        if (typeof result === "object") {
            for (var key in result) {
                texts[key] = result[key];
            }
        } else {
            files = files.concat(result);
        }
                
    }
    files.shuffle();
    return {files: files, texts: texts};
}

function setAudio() {
    var audioPath = file_list[n]
    var audioName = audioPath.split('/').pop().split('.')[0]; // 获取音频文件名（无扩展名）
    var audioText = set_num == "2" ? textMap[audioName] : ""; // 检索对应文本
    document.getElementById("page").textContent = "" + (n + 1) + "/" + scores.length;

    document.getElementById("audio").innerHTML = 'Voice:<br>'
        + '<audio src="' + file_list[n]
        + '" controls preload="auto">'
        + '</audio>';
        + '<p>' + audioText + '</p>'; 
}

function init() {
    n = 0;
    setAudio();
    evalCheck();
    setButton();
}

function evalCheck() {
    const c = scores[n];
    if ((c <= 0) || (c > eval.length)) {
        for (var i = 0; i < eval.length; i++) {
            eval[i].checked = false;
        }
    }
    else {
        eval[5 - c].checked = true;
    }
}

function setButton() {
    if (n == (scores.length - 1)) {
        document.getElementById("prev").disabled = false;
        document.getElementById("next2").disabled = true;
        document.getElementById("finish").disabled = true;
        for (var i = 0; i < eval.length; i++) {
            if (eval[i].checked) {
                document.getElementById("finish").disabled = false;
                break;
            }
        }
    }
    else {
        if (n == 0) {
            document.getElementById("prev").disabled = true;
        }
        else {
            document.getElementById("prev").disabled = false;
        }
        document.getElementById("next2").disabled = true;
        document.getElementById("finish").disabled = true;
        for (var i = 0; i < eval.length; i++) {
            if (eval[i].checked) {
                document.getElementById("next2").disabled = false;
                break;
            }
        }
    }
}

function evaluation() {
    for (var i = 0; i < eval.length; i++) {
        if (eval[i].checked) {
            scores[n] = 5 - i;
        }
    }
    setButton();
}

function exportCSV() {
    var csvData = "";
    for (var i = 0; i < file_list.length; i++) {
        csvData += "" + file_list[i] + ","
            + scores[i] + "\r\n";
    }

    const link = document.createElement("a");
    document.body.appendChild(link);
    link.style = "display:none";
    const blob = new Blob([csvData], { type: "octet/stream" });
    const url = window.URL.createObjectURL(blob);
    link.href = url;
    link.download = outfile;
    link.click();
    window.URL.revokeObjectURL(url);
    link.parentNode.removeChild(link);
}

function next() {
    n++;
    setAudio();
    evalCheck();
    setButton();
}

function prev() {
    n--;
    setAudio();
    evalCheck();
    setButton();
}

function finish() {
    exportCSV();
}


// directory name
const wav_dir = "wav/";

// invalid enter key
document.onkeypress = invalid_enter;

// global variables
var outfile;
var file_list;
var scores;
var textMap;

// since loadText() doesn't work in local
var n = 0;
var eval = document.getElementsByName("eval");
