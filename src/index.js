var L = require('leaflet'),
	Control = require('./control'),
	Sputnik = require('./geocoders/sputnik');

module.exports = L.Util.extend(Control.class, {
	Sputnik: Sputnik.class,
	sputnik: Sputnik.factory
});

L.Util.extend(L.Control, {
	Geocoder: module.exports,
	geocoder: Control.factory
});
