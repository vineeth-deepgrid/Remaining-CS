import {
  Component,
  OnInit,
  HostListener,
  AfterViewInit,
  EventEmitter,
  Input,
  Output,
  SimpleChange,
  OnChanges,
  ElementRef,
  Renderer2,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { Draggable } from '../../assets/js/Draggable.js';
import { TweenLite } from '../../assets/js/TweenLite.js';
import { BasemapService } from '../basemap/basemap.service';
import {
  NgbModalConfig,
  NgbModal,
  ModalDismissReasons,
} from '@ng-bootstrap/ng-bootstrap';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  group,
  // ...
} from '@angular/animations';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { AuthObservableService } from '../Services/authObservableService';
import { ISlimScrollOptions, SlimScrollEvent } from 'ngx-slimscroll';
import { BasemapFactory } from '../basemap/BasemapFactory.js';
import { get } from 'ol/proj';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4.js';
import OlView from 'ol/View';
import Stamen from 'ol/source/Stamen.js';
import OlTileLayer from 'ol/layer/Tile';
import OlXYZ from 'ol/source/XYZ';
import { CommonService } from '../Services/common.service';
import { GeotowerService } from '../geotower/geotower.service';
import { environment } from 'src/environments/environment';
// import { jsPDF } from 'jspdf';
import { extent } from 'ol/extent';
import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getPointResolution } from 'ol/proj';
import { fromExtent } from 'ol/geom/Polygon';
import Feature from 'ol/Feature';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { getTransform } from 'ol/proj';
import { applyTransform } from 'ol/extent';
import { Observable } from 'rxjs';
import { PrintToolService } from '../Services/print-tool.service.js';
import Overlay from 'ol/Overlay.js';
import { MyService } from '../my-service.service';
// import {getCoordinateFromPixel} from 'ol/map';
import Map from 'ol/Map';
// import OSM from 'ol/source/OSM';
// import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import OlMap from 'ol/Map';
import { Fill, Stroke, Style, Text } from 'ol/style';
import { map } from 'rxjs-compat/operator/map.js';
import { addLayer } from 'ol/Map';
import Layer from 'ol/layer/Layer';
import { Polygon } from 'ol/geom';
import { Vector } from 'ol/layer';
import { boundingExtent } from 'ol/extent';
import { SetLayerTOMapUtil } from '../geotower/util/setLayerToMapUtil.js';

@Component({
  selector: 'app-geosol',
  templateUrl: './geosol.component.html',
  styleUrls: ['./geosol.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({ width: '*', opacity: 0 })),
      transition(':enter', [
        style({ width: '0', opacity: 0 }),

        group([
          animate(300, style({ width: '*' })),
          animate('400ms ease-in-out', style({ opacity: '1' })),
        ]),
      ]),
    ]),
    trigger('slideInOut-mid', [
      state('in', style({ width: '*', opacity: 0 })),
      transition(':enter', [
        style({ width: '0', opacity: 0 }),

        group([
          animate(300, style({ width: '*' })),
          animate('400ms ease-in-out', style({ opacity: '1' })),
        ]),
      ]),
    ]),
  ],
  providers: [NgbModalConfig, NgbModal],
})
export class GeosolComponent implements OnInit, AfterViewInit, OnChanges {
  // selectedAngularOption = this.angularOptions[0];
  // selectedRectangularOption = this.rectangularOptions[0];
  // angularOptions = ['Option 1', 'Option 2', 'Option 3'];
  // rectangularOptions = ['Option A', 'Option B', 'Option C'];

  showCompassCtrl = '';
  closeCompassCtrl = '';
  topRightMenuToogle = false;
  closeResult: string;
  unitValue = '';
  unitsList: any = [
    {
      value: 'us',
      view: 'Miles',
      scaleValue: 'us',
    },
    {
      value: 'metric',
      view: 'Kms',
      scaleValue: 'metric',
    } /* ,
    {
      value: 'METERS',
      view: 'Meters',
    } */,
  ];
  // unitCtrl:FormControl = new FormControl('');
  form: FormGroup;

  isLeftWingExpanded = true;
  isRightWingExpanded = true;
  mapProjectionUnits = '500 nm';
  mapProjectionUnitsPopup = '';
  innerWidth: number;
  orientationActive = false;
  iconWidth = 60; // 65;

  leftWingContainerWidth: string = this.iconWidth * 5 + 45 + 'px'; // '320px';
  rightWingContainerWidth: string = this.iconWidth * 5 + 45 + 'px'; // '320px';

