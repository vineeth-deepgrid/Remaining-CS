import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChange,
  AfterViewInit,
  OnChanges,
} from '@angular/core';
import * as $ from 'jquery';
import { BasemapService } from 'src/app/basemap/basemap.service';
import { FileUtil } from 'src/app/geobar/util/fileUtil';
import { KMLGroundOverlayParsing } from 'src/app/geobar/util/kmlGroundOverlayParsing';
import { AuthObservableService } from 'src/app/Services/authObservableService';
import { CommonService } from 'src/app/Services/common.service';
import { GeotrayService } from '../geotray.service';
//import { SlopeFinderComponent } from '../slope-finder/slope-finder.component';
//import { BufferToolComponent } from '../buffer-tool/buffer-tool.component';
@Component({
  selector: 'app-geotray-menu',
  templateUrl: './geotray-menu.component.html',
  styleUrls: ['./geotray-menu.component.scss'],
})
export class GeotrayMenuComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() state: boolean;
  @Output() parentFunction: EventEmitter<any> = new EventEmitter();
  propertiesWindowVisible: any;
  predefinedVisibility: any;
  classifiedVisibility: any;
  blendedVisibility: any;
  collocatedVisibility: any;
  extendedVisibility: any;
  slopefinderVisibility: any;
  buffertoolVisibility: any;
  @Input() wings: any = [];
  @Input() resetAllWings: String = '';
  @Input() isGuest = true;
  @Output() onPropertiesClicked: EventEmitter<boolean> =
    new EventEmitter<boolean>();
  @Output() onslopeClicked: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() onbufferClicked: EventEmitter<boolean> =
    new EventEmitter<boolean>();
  @Output() onPredefinedClicked: EventEmitter<boolean> =
    new EventEmitter<boolean>();
  @Output() onClassifiedClicked: EventEmitter<boolean> =
    new EventEmitter<boolean>();
  @Output() onBlendedClicked: EventEmitter<boolean> =
    new EventEmitter<boolean>();
  @Output() onCollocatedClicked: EventEmitter<boolean> =
    new EventEmitter<boolean>();
  @Output() onExtendedClicked: EventEmitter<boolean> =
    new EventEmitter<boolean>();
  @Output() onWingHovered: EventEmitter<any> = new EventEmitter<any>();
  @Output() onWingHoveredOut: EventEmitter<any> = new EventEmitter<any>();
  @Output() onWingSelected: EventEmitter<any> = new EventEmitter<any>();
  @Output() onMenuBtnClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() showGeopadWindow: EventEmitter<any> = new EventEmitter<any>();
  // @Output() showPropertyWindow: EventEmitter<any> = new EventEmitter<any>();

  @Output() showGeoSessionWindow: EventEmitter<any> = new EventEmitter<any>();
  @Output() nameEmitter: EventEmitter<string> = new EventEmitter<any>();
  setActive = false;
  currentTooltipContent = '';
  width = 50;
  height = 50;
  showSubOptions = false;
  showProperties = false;
  showbuffer = false;
  showslope = false;
  selectedSubOption: string;
  selectedProperty: string;
  afterLoginOperations: any[] = [];

  constructor(
    private geotrayService: GeotrayService,
    private authObsr: AuthObservableService,
    private commonService: CommonService,
    private predefined1: GeotrayService
  ) {}
  predef: any;
  public fileUtilCallback: (returnData: any) => any;
  kmlParsingProcess: KMLGroundOverlayParsing;
  baseService: BasemapService;
  zipWriter: any;
  validationUploadedFile(inputFiles: any, options: any): void {
    throw new Error('Method not implemented.');
  }
  validationAwsUrl(options: any): void {
    throw new Error('Method not implemented.');
  }
  checkOtherFormatsForAws(inputFiles: any, options: any): void {
    throw new Error('Method not implemented.');
  }
  _createZipFile(inputFiles: any, callback: any): void {
    throw new Error('Method not implemented.');
  }
  getZipFileMethod1(files: any, callback: any): void {
    throw new Error('Method not implemented.');
  }
  addNextFileToZip(currentCount: any, files: any, onSuccess: any): void {
    throw new Error('Method not implemented.');
  }
  getZipFileMethod2(inputFiles: any, finalCallback: any): void {
    throw new Error('Method not implemented.');
  }
  saveZipBlob(blob: any): void {
    throw new Error('Method not implemented.');
  }
  pFileReaderAsText(file: any): Promise<unknown> {
    throw new Error('Method not implemented.');
  }
  pFileReaderAsArrayBuffer(file: any): Promise<unknown> {
    throw new Error('Method not implemented.');
  }
  pBufferReaderAsText(buffer: any): Promise<unknown> {
    throw new Error('Method not implemented.');
  }
  public _processXLSXFilesList(inputFile: any): void {
    throw new Error('Method not implemented.');
  }
  public _processCSVFilesList(inputFile: any): void {
    throw new Error('Method not implemented.');
  }
  getFile(files: any, fileType: string): unknown {
    throw new Error('Method not implemented.');
  }

  ngOnInit(): void {
    this.parentFunction.emit('sushma');
    // $(document).ready(function(){
    //   $('.close').click(function(){
    //     // $('ul').toggleClass('active');
    //     $('.circle-menu-card-container').toggleClass('active');
    //   })
    // })
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.setActive = true;
    }, 300);
  }
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    this.predefined1.setPopup(this.predef);
    console.log(this.predefined1, 'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
    console.log(changes);
    if (this.commonService.isValid(changes.resetAllWings)) {
      if (!changes.resetAllWings.firstChange) {
        this.resetWingSelection();
        this.showSubOptions = false;
        this.showProperties = false;
        this.showbuffer = false;
        this.showslope = false;
        this.selectedSubOption = '';
        this.selectedProperty = '';
      }
    }
    if (this.commonService.isValid(changes.isGuest)) {
      if (!changes.isGuest.firstChange) {
        if (!this.isGuest) {
          this.runAllWaitingTasks();
        } else {
          this.afterLoginOperations = [];
        }
      }
    }
    // if(SlopeFinderComponent.spopupstatus==false){
    //   this.slopefinderVisibility=false;

    // }
  }
  resetWingSelection() {
    this.wings.forEach((element) => {
      element.selected = false;
      this.setHoveredOutIcon(element);
    });
  }
  mouseOver(e, wing) {
    this.currentTooltipContent = wing.tooltip;
    if (!wing.selected) {
      this.onWingHovered.emit(wing);
    }
  }
  mouseOut(e, wing) {
    if (!wing.selected) {
      this.onWingHoveredOut.emit(wing);
    }
  }

  runAllWaitingTasks() {
    this.afterLoginOperations.forEach((operation) => {
      if (operation.type === 'showSaveShare') {
        console.log('CALLING SHOW SAVE SHARE SCREEN AFTER LOGIN');
        this.openSaveShareScreen(operation.data);
        const index = this.afterLoginOperations.findIndex(
          (op) => op.type === 'showSaveShare'
        );
        if (index !== -1) {
          this.afterLoginOperations.splice(index, 1);
        }
      }
    });
  }

  openSaveShareScreen(data) {
    this.showGeoSessionWindow.emit(data);
    this.closeMenu('');
    setTimeout(() => {
      this.resetWingSelection();
    }, 1000);
    this.geotrayService.dectivateTools();
  }
  selectedWing(e: PointerEvent, wing) {
    console.log(e);
    console.log(e.ctrlKey);
    if (wing.title === 'GPTB') {
      if (e.ctrlKey) {
        this.showSubOptions = true;
        this.resetWingSelection();
        this.geotrayService.dectivateTools();
        this.showslope = false;
        this.showbuffer = false;
      } else {
        this.showGeopad(e);
        this.resetWingSelection();
      }
    } else if (wing.title === 'QTB') {
      //this.showProperties = true;
      this.showProperties = !this.showProperties;
      this.showbuffer = false;
      this.showslope = false;
    } else if (wing.title === 'ATB') {
      if (e.ctrlKey) {
        this.showAnnotation(e);
        this.resetWingSelection();
      } else {
        this.showslope = true;
        this.showProperties = false;
        this.showbuffer = false;
      }
    } else if (wing.title === 'VTB') {
      this.showbuffer = true;
      this.showslope = false;
      this.showProperties = false;
    } else if (wing.title === 'STB') {
      const data = { e, data: 'geosession' };
      if (!this.isGuest) {
        this.openSaveShareScreen(data);
      } else {
        // SAVING OPERATION TO PERFORM AFTER LOGIN
        const index = this.afterLoginOperations.findIndex(
          (op) => op.type === 'showSaveShare'
        );
        if (index === -1) {
          // IF NO TOWER LAYER SAVE REQUEST PRESENT
          this.afterLoginOperations.push({ type: 'showSaveShare', data });
        } else {
          // IF TOWER LAYER SAVE REQUEST PRESENT, SAVING RECENT REQUEST ONLY
          this.afterLoginOperations[index] = { type: 'showSaveShare', data };
        }
        this.authObsr.initiateAuthenticationRequest({
          from: 'geotray-save-share',
        });
      }
    } else if (wing.title === 'ATB') {
    } else {
      this.showSubOptions = false;
      this.showProperties = false;
      this.showslope = false;
      this.showbuffer = false;
    }
    this.resetWingSelection();
    if (wing.title === 'GPTB' && !e.ctrlKey) {
    } else if (wing.title === 'QTB') {
    } else if (wing.title === 'ATB') {
    } else {
      this.wings.forEach((element) => {
        if (element.title === wing.title) {
          element.selected = true;
          this.setHoveredIcon(element);
          // this.onWingHovered.emit(wing);
        } else {
          element.selected = false;
          this.setHoveredOutIcon(element);
          // this.onWingHoveredOut.emit(wing);
        }
      });
    }
    const temp = wing;
    temp.srcEvent = e;
    this.onWingSelected.emit(temp);
    // }
  }
  showUploadPhotosVideos() {
    // this.showGeopadWindow.emit('video-image');
    // this.selectedSubOption='video-image';
  }
  showUploadAudio() {
    // this.showGeopadWindow.emit('audio');
    // this.selectedSubOption='audio';
  }
  showGeopad(event) {
    console.log(event);
    this.showGeopadWindow.emit({ event, data: 'geopad' });
    this.selectedSubOption = 'geopad';
    this.closeMenu('');
  }
  showAnnotation(event): void {
    this.showGeopadWindow.emit({ event, data: 'annotate' });
    this.selectedSubOption = 'annotate';
    this.closeMenu('');
  }
  showViewOtherLocation() {
    // this.showGeopadWindow.emit('view-location');
    // this.selectedSubOption='view-location';
  }
  showPredefined() {
    this.selectedProperty = 'predefined';
    this.predefinedVisibility = !this.predefinedVisibility;
    this.classifiedVisibility = false;
    this.blendedVisibility = false;
    this.collocatedVisibility = false;
    this.extendedVisibility = false;
    // this.propertiesWindowVisible = !this.propertiesWindowVisible;
    // this.onPropertiesClicked.emit(this.propertiesWindowVisible);
    this.onPredefinedClicked.emit(this.predefinedVisibility);
    console.log('checkhit', this.selectedProperty);
  }
  showClassified() {
    this.selectedProperty = 'classified';
    this.classifiedVisibility = !this.classifiedVisibility;
    this.blendedVisibility = false;
    this.collocatedVisibility = false;
    this.extendedVisibility = false;
    this.predefinedVisibility = false;
    this.propertiesWindowVisible = !this.propertiesWindowVisible;
    //this.onClassifiedClicked.emit(this.predefinedVisibility);
    this.onClassifiedClicked.emit(this.classifiedVisibility);
    console.log('checkhit', this.selectedProperty);
  }
  showBlended() {
    this.selectedProperty = 'blended';
    this.blendedVisibility = !this.blendedVisibility;
    this.classifiedVisibility = false;
    this.collocatedVisibility = false;
    this.extendedVisibility = false;
    this.predefinedVisibility = false;
    this.propertiesWindowVisible = !this.propertiesWindowVisible;
    // this.onBlendedClicked.emit(this.predefinedVisibility);
    this.onBlendedClicked.emit(this.blendedVisibility);
    console.log('checkhit', this.selectedProperty);
  }
  showCollocated() {
    this.selectedProperty = 'collocated';
    this.extendedVisibility = false;
    this.predefinedVisibility = false;
    this.blendedVisibility = false;
    this.classifiedVisibility = false;
    this.collocatedVisibility = !this.collocatedVisibility;
    this.propertiesWindowVisible = !this.propertiesWindowVisible;
    //this.onCollocatedClicked.emit(this.predefinedVisibility);
    this.onCollocatedClicked.emit(this.collocatedVisibility);
    console.log('checkhit', this.selectedProperty);
  }
  showExtended() {
    this.selectedProperty = 'extended';
    this.predefinedVisibility = false;
    this.blendedVisibility = false;
    this.classifiedVisibility = false;
    this.collocatedVisibility = false;
    this.extendedVisibility = !this.extendedVisibility;
    //this.propertiesWindowVisible = !this.propertiesWindowVisible;
    //this.onExtendedClicked.emit(this.predefinedVisibility);
    this.onExtendedClicked.emit(this.extendedVisibility);
    console.log('checkhit', this.onExtendedClicked);
  }
  showslopefinder() {
    this.selectedProperty = 'slopefinder';
    // this.predefinedVisibility = false;
    // this.blendedVisibility = false;
    // this.classifiedVisibility = false;
    // this.collocatedVisibility = false;
    // this.extendedVisibility = false;
    this.slopefinderVisibility = !this.slopefinderVisibility;
    this.onslopeClicked.emit(this.slopefinderVisibility);
    console.log('checkhit', this.onslopeClicked);
    //SlopeFinderComponent.spopupstatus=true;
  }

  showslopedropdown: boolean = false;

  openslopedropdown() {
    this.showslopedropdown = !this.showslopedropdown;
  }

  showbuffertool() {
    this.selectedProperty = 'buffertool';
    this.buffertoolVisibility = !this.slopefinderVisibility;
    this.onbufferClicked.emit(this.buffertoolVisibility);
    console.log('checkhit', this.onbufferClicked);
  }

  showbufferdropdown: boolean = false;

  openbufferdropdown() {
    this.showbufferdropdown = !this.showbufferdropdown;
  }

  closeMenu(event) {
    this.onMenuBtnClicked.emit(false);
  }
  public setHoveredIcon(wing) {
    wing.color = '#667BBC';
    wing.icon.name = 'assets/right-white-svg/' + wing.title + '.svg';
    // console.log('onWingHovered', selectedToolWing);
  }

  public setHoveredOutIcon(wing) {
    wing.color = '#FFFFFF';
    wing.icon.name = 'assets/right-colored-svg/' + wing.title + '.svg';
    // console.log('onWingHoveredOUt', selectedToolWing);
  }
}
