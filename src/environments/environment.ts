// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import {newCryptoKey} from "../tools";

export const environment = {
  production: false,
  faqs:"{{domain_appli}}/assets/faqs.yaml",
  forum:"https://discord.gg/BfC2E2ent",
  mail:"contact@nfluent.io",
  version: "0.2dev",
  appname:"Gate",
  networks:[
    {label:"MultiversX Test",value:"elrond-devnet"},
    {label:"MultiversX",value:"elrond-mainnet"},
    {label:"MultiversX Test v2",value:"elrond-devnet2"},
  ],
  visual:"./assets/coffre.jpg",
  claim:"Valoriser vos contenus en quelques clics",
  token:"NFLUCOIN-4921ed",

  appli:"http://localhost:4202",
  server:"http://127.0.0.1:4242",
  website:"https://nfluent.io",
  style:"nfluent-dark.css",
  background:"./assets/wood.jpg",
  logo:"./assets/logo.png",
  default_bank:"http://faucet.nfluent.io",
  company:"Nfluent",
  histo:"db-server-nfluent_local",
  gate_server:"http://localhost:4200",
  shorter_service:"https://femis.f80.fr:444",
  transfer_page:"https://x.f80.fr",
  //shorter_service: "http://localhost:80",

  recaptcha: {
    siteKey: '6Lf7UL0cAAAAAIt_m-d24WG4mA1XFPHE8yVckc5S',
  },

  merchant:{
    id:"BCR2DN4TYD4Z5XCR",
    name:"NFluenT",
    currency:"EUR",
    country:"FR",
    contact:"contact@nfluent.io",
    wallet:
      {
        token:"NFLUCOIN-4921ed",
        address:"erd1gkd6f8wm79v3fsyyklp2qkhq0eek28cnr4jhj9h87zwqxwdz7uwstdzj3m",
        network:"elrond-devnet",
        unity: "NfluCoint",
        bank: "nfluent: Z0FBQUFBQmtYUjJVbS1Uc0lpa2FTR2F0SnF4LW1HUHIzbHFKN2hCVmRPN3NRR1R3Wk4tUnhfcUxqUE9IQVdObzMxMHgtazhrT1hpWXVndENZallGNnI1Q2RTLVQ1N2d0TEQ2dHNmVlByV3B0RlR3SUMxejhKMHZUeVJ3NHl6dnNFNEIyZWk2eGZsS1hWU2FuQnljcGRDUEh4WFhSMTBRTFFLdHkxeTJuUjZxYWRRc1dVN2FqYlZzPQ==",
        title:"La banque de NFluent",
        refund: 5
      }
  },

  dictionnary: {
    "en": {
      "Délivrer un message":"Show a message",
      "Conditions": "",
      "Lien a raccourcir": "Link to short",
      "Nom d'une collection": "Collection name",
      "Charger un fichier":"Upload file",
      "Sélectionner une collection": "Select a collection",
      "Chercher": "Find",
      "Réseau": "Network",
      "Coller":"Paste",
      "Le premier NFT de cette collection": "First NFT of this collection",
      "Créer le lien":"Build the link",
      "Lien pour acquérir un NFT":"Link to buy the required NFT"
    }
  },
  max_file_size: 1000000
};



/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
