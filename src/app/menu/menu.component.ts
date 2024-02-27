import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {Router} from "@angular/router";
import {MatListItem, MatNavList} from "@angular/material/list";
import {MatIcon} from "@angular/material/icon";
import {NgFor, NgIf} from "@angular/common";

export interface menu_items {
  [key: string]: {
    label: string
    title: string
    queryParam: any | undefined
    icon: string
    actif: boolean
  }
}


@Component({
  selector: 'app-menu',
  standalone:true,
  imports: [
    MatNavList,
    MatListItem,NgIf,NgFor,
    MatIcon
  ],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.sass']
})
export class MenuComponent implements OnChanges {
  @Input() items:menu_items={};
  @Input() status:string=""
  @Input() with_label:boolean=true;
  @Output("select") onselect=new EventEmitter();
  l_items: any[]=[];

  constructor(public router:Router) {
  }

  ngOnChanges(changes: any): void {
    this.l_items=[];
    for(let k of Object.keys(this.items)){
      let item:any=this.items[k];
      if(item.actif){
        item["link"]=k
        this.l_items.push(item);
      }
    }
  }

  goto(item: any) {
    if(!item.link.startsWith("_")){
      this.router.navigate([item.link],{queryParams:item.queryParam})
    }else{
      this.onselect.emit(item);
    }
  }
}
