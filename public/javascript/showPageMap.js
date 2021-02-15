mapboxgl.accessToken = mapToken;
center = campground.geometry.coordinates || [-74.5, 40];
const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/light-v10",
    center: center,
    zoom: 4,
});

map.addControl(new mapboxgl.NavigationControl());

var marker = new mapboxgl.Marker()
    .setLngLat(center)
    .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>${campground.title}</h3><p>${campground.location}</p>`))
    .addTo(map);
