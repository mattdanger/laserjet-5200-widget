
/********************************************************
* Title:    HP LaserJet Status Widget
* Author:   Matt West, mattdanger.net
* Date:     3/13/2007
********************************************************/

var uri = "/hp/device/this.LCDispatcher";
var updateInterval = 5;


// Don't touch below this.
var http_request = null;
var printerIP = '';
var last_updated = 0;

if ( window.widget ) {

    widget.onshow = update;

}

function runSetup() {

	flipper = new AppleInfoButton(document.getElementById("flipper"), document.getElementById("front"), "white", "white", showBack);
	glassButton = new AppleGlassButton(document.getElementById("doneButton"), "Done", showFront);

    update();

}

// Prefs let us set fade time, pause between transitions
function showBack(event) {

	if ( window.widget ) {

		widget.prepareForTransition("ToBack");

	}

	document.getElementById("front").style.display = "none";
	document.getElementById("back").style.display = "block";

	if ( window.widget ) {
		setTimeout("widget.performTransition()", 0);
	}

}	

function showFront(event) {

    setPrinterIP(document.printerForm.printerIP.value);
    update();

	if ( window.widget ) {

		widget.prepareForTransition("ToFront");

	}

	document.getElementById("back").style.display = "none";
	document.getElementById("front").style.display = "block";

	if ( window.widget ) {
		setTimeout("widget.performTransition()", 0);
	}

}

function update() {

    var ip = document.printerForm.printerIP.value;

    if ( ip == '0.0.0.0' || ip == '' ) {

        setToBlank();
    
    } else { 

        queryPrinter();

    }

}

function setToBlank() {

    setStatus('Run setup');
    updatePrinterName('');
    updateValues('tray1Value', '');
    updateValues('tray2Value', '');
    updateValues('tray3Value', '');
    updateValues('tonerValue', '');
    updateValues('maintenanceKitValue', '');
}

function setPrinterIP(ip) { 

    printerIP = ip; 
    document.printerForm.printerIP.value = ip;
}



/******************************
* Widget's display functions 
******************************/
function clearForm(input) {

    if ( input.value == '0.0.0.0' ) {

        input.value = '';
    
    } 

}

function setStatus(status) {

    document.getElementById('statusMessage').innerHTML = status;
    setStatusColor(status);

}

function updateStatus() {

    var status = '';
    var tonerValue = document.getElementById('tonerValue').innerHTML.replace(/%/,'');

    if ( document.getElementById('tray1Value').innerHTML == 'Empty' && document.printerForm.ignoreTray1.value != 'on') { 
    
        status = 'Out of Paper';
        setStatus(status);
    
    } else if ( document.getElementById('tray2Value').innerHTML == 'Empty' ) { 

        status = 'Out of Paper';
        setStatus(status);
    
    } else if ( document.getElementById('tray3Value').innerHTML == 'Empty' ) { 

        status = 'Out of Paper';
        setStatus(status);
    
    } else if ( tonerValue < 2 ) { 

        status = 'Replace Toner';
        setStatus(status);
    
    } else {

        status = 'Ready';
        setStatus(status);

    }

    setStatusColor(status);

}

function setStatusColor(status) {

    switch ( status ) {

        case 'Processing job...':
            document.getElementById('statusMessage').style.color = "green";
            break;

        case 'Paper Jam':
        case 'Out of Paper':
        case 'Replace Toner':
            document.getElementById('statusMessage').style.color = "red";
            break;

        default:
            document.getElementById('statusMessage').style.color = "#CCC";
    
    }

}

function updateValues (id, text) { document.getElementById(id).innerHTML = text; }
function updatePrinterName (name) { document.getElementById('printerName').innerHTML = name; }

function openLink (url) {
	if ( window.widget ) {

		widget.openURL (url);

	} else document.location = url;
}



/******************************
* Network request stuff 
******************************/
function queryPrinter() {

	var now = (new Date).getTime();

	// only check if the specified updateInterval time has passed
	if ( (now - last_updated) > ( ( 60 * updateInterval ) * 1000 ) ) {

        // Abort any existing requests
		if ( http_request != null ) {

			http_request.abort();
			http_request = null;

		}

        setToBlank();
        setStatus('Connecting...');
		http_request = new XMLHttpRequest();
		http_request.onload = function() { updateData(); }
		http_request.overrideMimeType("text/html");
		http_request.setRequestHeader("Cache-Control", "no-cache");
		http_request.open("GET", "http://" + printerIP + uri);
		http_request.send(null);

    }

}

