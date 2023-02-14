import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import Overlay from 'ol/Overlay';

@Component({
  selector: 'app-depiction',
  templateUrl: './depiction.component.html',
  styleUrls: ['./depiction.component.scss']
})
export class DepictionComponent implements OnInit {
  @ViewChild('container') _containerEl: ElementRef;
  @ViewChild('closer') _closerEl: ElementRef;
  private _popupOverlay: Overlay;
  depProperties = [];

  constructor() { }

  ngOnInit() { }

  getDepctionPopup() {
    this._popupOverlay = new Overlay({
      element: this._containerEl.nativeElement,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    });
    this._closerEl.nativeElement.onclick = () => {
      this.close();
    };
    return this._popupOverlay;
  }

  public close() {
    this._popupOverlay.setPosition(undefined);
    this._closerEl.nativeElement.blur();
    return false;
  }

  setPropertyValues(depProperties) {
    this.depProperties = [];
    Object.entries(depProperties).forEach(entry => {
      const jsonObj = {
        title : entry[0],
        value : entry[1]
      };
      this.depProperties.push(jsonObj);
  });
  }
}
