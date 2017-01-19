var ge;

var app = {};

Number.prototype.toFixedDown = function(digits) {
    var re = new RegExp("(\\d+\\.\\d{" + digits + "})(\\d)"),
        m = this.toString().match(re);
    return m ? parseFloat(m[1]) : this.valueOf();
};

centers = {'sondrio': [ 9.878767, 46.169858 ],
			'lodi': [ 9.5037159, 45.3097228 ] ,
			'cremona':[ 10.022651, 45.133249 ], 
			'milano':[ 9.185924, 45.465422 ],
			'mantova': [ 10.791375, 45.156417 ], 
			'bergamo':[ 9.67727, 45.698264 ],
			'lecco':[ 9.39767, 45.85657 ] ,
			'pavia':[ 9.158207, 45.184725 ] ,
			'monza':[ 9.274449, 45.5845 ] ,
			'brescia':[ 10.211802, 45.541553 ],
			'como':[ 9.085176, 45.80806 ] ,
			'varese': [ 8.825058, 45.820599 ] };


var currentKmlObjects = { 
// 'ecomuseo': null,
//'tin': null,
//'sic_riserve_plis': null,
// 'confini_comunali': null,
// 'designatori__': null
 
};
    
//var ge_strade = false;
//var ge_abitati = true;

// google.load("earth", "1");

function init() {
	mapboxgl.accessToken = 'pk.eyJ1IjoiZG5sY3JsIiwiYSI6ImNpc3ZpeXpuYzAwMGcydG1uZnYwcjF6a20ifQ.haWicjVXwzcXqRMj3kdYMg';
	var map = new mapboxgl.Map({
		// attributionControl: false,
	    container: 'map3d', // container id
	    style: 'mapbox://styles/dnlcrl/ciy1cvzzp00c32sqkqt2uebg1', //stylesheet location
	    center:  [9.689630, 45.705651], //[9.856441382762, 45.10320555826568], // starting position
	    zoom: 13, //9 // starting zoom
	    pitch: 60

    });
    setTimeout(function() {
      document.getElementById("coordinate").innerHTML = "9.68963, 45.70565";
    }, 10);


    app.map = map;
    map.on('mousemove', function (e) {


    setTimeout(function() {
      // alert(text);
      var text = e.lngLat['lat'].toFixedDown(5) + ", " + e.lngLat['lng'].toFixedDown(5);

      var divcoordinate = document.getElementById("coordinate");
      divcoordinate.innerHTML = text;
    }, 10);
	});

	// map.addControl(new mapboxgl.AttributionControl(), 'bottom-right');
	// document.getElementsByClassName('mapboxgl-ctrl-attrib')[0].innerHTML = '<a href="https://github.com/dnlcrl" target="_blank">© dnlcrl</a> ' + document.getElementsByClassName('mapboxgl-ctrl-attrib')[0].innerHTML

   	

	// When a click event occurs near a place, open a popup at the location of
	// the feature, with description HTML from its properties.
	app.map.on('click', function (e) {
	    if(app.popup){
	        app.popup._closeButton.click()
	    }
	    var features = map.queryRenderedFeatures(e.point, { layers: Object.keys( currentKmlObjects )});

	    if (!features.length) {
	        return;
	    }

	    feature = undefined;
	    for (var i = features.length - 1; i >= 0; i--) {
	    	if (features[i].properties.description !== undefined){
	    		feature = features[i];
	    		break;
	    	}
	    }

	    // var feature = features[features.length - 1];

	    // Populate the popup and set its coordinates
	    // based on the feature found.
	    app.popup = new mapboxgl.Popup()
	        .setLngLat(e.lngLat)
	        .setHTML(feature.properties.description)
	        .addTo(map);
	});

	// Use the same approach as above to indicate that the symbols are clickable
	// by changing the cursor style to 'pointer'.
	app.map.on('mousemove', function (e) {
	    var features = map.queryRenderedFeatures(e.point, { layers: Object.keys(currentKmlObjects) });
	    map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

	});


  // google.earth.createInstance('map3d', initCallback, failureCallback);
}