  tcAndPrivacyActivePage = 'tc';
  opts: ISlimScrollOptions;
  scrollEvents: EventEmitter<SlimScrollEvent>;
  scaleLineWidth = 0;
  rotationAngle: FormControl = new FormControl(0);
  compassOpenState = false;
  selectedOption = '';
  frameworkForm: FormGroup;
  static mapReference;
  referenceSystemTypes: any[] = [
    { index: 1, name: 'EPSG:3857', value: '3857' },
    { index: 2, name: 'EPSG:4326', value: '4326' },
    { index: 3, name: 'EPSG:2100', value: '2100' },
    { index: 4, name: 'EPSG:27700', value: '27700' },
    { index: 5, name: 'EPSG:23032', value: '23032' },
    { index: 6, name: 'EPSG:5479', value: '5479' },
    { index: 7, name: 'EPSG:21781', value: '21781' },
    { index: 8, name: 'EPSG:3413', value: '3413' },
    { index: 9, name: 'EPSG:2163', value: '2163' },
    { index: 10, name: 'ESRI:54009', value: '54009' },
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
    { index: 143, name: 'EPSG:32760', value: '32760' }, ,
  ];
  selectedReferenceSystem: any = this.referenceSystemTypes[0];
  @Input() awarenessCurrentMode: any = {};
  @Input() globalObject: any = {};
  @Output() toggleAwareness: EventEmitter<any> = new EventEmitter<any>();
  @Output() passInputValue: EventEmitter<any> = new EventEmitter<any>();
  @Output() emitId: EventEmitter<any> = new EventEmitter<any>();

  lastClickHappend: number = new Date().getTime();
  @Input() isGuest = true;
  // showConceptSplashScreen = false;
  // showGeoReferencingScreen: boolean;
  // minimizedGeoRefWindow: boolean;
  @ViewChild('geoRefWindow') geoRefWindow: ElementRef<HTMLDivElement>;
  @ViewChild('dropdown', { static: true }) dropdown: ElementRef;

  showTooltip = true;
  @Output() triggerToShowFeSpalsh: EventEmitter<any> = new EventEmitter<any>();

  activeSitesForPresentation: any[] = [];

  showFrameworkForm: boolean = false;
  testingepsgvalue: string;
  epsgCodee: any;
  finalProjection: any;
  latestlayername: any;
  abc: any;

  constructor(
    private basemapService: BasemapService,
    config: NgbModalConfig,
    private modalService: NgbModal,
    private geotowerService: GeotowerService,
    private renderer: Renderer2,
    private commonService: CommonService,
    private formBuilder: FormBuilder,
    private observ: AuthObservableService,
    private printToolService: PrintToolService,
    private authObsr: AuthObservableService,
    private myService: MyService,
    changeDetectorRef: ChangeDetectorRef
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
    this.opts = {
      position: 'right',
      barBackground: '#656565', // '#C9C9C9',
      barOpacity: '0.7',
      barWidth: '7', // '10',
      barBorderRadius: '5', // '20',
      barMargin: '0',
      gridBackground: '#D9D9D9',
      gridOpacity: '1',
      gridWidth: '2',
      gridBorderRadius: '20',
      gridMargin: '0',
      alwaysVisible: true,
      visibleTimeout: 1000,
      // scrollSensitivity: 1
    };

    this.form = this.formBuilder.group({
      unitCtrl: ['us'],
    });
    this.frameworkForm = this.formBuilder.group({
      framework: new FormControl('rectangular'),
    });
    this.frameworkForm.controls.framework.valueChanges.subscribe((res) => {
      console.log(res);
    });
    localStorage.setItem('unit', 'us');
    this.rotationAngle.valueChanges.subscribe((val) => {
      console.log('ANGLE CHANGED');
      console.log(val);
      let rotationValue;
      if (this.commonService.isValid(val) && val !== '-' && val !== '+') {
        rotationValue = val;
        console.log((Math.PI / 180) * rotationValue);
        this.basemapService
          .getCurrentBasemap()
          .getView()
          .setRotation((Math.PI / 180) * rotationValue);
      } else {
        rotationValue = 0;
        this.basemapService
          .getCurrentBasemap()
          .getView()
          .setRotation((Math.PI / 180) * 0);
      }
    });
    this.observ.subscribeForAuthStatus('GeosolComponent', (status, msg) => {
      console.log('LOGIN STATUS CHANGED');
      console.log(status);
      console.log(msg);
      if (status.status === 'success') {
        this.isGuest = false;
        this.closeTooltip();
      } else if (status.status === 'failed') {
        this.isGuest = true;
      }
    });
  }

