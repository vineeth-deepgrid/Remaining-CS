import { Component, OnInit, Input, Output, EventEmitter, SimpleChange, AfterViewInit, OnChanges, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import Overlay from 'ol/Overlay';
import { BasemapService } from 'src/app/basemap/basemap.service';
import { Select } from 'ol/interaction';

@Component({
  selector: 'app-prototype-popup',
  templateUrl:'./prototype-popup.component.html',
  styleUrls: ['./prototype-popup.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PrototypePopupComponent {
  
  showPopup:boolean;
  private _popupOverlay: Overlay;
  @ViewChild('container') _containerEl: ElementRef<HTMLDivElement>;
  @ViewChild('closer') _closerEl: ElementRef;
  @Input() onDataSelection: any;
  
  
  constructor(private basemapService: BasemapService) { }
  ngOnInit(): void {
    console.log("popup request ", this.onDataSelection)
    if(this.onDataSelection) {
      this.showPopup = !this.showPopup;
    }
  }
    

  showPopupFunc(){
    this.showPopup = !this.showPopup;
  }

  public getGeoPopup() {
    this._popupOverlay = new Overlay({
      element: this._containerEl.nativeElement,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      },
    });
    this._closerEl.nativeElement.onclick = () => {
      // this.close_DestoryTool();
      this.close();
    };
    return this._popupOverlay;
  }
  public close() {
    this._popupOverlay.setPosition(undefined);
    this._closerEl.nativeElement.blur();
    console.log('geotray service ', this.basemapService.getCurrentBasemap());
    this.basemapService.getCurrentBasemap().interactions.forEach((interaction) => {
      if (interaction instanceof Select) {
        interaction.getFeatures().clear();
      }
    });
    return false;
  }

  public setContent(collectedData) {
    console.log('features data ', collectedData);
  }
}
