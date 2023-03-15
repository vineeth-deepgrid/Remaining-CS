import { Injectable, Output, EventEmitter } from '@angular/core';
import OlMap from 'ol/Map';
import { BasemapFactory } from './BasemapFactory';
import OlView from 'ol/View';
import { defaults as defaultControls, ScaleLine, Zoom } from 'ol/control.js';
import Geolocation from 'ol/Geolocation';
import DoubleClickZoom from 'ol/interaction/DoubleClickZoom';
import PinchRotate from 'ol/interaction/PinchRotate';
import Projection from 'ol/proj/Projection.js';
import { transformExtent } from 'ol/proj';
import { get } from 'ol/proj';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4.js';
import OlTileLayer from 'ol/layer/Tile';
import {get as getProjection} from 'ol/proj.js'
import { transform } from 'ol/proj';


proj4.defs(
  "EPSG:27700",
  "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 " +
    "+x_0=400000 +y_0=-100000 +ellps=airy " +
    "+towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 " +
    "+units=m +no_defs"
);

proj4.defs(
  "EPSG:6933",
  "+proj=cea +lat_ts=30 +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs +type=crs"
);


proj4.defs(
  "EPSG:23032",
  "+proj=utm +zone=32 +ellps=intl " +
    "+towgs84=-87,-98,-121,0,0,0,0 +units=m +no_defs"
);

proj4.defs(
  "EPSG:5479",
  "+proj=lcc +lat_1=-76.66666666666667 +lat_2=" +
    "-79.33333333333333 +lat_0=-78 +lon_0=163 +x_0=7000000 +y_0=5000000 " +
    "+ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
);
proj4.defs(
  "EPSG:21781",
  "+proj=somerc +lat_0=46.95240555555556 " +
    "+lon_0=7.439583333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel " +
    "+towgs84=674.4,15.1,405.3,0,0,0,0 +units=m +no_defs"
);
proj4.defs(
  "EPSG:3413",
  "+proj=stere +lat_0=90 +lat_ts=70 +lon_0=-45 +k=1 " +
    "+x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs"
);

proj4.defs(
  "EPSG:2163",
  "+proj=laea +lat_0=45 +lon_0=-100 +x_0=0 +y_0=0 " +
    "+a=6370997 +b=6370997 +units=m +no_defs"
);

proj4.defs(
  "ESRI:54009",
  "+proj=moll +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 " + "+units=m +no_defs"
);

proj4.defs(
  "EPSG:2229",
  "+proj=lcc +lat_1=35.46666666666667 +lat_2=34.03333333333333 +lat_0=33.5 +lon_0=-118 +x_0=2000000.0001016" +
   "+y_0=500000.0001016001 +ellps=GRS80 +datum=NAD83 +to_meter=0.3048006096012192 +no_defs "
);

register(proj4);

const proj27700 = getProjection('EPSG:27700');
// console.log(proj27700)
// JSON.stringify(proj27700);

const proj23032 = getProjection("EPSG:23032");
// console.log(proj23032,"123")
// JSON.stringify(proj23032);
// console.log(proj23032,"356")

const proj6933 = getProjection("EPSG:6933");

// proj23032.setExtent([-1206118.71, 4021309.92, 1295389.0, 8051813.28]);

const proj5479 = getProjection("EPSG:5479");
// JSON.stringify(proj5479);

// proj5479.setExtent([6825737.53, 4189159.8, 9633741.96, 5782472.71]);

const proj21781 = getProjection("EPSG:21781");
// JSON.stringify(proj21781);

// proj21781.setExtent([485071.54, 75346.36, 828515.78, 299941.84]);

const proj3413 = getProjection("EPSG:3413");
// JSON.stringify(proj3413);

// proj3413.setExtent([-4194304, -4194304, 4194304, 4194304]);

const proj2163 = getProjection("EPSG:2163");
// JSON.stringify(proj2163);

// proj2163.setExtent([-8040784.5135, -2577524.921, 3668901.4484, 4785105.1096]);

const proj54009 = getProjection("ESRI:54009");
// JSON.stringify(proj54009);

