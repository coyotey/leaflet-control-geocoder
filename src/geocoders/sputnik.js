var L = require('leaflet'),
	Util = require('../util');

module.exports = {
	class: L.Class.extend({
		options: {
			markerClass: Util.extract(L, 'sm.Marker', L.Marker),
			geocoderUrl: 'http://search.maps.sputnik.ru/search/addr',
			reverseGeocoderUrl: 'http://whatsthere.maps.sputnik.ru/point'
		},

		_bboxDeltas: {
			"country": {
				"latD": 29.4912965,
				"lngD": 122.871094
			},
			"region": {
				"latD": 2.2116335,
				"lngD": 7.6794435
			},
			"district": {
				"latD": 0.2752005,
				"lngD": 0.9599305
			},
			"place": {
				"latD": 0.1496885,
				"lngD": 0.4837415
			},
			"street": {
				"latD": 0.004543,
				"lngD": 0.015117
			},
			"house": {
				"latD": 0.0011355,
				"lngD": 0.0037795
			},
			"default": {
				"latD": 0.1,
				"lngD": 0.1
			}
		},

		getBBox: function ( center, type ) {
			type = type in this._bboxDeltas ? type : 'default';
			var deltas = this._bboxDeltas[type];
			return L.latLngBounds(
				L.latLng(center.lat - deltas.latD, center.lng - deltas.lngD ),
				L.latLng(center.lat + deltas.latD, center.lng + deltas.lngD )
			)
		},

		geocode: function (query, cb, context) {
			Util.jsonp(this.options.geocoderUrl, {
				q: query
			}, function(data) {
				cb.call(context, this._prepareResult(data));
			}, this, 'callback');
		},

		reverse: function(location, scale, cb, context) {
			Util.jsonp(this.options.reverseGeocoderUrl , {
				lat: location.lat,
				lon: location.lng,
				houses : true
			}, function(data) {
				cb.call(context, this._prepareResult(data));
			}, this, 'callback');
		},
		_prepareResult: function (data) {
			var _this = this;
			var features = [].concat(Util.extract(data, 'result.address.0.features', []), Util.extract(data, 'result.address.1.features', []));
			return features.map(function(feature){
				var feats = L.geoJson(feature);
				var bounds = feats && feats.getBounds(),
					center = bounds.getCenter();
				var bbox =  _this.getBBox(center, feature.properties.type);
				var name =  [feature.properties.title, feature.properties.description]
					.filter(function(value){ return !! value; })
					.join(', ');
				return {
					name: name,
					bbox: bbox,
					center: bounds.getCenter()
				}
			});
		}
	}),

	factory: function(options) {
		return new L.Control.Geocoder.Sputnik(options);
	}
};
