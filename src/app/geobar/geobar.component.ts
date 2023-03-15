import {
  Component,
  ViewChild,
  Input,
  HostListener,
  ElementRef,
  Renderer2,
  OnDestroy,
  EventEmitter,
  Output,
  SimpleChange,
  OnChanges,
  AfterViewInit,
  OnInit,
} from '@angular/core';
import { BasemapService } from '../basemap/basemap.service';
import { GeobarService } from './geobar.service';
import { GeobarAlertComponent } from '../geobar-alert/geobar-alert.component';
import { GeotowerService } from '../geotower/geotower.service';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { AuthObservableService } from '../Services/authObservableService';
import { CommonService } from '../Services/common.service';
import { GeobaseService } from '../Services/geobase.service';
import { Router } from '@angular/router';
import { GeoNotePadService } from '../Services/geo-notepad.service';
import { Subject, Subscription } from 'rxjs';
import { unByKey } from 'ol/Observable';
import { TopicsService } from '../Services/topics.service';
import OlOverlay from 'ol/Overlay';
import * as XLSX from 'xlsx';
import { FileUtil } from './util/fileUtil';
import { MyService } from '../my-service.service';

import { constants } from 'buffer';
import { ISlimScrollOptions, SlimScrollEvent } from 'ngx-slimscroll';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  group,
} from '@angular/animations';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import {
  NgbModalConfig,
  NgbModal,
  ModalDismissReasons,
} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-geobar',
  templateUrl: './geobar.component.html',
  styleUrls: ['./geobar.component.scss'],
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
})
export class GeobarComponent
  implements OnInit, OnDestroy, OnChanges, AfterViewInit
{
  @ViewChild('externalPdfViewer') public externalPdfViewer;
  @ViewChild('searchinput') searchinput: ElementRef;
  file: {
    TotalPages: number;
    Name: string;
    'Page-1': { ImageURL: string; MetaData: string };
    'Page-2': { ImageURL: string; MetaData: string };
    'Page-3': { ImageURL: string; MetaData: string };
    'Page-4': { ImageURL: string; MetaData: string };
  };
  pdfObjects: any;
  pdfpages_num: any;
  obj: { URL: string };
  num: {
    TotalPages: number;
    Name: string;
    'Page-1': { ImageURL: string; MetaData: string };
    'Page-2': { ImageURL: string; MetaData: string };
    'Page-3': { ImageURL: string; MetaData: string };
    'Page-4': { ImageURL: string; MetaData: string };
  };
  arrraydata1: any;
  pagearr: any[];
  PdfFinal3: unknown;
  PDFFinal2: any[];
  pdfarrr: any[];
  ExcelObject: string;
  newArrayOfObj: any[];
  newArrayOfObj1: any[];
  currentCoordinateSystem = 'EPSG:4326';
  currentSystemname = 'Angular';
  arrayObj = [];
  onSearchCoordinates = [];
  triggerselectedReferenceSystem = true;
  public globalInputValue: string;
  public globalRectValue: any[];
  validatedsearch = false;
  showangulardropdown: boolean = false;
  radioButtonState: boolean = false;
  showrectangulardropdown: boolean = false;

  public openPdf() {
    console.log('opening pdf in new tab!');
    this.externalPdfViewer.pdfSrc = 'gre_research_validity_data.pdf';
    this.externalPdfViewer.refresh();
  }

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
  angularProjection = 'EPSG:4326';
  rectangularProjection: string;

  coordinateSystemTypes: any[] = [
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
    { index: 143, name: 'EPSG:32760', value: '32760' }, 
  ];
  selectedCoordinateSystem: any = this.coordinateSystemTypes[0];
  @Input() awarenessCurrentMode: any = {};
  @Input() globalObject: any = {};
  @Output() toggleAwareness: EventEmitter<any> = new EventEmitter<any>();
  lastClickHappend: number = new Date().getTime();
  @Input() isGuest = true;
  @ViewChild('geoRefWindow') geoRefWindow: ElementRef<HTMLDivElement>;
  showTooltip = true;
  @Output() triggerToShowFeSpalsh: EventEmitter<any> = new EventEmitter<any>();
  @Output() exportcordsysname: EventEmitter<any> = new EventEmitter<any>();

  activeSitesForPresentation: any[] = [];

  showFrameworkForm: boolean = false;

  openFrameworkForm(): any {
    this.showFrameworkForm = !this.showFrameworkForm;
  }

  showExcelData: any;

  showPDF: any;
  pdf_json = [
    {
      TotalPages: 4,
      Name: 'pdfname.pdf',
      'Page-1': {
        ImageURL:
          'https://firebasestorage.googleapis.com/v0/b/geomocus-qa.appspot.com/o/.jpg%2F1628430229893_Dawson_mine_area-page-001.jpg?alt=media&token=c3bb4bde-272d-4b50-9579-cf3cdd53e81f',
        MetaData: 'if available',
      },
      'Page-2': {
        ImageURL:
          'https://firebasestorage.googleapis.com/v0/b/geomocus-qa.appspot.com/o/.jpg%2F1631534153542_JKAtlas-page-001.jpg?alt=media&token=e92b6b48-93bd-45df-8f3f-bf9248c1f256',
        MetaData: 'if available',
      },
      'Page-3': {
        ImageURL:
          'https://firebasestorage.googleapis.com/v0/b/geomocus-qa.appspot.com/o/.jpg%2F1631534581229_hyderabad_election_wards-page-001.jpg?alt=media&token=7a57e77e-fde9-4a66-851f-71a3ea1aa860',
        MetaData: 'if available',
      },
      'Page-4': {
        ImageURL:
          'https://firebasestorage.googleapis.com/v0/b/geomocus-qa.appspot.com/o/.jpg%2F1632930290271_Precise%20Grading%20Plan.jpg?alt=media&token=d7639e0a-72ec-4f64-b173-ae777459c8f8',
        MetaData: 'if available',
      },
    },
  ];
  @Input() currentSession: any = {};
  @Input() userClickOnMap = '';
  @Input() userInfo: any = {};
  @Input() activeSearchOptionLLC = false;
  @Input() activeSearchOptionASB = false;
  @Input() faClass: any;
  @Input() latLngsList = [];
  @ViewChild(GeobarAlertComponent) alertComponent: GeobarAlertComponent;
  @Input() activewmsImg = false;
  @Output() selectedSession: EventEmitter<any> = new EventEmitter<any>();
  private wmsimg: any;
  searchValue = '';
  urlLayerjsonObj: any;
  options: any;
  @ViewChild('placesRef') placesRef: GooglePlaceDirective;
  layerUploadStatusInPercentage = 0;
  showLayerUploadStatus = false;
  @ViewChild('layerStatus') layerStatus: ElementRef<HTMLDivElement>;
  showFilePickerOptions = false;
  showAwsFilePicker: boolean;
  showLatLongTrigger = false;
  showLatLongCombinations: boolean;
  showDropDownWithOptions: boolean;
  showGeobaseArea: boolean;
  ExceljsonData: any;
  ExceljsonDataHeading: any;
  ExcelSheets: any;
  Excel: any;
  exceljson: any[];
  ExcelFinal: any;
  ExcelFinal2: any[];
  sheet = 'Sheet1';
  arrraydataSheet = [];
  ExcelHeading: any;
  ExcelHeading2: string[];
  upExcelsheet: any;
  uploadExcelObject: any[];
  uploadExcelObject2: any[];
  UploadExcelData: any[];
  data2: string;
  data: string;
  PdfFinal: any;
  PdfFinal2: any[];
  page = 'Page-1';
  arrraydata = [];
  PDFURL: [];
  geoSessionsList: any[] = [];
  geoSessionDataColleced: boolean;
  afterLoginOperations: any[] = [];
  showCfmWindow = false;
  @ViewChild('cfmWindow') cfmWindow: ElementRef<HTMLDivElement>;
  minimizedWindow: boolean;
  showUcrWindow = false;
  @ViewChild('ucrWindow') ucrWindow: ElementRef<HTMLDivElement>;
  minimizedUcrWindow: boolean;
  resetCfmFileSelection: string;
  validStates = {
    UNKNOWN: '',
    VALID: 'valid',
    INVALID: 'invalid',
  };
  geobarValidationStatus = this.validStates.UNKNOWN;
  userTryingToLocationSearch: boolean;
  tempCreateSiteId: string = String(new Date().getTime());
  watchOnPolygonChangesSubs: Subscription;
  currSiteLocationData: any[] = [];
  markerClickListener: any = null;
  markerClickListener1: any = null;
  showAddSiteWindow: boolean;
  projects: any[] = [];
  places: any[] = [];
  topics: any[] = [];
  selectedProjectId: number = null;
  selectedPlaceId: number = null;
  topicSelect: FormControl = new FormControl();
  titleCtrl: FormControl = new FormControl();
  contactCtrl: FormControl = new FormControl();
  descCtrl: FormControl = new FormControl();
  tagsCtrl: FormControl = new FormControl();
  currSiteLocationDataToView: string[] = [];
  siteErrMsg: string;
  currentLocationFetchStatus = '';
  showAddSiteSuccessMsg = false;
  siteSavingStatus = '';
  @ViewChild('markerTail') markerTail: ElementRef<HTMLSpanElement>;
  markerTailLayer: OlOverlay;
  constructor(
    private baseMapService: BasemapService,
    private renderer: Renderer2,
    private router: Router,
    private authObsr: AuthObservableService,
    private commonService: CommonService,
    private geobarService: GeobarService,
    private geoTowerService: GeotowerService,
    private geobaseService: GeobaseService,
    private notePadService: GeoNotePadService,
    private topicsService: TopicsService,
    private formBuilder: FormBuilder,
    private observ: AuthObservableService,
    private myService: MyService
  ) {
    this.myService.triggerKeyupEnter$.subscribe((data) => {
      // Handle the "Enter" keyup event here
      console.log('triggereddropdown..', data);
      if (this.globalInputValue != null) {
        this.onSearch(this.globalInputValue, this.globalInputValue);
      }
    });
    this.authObsr.subscribeForErrors('GeobarComponent', (data) => {
      console.log('RECEIVED AND ERROR...');
      console.log(data);
      this._getAlertMessage(this.alertComponent, data);
    });
    this.authObsr.subscribeForDuplicateErrors('GeobarComponent', (data) => {
      console.log('RECEIVED AND ERROR...');
      console.log(data);
      this.hideLayerUploadStatus('Duplicate found.');
    });
    if (this.commonService.isValid(localStorage.getItem('token'))) {
      this.isGuest = false;
    } else {
      this.isGuest = true;
    }
    this.authObsr.subscribeForAuthStatus('GeobarComponent', (authRes, msg) => {
      console.log('LOGIN STATUS CHANGED');
      console.log(authRes);
      console.log(msg);
      if (authRes.status === 'success') {
        this.isGuest = false;
        // DO OPERATIONS AFTER LOGIN
        this.runAllWaitingTasks();
      } else if (authRes.status === 'failed') {
        this.isGuest = true;
        this.afterLoginOperations = [];
        this.showGeobaseArea = false;
        (document.getElementById('geo-address-bar') as HTMLInputElement).value =
          '';
        this.showDropDownWithOptions = false;
        this.showLatLongCombinations = false;
        this.showGeobaseArea = false;
        this.clearAllGeobarItems('');
        this.activeSearchOptionLLC = false;
      }
    });
    this.markerTailLayer = new OlOverlay({});
  }
  runAllWaitingTasks(): any {
    this.afterLoginOperations.forEach((operation) => {
      if (operation.type === 'showGeobase') {
        console.log('CALLING SHOW GEOBASE SCREEN AFTER LOGIN');
        this.showAllGeobases();
        const index = this.afterLoginOperations.findIndex(
          (op) => op.type === 'showGeobase'
        );
        if (index !== -1) {
          this.afterLoginOperations.splice(index, 1);
        }
      } else if (operation.type === 'setFocusToType') {
        console.log('CALLING SET FOCUS TO TEXT FIELD...');
        document.getElementById('geo-address-bar').focus();
      } else if (operation.type === 'showOperations') {
        this.showOrHideGeobarOperations();
      }
    });
  }
  ngOnDestroy(): any {
    this.authObsr.unSubscribeForErrors('GeobarComponent');
    this.authObsr.unSubscribeForAuthStatus('GeobarComponent');
  }
  ngOnChanges(changes: { [key: string]: SimpleChange }): any {
    // EXCEL=================================
    if (FileUtil.checkUpload === true) {
      // this.showPDF = true;
    }
    if (FileUtil.checkUploadExcel === true) {
      console.log(this.geobarService.returnDataToGeobar);
      // this.showExcelData = true;
    }
    if (this.commonService.isValid(changes.userClickOnMap)) {
      if (this.commonService.isValid(changes.userClickOnMap.currentValue)) {
        this.closeOperationsMenu();
      }
    }
    if (this.commonService.isValid(changes.globalObject)) {
      if (this.commonService.isValid(changes.globalObject.currentValue)) {
        if (this.globalObject.pageType === 'COVID19') {
          this.getProjectsList();
        }
      }
    }
  }
  ngOnInit() {
    this.setExceDataSheet({});
    // this._setClientLayerToTower({});
    this.createFrameworkGroup();

    this.frameworkForm.controls.framework.valueChanges.subscribe((res) => {
      this.currentSystemname = res;
      this.exportcordsysname.emit(this.currentSystemname);
      console.log(this.currentSystemname, 'checkcurrentsys');
      if (this.currentSystemname === 'Rectangular') {
        // this.angularDropdownOptions = [{value: 'EPSG', label: 'EPSGs'}];
        this.showangulardropdown = false;
      } else if (this.currentSystemname === 'Angular') {
        // this.rectangularDropdownOptions = [{value: 'EPSG', label: 'EPSGs'}];
        this.showrectangulardropdown = false;
      }
    });
  }
  createFrameworkGroup() {
    this.frameworkForm = this.formBuilder.group({
      framework: new FormControl('Angular'),
      addRectangular: new FormControl('EPSG:3857'),
      addAngular: new FormControl('EPSG:4326'),
    });
  }
  ngAfterViewInit(): void {
    console.log(FileUtil.checkExcelData({}), 'check data');
  }
  closeOperationsMenu(): void {
    this.showDropDownWithOptions = false;
    this.showLatLongCombinations = false;
    this.showGeobaseArea = false;
  }
  @HostListener('window:keyup.esc', ['$event'])
  keyEvent(event: KeyboardEvent): any {
    console.log('esc clicked!! in Search component ', event);
    this.clearAllGeobarItems(event);
    this.closePreviousMarkers();
  }
  openrectangulardropdown() {
    this.showrectangulardropdown = !this.showrectangulardropdown;
    this.showangulardropdown = false;
  }
  openangulardropdown() {
    this.showangulardropdown = !this.showangulardropdown;
    this.showrectangulardropdown = false;
  }
  angularepsg = 'EPSGs';
  rectangularepsg = 'EPSGs';
  epsgCodee: any;
  epsgChangeEvent(epsgCode,id): any {
    this.showrectangulardropdown = false;
    this.showangulardropdown = false;
    console.log(epsgCode,id, 'check epsg in geobar');
    this.epsgCodee = 'EPSG:' + epsgCode;
    if (this.frameworkForm.get('framework').value === 'Angular') {
      this.angularProjection = this.epsgCodee;
      this.angularepsg = this.epsgCodee;
      this.currentCoordinateSystem = this.angularProjection;
      console.log();
    } else if (this.frameworkForm.get('framework').value === 'Rectangular') {
      this.rectangularProjection = this.epsgCodee;
      this.rectangularepsg = this.epsgCodee;
      this.currentCoordinateSystem = this.rectangularProjection;
    }
    console.log('selected epsgCode ', epsgCode);
    const index = this.coordinateSystemTypes.findIndex(
      (csSys) => String(csSys.value) === String(epsgCode)
    );
    if (index !== -1) {
      this.selectedCoordinateSystem = this.coordinateSystemTypes[index];
      this.observ.updateCoordinateSystem(this.selectedCoordinateSystem);
    }
    console.log(this.selectedCoordinateSystem);
  }
  clearAllGeobarItems(event): void {
    this.geobarValidationStatus = this.validStates.UNKNOWN;
    this.clearASB(event, event);
    this.clearLLC(event, event);
    this.geobarService.removeMarker();
    this._closeAlertMessage(this.alertComponent);
    this.showDropDownWithOptions = false;
    this.showGeobaseArea = false;
    this.userTryingToLocationSearch = false;
  }
  public handleAddressChange(address: Address): any {
    this.userTryingToLocationSearch = true;
    this.activeSearchOptionLLC = false;
    this.showLatLongCombinations = false;
    this._closeAlertMessage(this.alertComponent);
    console.log('handling the address ', address);
    const latValue = address.geometry.location.lat();
    const lngValue = address.geometry.location.lng();
    // here adding the marker when click on the address from list
    if (this.globalObject.pageType !== 'COVID19') {
      this.geobarService.addMarker(latValue, lngValue);
      this.baseMapService.getCurrentBasemap().getView().setZoom(17);
      this._closeAlertMessage(this.alertComponent);
    } else {
      // ENABLE THIS ON CLICK MAP => MOVE MARKER
      this.closePreviousMarkers();
      setTimeout(() => {
        this.moveMarkerToLocationForCovidPage(latValue, lngValue);
      }, 500);
    }
  }
  moveMarkerToLocationForCovidPage(latValue, lngValue): void {
    const coordsList: Array<number> = [lngValue, latValue];
    this.currSiteLocationData = coordsList;
    this.currSiteLocationDataToView = this.getLatLongsToShow(coordsList); // [latValue, lngValue];
    this.tempCreateSiteId = String(new Date().getTime());
    const note: any = {
      latitudeLongitude: coordsList,
    };
    const watchOnPolygonChanges: Subject<any> = new Subject<any>();
    this.updatePolygonOnChanges(watchOnPolygonChanges);
    setTimeout(() => {
      this.showOrCloseLocationOnMap(note, watchOnPolygonChanges);
    }, 500);

    this.markerTail.nativeElement.style.display = 'block';
    console.log(this.markerTail.nativeElement);
    this.markerTailLayer.setPosition([lngValue, latValue]);
    this.markerTailLayer.setElement(this.markerTail.nativeElement);
    this.baseMapService.getCurrentBasemap().addOverlay(this.markerTailLayer);
  }
  markCurrentLocation(): void {
    if (navigator.geolocation) {
      console.log('changed- navigated true ');
      this.currentLocationFetchStatus = 'inprogress';
      navigator.geolocation.getCurrentPosition(
        (positionData) => {
          console.log('changed- user location ');
          const latitude = positionData.coords.latitude;
          const longitude = positionData.coords.longitude;
          this.closePreviousMarkers();
          setTimeout(() => {
            this.moveMarkerToLocationForCovidPage(latitude, longitude);
          }, 500);

          this.currentLocationFetchStatus = 'success';
          setTimeout(() => {
            this.currentLocationFetchStatus = '';
          }, 3000);
        },
        (error) => {
          console.log(error);
          this.currentLocationFetchStatus = 'error';
          console.log('Browser block the location permission!!!');
          setTimeout(() => {
            this.currentLocationFetchStatus = '';
          }, 3000);
        },
        {
          timeout: 60000,
        }
      );
    } else {
      console.log('Browser is so old');
    }
  }
  onSearch($event, inputValue): any {
    this.globalInputValue = this.searchValue;
    this.arrayObj = [];
    this.showFrameworkForm = false;
    if (this.isGuest) {
      // SAVING OPERATION TO PERFORM AFTER LOGIN
      const index = this.afterLoginOperations.findIndex(
        (op) => op.type === 'setFocusToType'
      );
      if (index === -1) {
        // IF NO REQUEST PRESENT
        this.afterLoginOperations.push({ type: 'setFocusToType' });
      } else {
        // IF REQUEST PRESENT, SAVING RECENT REQUEST ONLY
        this.afterLoginOperations[index] = { type: 'setFocusToType' };
      }
      this.authObsr.initiateAuthenticationRequest({ from: 'geobar' });
    } else {
      console.log('event triggied....', event, inputValue);
      this.activeSearchOptionLLC = false;
      ///Angular Validations and transformation//
      if (this.frameworkForm.get('framework').value === 'Angular') {
        console.log('i am in angular');
        this._closeAlertMessage(this.alertComponent);
        this._validateInputText(inputValue);
        if (this.validatedsearch == true) {
          console.log('checkvalidatedsearchistruee');
          if (this.onSearchCoordinates) {
            console.log(
              this.onSearchCoordinates,
              'check coordinates after dms validation'
            );
            console.log(this.angularProjection, 'check angular projection');
            var source_projection = this.baseMapService.getSourceProjection(
              this.angularProjection
            );
            console.log(source_projection, 'check source projection');
            console.log(
              this.baseMapService.getCurrentBasemap().getView().getProjection(),
              'check destination projection'
            );
            var transformed_Coordinates =
              this.baseMapService.getTransformedCoordinates(
                [this.onSearchCoordinates[1], this.onSearchCoordinates[0]],
                source_projection,
                this.baseMapService
                  .getCurrentBasemap()
                  .getView()
                  .getProjection()
              );
            console.log(transformed_Coordinates, 'check output coordinates');
            this.geobarService.addMarker(
              transformed_Coordinates[1],
              transformed_Coordinates[0]
            );
            this.onSearchCoordinates.splice(0, this.onSearchCoordinates.length);
            transformed_Coordinates.splice(0, this.onSearchCoordinates.length);
          } else {
            console.log('check me when i am here', inputValue);
            for (let i = 0; i < 2; i++) {
              this.arrayObj.push(Number(inputValue.split(',')[i]));
            }

            console.log(this.angularProjection, 'check angular projection');
            var source_projection = this.baseMapService.getSourceProjection(
              this.angularProjection
            );
            console.log(source_projection, 'check source projection');
            console.log(
              this.baseMapService.getCurrentBasemap().getView().getProjection(),
              'check destination projection'
            );
            var transformed_Coordinates =
              this.baseMapService.getTransformedCoordinates(
                [this.arrayObj[1], this.arrayObj[0]],
                source_projection,
                this.baseMapService
                  .getCurrentBasemap()
                  .getView()
                  .getProjection()
              );
            console.log(transformed_Coordinates, 'check output coordinates');
            this.geobarService.addMarker(
              transformed_Coordinates[1],
              transformed_Coordinates[0]
            );
          }
        }
        //Rectangular Validations and Transformations
      } else if (this.frameworkForm.get('framework').value === 'Rectangular') {
        console.log('i am in rectangular');
        this._validateRectInput(inputValue);
        var source_projection = this.baseMapService.getSourceProjection(
          this.rectangularProjection
        );
        console.log(source_projection, 'check source projection');
        console.log(
          this.baseMapService.getCurrentBasemap().getView().getProjection(),
          'check destination projection'
        );
        var transformed_Coordinates =
          this.baseMapService.getTransformedCoordinates(
            [this.globalRectValue[0], this.globalRectValue[1]],
            source_projection,
            this.baseMapService.getCurrentBasemap().getView().getProjection()
          );
        console.log(transformed_Coordinates, 'check output coordinates');
        this.geobarService.addMarkerRect(
          transformed_Coordinates[0],
          transformed_Coordinates[1]
        );
      }
    }
  }
  getOnSearchCoordinates(coordinates) {
    this.onSearchCoordinates.splice(0, this.onSearchCoordinates.length);
    this.onSearchCoordinates = coordinates;
    this.validatedsearch = true;
  }
  showGeobarOperations(): void {
    if (this.isGuest) {
      // SAVING OPERATION TO PERFORM AFTER LOGIN
      const index = this.afterLoginOperations.findIndex(
        (op) => op.type === 'showOperations'
      );
      if (index === -1) {
        // IF NO REQUEST PRESENT
        this.afterLoginOperations.push({ type: 'showOperations' });
      } else {
        // IF REQUEST PRESENT, SAVING RECENT REQUEST ONLY
        this.afterLoginOperations[index] = { type: 'showOperations' };
      }
      this.authObsr.initiateAuthenticationRequest({ from: 'geobar' });
    } else {
      this.showOrHideGeobarOperations();
    }
  }
  showOrHideGeobarOperations(): void {
    this.showDropDownWithOptions = !this.showDropDownWithOptions;
    this.showLatLongCombinations = false;
    this.showGeobaseArea = false;
  }
  closeFilePickerOptions(): any {
    if (this.showCfmWindow) {
      this.closeCfmWindow();
    }
    if (this.showUcrWindow) {
      this.closeUcr();
    }
    this.resetCfmFileSelection = String(new Date().getTime());
  }
  selectFilePickOption(option): any {
    if (option === 'local') {
      document.getElementById('selectedFile').click();
      this.closeFilePickerOptions();
    } else if (option === 'aws') {
      this.showAwsFilePicker = true;
    }
  }
  triggerEventToShowGeobase(): any {
    if (this.isGuest) {
      console.log('NOT LOGGED-IN');
      // LOGIN
      // SAVING OPERATION TO PERFORM AFTER LOGIN
      const index = this.afterLoginOperations.findIndex(
        (op) => op.type === 'showGeobase'
      );
      if (index === -1) {
        // IF NO TOWER LAYER SAVE REQUEST PRESENT
        this.afterLoginOperations.push({ type: 'showGeobase' });
      } else {
        // IF TOWER LAYER SAVE REQUEST PRESENT, SAVING RECENT REQUEST ONLY
        this.afterLoginOperations[index] = { type: 'showGeobase' };
      }
      this.authObsr.initiateAuthenticationRequest({ from: 'geobar-geobase' });
    } else {
      console.log('ALREADY LOGGED-IN');
      this.showAllGeobases();
    }
  }
  showAllGeobases(): any {
    console.log('In showAllGeobases');
    this.showGeobaseArea = true;
    this.geoSessionDataColleced = false;
    const includeDefaultGeobase = false;
    this.geoSessionsList = [];
    this.geobaseService.getGeobasesList(includeDefaultGeobase).subscribe(
      (geobaseList) => {
        console.log('Got geobaseList info', geobaseList);
        if (!this.commonService.isValid(geobaseList)) {
          console.log('No geobaseList present');
        } else {
          console.log('geobaseList present');
          if (geobaseList.length > 0) {
            geobaseList.forEach((geobase) => {
              this.geoSessionsList.push({
                name: geobase.name,
                id: geobase.sessionId,
                uuid: null,
                type: 'myFiles',
                label: this.getSessionLabel(geobase),
              });
              console.log(
                'geobaseList iterating ',
                this.geoSessionsList,
                geobase
              );
            });
          }
        }
        this.geoSessionDataColleced = true;
      },
      (error) => {
        console.log('Error while getting geobaseList');
        console.log(error);
        this.geoSessionDataColleced = true;
        this.geoSessionsList = [];
        if (error.errorCode === 500) {
        }
      }
    );
  }

  // EXCEL=============================
  removeSheet(e) {
    for (let i = 0; i < this.ExcelSheets.length; i++) {
      if (parseInt(e.target.id) === i) {
        this.ExcelSheets.splice(i, 1);
        const spliced_data = this.arrraydataSheet.splice(i, 1);
        const data = spliced_data[0].data;
        //  this.ExceljsonData.splice(data,1)
        const check_deleted = delete this.ExceljsonData[data];

        this.ExcelFinal = this.ExceljsonData[`${this.ExcelSheets[0]}`];
        this.ExcelHeading = this.ExceljsonDataHeading[`${this.ExcelSheets[0]}`];

        this.ExcelHeading2 = Object.keys(this.ExcelHeading[0]);
        const dataFinal = [];
        for (let i = 0; i < this.ExcelFinal.length; i++) {
          dataFinal.push(Object.values(this.ExcelFinal[i]));
        }

        this.ExcelFinal2 = dataFinal;
      }
    }
  }

  showSheet(e) {
    for (let i = 0; i < this.arrraydataSheet.length; i++) {
      if (parseInt(e.target.id) === i) {
        this.sheet = this.arrraydataSheet[i].data;

        this.ExcelFinal = this.ExceljsonData[`${this.sheet}`];

        this.ExcelHeading = this.ExceljsonDataHeading[`${this.sheet}`];

        this.ExcelHeading2 = Object.keys(this.ExcelHeading[0]);
        const data = [];
        for (let i = 0; i < this.ExcelFinal.length; i++) {
          data.push(Object.values(this.ExcelFinal[i]));
        }

        this.ExcelFinal2 = data;
      }
    }
  }

  setExceDataSheet(sheetData): any {
    this.baseMapService.onGeobarDataAddingToPopup.subscribe(() => {
      this.showExcelData = true;
      this.ExcelSheets = FileUtil.ExcelSheets;
      for (let i = 0; i < this.ExcelSheets.length; i++) {
        //creating object
        const obj = {
          id: `${i}`,
          data: `Sheet${i + 1}`,
        };
        //pushing into array
        this.arrraydataSheet.push(obj);
      }

      this.ExceljsonDataHeading = [FileUtil.ExcelData][0];
      this.ExceljsonData = [FileUtil.ExcelData][0];
      this.ExcelFinal = this.ExceljsonData[this.arrraydataSheet[0].data];
      this.ExcelHeading =
        this.ExceljsonDataHeading[this.arrraydataSheet[0].data];
      this.ExcelHeading2 = Object.keys(this.ExcelHeading[0]);
      const data = [];
      for (let i = 0; i < this.ExcelFinal.length; i++) {
        data.push(Object.values(this.ExcelFinal[i]));
      }
      this.ExcelFinal2 = data;
    });
  }

  uploadExcel(e) {
    for (let i = 0; i < this.ExcelHeading2.length; i++) {
      if (e == i) {
        this.data = this.ExcelHeading2[i];
        console.log(this.data, 'data');
        let arr = [];
        for (let i = 0; i < this.ExcelFinal.length; i++) {
          arr.push(this.ExcelFinal[i]);
        }
        this.newArrayOfObj = arr.map(
          ({ [`${this.data}`]: Latitude, ...rest }) => ({
            Latitude,
            ...rest,
          })
        );
        console.log(this.newArrayOfObj, 'sushma');
        const dataTypeCheck = [];
        for (let j = 0; j < this.ExcelFinal.length; j++) {
          dataTypeCheck.push(this.ExcelFinal[j][this.data]);

          if (typeof dataTypeCheck[0] == 'number') {
            this.uploadExcelObject = dataTypeCheck;
          } else {
            window.alert('Select number type');
            return;
          }
        }
      }
    }
  }

  uploadExcel1(e) {
    for (let i = 0; i < this.ExcelHeading2.length; i++) {
      if (e == i) {
        this.data2 = this.ExcelHeading2[i];
        console.log(this.data2, 'data2');
        this.newArrayOfObj1 = this.newArrayOfObj.map(
          ({ [`${this.data2}`]: Longitude, ...rest }) => ({
            Longitude,
            ...rest,
          })
        );

        console.log(this.newArrayOfObj1, 'shiva');
        const dataTypeCheck2 = [];

        for (let j = 0; j < this.ExcelFinal.length; j++) {
          dataTypeCheck2.push(this.ExcelFinal[j][this.data2]);
          if (typeof dataTypeCheck2[0] == 'number') {
            this.uploadExcelObject2 = dataTypeCheck2;
          } else {
            window.alert('Select number type');
            return;
          }
        }
      }
    }
  }
  UploadExcel() {
    console.log(this.data, this.data2, 'data data2 check');
    if (this.data === this.data2) {
      window.alert('Selected the same inputs for latitude and longitude');
      return;
    }
    this.ExcelObject = JSON.stringify(this.newArrayOfObj1);

    console.log(this.ExcelObject, 'UPLOAD EXCEL DATA', this.newArrayOfObj1);

    const obj = {
      id: this.sheet,
      // data : this.ExcelObject
      data: this.newArrayOfObj1,
    };
    //pushing into array

    console.log(obj, 'fINAL');
    // Here Getting return data?
    const returnData = this.geobarService.returnDataToGeobar;
    returnData.metadata = JSON.stringify(obj);
    console.log('before call tower');
    this.baseMapService.setLayerToGeotower(returnData);
    console.log('after call tower');
  }

  // PDF============================================
  showPage(e) {
    for (let i = 0; i < this.pagearr.length; i++) {
      console.log(e.target.id, this.pagearr[i].id, 'check id and array');

      if (parseInt(e.target.id) === parseInt(this.pagearr[i].id)) {
        this.page = this.pagearr[i].data;
        console.log(this.page, 'pageeeeeee');

        this.PdfFinal = this.PDFFinal2[Number(e.target.id)];
        console.log(this.PdfFinal, 'uuuuuuuuu');

        var data = [];
        data.push(this.PdfFinal);
        this.PdfFinal3 = data;
        console.log(this.PdfFinal3, 'check PDFData Showpage');
      }
    }
  }
  uploadpdf() {
    console.log(this.PDFFinal2, 'Check upload pdfs');
  }
  RemovePage(e) {
    var data = [];
    data.push(Object.values(this.PdfFinal)[0]);
    this.PdfFinal3 = data;
    delete this.PDFFinal2[e.target.id];
    delete this.PdfFinal3;

    this.PDFFinal2.splice(Number(e.target.id), 1);

    console.log(this.PDFFinal2, 'Check PDFData after Remove');
  }

  _setClientLayerToTower(pageData): any {
    this.baseMapService.onLayerAddedToTower.subscribe(() => {
      this.showPDF = true;
      this.num = this.pdf_json[0];
      console.log(this.num['Page-1']);

      this.pdfpages_num = this.num['TotalPages'];
      this.pagearr = [];

      for (let i = 0; i < this.pdfpages_num; i++) {
        //creating object
        const obj = {
          id: `${i}`,
          data: `Page-${i + 1}`,
        };

        //pushing into array
        this.pagearr.push(obj);
      }

      this.pdfarrr = [];
      for (let i = 0; i < this.pdfpages_num; i++) {
        this.pdfarrr.push(this.num[this.pagearr[i].data]);
      }

      this.PdfFinal = this.num[this.page];

      const data = [];
      data.push(Object.values(this.PdfFinal)[0]);
      this.PdfFinal3 = data;
      console.log(this.PdfFinal3, 'check pdf Data');

      const data1 = [];
      for (let i = 0; i < this.pdfpages_num; i++) {
        data1.push(Object.values(this.pdfarrr[i])[0]);
      }
      this.PDFFinal2 = data1;
      console.log(this.PDFFinal2, 'check Common access data of PDF');
    });
  }

  selectedAwsFile(selectedFileUrls): any {
    console.log('In selectedAwsFile');
    console.log(selectedFileUrls);
    this.closeFilePickerOptions();
    const eventOptions = {
      fileUrls: selectedFileUrls,
      alertComponent: this.alertComponent,
      zip_file: zip,
      fileEvent: 'event',
      geobar: this,
    };
    this.geobarService.activateEvent(eventOptions, 'AwsUrl');
  }

  // method for validating Rectangular Inputs
  private _validateRectInput(inputValue): any {
    console.log(inputValue, 'input value check...');
    this.geobarValidationStatus = this.validStates.UNKNOWN;
    // Condition - 1 : if no input calling local directory
    if (!this.commonService.isValid(inputValue)) {
      this.faClass = '';
      this._getAlertMessage(
        this.alertComponent,
        'Try typing a location name or coordinates.'
      );
      console.log('checkglobalrectvalue');
    } else {
      const RectcoordinatesRegexInd =
        /^\d{1,2},\d{2},\d{3}\.\d{4} \d{1,2},\d{2},\d{3}\.\d{4}$/;

      const RectcoordinatesRegexInt =
        /^(\d{1,3}(?:,\d{3})*)\.\d{4} (\d{1,3}(?:,\d{3})*)\.\d{4}$/;

      const RectcoordinatesRegexSpace = /^\d{1,9}\.\d{1,4} \d{1,9}\.\d{1,4}$/;

      const RectcoordinatesRegexcommaspace =
        /^\d{1,9}\.\d{1,4}, \d{1,9}\.\d{1,4}$/;

      const RectCoordinatesRegexComma = /^\d{1,9}\.\d{1,4},\d{1,9}\.\d{1,4}$/;

      const ReturnRectcoordinatesRegexInd = this._validateRectSearch(
        inputValue,
        RectcoordinatesRegexInd
      );
      const ReturnRectcoordinatesRegexInt = this._validateRectSearch(
        inputValue,
        RectcoordinatesRegexInt
      );
      const ReturnRectcoordinatesRegexSpace = this._validateRectSearch(
        inputValue,
        RectcoordinatesRegexSpace
      );
      const ReturnRectcoordinatesRegexcommaspace = this._validateRectSearch(
        inputValue,
        RectcoordinatesRegexcommaspace
      );
      const ReturnRectcoordinatesRegexcomma = this._validateRectSearch(
        inputValue,
        RectCoordinatesRegexComma
      );

      if (ReturnRectcoordinatesRegexInd) {
        this.globalRectValue = inputValue
          .split(' ')
          .map((val) => val.replace(/,/g, ''));
        console.log(
          ReturnRectcoordinatesRegexcomma,
          this.globalRectValue,
          'checkglobalrectvalue1'
        );
      } else if (ReturnRectcoordinatesRegexInt) {
        this.globalRectValue = inputValue
          .split(' ')
          .map((val) => val.replace(/,/g, ''));
        console.log(
          ReturnRectcoordinatesRegexcomma,
          this.globalRectValue,
          'checkglobalrectvalue2'
        );
      } else if (ReturnRectcoordinatesRegexSpace) {
        this.globalRectValue = inputValue.split(' ');
        console.log(
          ReturnRectcoordinatesRegexcomma,
          this.globalRectValue,
          'checkglobalrectvalue3'
        );
      } else if (ReturnRectcoordinatesRegexcommaspace) {
        this.globalRectValue = inputValue.split(',').map((val) => val.trim());
        console.log(
          ReturnRectcoordinatesRegexcommaspace,
          this.globalRectValue,
          'checkglobalrectvalue4'
        );
      } else if (ReturnRectcoordinatesRegexcomma) {
        this.globalRectValue = inputValue.split(',');
        console.log(
          ReturnRectcoordinatesRegexcomma,
          this.globalRectValue,
          'checkglobalrectvalue5'
        );
      } else {
        console.log('Search input text not valid');

        // BECAUSE ADDRESS SELECTION EVENT TRIGGERS LATE BY FEW SECs.
        setTimeout(() => {
          if (!this.userTryingToLocationSearch) {
            // USER NOT LOOKING FOR A LOCATION
            console.log('USER NOT LOOKING FOR A LOCATION');
            this._getAlertMessage(this.alertComponent);
            this.geobarValidationStatus = this.validStates.INVALID;
          } else {
            // USER LOOKING FOR A LOCATION. DON'T THROW ERROR.
            console.log("USER LOOKING FOR A LOCATION. DON'T THROW ERROR");
          }
        }, 1000);
      }
    }
  }

  _validateRectSearch(inputValue: string, regex: RegExp): boolean {
    return regex.test(inputValue);
  }

  // this validate method used for input text validating and calling realated method
  private _validateInputText(inputValue): any {
    console.log(inputValue, 'input value check...');
    this.geobarValidationStatus = this.validStates.UNKNOWN;
    // Condition - 1 : if no input calling local directory
    if (!this.commonService.isValid(inputValue)) {
      this.faClass = '';
      this._getAlertMessage(
        this.alertComponent,
        'Try typing a location name or coordinates.'
      );
    } else {
      // Condition - 2 : if input coordinates validate it and add markers
      // const coordinatesRegex = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/g;
      const coordinatesRegexOld =
        /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)?(|\s([0-5][0-9]?))?(|\s([0-5][0-9]?))(|\s),(|\s)[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)?(|\s([0-5][0-9]?))?(|\s([0-5][0-9]?))$/g;
      const coordinatesRegex =
        /^(|\s+)[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)?(|\s+([0-5][0-9]([.][0-9]+)?))?(|\s+([0-5][0-9]([.][0-9]+)?))(|\s+),(|\s+)[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)?(|\s+([0-5][0-9]([.][0-9]+)?))?(|\s+([0-5][0-9]([.][0-9]+)?))\s*$/g;
      const coordinatesRegexReverse =
        /^(|\s+)[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)?(|\s+([0-5][0-9]([.][0-9]+)?))?(|\s+([0-5][0-9]([.][0-9]+)?))(|\s+),(|\s+)[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)?(|\s+([0-5][0-9]([.][0-9]+)?))?(|\s+([0-5][0-9]([.][0-9]+)?))\s*$/g;
      const dmscoordinatesRegex = /([°′″EWNS])/g;
      const coordinatesRegexWithOutComma =
        /^(|\s+)[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)?(|\s+([0-5][0-9]([.][0-9]+)?))?(|\s+([0-5][0-9]([.][0-9]+)?))\s(|\s+)[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)?(|\s+([0-5][0-9]([.][0-9]+)?))?(|\s+([0-5][0-9]([.][0-9]+)?))\s*$/g;
      const coordinatesRegexReverseWithOutComma =
        /^(|\s+)[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)?(|\s+([0-5][0-9]([.][0-9]+)?))?(|\s+([0-5][0-9]([.][0-9]+)?))\s(|\s+)[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)?(|\s+([0-5][0-9]([.][0-9]+)?))?(|\s+([0-5][0-9]([.][0-9]+)?))\s*$/g;

      const urlRegex =
        /^(|\s)(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/g;
      const wmsUrlMatchReturnResult = this._validateSearchTextLatLng(
        inputValue,
        urlRegex
      );

      const latLongMatchReturnResults = this._validateSearchTextLatLng(
        inputValue,
        coordinatesRegex
      );
      const DMSMatchReturnResults = this._validateSearchTextLatLng(
        inputValue,
        dmscoordinatesRegex
      );
      const longLatMatchReturnResults = this._validateSearchTextLatLng(
        inputValue,
        coordinatesRegexReverse
      );
      const latLongMatchReturnResultsWithOutComma =
        this._validateSearchTextLatLng(
          inputValue,
          coordinatesRegexWithOutComma
        );
      const longLatMatchReturnResultsWithOutComma =
        this._validateSearchTextLatLng(
          inputValue,
          coordinatesRegexReverseWithOutComma
        );

      if (latLongMatchReturnResults) {
        console.log('VALID LAT LONGS FOUND', latLongMatchReturnResults);
        this.activeSearchOptionLLC = true;
        this.faClass = 'activeLLC';
        const eventOptions = {
          inputValue,
          geobar: this,
          isDMS: false,
          isReverseLatlng: false,
        };
        this.geobarService.activateEvent(eventOptions, 'SearchLocation');
        this.geobarValidationStatus = this.validStates.VALID;
        console.log('decimal check', eventOptions);
      } else if (wmsUrlMatchReturnResult) {
        console.log('VALID WMS URLS FOUND', wmsUrlMatchReturnResult);
        this.activeSearchOptionASB = false;
        const eventOptions = { inputValue, geobar: this };
        const returnList = this.geobarService.activateEvent(
          eventOptions,
          'ServiceURL'
        );
        this.geobarValidationStatus = this.validStates.VALID;
      } else if (DMSMatchReturnResults) {
        console.log('VALID DMS lat lng FOUND', DMSMatchReturnResults);
        this.activeSearchOptionLLC = true;
        this.faClass = 'activeLLC';
        const eventOptions = {
          inputValue,
          geobar: this,
          isDMS: true,
          isReverseLatlng: false,
        };
        this.geobarService.activateEvent(eventOptions, 'SearchLocation');
        this.geobarValidationStatus = this.validStates.VALID;
      } else if (longLatMatchReturnResults) {
        console.log('VALID LONG LAT Reverse FOUND', longLatMatchReturnResults);
        this.activeSearchOptionLLC = true;
        this.faClass = 'activeLLC';
        const eventOptions = {
          inputValue,
          geobar: this,
          isDMS: false,
          isReverseLatlng: true,
        };
        this.geobarService.activateEvent(eventOptions, 'SearchLocation');
        this.geobarValidationStatus = this.validStates.VALID;
      } else if (latLongMatchReturnResultsWithOutComma) {
        console.log(
          'VALID LAT LONG WITH OUT COMMA FOUND',
          latLongMatchReturnResultsWithOutComma
        );
        this.activeSearchOptionLLC = true;
        this.faClass = 'activeLLC';
        const eventOptions = {
          inputValue,
          geobar: this,
          isDMS: false,
          isReverseLatlng: false,
        };
        this.geobarService.activateEvent(eventOptions, 'SearchLocation');
        this.geobarValidationStatus = this.validStates.VALID;
      } else if (longLatMatchReturnResultsWithOutComma) {
        console.log(
          'VALID LONG LAT Reverse WITH OUT COMMA FOUND',
          longLatMatchReturnResultsWithOutComma
        );
        this.activeSearchOptionLLC = true;
        this.faClass = 'activeLLC';
        const eventOptions = {
          inputValue,
          geobar: this,
          isDMS: false,
          isReverseLatlng: true,
        };
        this.geobarService.activateEvent(eventOptions, 'SearchLocation');
        this.geobarValidationStatus = this.validStates.VALID;
      } else {
        console.log('Search input text not valid');

        // BECAUSE ADDRESS SELECTION EVENT TRIGGERS LATE BY FEW SECs.
        setTimeout(() => {
          if (!this.userTryingToLocationSearch) {
            // USER NOT LOOKING FOR A LOCATION
            console.log('USER NOT LOOKING FOR A LOCATION');
            this._getAlertMessage(this.alertComponent);
            this.geobarValidationStatus = this.validStates.INVALID;
          } else {
            // USER LOOKING FOR A LOCATION. DON'T THROW ERROR.
            console.log("USER LOOKING FOR A LOCATION. DON'T THROW ERROR");
          }
        }, 1000);
      }
    }
  }

  // validating coordinates input
  private _validateSearchTextLatLng(inputValue, regex): any {
    inputValue = inputValue; // .replace(/\s/g, '');
    let returnResults = false;
    let regexVariable;
    while ((regexVariable = regex.exec(inputValue)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (regexVariable.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      // The result can be accessed through the `regexStr`-variable.
      regexVariable.forEach((match, groupIndex) => {
        console.log(`Found match, group ${groupIndex}: ${match}`);
        returnResults = true;
      });
    }
    return returnResults;
  }

  dropDownClickEvent(event, latlngObj): any {
    console.log(' DropDown clicked Event ', latlngObj);
    // Here need to call base and add marker
    this.geobarService.addMarker(latlngObj.lat, latlngObj.lng);
    this.searchValue = latlngObj.lat + ',' + latlngObj.lng;
  }

  onShapefileUpload(event): any {
    if (event.target.files.length > 0) {
      console.log(this.geoTowerService.clientObjList);
      console.log(this.geoTowerService.geotowerLayersList);
      // here changed to clientObjList to geotowerLayersList, it should resolve the issue of server list filtering
      const clientObjResult = this.geoTowerService.geotowerLayersList.filter(
        (item) => {
          return item.name === event.target.files[0].name.split('.')[0];
        }
      );
      console.log(
        clientObjResult,
        this.geoTowerService.geotowerLayersList.indexOf(
          event.target.files[0].name.split('.')[0]
        )
      );
      if (clientObjResult.length > 0) {
        this._getAlertMessage(
          this.alertComponent,
          'Duplicate file found, Please try with new file!!'
        );
        // alert('Duplicate file found, Please try with new file!!');
      } else {
        const eventOptions = {
          files: event.target.files,
          alertComponent: this.alertComponent,
          zip_file: zip,
          fileEvent: event,
          geobar: this,
        };
        this.geobarService.activateEvent(eventOptions, 'Upload');
      }
      event.srcElement.value = '';
    }
  }

  loadDropDownContent(latlngList): any {
    this.latLngsList = latlngList;
  }

  loadURLElContent(wmsLayerImg): any {
    this.activewmsImg = false;
    this.wmsimg = wmsLayerImg;
  }

  clickASBWMS(event, url): any {
    this.activewmsImg = false;
    this.geobarService.addwmsLayer(url, this.urlLayerjsonObj);
    this.clearASB(event, '');
  }

  clearASB(event, inputValue): any {
    console.log('clicked clear ASB ', event, inputValue);
    this.geobarValidationStatus = this.validStates.UNKNOWN;
    this.activewmsImg = false;
    this.activeSearchOptionASB = false;
    this.searchValue = ' ';
    this.searchValue = null;
  }

  clearLLC(event, inputValue): any {
    console.log('clicked clear  LLC ', event, inputValue);
    // this.activeSearchOptionLLC = false;
    this.showLatLongCombinations = false;
    this.searchValue = ' ';
    this.searchValue = null;
  }

  private _getAlertMessage(
    alertComponent,
    msg: string = 'Invalid Coordinates, Please check your Coordinate system.'
  ): any {
    const alertMessage = msg;
    alertComponent.setAlertMessage(alertMessage);
    this.searchValue = ' ';
    this.searchValue = null;
  }

  private _closeAlertMessage(alertComponent): any {
    alertComponent.closeAlert();
  }
  textEntered(e): any {
    if (this.isGuest) {
      e.target.value = '';
      // SAVING OPERATION TO PERFORM AFTER LOGIN
      const index = this.afterLoginOperations.findIndex(
        (op) => op.type === 'setFocusToType'
      );
      if (index === -1) {
        // IF NO REQUEST PRESENT
        this.afterLoginOperations.push({ type: 'setFocusToType' });
      } else {
        // IF REQUEST PRESENT, SAVING RECENT REQUEST ONLY
        this.afterLoginOperations[index] = { type: 'setFocusToType' };
      }
      this.authObsr.initiateAuthenticationRequest({ from: 'geobar' });
      setTimeout(() => {
        document.getElementById('geo-address-bar').blur();
      }, 500);
    } else {
      this.geobarValidationStatus = this.validStates.UNKNOWN;
      if (
        e.key === 'Backspace' ||
        e.code === 'Backspace' ||
        e.key === 'Delete' ||
        e.code === 'Delete'
      ) {
        if (e.target.value === '') {
          this.clearASB(e, e);
          this.clearLLC(e, e);
          this.geobarService.removeMarker();
          this._closeAlertMessage(this.alertComponent);
          // dropDown.close();
          this.activeSearchOptionLLC = false;
          this.showLatLongCombinations = false;
          this.showDropDownWithOptions = false;
        }
        this.userTryingToLocationSearch = false;
      }
    }
  }
  setLayerUploadStatus(num): any {
    this.layerUploadStatusInPercentage = num;
    this.authObsr.updateLayerUploadStatus({
      progress: this.layerUploadStatusInPercentage,
      status: 'inprogress',
    });
    if (this.layerUploadStatusInPercentage >= 100) {
      setTimeout(() => {
        this.closeLayerUploadStatus();
      }, 5000);
    }
  }
  enableLayerUploadStatus(): any {
    this.showLayerUploadStatus = true;
  }
  hideLayerUploadStatus(msg = ''): any {
    this.showLayerUploadStatus = false;
    this.layerUploadStatusInPercentage = 0;
    this.authObsr.updateLayerUploadStatus({
      progress: this.layerUploadStatusInPercentage,
      status: msg,
    });
  }
  closeLayerUploadStatus(): any {
    this.hideLayerUploadStatus();
  }

  closeCfmWindow(): any {
    this.showCfmWindow = false;
    this.minimizedWindow = false;
  }

  closeUcr(): any {
    this.showUcrWindow = false;
    this.minimizedUcrWindow = false;
  }

  getGeobaseListByFilter(selectedFilter): any {
    if (!this.isGuest) {
      this.getGeobaseListByFilterProcess(selectedFilter);
    }
  }

  getGeobaseListByFilterProcess(selectedFilter): any {
    console.log('selecting the geobase list filter ', selectedFilter);
    this.geoSessionsList = [];
    this.geoSessionDataColleced = false;
    this.geobaseService.getGeobasesListByFilter(selectedFilter).subscribe(
      (geobaseList) => {
        console.log('Got geobaseList info in filter', geobaseList);
        if (!this.commonService.isValid(geobaseList)) {
          console.log('No geobaseList present in filter');
        } else {
          console.log('geobaseList present');

          if (geobaseList.length > 0) {
            geobaseList.forEach((geobase) => {
              let uuidValue = null;
              if (geobase.sessionShare != null) {
                uuidValue = geobase.sessionShare.uuid;
              }
              this.geoSessionsList.push({
                name: geobase.session.name,
                id: geobase.session.sessionId,
                uuid: uuidValue,
                type: selectedFilter,
                label: this.getSessionLabel(geobase),
              });
              console.log(
                'geobaseList iterating in filter ',
                this.geoSessionsList,
                geobase.session
              );
            });
          }
        }
        this.geoSessionDataColleced = true;
      },
      (error) => {
        console.log('Error while getting geobaseList in filter');
        console.log(error);
        this.geoSessionDataColleced = true;
        this.geoSessionsList = [];
        if (error.errorCode === 500) {
        }
      }
    );
  }

  showGeoSession(session): any {
    console.log('session is session', session);
    if (session.type === 'shareWithMe') {
      window.open('/share/' + session.id, '_blank');
    } else {
      window.open('/session/' + session.id, '_blank');
    }
  }

  /**
   * FOR COVID PAGES GEOPAD SITE WORK
   */

  createSite(): void {
    let errorsFound = false;
    this.siteErrMsg = '';
    this.siteSavingStatus = '';
    let selecteProject: any = {};
    try {
      const projIndex = this.projects.findIndex((val) => val.selected === true);
      if (projIndex !== -1) {
        selecteProject = this.projects[projIndex];
      } else {
        throw new Error('Please select Need or Availability');
      }
      console.log(this);
      console.log(this.topicSelect);
      console.log(this.topicSelect.value);
      if (!this.commonService.isValid(this.topicSelect.value)) {
        throw new Error('Please select resources.');
      } else if (!this.commonService.isValid(this.titleCtrl.value)) {
        throw new Error('Please enter title.');
      } else if (!this.commonService.isValid(this.contactCtrl.value)) {
        throw new Error('Please enter contact details.');
      } else if (!this.commonService.isValid(this.descCtrl.value)) {
        throw new Error('Please enter description.');
      }
    } catch (e) {
      errorsFound = true;
      this.siteErrMsg = e;
      setTimeout(() => {
        this.siteErrMsg = '';
      }, 5000);
      console.log(e);
    }
    if (!errorsFound) {
      let siteTags: any = [];
      if (this.commonService.isValid(this.tagsCtrl.value)) {
        siteTags = String(this.tagsCtrl.value).split(';');
      }
      const dataToSend = {
        observationInstanceId: null, // currentSite.observationInstanceId,
        locationName: this.titleCtrl.value, // siteNameInput,
        description: `${this.contactCtrl.value}, ${this.descCtrl.value}`, // notesDescription,
        geopadId: this.currentSession.geopadId,
        geopadNotes: '',
        uiTimestamp: new Date().toISOString(),
        tags: siteTags, // currentSite.tags, // this.locationTags,
        status: 'Active',
        projectId: selecteProject.topicId, // project, // 1,
        topicId: this.topicSelect.value, // topic, // 3,
        placeId: this.places[0].topicId, // place, // 7,
        latitudeLongitude: this.currSiteLocationData, // currentSite.latitudeLongitude,
      };

      console.log('DATA TO SEND: ', dataToSend);
      this.siteSavingStatus = 'inprogress';
      setTimeout(() => {
        this.siteSavingStatus = '';
      }, 5000);
      this.notePadService
        .saveSingleSite(dataToSend, this.currentSession.geopadId)
        .subscribe(
          (result) => {
            console.log(result);
            // this.authObsr.updateRefreshSites(String(new Date().getTime()));
            this.closeAddSite();
            this.showAddSiteSuccessMsg = true;
            setTimeout(() => {
              this.showAddSiteSuccessMsg = false;
            }, 5000);
          },
          (error) => {
            console.log('Error while saving notes');
            this.siteSavingStatus = 'error';
            console.log(error);
            setTimeout(() => {
              this.siteSavingStatus = '';
            }, 5000);
          }
        );
    }
  }

  gotoGeopad(): void {
    this.authObsr.updateRefreshSites(String(new Date().getTime()));
    this.showAddSiteSuccessMsg = false;
  }

  showAddSiteScreen(): void {
    this.showAddSiteWindow = true;
    this.siteSavingStatus = '';
    this.getProjectsList();
  }
  closePreviousMarkers(): void {
    this.showAddSiteWindow = false;
    if (this.watchOnPolygonChangesSubs) {
      this.watchOnPolygonChangesSubs.unsubscribe();
    }
    if (this.currSiteLocationData.length > 0) {
      this.showOrCloseLocationOnMap(
        { latitudeLongitude: this.currSiteLocationData },
        null,
        'close'
      );
    }
    this.baseMapService.getCurrentBasemap().removeOverlay(this.markerTailLayer);
    this.notePadService.clearPolygonDrawingTools();
    this.currSiteLocationData = [];
  }
  closeAddSite(): void {
    // ENABLE THIS ON CLICK MAP => MOVE MARKER
    this.closePreviousMarkers();
    this.clearAllGeobarItems('');
    this.projects.forEach((element) => {
      element.selected = false;
    });
    this.topicSelect.reset();
    this.titleCtrl.reset();
    this.contactCtrl.reset();
    this.descCtrl.reset();
    this.tagsCtrl.reset();
  }
  updatePolygonOnChanges(watchOnPolygonChanges: Subject<any>): void {
    this.watchOnPolygonChangesSubs = watchOnPolygonChanges.subscribe(
      (polygonChanged) => {
        console.log('POLYGON CHANGED');
        console.log(polygonChanged);
        let coords;
        const coordsList = [];
        // coords = [res['co-ordinates']];
        polygonChanged['co-ordinates'].forEach((latLngList) => {
          console.log(latLngList);
          // CO-ORDINATES `[78.534344232, 17.534435435]` <=> `[LONGITUDE, LATITUDE]`
          coordsList.push(latLngList);
        });
        console.log(coordsList);
        coords = coordsList;
        this.currSiteLocationData = coords;
        this.markerTailLayer.setPosition([coords[0], coords[1]]);
      }
    );
  }

  getLatLongsToShow(locationData: Array<number>): Array<string> {
    console.log('In latitudeLongitude');
    console.log(locationData);
    const tempData: Array<string> = [];
    for (let index = 0; index < locationData.length; index = index + 2) {
      console.log(index);
      console.log(locationData[index]);
      console.log(locationData[index + 1]);
      try {
        tempData.push(
          Number(locationData[index + 1])
            .toFixed(4)
            .toString()
        );
      } catch (e) {
        console.log(e);
      }
      try {
        tempData.push(Number(locationData[index]).toFixed(4).toString());
      } catch (e) {
        console.log(e);
      }
    }
    console.log('end');
    return tempData;
  }

  showOrCloseLocationOnMap(
    note: any,
    watchOnPolygonChanges: Subject<any>,
    operation = ''
  ): any {
    console.log('In showLocationOnMap');
    console.log(note);
    let geometryData: any;
    const currentContextInfo: any = {};
    currentContextInfo.site = note;
    geometryData = {
      type: this.notePadService.shapeDrawType.POINT, // 'Point',
      coordinates: [
        Number(note.latitudeLongitude[0]),
        Number(note.latitudeLongitude[1]),
      ],
    };
    const data = {
      features: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: geometryData,
            properties: { '': note.description },
          },
        ],
      },
      name: `observationInstanceId_${this.tempCreateSiteId}`,
    };

    let layerFound = false;
    let addedLayerObj: any;
    this.baseMapService
      .getCurrentBasemap()
      .getLayers()
      .forEach((layerObj) => {
        if (layerObj !== undefined) {
          if (layerObj.values_.name === data.name) {
            layerFound = true;
            addedLayerObj = layerObj;
          }
        }
      });
    if (layerFound) {
      console.log('REMOVING POINT OR POLYGON');
      this.baseMapService.getCurrentBasemap().removeLayer(addedLayerObj);
    } else if (operation === '') {
      // ONLY OF OPERATION is '', IT SHOULD WORK IN TOGGLE MODE
      console.log('ADDING POINT');
      this.notePadService.reDrawPointOrPolygonOnMap(
        this.notePadService.shapeDrawType.POINT,
        data,
        true,
        watchOnPolygonChanges,
        currentContextInfo
      );
    }
  }

  getProjectsList(): any {
    console.log('getting the projects list');
    this.topicsService
      .getProjectsList('COVID19', this.globalObject.geobase.organizationId)
      .subscribe(
        (projectInfo) => {
          console.log('Got projectInfo info', projectInfo);
          console.log('projectInfo present', projectInfo);
          if (!this.commonService.isValid(projectInfo)) {
            console.log('No topicsInfo present');
            this.projects = [];
          } else {
            this.projects = projectInfo;
          }

          this.projects.forEach((element) => {
            element.selected = false;
          });
          if (this.projects.length > 0) {
            this.projects[0].selected = true;
          }
          let selectedProjectId = null;
          const projSelectedIndex = this.projects.findIndex(
            (val) => val.selected === true
          );
          if (projSelectedIndex !== -1) {
            selectedProjectId = this.projects[projSelectedIndex].topicId;
            this.getPlacesListByProjectId(selectedProjectId);
          }
          this.selectedProjectId = selectedProjectId;
        },
        (error) => {
          console.log('Error while getting projectInfo');
          console.log(error);
        }
      );
  }
  onProjectChange(event, proj): void {
    console.log('onProjectChanged');
    console.log(event);
    console.log(proj);
    const boxVal = event.target.checked;
    const projIndex = this.projects.findIndex(
      (val) => val.topicId === proj.topicId
    );
    console.log(`proj index : ${projIndex}`);
    if (projIndex !== -1) {
      this.projects.forEach((element) => {
        element.selected = false;
      });
      this.projects[projIndex].selected = boxVal;
    }

    let selectedProjectId = null;
    const projSelectedIndex = this.projects.findIndex(
      (val) => val.selected === true
    );
    console.log(`selected index : ${projSelectedIndex}`);
    console.log(this.projects);
    if (projSelectedIndex !== -1) {
      selectedProjectId = this.projects[projSelectedIndex].topicId;
      this.getPlacesListByProjectId(selectedProjectId);
    }
    this.selectedProjectId = selectedProjectId;
  }

  getPlacesListByProjectId(projectId): any {
    console.log('getting the places list', projectId);
    this.places = [
      {
        createdDate: null,
        description: 'Place is world wide',
        name: 'world-wide',
        organizationId: 5,
        parentTopicId: 994,
        status: 'Active',
        topicId: 1010,
        topicUsage: 1,
        updatedDate: null,
      },
    ];
    this.selectedPlaceId = this.places[0].topicId;
    this.getTopicsListByPlaceId(this.selectedPlaceId);
  }

  getTopicsListByPlaceId(placeId): any {
    console.log('getting the topics list', placeId);
    this.topicsService.getTopicsListByPlaceId(placeId).subscribe(
      (topicsInfo) => {
        console.log('Got topicsInfo info', topicsInfo);
        if (!this.commonService.isValid(topicsInfo)) {
          console.log('No topicsInfo present');
          this.topics = [];
        } else {
          console.log('topicsInfo present', topicsInfo);
          this.topics = topicsInfo;
          if (this.topics.length > 0) {
            this.topicSelect.setValue(this.topics[0].topicId);
          }
        }
      },
      (error) => {
        console.log('Error while getting topicsInfo');
        console.log(error);
      }
    );
  }
  getSessionLabel(geobase): string {
    try {
      if (this.commonService.isValid(geobase.createdDate)) {
        const currTime = new Date().getTime(); // In Milli seconds
        const createdTime = new Date(
          this.commonService.parseDateForSafariSupport(geobase.createdDate)
        ).getTime(); // In Milli seconds
        const oneDay = 86400000; // Milli seconds
        if (currTime - createdTime < oneDay * 2) {
          return 'New';
        } else {
          return 'Old';
        }
      } else {
        return '';
      }
    } catch (e) {
      console.log(e);
      return '';
    }
  }
}