// proj54009.setExtent([-18e6, -9e6, 18e6, 9e6]);
const proj2229 = getProjection("EPSG:2229");
proj2229.setExtent([5528230.8160, 1384701.5952, 7751890.9134, 2503239.6463]);

const proj3857 = getProjection("EPSG:3857");

const proj4326 = getProjection("EPSG:4326");

@Injectable({
  providedIn: 'root'
})
export class BasemapService {
  private _baseMapType: string;
  private _currentMap: OlMap;
  @Output() iconChanger: EventEmitter<any> = new EventEmitter();
  private projection = 'EPSG:4326';
  public projection3857Code = 'EPSG:3857';
  // #TODO: Need to remove this later.
  @Output() onLayerAddedToTower: EventEmitter<any> = new EventEmitter();
  @Output() onLoadDefaultLayers: EventEmitter<any> = new EventEmitter();
  @Output() onLoadScaleLine: EventEmitter<any> = new EventEmitter();
  @Output() onLoadOrientation: EventEmitter<any> = new EventEmitter();
  @Output() onGeobarDataAddingToPopup: EventEmitter<any> = new EventEmitter();

  public isOrientationEvent = false;

  projectionsList = [
    { index: 1, name: 'ESRI:54009', value: '54009' },
    { index: 2, name: 'EPSG:2163', value: '2163' },
    { index: 3, name: 'EPSG:2100', value: '2100' },
    { index: 4, name: 'EPSG:27700', value: '27700' },
    { index: 5, name: 'EPSG:23032', value: '23032' },
    { index: 6, name: 'EPSG:5479', value: '5479' },
    { index: 7, name: 'EPSG:21781', value: '21781' },
    { index: 8, name: 'EPSG:3413', value: '3413' },
    { index: 9, name: 'EPSG:4326', value: '4326' },
    { index: 10, name: 'EPSG:3857', value: '3857' },
    { index: 11, name: 'EPSG:2229', value: '2229' },
    { index: 12, name: 'EPSG:4120', value: '4120' },
    { index: 13, name: 'EPSG:4470', value: '4470' },
    { index: 14, name: 'EPSG:2225', value: '2225' },
    { index: 15, name: 'EPSG:2226', value: '2226' },
    { index: 16, name: 'EPSG:2227', value: '2227' },
    { index: 17, name: 'EPSG:2228', value: '2228' },
    { index: 18, name: 'EPSG:2230', value: '2230' },
    { index: 19, name: 'EPSG:24378', value: '24378' },
    { index: 20, name: 'EPSG:24379', value: '24379' },
    { index: 21, name: 'EPSG:24380', value: '24380' },
    { index: 22, name: 'EPSG:24381', value: '24381' },
    { index: 23, name: 'EPSG:24382', value: '24382' },
    { index: 23, name: 'EPSG:24383', value: '24383' },
    { index: 24, name: 'EPSG:32601', value: '32601' },
    { index: 25, name: 'EPSG:32602', value: '32602' },
    { index: 26, name: 'EPSG:32603', value: '32603' },
    { index: 27, name: 'EPSG:32604', value: '32604' },
    { index: 28, name: 'EPSG:32605', value: '32605' },
    { index: 29, name: 'EPSG:32606', value: '32606' },
    { index: 30, name: 'EPSG:32607', value: '32607' },
    { index: 31, name: 'EPSG:32608', value: '32608' },
    { index: 32, name: 'EPSG:32609', value: '32609' },
    { index: 33, name: 'EPSG:32610', value: '32610' },
    { index: 34, name: 'EPSG:32611', value: '32611' },
    { index: 35, name: 'EPSG:32612', value: '32612' },
    { index: 36, name: 'EPSG:32613', value: '32613' },
    { index: 37, name: 'EPSG:32614', value: '32614' },
    { index: 38, name: 'EPSG:32615', value: '32615' },
    { index: 39, name: 'EPSG:32616', value: '32616' },
    { index: 40, name: 'EPSG:32617', value: '32617' },
    { index: 41, name: 'EPSG:32618', value: '32618' },
    { index: 42, name: 'EPSG:32619', value: '32619' },
    { index: 43, name: 'EPSG:32620', value: '32620' },
    { index: 44, name: 'EPSG:32621', value: '32621' },
    { index: 45, name: 'EPSG:32622', value: '32622' },
    { index: 46, name: 'EPSG:32623', value: '32623' },
    { index: 47, name: 'EPSG:32624', value: '32624' },
    { index: 48, name: 'EPSG:32625', value: '32625' },
    { index: 49, name: 'EPSG:32626', value: '32626' },
    { index: 50, name: 'EPSG:32627', value: '32627' },
    { index: 51, name: 'EPSG:32628', value: '32628' },
    { index: 52, name: 'EPSG:32629', value: '32629' },
    { index: 53, name: 'EPSG:32630', value: '32630' },
    { index: 54, name: 'EPSG:32631', value: '32631' },
    { index: 55, name: 'EPSG:32632', value: '32632' },
    { index: 56, name: 'EPSG:32633', value: '32633' },
    { index: 57, name: 'EPSG:32634', value: '32634' },
    { index: 58, name: 'EPSG:32635', value: '32635' },
    { index: 59, name: 'EPSG:32636', value: '32636' },
    { index: 60, name: 'EPSG:32637', value: '32637' },
    { index: 61, name: 'EPSG:32638', value: '32638' },
    { index: 62, name: 'EPSG:32639', value: '32639' },
    { index: 63, name: 'EPSG:32640', value: '32640' },
    { index: 64, name: 'EPSG:32641', value: '32641' },
    { index: 65, name: 'EPSG:32642', value: '32642' },
    { index: 66, name: 'EPSG:32643', value: '32643' },
    { index: 67, name: 'EPSG:32644', value: '32644' },
    { index: 68, name: 'EPSG:32645', value: '32645' },
    { index: 69, name: 'EPSG:32646', value: '32646' },
    { index: 70, name: 'EPSG:32647', value: '32647' },
    { index: 71, name: 'EPSG:32648', value: '32648' },
    { index: 72, name: 'EPSG:32649', value: '32649' },
    { index: 73, name: 'EPSG:32650', value: '32650' },
    { index: 74, name: 'EPSG:32651', value: '32651' },
    { index: 75, name: 'EPSG:32652', value: '32652' },
    { index: 76, name: 'EPSG:32653', value: '32653' },
    { index: 77, name: 'EPSG:32654', value: '32654' },
    { index: 78, name: 'EPSG:32655', value: '32655' },
    { index: 79, name: 'EPSG:32656', value: '32656' },
    { index: 80, name: 'EPSG:32657', value: '32657' },
    { index: 81, name: 'EPSG:32658', value: '32658' },
    { index: 82, name: 'EPSG:32659', value: '32659' },
    { index: 83, name: 'EPSG:32660', value: '32660' },
    { index: 84, name: 'EPSG:32701', value: '32701' },
    { index: 85, name: 'EPSG:32702', value: '32702' },
    { index: 86, name: 'EPSG:32703', value: '32703' },
    { index: 87, name: 'EPSG:32704', value: '32704' },
    { index: 88, name: 'EPSG:32705', value: '32705' },
    { index: 89, name: 'EPSG:32706', value: '32706' },
    { index: 90, name: 'EPSG:32707', value: '32707' },
    { index: 91, name: 'EPSG:32708', value: '32708' },
    { index: 92, name: 'EPSG:32709', value: '32709' },
    { index: 93, name: 'EPSG:32710', value: '32710' },
    { index: 94, name: 'EPSG:32711', value: '32711' },
    { index: 95, name: 'EPSG:32712', value: '32712' },
    { index: 96, name: 'EPSG:32713', value: '32713' },
    { index: 97, name: 'EPSG:32714', value: '32714' },
    { index: 98, name: 'EPSG:32715', value: '32715' },
    { index: 99, name: 'EPSG:32716', value: '32716' },
    { index: 100, name: 'EPSG:32717', value: '32717' },
    { index: 101, name: 'EPSG:32718', value: '32718' },
    { index: 102, name: 'EPSG:32719', value: '32719' },
    { index: 103, name: 'EPSG:32720', value: '32720' },
    { index: 104, name: 'EPSG:32721', value: '32721' },
    { index: 105, name: 'EPSG:32722', value: '32722' },
    { index: 106, name: 'EPSG:32723', value: '32723' },
    { index: 107, name: 'EPSG:32724', value: '32724' },
    { index: 108, name: 'EPSG:32725', value: '32725' },
    { index: 109, name: 'EPSG:32726', value: '32726' },
    { index: 110, name: 'EPSG:32727', value: '32727' },
    { index: 111, name: 'EPSG:32728', value: '32728' },
    { index: 112, name: 'EPSG:32729', value: '32729' },
    { index: 113, name: 'EPSG:32730', value: '32730' },
    { index: 114, name: 'EPSG:32731', value: '32731' },
    { index: 115, name: 'EPSG:32732', value: '32732' },
    { index: 116, name: 'EPSG:32733', value: '32733' },
    { index: 117, name: 'EPSG:32734', value: '32734' },
    { index: 118, name: 'EPSG:32735', value: '32735' },
    { index: 119, name: 'EPSG:32736', value: '32736' },
    { index: 120, name: 'EPSG:32737', value: '32737' },
    { index: 121, name: 'EPSG:32738', value: '32738' },
    { index: 122, name: 'EPSG:32739', value: '32739' },
    { index: 123, name: 'EPSG:32740', value: '32740' },
    { index: 124, name: 'EPSG:32741', value: '32741' },
    { index: 125, name: 'EPSG:32742', value: '32742' },
    { index: 126, name: 'EPSG:32743', value: '32743' },
    { index: 127, name: 'EPSG:32744', value: '32744' },
    { index: 128, name: 'EPSG:32745', value: '32745' },
    { index: 129, name: 'EPSG:32746', value: '32746' },
    { index: 130, name: 'EPSG:32747', value: '32747' },
    { index: 131, name: 'EPSG:32748', value: '32748' },
    { index: 132, name: 'EPSG:32749', value: '32749' },
    { index: 133, name: 'EPSG:32750', value: '32750' },
    { index: 134, name: 'EPSG:32751', value: '32751' },
    { index: 135, name: 'EPSG:32752', value: '32752' },
    { index: 136, name: 'EPSG:32753', value: '32753' },
    { index: 137, name: 'EPSG:32754', value: '32754' },
    { index: 138, name: 'EPSG:32755', value: '32755' },
    { index: 139, name: 'EPSG:32756', value: '32756' },
    { index: 140, name: 'EPSG:32757', value: '32757' },
    { index: 141, name: 'EPSG:32758', value: '32758' },
    { index: 142, name: 'EPSG:32759', value: '32759' },
    { index: 143, name: 'EPSG:32760', value: '32760' }, 
   ]