function updateData() {

    if (http_request.status == 200) {

        var data = http_request.responseText;
        var tmpImg = null;
        var tonerValue = null;
        var maintenanceKitValue = null;
        var tray1Value = null;
        var tray2Value = null;
        var tray3Value = null;
        var status = null;
        http_request = null;

        // All the wonderful parsing needs to take place here
        data = data.replace(/\n/g ,"");

        // Set the name of the printer
        var printerName = data.replace(/^.*hpBannerTextSmall\">/, ""); //"
        printerName = printerName.replace(/ \/.*$/, " "); 
        updatePrinterName(printerName);

        status = data.replace(/^.*padding-bottom: .7em;" >/, ""); //"
        status = status.replace(/<.*$/, "")

        // Set the values for the supplies
        data = data.replace(/^.*Black Cartridge&nbsp;&nbsp;/, "");
        tonerValue = data.replace(/%.*$/, "");
        updateValues('tonerValue', tonerValue + '%');

        data = data.replace(/^.*Maintenance Kit&nbsp;&nbsp;/, "");
        maintenanceKitValue = data.replace(/%.*$/, "");
        updateValues('maintenanceKitValue', maintenanceKitValue + '%');

        // Tray 1
        tmpImg = data.replace(/^.*Tray 1<\/span><\/td><td headers="Status"  style="white-space: nowrap:"   ><img class="hpPageImage" src="images\//, ""); //"
        tmpImg = tmpImg.replace(/".*$/, ""); //"
        tray1Value = data.replace(/^.*Tray 1<\/span><\/td><td headers="Status"  style="white-space: nowrap:"   ><img class="hpPageImage" src="images\//, ""); //"
        tray1Value = tray1Value.replace(tmpImg, ""); //"
        tray1Value = tray1Value.replace(/" alt="" title="" \/><span  class="hpPageText" >&nbsp;&nbsp;/, ""); //"
        updateValues('tray1Value', tray1Value.replace(/".*$/, "")); //"

        // Tray 2
        tmpImg = data.replace(/^.*Tray 2<\/span><\/td><td headers="Status"  style="white-space: nowrap:"   ><img class="hpPageImage" src="images\//, ""); //"
        tmpImg = tmpImg.replace(/".*$/, ""); //"
        tray2Value = data.replace(/^.*Tray 2<\/span><\/td><td headers="Status"  style="white-space: nowrap:"   ><img class="hpPageImage" src="images\//, ""); //"
        tray2Value = tray2Value.replace(tmpImg, ""); //"
        tray2Value = tray2Value.replace(/" alt="" title="" \/><span  class="hpPageText" >&nbsp;&nbsp;/, ""); //"
        updateValues('tray2Value', tray2Value.replace(/".*$/, "")); //"

        // Tray 3
        tmpImg = data.replace(/^.*Tray 3<\/span><\/td><td headers="Status"  style="white-space: nowrap:"   ><img class="hpPageImage" src="images\//, ""); //"
        tmpImg = tmpImg.replace(/".*$/, ""); //"
        tray3Value = data.replace(/^.*Tray 3<\/span><\/td><td headers="Status"  style="white-space: nowrap:"   ><img class="hpPageImage" src="images\//, ""); //"
        tray3Value = tray3Value.replace(tmpImg, ""); //"
        tray3Value = tray3Value.replace(/" alt="" title="" \/><span  class="hpPageText" >&nbsp;&nbsp;/, ""); //"
        updateValues('tray3Value', tray3Value.replace(/".*$/, "")); //"


        if ( status.match("Processing") ) {

            setStatus("Processing job...");

        } else if ( status.match("Paper jam") ) {

            setStatus("Paper Jam");
        
        } else {

            // Update the status message.
            updateStatus();
    
        }

        // Update the color of the status message.
        updateStatusColor();


        // Set the time the widget was last updated
        last_updated = (new Date).getTime();
    
    } else {

        setToBlank();
        setStatus('Unable to connect to ' + printerIP );

    }

}