  isValid(str): any {
    if (
      str == null ||
      str === undefined ||
      str === ' ' ||
      str === '' ||
      str === 'null' ||
      str === 'undefined'
    ) {
      return false;
    } else {
      return true;
    }
  }
  @HostListener('window:keyup.esc', ['$event'])
  escapeKeyPressed(event: KeyboardEvent): any {
    console.log('esc clicked, geotray', event);
    this.resetSelectedOption();
    this.showFrameworkForm = false;
  }
  resetSelectedOption(): void {
    this.selectedOption = '';
    this.showFrameworkForm = false;

  }
  selectGeosolOption(currOption): void {
    console.log('clicked the geosol buttons ', this.isGuest, currOption);

    /* if(this.isGuest || this.isGuest === undefined) {
      if(currOption === 'presentation' || currOption === 'analysis' || currOption === 'management'
      || currOption === 'production' || currOption === 'referencing'||
      currOption === 'observations' || currOption === 'applications' || currOption === 'awareness'
      || currOption === '
      ' || currOption === 'concepts') {
        this.observ.initiateAuthenticationRequest({from: 'geosol'});
        return;
      }
    } */
    let showAwareness = false;
    let isPreviousOptionAwareness = false;
    if (currOption === this.selectedOption) {
      this.resetSelectedOption();
      showAwareness = false;
    } else {
      if (this.selectedOption === 'awareness') {
        isPreviousOptionAwareness = true;
      }
      this.selectedOption = currOption;
      showAwareness = true;
      this.showFrameworkForm =  false;
    }
    if (currOption === 'awareness') {
      const viewMode = {
        mode: 'awareness',
        show: showAwareness,
        timestamp: new Date().getTime(),
        from: 'awareness',
        op: '',
      };
      this.toggleAwareness.emit(viewMode);
    } else if (isPreviousOptionAwareness) {
      const viewMode = {
        mode: 'awareness',
        show: false,
        timestamp: new Date().getTime(),
        from: 'awareness',
        op: '',
      };
      this.toggleAwareness.emit(viewMode);
    }
    if (this.selectedOption === 'referencing') {
      console.log('GEO REF ENABLED');
      this.observ.updateGeorefToggleStatus(true);
      this.showFrameworkForm = false;
    } else {
      console.log('GEO REF DISABLED');
      this.observ.updateGeorefToggleStatus(false);
    }
  }
  ngOnChanges(changes: { [key: string]: SimpleChange }): any {
    console.log('IN GEOSOL CHANGES');
    console.log(changes);
    if (this.commonService.isValid(changes.awarenessCurrentMode)) {
      if (
        this.commonService.isValid(changes.awarenessCurrentMode.currentValue)
      ) {
        console.log(this.awarenessCurrentMode);
        console.log(this);
        if (this.selectedOption === 'awareness') {
          if (
            this.awarenessCurrentMode.mode === 'capture' ||
            !this.awarenessCurrentMode.show
          ) {
            this.selectedOption = '';
          }
        }
      }
    }
  }
  ngOnInit(): any {
    console.log(this);
    this.basemapService.onLoadScaleLine.subscribe((element) => {
      console.log('trigged when added layer or zooming ', element);
      this.getMapProjectionUnits();
      this.getScaleLineWidth();
    });

    this.frameworkForm.get('framework').valueChanges.subscribe((value) => {
      console.log(
        this.frameworkForm.get('framework').value,
        'checkframeworkval'
      );
      if (value === 'rectangular') {
        // this.angularDropdownOptions = [{value: 'EPSG', label: 'EPSGs'}];
        this.showangulardropdown = false;
      } else if (value === 'angular') {
        // this.rectangularDropdownOptions = [{value: 'EPSG', label: 'EPSGs'}];
        this.showrectangulardropdown = false;
      }
    });

    this.getMapProjectionUnits();
    this.getScaleLineWidth();
    this.basemapService.getCurrentBasemap().on('moveend', (e) => {
      // console.log(e);
      this.getMapProjectionUnits();
      // this.basemapService.setLoadScaleLine();
    });
    Draggable.create('#rotationImgID', {
      type: 'rotation',
      throwProps: true,
      // bounds: { minRotation: -23, maxRotation: 337 },
      onDrag: (e) => {
        // console.log(e);
        let target = null;
        if (e.target.tagName === 'SPAN') {
          target = e.target.parentNode || e.target.parentElement;
        } else if (e.target.id === 'rotationImgID') {
          target = e.target;
        } else {
          console.log('OTHER ELEMENT');
        }
        if (this.isValid(target)) {
          // console.log('VALID TARGET...');
          const element = target; // e.target;
          // console.log(element);
          // console.log(element._gsTransform);
          let angle = element._gsTransform.rotation;
          // console.log(e, angle, element);
          // Here code call for setting the angle to base map
          angle = angle + 23;
          this._setRotation(angle);
        } else {
          // console.log('INVALID TARGET...');
        }
      },
      onDragEnd: (e) => {
        let target = null;
        if (e.target.tagName === 'SPAN') {
          target = e.target.parentNode || e.target.parentElement;
        } else if (e.target.id === 'rotationImgID') {
          target = e.target;
        } else {
          console.log('OTHER ELEMENT');
        }
        if (this.isValid(target)) {
          // console.log('VALID TARGET...');
          const element = target; // e.target;
          let angle = element._gsTransform.rotation;
          console.log(angle, element);
          // Here code call for setting the angle to base map
          angle = angle + 23;
          this._setRotation(angle);
        } else {
          // console.log('INVALID TARGET...');
        }
      },
    });
    try {
      this._updateDraggableObj();
    } catch (e) {
      console.log(e);
    }
    this.form.controls.unitCtrl.valueChanges.subscribe((val) => {
      console.log('Unit value changed', this.form.controls.unitCtrl.value);
      console.log(val);
      this.submit();
    });
    this.innerWidth = window.innerWidth;

    this.basemapService.onLoadOrientation.subscribe((rotationValue) => {
      console.log('Rotation value from Tray tool ', rotationValue);
      try {
        const globeIconDraggable = Draggable.get('#rotationImgID');
        TweenLite.set('#rotationImgID', { rotation: rotationValue - 23 });
        globeIconDraggable.update();
      } catch (e) {
        console.log(e);
      }
    });
    setTimeout(() => {
      this.observ.updateReferenceSystem(this.selectedReferenceSystem);
    }, 1000);
  }

