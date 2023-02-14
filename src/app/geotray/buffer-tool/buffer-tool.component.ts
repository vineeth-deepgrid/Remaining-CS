import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { BasemapService } from 'src/app/basemap/basemap.service';
import OlMap from 'ol/Map';
import { DragBox } from 'ol/interaction.js';
import { platformModifierKeyOnly } from 'ol/events/condition.js';
import { Select } from 'ol/interaction';
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import { Fill, Stroke, Style } from 'ol/style.js';
import { Vector as VectorSource } from 'ol/source.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import { unByKey } from 'ol/Observable.js';
import { CommonService } from '../../Services/common.service';
import { features } from 'process';
import Overlay from 'ol/Overlay';
import {containsExtent} from 'ol/extent';
import CircleStyle from 'ol/style/Circle';
import {MatExpansionModule} from '@angular/material/expansion';
import {Heatmap as HeatmapLayer} from 'ol/layer';
import Text from 'ol/style/Text';
import { GeotrayMenuComponent } from '../geotray-menu/geotray-menu.component';

@Component({
  selector: 'app-buffer-tool',
  templateUrl: './buffer-tool.component.html',
  styleUrls: ['./buffer-tool.component.scss']
})
export class BufferToolComponent implements OnInit {
  @Input() onbufferClicked;


  constructor() { }

  ngOnInit(): void {
  }

}
