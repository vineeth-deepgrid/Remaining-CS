import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ChangeProjectionService {
  private dataSubject = new Subject<any>();
  


  constructor() { }
  setData(data: any) {
    this.dataSubject.next(data);
 
  }

  getData() {
    return this.dataSubject.asObservable();
  }


}