  constructor() {
    this.updateLocation = this.updateLocation.bind(this);
  }

  getTransformedCoordinates(coordinate,source,destination){
    var transformed_Coordinates = transform(coordinate,source,destination)
    return transformed_Coordinates
   }

  public getCurrentBasemap(): OlMap {
    return this._currentMap;
  }

  setMouseIcon(iconURL) {
    this.iconChanger.emit(iconURL);
  }

  setLayerToGeotower(clientLayerObj) {
    this.onLayerAddedToTower.emit(clientLayerObj);
  }

  setGeobarDataToPopup(data) {
    this.onGeobarDataAddingToPopup.emit(data);
  }

  setLoadDeafultLayers() {
    this.onLoadDefaultLayers.emit();
  }

  setLoadScaleLine() {
    this.onLoadScaleLine.emit();
  }

  setLoadOrientationValue(DegValue) {
    this.onLoadOrientation.emit(DegValue);
  }

  getSourceProjection(inputvalue){
    console.log(inputvalue,"check input value in service")
    var projection;
    this.projectionsList.map((x)=>{
      if(x.name === inputvalue){
          projection = x.name
      }
    })
    console.log(projection,"check projection...")
  return projection
  }


  // TODO: It should be good to initialize map in constructor
  public getBasemapByType(baseMapType: string, options) {
    const geolocation = new Geolocation({
      tracking: true
    });
    geolocation.on('change:position', () => {
      const position = geolocation.getPosition();
      options.longitude = position[0];
      options.latitude = position[1];
    });
    this._baseMapType = baseMapType;
    const basemapFactory = new BasemapFactory(baseMapType);
    const mapLayer: OlTileLayer = basemapFactory.getBaseMap().getMapTileLayer();
    mapLayer.setVisible(true);
    this._currentMap = new OlMap({
      controls: defaultControls().extend([
        new ScaleLine({
          className: 'ol-scale-text',
          target: options.scaleLine,
          units: 'us',
          bar: true,
          text: true
        }),
      ]),
      target: options.target,
      layers: [mapLayer],
      view: new OlView({
        center: [options.longitude, options.latitude],
        zoom: options.zoom,
        // #TODO: Need to remove this if this is not required.
        projection: this.projection3857Code,
        constrainRotation: false
      })
    });
    if (options.pageType === 'DEFAULT') {
      this.userLocation();
    }
    this._currentMap.getInteractions().forEach((interaction) => {
      if (interaction instanceof DoubleClickZoom) {
        this._currentMap.removeInteraction(interaction);
      }
      if (interaction instanceof PinchRotate) {
        this._currentMap.removeInteraction(interaction);
      }
    });
    this._currentMap.getView().on('change:rotation', () => {
      console.log('fired ', this._currentMap.getView().getRotation());
      if (this.isOrientationEvent) {
        // console.log('its when rotate the orientation not from map map ', );
      } else {
        // console.log('its when rotate the map not from map rotate ', (this._currentMap.getView().getRotation()) / (Math.PI / 180 ));
        this.setLoadOrientationValue((this._currentMap.getView().getRotation()) / (Math.PI / 180));
      }
    });
    this.loadAllBaseMaps(options);
    return this._currentMap;
  }

