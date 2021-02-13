mapboxgl.accessToken = mapToken;
console.log(center);
center = center || [-74.5, 40];
const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: center,
    zoom: 4,
});

var marker = new mapboxgl.Marker().setLngLat(center).addTo(map);