  ngAfterViewInit(): any {
    setTimeout(() => {
      this.orientationActive = true;
    }, 1000);
    this.closeTooltip();
  }

  setDefaultPosition(event): any {
    this._updateDraggableObj();
    this._setRotation(0);
  }

  private _updateDraggableObj(): any {
    const globeIconDraggable = Draggable.get('#rotationImgID');
    TweenLite.set('#rotationImgID', { rotation: -23 });
    globeIconDraggable.update();
  }

  private _setRotation(rotationValue): any {
    this.basemapService.isOrientationEvent = true;
    this.basemapService
      .getCurrentBasemap()
      .getView()
      .setRotation((Math.PI / 180) * rotationValue);
    this.basemapService.isOrientationEvent = false;
    this.rotationAngle.setValue(rotationValue);
  }

  toogleTopRightMenu(event): any {
    this.topRightMenuToogle = !this.topRightMenuToogle;
  }

  loadDefaultLayers(): any {
    this.basemapService.setLoadDeafultLayers();
  }
  openMeasureUnitsChangePopup(event, content): any {
    console.log('openMeasureUnitsChangePopup');
    console.log(event);
    /* this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.resetSelectedOption();
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    }); */
  }
  showBlog(): void {
    // this.showConceptSplashScreen = true;
    console.log('IN SHOW BLOG');
    this.triggerToShowFeSpalsh.emit(true);
    // window.open('https://mapsolgeo.com/fe/home.html', '_blank');
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  valueChanged(event): any {
    console.log('valueChanged');
    console.log(event);
  }
  submit(): any {
    this.basemapService.getCurrentBasemap().controls.forEach((control) => {
      console.log('what is control here ', control);
      if (control.values_ !== null && control.values_.units !== undefined) {
        this.basemapService.getCurrentBasemap().removeControl(control);
        control.setUnits(this.form.controls.unitCtrl.value);
        // this.mapProjectionUnits = this.setMapProjectionUnits(control.renderedHTML_);
        this.mapProjectionUnits = this.setMapProjectionUnits(
          control.element.innerText
        );
        this.basemapService.getCurrentBasemap().addControl(control);
      }
    });
    this.observ.updateUnits(this.form.controls.unitCtrl.value);
    // this.modalService.dismissAll('close');
    localStorage.setItem('unit', this.form.controls.unitCtrl.value);
  }
  getScaleLineWidth(): any {
    setTimeout(() => {
      try {
        const mapControlCollection: any[] = this.basemapService
          .getCurrentBasemap()
          .getControls().array_;
        // console.log(mapControlCollection);
        mapControlCollection.forEach((element) => {
          // console.log(element);
          // console.log(element.renderedWidth_);
          if (this.isValid(element.renderedWidth_)) {
            this.scaleLineWidth = element.renderedWidth_;
          }
        });
        console.log('SCALE LINE WIDTH : ', this.scaleLineWidth);
      } catch (e) {
        console.log(e);
      }
    }, 1000);
  }
  zoomIn(): any {
    // console.log(this.basemapService.getCurrentBasemap().getView());
    // console.log(this.basemapService.getCurrentBasemap().getView().getZoom());
    const currentZoom = this.basemapService
      .getCurrentBasemap()
      .getView()
      .getZoom();
    const maxZoom = this.basemapService
      .getCurrentBasemap()
      .getView()
      .getMaxZoom();
    this.getScaleLineWidth();
    if (currentZoom < maxZoom) {
      this.basemapService
        .getCurrentBasemap()
        .getView()
        .setZoom(
          this.basemapService.getCurrentBasemap().getView().getZoom() + 1
        );
      this.getMapProjectionUnits();
    }
  }
  zoomOut(): any {
    const currentZoom = this.basemapService
      .getCurrentBasemap()
      .getView()
      .getZoom();
    const minZoom = this.basemapService
      .getCurrentBasemap()
      .getView()
      .getMinZoom();
    this.getScaleLineWidth();
    if (currentZoom > minZoom) {
      this.basemapService
        .getCurrentBasemap()
        .getView()
        .setZoom(
          this.basemapService.getCurrentBasemap().getView().getZoom() - 1
        );
      this.getMapProjectionUnits();
    }
  }
  getMapProjectionUnits(): any {
    this.basemapService.getCurrentBasemap().controls.forEach((control) => {
      if (this.commonService.isValid(control.values_)) {
        if (control.values_.units !== undefined) {
          setTimeout(() => {
            // console.log('Here scal line ', control, control.renderedHTML_, control.element.innerText);
            this.mapProjectionUnits = this.setMapProjectionUnits(
              control.element.innerText
            );
          }, 1000);
        }
      }
    });
  }
  setMapProjectionUnits(val): any {
    const tempArr = val.split(' ');
    if (tempArr.length > 1) {
      // Here adding new code for view factory related
      const scaleLine = tempArr[3].match(/\d+/g);
      const scalByHalf = Number(scaleLine) / 2;
      const value = tempArr[2]
        .slice(0, tempArr[2].length - scalByHalf.toString().length)
        .slice(0, -1); // .replace(/\,/g, '');
      console.log(tempArr, ' :: ', scaleLine, ' : ', value);
      const viewFactory = tempArr[0] + tempArr[1] + value;
      this.observ.updateViewFactory(viewFactory);
      if (scaleLine.includes('.')) {
        let fixedNum = scaleLine.substr(scaleLine.indexOf('.') + 1).length;
        // console.log(fixedNum);
        if (fixedNum > 5) {
          // console.log('MORE THAN 5. SETTING TO 5');
          fixedNum = 5;
        }
        return String(Number(scaleLine).toFixed(fixedNum)) + ' ' + tempArr[4];
      } else {
        return scaleLine + ' ' + tempArr[4];
      }
    } else {
      return val;
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize(event): any {
    // console.log(event);
    // console.log(this);
    this.innerWidth = window.innerWidth;
  }
  toggleOptions(from = 'all'): any {
    // console.log(new Date().getTime() - this.lastClickHappend);
    if (new Date().getTime() - this.lastClickHappend > 500) {
      // console.log('CLICKED A WHILE AGO...');
    } else {
      // console.log('EARLY CLICK...');
      return;
    }
    this.lastClickHappend = new Date().getTime();
    if (from === 'all') {
      if (this.isLeftWingExpanded || this.isRightWingExpanded) {
        this.isLeftWingExpanded = this.isRightWingExpanded = false;
        setTimeout(() => {
          this.leftWingContainerWidth = '0px';
          this.rightWingContainerWidth = '0px';
        }, 500);
      } else {
        this.leftWingContainerWidth = this.iconWidth * 5 + 45 + 'px'; // '320px';
        this.rightWingContainerWidth = this.iconWidth * 5 + 45 + 'px'; // '320px';
        setTimeout(() => {
          this.isLeftWingExpanded = this.isRightWingExpanded = true;
        }, 100);
      }
    } else if (from === 'left') {
      // this.isLeftWingExpanded=!this.isLeftWingExpanded;
      if (this.isLeftWingExpanded) {
        this.resetSelectedOption();
        this.isLeftWingExpanded = false;
        setTimeout(() => {
          this.leftWingContainerWidth = '0px';
        }, 500);
      } else {
        this.leftWingContainerWidth = this.iconWidth * 5 + 45 + 'px'; // '320px';
        setTimeout(() => {
          this.isLeftWingExpanded = true;
        }, 100);
      }
    } else if (from === 'right') {
      if (this.isRightWingExpanded) {
        this.isRightWingExpanded = false;
        setTimeout(() => {
          this.rightWingContainerWidth = '0px';
        }, 500);
      } else {
        this.rightWingContainerWidth = this.iconWidth * 5 + 45 + 'px'; // '320px';
        setTimeout(() => {
          this.isRightWingExpanded = true;
        }, 100);
      }
    }
  }
  showAppInfo(event, content): any {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.resetSelectedOption();
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  changeView(epsgCodee, bbox, epsgCode): any {
    const newProj = get(epsgCodee); // .setExtent(extent_);
    let view = this.basemapService.getCurrentBasemap().getView();
    const fromLonLat = getTransform('EPSG:4326', newProj);

    let worldExtent = [bbox[1], bbox[2], bbox[3], bbox[0]];

    if (bbox[1] > bbox[3]) {
      worldExtent = [bbox[1], bbox[2], bbox[3] + 360, bbox[0]];
    }

    const extent = applyTransform(worldExtent, fromLonLat, undefined, 8);
    // newProj.setExtent();
    console.log(extent, worldExtent, 'hello');
    // newProj.setExtent(extent);
    // const coordinates = boundingExtent(bbox); //no need this
    const polygon = fromExtent(extent);
    const polygonFeature = new Feature({
      geometry: polygon,
      // projection: newProj
    });

    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [polygonFeature],
      }),
      name: 'boundingLayer',
    });
    polygonFeature.setStyle(
      new Style({
        stroke: new Stroke({
          color: '#FF0000', // please use color codes
          width: 1,
        }),
        text: new Text({
          text: this.epsgCodee,
          textAlign: 'right',
          textBaseline: 'top',
          // backgroundFill: '#000000'
        }),
      })
    );

    const overlay = new Overlay({
      element: vectorLayer.features,
      positioning: 'top-right',
      position: [10, 10],
    });
    //  layers = new Layer({
    //   layers: [],
    // });
    view = new OlView({
      projection: newProj,
      // minZoom: 10
      // center: [latVal, lngVal],
    });
    // const buffer = extent.buffer(extent, 0.2 *extent.getWidth(extent));
    const layers = this.basemapService
      .getCurrentBasemap()
      .getLayers()
      .getArray();
    this.basemapService.getCurrentBasemap().setView(view);
    view.fit(extent);
    console.log(epsgCode, 'epsgCode');
    if (epsgCode !== '3857' && epsgCode !== '4326') {
      this.basemapService.getCurrentBasemap().addLayer(vectorLayer);

      // this.basemapService.getCurrentBasemap().addOverlay(overlay);
      const vectorMapLayers = layers.filter(
        (layer) => layer instanceof VectorLayer
      );
      console.log('vectormaplayers', vectorMapLayers);
      const vectorLayersToRemove = vectorMapLayers.slice(0, -1);
      vectorLayersToRemove.forEach((layer) => {
        if (layer.values_.name == 'boundingLayer') {
          this.basemapService.getCurrentBasemap().removeLayer(layer);
        }
      });
    }
    // layers.forEach((layer, index) => {
    //   if (layer instanceof VectorLayer && index < layers.getLength() - 1 && layer === vectorLayer1) {
    //     this.basemapService.getCurrentBasemap().removeLayer(layer);
    //   }
    // });
    this.finalProjection = this.basemapService
      .getCurrentBasemap()
      .getView()
      .getProjection();
    GeosolComponent.mapReference = this.finalProjection;
    this.basemapService
      .getCurrentBasemap()
      .getLayers()
      .forEach((currentLayer) => {
        console.log('layers name', currentLayer.values_.name);
        for (let i = 0; i < this.geotowerService.clientObjList.length; i++) {
          this.latestlayername = this.geotowerService.clientObjList[i].name;
          if (
            currentLayer.values_.name ===
            this.geotowerService.clientObjList[i].name
          ) {
            console.log('layers name', currentLayer.values_.name);
            console.log('layers list', this.geotowerService.clientObjList);
            console.log('got to the sanat layer', currentLayer);
            this.geotowerService.clientObjList.forEach((layerObject) => {
              if (layerObject.name == currentLayer.values_.name) {
                console.log('layer object', layerObject.name);
                console.log(
                  'layer of geotower',
                  this.geotowerService.clientObjList
                );
                const options = { layerObj: layerObject, geotower: this };

                this.geotowerService.activateEvent(options, 'LayerSetToMap');
              }
            });
            const options = { layerObj: currentLayer, geotower: this };

            this.geotowerService.activateEvent(options, 'LayerSetToMap');
          }
        }
        const vectorLayers = layers.filter(
          (layer) => layer instanceof VectorLayer
        );
        console.log(vectorLayers, 'layeredvector');
        const vectorLayersRemove = vectorLayers.slice(0, -1);
        console.log(this.geotowerService.clientObjList, 'layerofvaluesofname');

        vectorLayersRemove.forEach((layer) => {
          for (let i = 0; i < this.geotowerService.clientObjList.length; i++) {
            console.log(
              this.geotowerService.clientObjList,
              'layerofvaluesofname'
            );

            if (
              layer.values_.name == this.geotowerService.clientObjList[i].name
            ) {
              this.basemapService.getCurrentBasemap().removeLayer(layer);
              console.log(layer.values_.name, 'layerofvaluesofname');
            }
            console.log(
              this.geotowerService.clientObjList,
              'layerofvaluesofname'
            );
          }
        });
      });
    console.log(this.geotowerService.clientObjList, 'layerofvaluesofname');
    console.log(GeosolComponent.mapReference, 'maprefe');
    console.log(this.finalProjection, 'finalpojection');
    // this.observ.updateMapReferenceSystem(this.finalProjection)
    // const previousVectorLayers = layers.getArray().slice(1, -1);
    // previousVectorLayers.forEach(layer => this.basemapService.getCurrentBasemap().removeLayer(layer));
    // this.basemapService.getCurrentBasemap().addLayer(vectorLayer)
    console.log(
      'vectorlayers are',
      this.basemapService.getCurrentBasemap().getLayers()
    );

    console.log(
      'projection is',
      this.basemapService.getCurrentBasemap().getView().getProjection()
    );
    // console.log('vectorlayer is', vectorLayer);
    // console.log('source is', vectorLayer.getSource());
    console.log('epsgCodee is', this.epsgCodee);
  }
  //   private _createClientLayerJsonObj(clientLayerObj): any {
  //     return {
  //       name: clientLayerObj.fileName,
  //       isServer: false,
  //       maximized: false,
  //       previewLayer: true,
  //       files: clientLayerObj.inputFiles,
  //       fileType: clientLayerObj.filetype,
  //       zipfile: clientLayerObj.zipfile,
  //       metadata: clientLayerObj.metadata,
  //       firebaseUrl: clientLayerObj.firebaseUrl,
  //       proj: clientLayerObj.proj,
  //       timestamp: new Date(),
  //       orderNumber: this.layersList.length + 1
  // };
  //   }

