var express = require("express");
var app = express();

var http = require("http");
var url = require("url");
var fs = require("fs");
var path = require("path");
var util = require("util");

var urls = require("./src/urls");
var output = require("./src/output");
var query = require("./src/query");

var citybikes = require("./samples/citybikes");
var geohubprovider = require("./samples/geohub");
var currentwx = require("./samples/currentweather");

// General URL engine for routing templated requests
var routerUrls = new urls.Urls();

// Helper Functions
function useCallback(request) {
	var q = url.parse(request.url, true).query;
	return q.hasOwnProperty('callback');
};

function getSvcForRequest(request) {
	var svcs = app.get("dataProviders");
	if (svcs.hasOwnProperty(request.params.dataProviderName)) {
		var provider = svcs[request.params.dataProviderName].dataProvider;
		provider._request = request;
		return provider;
	}
	else
	{
		return null;
	}
};

// App configuration
app.configure(function() {
	app.use(express.compress());
	app.use(express.methodOverride());
	app.use(express.bodyParser());
 
	// ## CORS middleware
	//
	// see: http://stackoverflow.com/questions/7067966/how-to-allow-cors-in-express-nodejs
	var allowCrossDomain = function(req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
		res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
		// intercept OPTIONS method
		if ('OPTIONS' == req.method) {
			res.send(200);
		}
		else {
			next();
		}
	};

	app.use(allowCrossDomain);
	app.use(function(req,res,next) {
		req["geoservicesOutFormat"] = (req.param("f") || "html").toLowerCase();;
// 		console.log(req.url);
		next();
	});

	app.use(app.router);
	app.use(express.static(path.join(__dirname,"resources"), {maxAge: 31557600000}));
});

// Redirect handlers for badly formed URLs (help users get to grips)
app.all('/', function onRequest(request, response) {
	response.send(200,output.dataProvidersHTML(app.get("dataProviders")));
});

app.all('/:dataProviderName', function onRequest(request, response, next) {
	var dataProvider = getSvcForRequest(request);
	if (dataProvider) {
		response.writeHead(301, {Location: dataProvider.urls.getServicesUrl()});
		response.end();
	}
	else
	{
		next();
	}
});


// Specific handlers
function infoHandler(request, response) {
	console.log("INFO");

	var dataProvider = getSvcForRequest(request);
	
	output.info(request.geoservicesOutFormat, dataProvider, function(responseData, err) {
		useCallback(request)?response.jsonp(200,responseData):response.send(200,responseData);
	});
};

app.get(routerUrls.getInfoUrl(), infoHandler);
app.post(routerUrls.getInfoUrl(), infoHandler);


function servicesHandler(request, response) {
	console.log("SERVICES");
	
	var dataProvider = getSvcForRequest(request);

	output.services(request.geoservicesOutFormat, dataProvider, function(responseData, err) {
		useCallback(request)?response.jsonp(200,responseData):response.send(200,responseData);
	});
};

app.get(routerUrls.getServicesUrl(), servicesHandler);
app.post(routerUrls.getServicesUrl(), servicesHandler);


function featureServiceHandler(request, response) {
	console.log("FEATURESERVICE");

	var dataProvider = getSvcForRequest(request);
	var serviceId = request.params.serviceId;

	output.featureService(request.geoservicesOutFormat, dataProvider, serviceId, function(responseData, err) {
		useCallback(request)?response.jsonp(200,responseData):response.send(200,responseData);
	});
};

app.get(routerUrls.getServiceUrl(), featureServiceHandler);
app.post(routerUrls.getServiceUrl(), featureServiceHandler);

function featureLayersHandler(request, response) {
	console.log("LAYERS");

	var dataProvider = getSvcForRequest(request);
	var serviceId = request.params.serviceId;

	output.featureServiceLayers(request.geoservicesOutFormat, dataProvider, serviceId, function(responseData, err) {
		useCallback(request)?response.jsonp(200,responseData):response.send(200,responseData);
	});
};

function featureLayerHandler(request, response) {
	var layerId = request.params.layerId;
	if (layerId === "layers") return featureLayersHandler(request, response);
	
	console.log("LAYER");

	var dataProvider = getSvcForRequest(request);
	var serviceId = request.params.serviceId;

	output.featureServiceLayer(request.geoservicesOutFormat, dataProvider, serviceId, layerId, function(responseData, err) {
		useCallback(request)?response.jsonp(200,responseData):response.send(200,responseData);
	});
};

app.get(routerUrls.getLayerUrl(), featureLayerHandler);
app.post(routerUrls.getLayerUrl(), featureLayerHandler);

function layerQueryHandler(request, response) {
	console.log("QUERY");

	var dataProvider = getSvcForRequest(request);
	var serviceId = request.params.serviceId;
	var layerId = request.params.layerId;

	output.featureServiceLayerQuery(request.geoservicesOutFormat,
									dataProvider, serviceId, layerId, 
									new query.Query(request),
									function(responseData, err) {
		if (err) {
			response.send(500, err);
		} else {
			useCallback(request)?response.jsonp(200,responseData):response.send(200,responseData);
		}
	});
}

app.get(routerUrls.getLayerQueryUrl(), layerQueryHandler);
app.post(routerUrls.getLayerQueryUrl(), layerQueryHandler);

var dataProviders = [
	new citybikes.CityBikes(), 
	new geohubprovider.GeoHubProvider(app), 
	new currentwx.CurrentWx()
];

app.configure(function() {
	var svcs = {};
	for (var i=0; i<dataProviders.length; i++) {
		var dataProvider = dataProviders[i];
		svcs[dataProvider.name] = {
			"dataProvider" : dataProvider
		};
	}
	app.set("dataProviders", svcs);
	
	console.log('App Configured');
});

var port = process.env.PORT || process.env.VCAP_APP_PORT || 1337;
app.listen(port);
console.log("Server started on port " + port);
