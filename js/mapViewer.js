class MapViewer extends HTMLElement {
  constructor() {
    super()
    window.addEventListener("load", ()=> {
      
      let shadow = this.attachShadow({mode: 'open'})
      let wraper = document.createElement('section')
      let mapDiv = document.createElement('div')
      let mapDiv2 = document.createElement('div')
      let slider = document.createElement('input')
      let lat = 8.82
      let long = 37.41
      let zoom = 4
      let OSM = false
      wraper.setAttribute('id', 'mapWrapper')
      mapDiv.setAttribute("id", "OSM")

      mapDiv2.setAttribute("id", "GM")
      mapDiv2.setAttribute("class", "map")

      slider.setAttribute('type', 'range')
      slider.setAttribute('min', '0')
      slider.setAttribute('max', '1')
      slider.setAttribute('value', '1')
      slider.setAttribute('step', '0.1')
      slider.setAttribute('id', 'rangeBar')
      slider.style.zIndex = '9999'
      slider.style.display = 'block'
      slider.style.width = '90vw'


      wraper.appendChild(mapDiv)
      wraper.appendChild(mapDiv2)
      shadow.appendChild(slider)
      shadow.appendChild(wraper)

      slider.addEventListener("input", (e)=> {
        console.log(slider.value)
        mapDiv2.style.opacity = slider.value

      })
      if(this.hasAttribute('lat')) {
         lat = parseFloat(this.getAttribute("lat"))
       }
      if(this.hasAttribute('long')) {
         long = parseFloat(this.getAttribute("long"))
       }
      if(this.hasAttribute('zoom')) {
         zoom = parseInt(this.getAttribute("zoom"))
       }
      if(this.hasAttribute('openStreetMap') && this.getAttribute('openStreetMap') === 'true') {
        this.initOpenStreetMap(lat, long, zoom, mapDiv)
      }
      if(this.hasAttribute('googleMap') && this.getAttribute('googleMap') === 'true') {
        this.initGoogleMap(lat, long, zoom, mapDiv2)
      }
    
    })
  }
  
  initOpenStreetMap(lat, long, zoom, mapDiv) {
    mapDiv.style.width = '90vw';
    mapDiv.style.height = '90vh';
    mapDiv.style.opacity = '1';
    mapDiv.style.position = 'absolute';
//    mapDiv.style.top = '0';
    var map = new ol.Map({
        target: mapDiv,
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM()
          })
        ],
        view: new ol.View({
          center: ol.proj.fromLonLat([long, lat]),
          zoom: zoom
        })
      });
  }
  
  initGoogleMap(lat, long, zoom, mapDiv){
    mapDiv.style.width = '90vw';
    mapDiv.style.height = '90vh';
    mapDiv.style.opacity = '1';
    mapDiv.style.position = 'absolute';
//    mapDiv.style.top = '0';
    
    let uluru = {lat: lat, lng: long};
    let map = new google.maps.Map(mapDiv, {
      zoom: zoom,
      center: uluru
    });
    let marker = new google.maps.Marker({
      position: uluru,
      map: map
    });
    
  }
}

customElements.define('map-viewer', MapViewer)