  radioButtonState: boolean = false;

  showrectangulardropdown: boolean = false;

  openrectangulardropdown() {
    this.showrectangulardropdown = !this.showrectangulardropdown;
  }

  showangulardropdown: boolean = false;

  openangulardropdown() {
    this.showangulardropdown = !this.showangulardropdown;
  }

  angularepsg = 'EPSGs';
  rectangularepsg = 'EPSGs';

  projectionChangeEvent(epsgCode, id): any {
    this.showrectangulardropdown = false;
    this.showangulardropdown = false;
    console.log(id, epsgCode, 'checkid');

    this.epsgCodee = 'EPSG:' + epsgCode;
    // this.finalProjection= this.basemapService.getCurrentBasemap().getView().getProjection();
    console.log('selected epsgCode ', this.epsgCodee);
    if (id === 'angular') {
      this.angularepsg = this.epsgCodee;
    } else if (id === 'rectangular') {
      this.rectangularepsg = this.epsgCodee;
    }
    const index = this.referenceSystemTypes.findIndex(
      (refSys) => String(refSys.value) === String(epsgCode)
    );
    if (index !== -1) {
      this.selectedReferenceSystem = this.referenceSystemTypes[index];
      this.observ.updateReferenceSystem(this.selectedReferenceSystem);
    }
    this.getProjDef(this.epsgCodee).subscribe((result) => {
      proj4.defs(this.epsgCodee, result.proj4);
      register(proj4);
      this.changeView(this.epsgCodee, result.bbox, epsgCode);
      // console.log(projdef, 'projdef')
      console.log('find bbox ', result.bbox);
      console.log(
        this.selectedReferenceSystem,
        'selected epsg projection value'
      );
      this.myService.trigger();

    });
    this.passInputValue.emit(`${epsgCode}`);
    this.emitId.emit(id);
  }

