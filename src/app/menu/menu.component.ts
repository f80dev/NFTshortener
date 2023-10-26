import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {environment} from "../../environments/environment";
import {apply_params, getParams} from "../../tools";
import {StyleManagerService} from "../style-manager.service";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  profil:any={
    airdrop:{url:"plugin",title:"Distribuer des NFT et des cryptos en quelques clics",icon:"account_balance"},
    sell:{url:"create",title:"Vendre un contenu en crypto",icon:"shopping_cart",params:{required:"token",redirect:""}},
    access:{url:"create",title:"Limiter l'acces grâce à un NFT",icon:"key",params:{required:"nft",redirect:""}},
    mint:{url:"mint",title:"Fabriquer votre monnaie / vos NFTs",icon:"build"}
  }

  options:any[]=[]

  appname: string=environment.appname;
  visual: string=environment.visual;
  claim: string = environment.claim;
  background: string=environment.background;
  profils: any[] = [
    {id:"particulier",label:"un particulier",
      usecase:{
        airdrop:"Distribuer des NFTs à vos amis",
        sell:"Récupérer des cryptos grâce à vos contenus",
        access:"Sécuriser vos informations gràce aux NFTs"
    }},
    {id:"commercant",label:"un commerçant",
      scenarios:[
        "Vos client peuvent récupérer des points de fidélité, simplement en flashant un QRCode affiché dans votre boutique. Ces points permettent d'obtenir des promotions sur certains articles",
        "Vos client peuvent récupérer un NFT d'invitation à une vente privée en flashant un QRCode affiché dans votre boutique"
      ],
      usecase:{
        airdrop:"Construire un programme de fidélité",
        sell:"Récompensez vos meilleurs clients",
        access:"Organisez des événements privés",
        mint:"Créer un programme de fidélité"}},
    {id:"artiste",label:"un artiste",
      scenarios:[
        "Vous distribuez un NFT certifiant que son possesseur à fait une exposition. Vos ventes privées / vernissage sont accessibles à ceux qui ont le NFT",
      ],
      usecase:{
        airdrop:"Développé votre notoriété",
        sell:"Récompensez vos mécénes",
        access:"Organisez des événements privés",
        mint:""}
    },
    {id:"webmaster",label:"un webmaster",
      scenarios:[
        "Tous les visiteurs de votre sites web peuvent recevoir un NFT créer pour l'occasion. Vos contenus premium sont réservés aux possesseurs du NFT"
      ],
      usecase:{
        airdrop:"Attirer de nouveaux visiteurs",
        sell:"Valoriser votre site sans intermédiaire",
        access:"Restreindre l'accès aux propriétaires de NFT",
        mint:""}
    },

    {id:"influenceur",label:"un influenceur",
      scenarios:[
        "Vos followers récupèrent une monnaie à votre nom en ouvrant un lien sponsorisé. Cette monnaie permet d'acheter certains de vos contenus premium",
        "Vos followers récupèrent un NFT en ouvrant un lien sponsorisé. Echangé ou revendu, ce NFT contribue a développer votre notoriété, il permet également l'accès a certains contenus premium",
      ],
      usecase:{
        airdrop:"Récompenser la visite de liens sponsorisés",
        sell:"Récompenser vos followers",
        access:"Développer la notion de membre",
        mint:""}
    }
  ]
  scenario="";
  intro: any;
  slide: number=1

  constructor(public router:Router,public routes:ActivatedRoute,public style:StyleManagerService) {
  }

  open_menu(option:any) {
    let params=option.params || {}
    params["title"]=option.title
    params["intro"]=0
    this.router.navigate([option.url],{queryParams:params})
  }

  async ngOnInit() {
    let params:any=await getParams(this.routes)
    apply_params(this,params,environment);
    this.options=Object.values(this.profil)
    let idx=-1;
    if(params.profil){
      idx=0
      while(idx<this.profils.length && this.profils[idx].id!=params.profil)idx++;
      if(idx==this.profils.length)idx=-1
    }
    if(idx>-1){
      this.update_profil(this.profils[idx])
    }
  }

  update_profil($event: any) {
    this.options=[]
    if($event.scenarios && $event.scenarios.length>0)this.scenario=$event.scenarios[Math.trunc(Math.random()*$event.scenarios.length)]
    for(let k of Object.keys($event.usecase)){
      let opt=this.profil[k]
      if($event.usecase[k]!='')opt.title=$event.usecase[k]
      this.options.push(opt)
    }
  }
}