function initCallback(pluginInstance) {




	if (document.getElementById('kml-confini_comunali-check').checked)
	loadKml('confini_comunali');

	if (document.getElementById('kml-designatori__-check').checked)
	loadKml('designatori__');






	function eventHandler(event) {
		var text = event.getLatitude()+","+event.getLongitude();

		// Prevent default balloon from popping up for marker placemarks
		event.preventDefault();

		// wrap alerts in API callbacks and event handlers
		// in a setTimeout to prevent deadlock in some browsers
		setTimeout(function() {
			// alert(text);
			var divcoordinate = document.getElementById("coordinate");
			divcoordinate.innerHTML = text;
		}, 0);
	}
	// listen to the click event on the globe and window
	google.earth.addEventListener(ge.getWindow(), 'mousemove', eventHandler);

}

function failureCallback(errorCode) {
}

function toggleGeojson(file) {

	var kmlCheckbox = document.getElementById('kml-' + file + '-check');

	if (kmlCheckbox.checked && !currentKmlObjects[file])
		loadGeojson(file);
	else{
		toggleLayer(file);
	}
}

function toggleLayer(file){
	map = app.map;
    var clickedLayer = file

    var visibility = map.getLayoutProperty(file, 'visibility');

    if (visibility !== 'none') {
        map.setLayoutProperty(file, 'visibility', 'none');
        this.className = '';
    } else {
        this.className = 'active';
        map.setLayoutProperty(file, 'visibility', 'visible');
        map.flyTo({
        	center: centers[file.split('_')[0]]
    	});
    }

}
function linkCheck(url)
{
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status!=404;
}


function loadGeojson(file) {
	map = app.map;
	var path = 'https://unibg-gislab.github.io/datasets/obsoleto_dismesso_3D/' + file + '.geojson'; 
	if (!linkCheck(path)){
		alert('Work In Progress!\nGoogle ha terminato il supporto alle API di Google Earth, stiamo lavorando per rendere la piattaforma nuovamente funzionante quanto prima.')
		document.getElementById('kml-' + file + '-check').checked = '';
		return
	}

    map.flyTo({
        center: centers[file.split('_')[0]]
    });

	map.addSource(file, {
    'type': 'geojson',
    'data': path
	});

	

	map.addLayer({
        'id': file,
        'type': 'fill-extrusion',
        'source': file,
        'paint': {
            // See the Mapbox Style Spec for details on property functions
            // https://www.mapbox.com/mapbox-gl-style-spec/#types-function
            'fill-extrusion-color': {
                // Get the fill-color from the source 'color' property.
                'property': 'color',
                'type': 'identity'
            },
            'fill-extrusion-height': {
                // Get fill-extrude-height from the source 'height' property.
                'property': 'height',
                'type': 'identity'
            },
            'fill-extrusion-base': {
                // Get fill-extrude-base from the source 'base_height' property.
                'property': 'base_height',
                'type': 'identity'
            },
            // Make extrusions slightly opaque for see through indoor walls.
	            'fill-extrusion-opacity': 0.8
	    }
	});

	currentKmlObjects[file] = true;

}


 function toggleStrade() {
 		var kmlCheckbox = document.getElementById('kml-strade-check');
		if (kmlCheckbox.checked)
		   	ge.getLayerRoot().enableLayerById(ge.LAYER_ROADS, true);
    else
    	 ge.getLayerRoot().enableLayerById(ge.LAYER_ROADS, false);  	
 }
  function toggleConfini() {
   		var kmlCheckbox = document.getElementById('kml-confini-check');
		if (kmlCheckbox.checked)
		   	ge.getLayerRoot().enableLayerById(ge.LAYER_BORDERS, true);
    else
    	 ge.getLayerRoot().enableLayerById(ge.LAYER_BORDERS, false);  
 }// JavaScript Document