  namechangeEvent(id){
    console.log(id,"checknameid");
     this.emitId.emit(id);

  }
  private getProjDef(epsgCodee): Observable<any> {
    let projdef =
      '+proj=laea +lat_0=45 +lon_0=-100 +x_0=0 +y_0=0 ' +
      '+a=6370997 +b=6370997 +units=m +no_defs';
    return new Observable((observer) => {
      fetch(
        'https://epsg.io/?format=json&q=' + this.epsgCodee.split(':')[1]
      ).then((response) => {
        return response.json().then((jsonData) => {
          const results = jsonData.results;
          console.log('getting proj4 result ', results);
          console.log('find epsgcodee in getProjdef ', epsgCodee);
          // console.log('find projdef in getprojdef before results ', projdef);
          if (results && results.length > 0) {
            // console.log('find projdef in getprojdef after results ', projdef);
            for (let i = 0, ii = results.length; i < ii; i++) {
              const result = results[i];
              console.log('result of i ', result);
              if (result) {
                const code = result.code;
                const name = result.name;
                const proj4def = result.proj4;
                console.log('find proj4def ', proj4def);
                const bbox = result.bbox;
                console.log('hi guys', result.code);

                // if(result.code=='3857'||result.code=='4326'){
                //   observer.next(proj4def)
                //   console.log('hi guys' )
                //   return
                // }
                if (proj4def && proj4def.length > 0) observer.next(result);
                console.log('find bbox ', bbox);
                observer.complete();
                return;
              }
            }
          } else {
            this.epsgCodee = 'NO-EPSG';
            console.log('no result for epsg ', this.epsgCodee);
          }
          observer.next(projdef);
          observer.complete();
        });
      });
    });
  }