  public loadAllBaseMaps(options) {
    let _basemapFactory = new BasemapFactory('openstreet');
    this._currentMap.addLayer(_basemapFactory.getBaseMap().getMapTileLayer());
    _basemapFactory = new BasemapFactory('satellite');
    this._currentMap.addLayer(_basemapFactory.getBaseMap().getMapTileLayer());
    _basemapFactory = new BasemapFactory('terrain');
    this._currentMap.addLayer(_basemapFactory.getBaseMap().getMapTileLayer());
    _basemapFactory = new BasemapFactory('bingsatellite');
    this._currentMap.addLayer(_basemapFactory.getBaseMap().getMapTileLayer());
    /* _basemapFactory = new BasemapFactory('bingstreet');
    this._currentMap.addLayer(_basemapFactory.getBaseMap().getMapTileLayer()); */
    _basemapFactory = new BasemapFactory('googlestreet');
    this._currentMap.addLayer(_basemapFactory.getBaseMap().getMapTileLayer());
    _basemapFactory = new BasemapFactory('googleSatellite');
    this._currentMap.addLayer(_basemapFactory.getBaseMap().getMapTileLayer());    
    _basemapFactory = new BasemapFactory('toner');
    this._currentMap.addLayer(_basemapFactory.getBaseMap().getMapTileLayer());
    /* if (options.pageType === 'DEFAULT') {
      _basemapFactory = new BasemapFactory('bingsatellite');
      this._currentMap.addLayer(_basemapFactory.getBaseMap().getMapTileLayer());
    } else {
      _basemapFactory = new BasemapFactory('bingstreet');
      this._currentMap.addLayer(_basemapFactory.getBaseMap().getMapTileLayer());
    } */
  }

  public getBaseMapProjection() {
    return this.projection;
  }
  public setBaseMapProjection(projection) {
    this.projection = projection;
  }
  userLocation() {
    if (navigator.geolocation) {
      console.log('changed- navigated true ');
      return navigator.geolocation.getCurrentPosition(this.updateLocation, this.handleLocationError, { timeout: 100000 });
    } else {
      console.log('Browser is so old');
    }
  }
  updateLocation(positionData) {
    console.log('changed- user location ');
    const latitude = positionData.coords.latitude;
    const longitude = positionData.coords.longitude;
    this.getCurrentBasemap().getView().setCenter([longitude, latitude]);
  }
  handleLocationError() {
    console.log('Browser block the location permission!!!');
  }
}
