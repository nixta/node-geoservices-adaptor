var util = require("util"),
    urls = require("../../src/urls");

GeoHubUrls = function(geohubProvider) {
    GeoHubUrls.super_.call(this, geohubProvider);
};

// This node.js helper function allows us to inherit from urls.
util.inherits(GeoHubUrls, urls.Urls);

// And now we'll override only what we need to (see also /src/urls.js).
Object.defineProperties(GeoHubUrls.prototype, {
    getServiceUrl: {
    	value: function(serviceId) {
			var t = GeoHubUrls.super_.prototype.getServiceUrl.call(this);
			var r = this.dataProvider.parseServiceId(serviceId);
			t = t.replace(":serviceId", r.fullServiceId);
			return t;
        }
    },

    getLayersUrl: {
    	value: function(serviceId) {
			var t = GeoHubUrls.super_.prototype.getLayersUrl.call(this);
			var r = this.dataProvider.parseServiceId(serviceId);
			t = t.replace(":serviceId", r.fullServiceId);
			return t;
		}
    },

    getLayerUrl: {
    	value: function(serviceId, layerId) {
			var t = GeoHubUrls.super_.prototype.getLayerUrl.call(this);
			var r = this.dataProvider.parseServiceId(serviceId, layerId);
			t = t.replace(":serviceId", r.fullServiceId).replace(":layerId", layerId);
			return t;
		}
    },

    getLayerQueryUrl: {
    	value: function(serviceId, layerId) {
			var t = GeoHubUrls.super_.prototype.getLayerQueryUrl.call(this);
			var r = this.dataProvider.parseServiceId(serviceId, layerId);
			t = t.replace(":serviceId", r.fullServiceId).replace(":layerId", layerId);
			return t;
		}
    }
});

exports.GeoHubUrls = GeoHubUrls;