  showCompass(): any {
    console.log('In showCompass');
    console.log(this.compassOpenState);
    if (!this.compassOpenState) {
      this.compassOpenState = true;
      // this.showCompassCtrl.emit(new Date().getTime());
      this.showCompassCtrl = String(new Date().getTime());
    } else {
      this.compassOpenState = false;
      // this.closeCompassCtrl.emit(new Date().getTime());
      this.closeCompassCtrl = String(new Date().getTime());
    }
  }
  compassClosedEventFun(): void {
    this.compassOpenState = false;
  }
  displayFullMap(): any {
    console.log('In displayFullMap');
    this.basemapService.getCurrentBasemap().getView().setZoom(2);
  }
  closeTooltip(): void {
    if (!this.isGuest) {
      setTimeout(() => {
        this.showTooltip = false;
      }, environment.feUserGuideTooltipAutoCloseDuration);
    }
  }
  openFrameworkForm(): any {
    this.showFrameworkForm = !this.showFrameworkForm;
  }
  @Output() epsgCord = new EventEmitter<string>();
  testing(e) {
    console.log(this.referenceSystemTypes[0].value, 'testing espg values');
    this.testingepsgvalue = e;

    console.log(this.testingepsgvalue, 'testing epsg values');
    for (let i = 0; i < this.referenceSystemTypes.length; i++) {
      if (this.referenceSystemTypes[i].value == this.testingepsgvalue) {
        this.epsgCord = this.referenceSystemTypes[i].name;
      }
    }
    // this.epsgCord.emit(e);
  }
  filterMapTypes(mapType, mapRealname): any {
    // const mapType = mapTypeObj.value;
    // console.log('what is map type: ', mapType, this.isBaseMapOptActive);
    // this.mapTypeName = mapType;
    // this.selecteMapType = mapTypeObj;
    this.authObsr.updateBaseLayerName(mapRealname);
    // this.isBaseMapOptActive = !this.isBaseMapOptActive;
    // #TODO - later this code need to be simply & easly...
    this.basemapService
      .getCurrentBasemap()
      .getLayers()
      .forEach((layer) => {
        console.log(
          'layer name ',
          mapType,
          layer.values_.name,
          layer.getVisible()
        );
        if (mapType === 'openstreet') {
          if (
            layer.values_.name === 'satellite' ||
            layer.values_.name === 'terrain' ||
            layer.values_.name === 'toner' ||
            layer.values_.name === 'bingsatellite' ||
            layer.values_.name === 'bingstreet' ||
            layer.values_.name === 'googlestreet' ||
            layer.values_.name === 'googlesatellite'
          ) {
            layer.setVisible(false);
          } else if (layer.values_.name === 'openstreet') {
            layer.setVisible(true);
          }
        }
        if (mapType === 'satellite') {
          if (
            layer.values_.name === 'openstreet' ||
            layer.values_.name === 'terrain' ||
            layer.values_.name === 'toner' ||
            layer.values_.name === 'bingsatellite' ||
            layer.values_.name === 'bingstreet' ||
            layer.values_.name === 'googlestreet' ||
            layer.values_.name === 'googlesatellite'
          ) {
            layer.setVisible(false);
          } else if (layer.values_.name === 'satellite') {
            layer.setVisible(true);
          }
        }
        if (mapType === 'terrain') {
          if (
            layer.values_.name === 'satellite' ||
            layer.values_.name === 'openstreet' ||
            layer.values_.name === 'toner' ||
            layer.values_.name === 'bingsatellite' ||
            layer.values_.name === 'bingstreet' ||
            layer.values_.name === 'googlestreet' ||
            layer.values_.name === 'googlesatellite'
          ) {
            layer.setVisible(false);
          } else if (layer.values_.name === 'terrain') {
            layer.setVisible(true);
          }
        }

        if (mapType === 'toner') {
          if (
            layer.values_.name === 'satellite' ||
            layer.values_.name === 'openstreet' ||
            layer.values_.name === 'terrain' ||
            layer.values_.name === 'bingsatellite' ||
            layer.values_.name === 'bingstreet' ||
            layer.values_.name === 'googlestreet' ||
            layer.values_.name === 'googlesatellite'
          ) {
            layer.setVisible(false);
          } else if (layer.values_.name === 'toner') {
            layer.setVisible(true);
          }
        }

        if (mapType === 'bingsatellite') {
          if (
            layer.values_.name === 'satellite' ||
            layer.values_.name === 'openstreet' ||
            layer.values_.name === 'terrain' ||
            layer.values_.name === 'toner' ||
            layer.values_.name === 'bingstreet' ||
            layer.values_.name === 'googlestreet' ||
            layer.values_.name === 'googlesatellite'
          ) {
            layer.setVisible(false);
          } else if (layer.values_.name === 'bingsatellite') {
            layer.setVisible(true);
          }
        }
        // New code for street view of bing
        if (mapType === 'bingstreet') {
          if (
            layer.values_.name === 'openstreet' ||
            layer.values_.name === 'terrain' ||
            layer.values_.name === 'toner' ||
            layer.values_.name === 'bingsatellite' ||
            layer.values_.name === 'googlestreet' ||
            layer.values_.name === 'satellite' ||
            layer.values_.name === 'googlesatellite'
          ) {
            layer.setVisible(false);
          } else if (layer.values_.name === 'bingstreet') {
            layer.setVisible(true);
          }
        }

        // New code for street view of bing
        if (mapType === 'googlestreet') {
          if (
            layer.values_.name === 'openstreet' ||
            layer.values_.name === 'terrain' ||
            layer.values_.name === 'toner' ||
            layer.values_.name === 'bingsatellite' ||
            layer.values_.name === 'bingstreet' ||
            layer.values_.name === 'satellite' ||
            layer.values_.name === 'googlesatellite'
          ) {
            layer.setVisible(false);
          } else if (layer.values_.name === 'googlestreet') {
            layer.setVisible(true);
          }
        }

        // New code for satellite view of google
        if (mapType === 'googlesatellite') {
          if (
            layer.values_.name === 'openstreet' ||
            layer.values_.name === 'terrain' ||
            layer.values_.name === 'toner' ||
            layer.values_.name === 'bingsatellite' ||
            layer.values_.name === 'bingstreet' ||
            layer.values_.name === 'satellite' ||
            layer.values_.name === 'googlestreet'
          ) {
            layer.setVisible(false);
          } else if (layer.values_.name === 'googlesatellite') {
            layer.setVisible(true);
          }
        }
      });
  }
}
