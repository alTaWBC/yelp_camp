mapboxgl.accessToken = mapToken;
console.log(center);
const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: center || [-74.5, 40],
    zoom: 4,
});
