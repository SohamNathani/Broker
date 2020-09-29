let cancel_btn = document.getElementById('cancel-btn');
//INSERTION QUERY
var insert_query;
// CURRENT TRANSACTION ID
let current_trans_id;
//FLAG VARIABLE TO SAVE OR UPDATE
var save_flag_new = 1
//Forward Button
let forward_btn = document.getElementById('forward-btn');
//Backward Button
let backward_btn = document.getElementById('backward-btn');
//EDIT BUTTON
let edit_btn = document.getElementById('edit-btn');
//SEARCH BUTTON
let search_btn = document.getElementById('search-btn');
//DELETE BUTTON
let delete_btn = document.getElementById('delete-btn');
//ADD BUTTON
let add_btn = document.getElementById('add-btn');
//BROWSER WINDOW FOR SEARCH
const BrowserWindow = require('electron').remote.BrowserWindow;
//TRANS FORM
let trans_form = document.getElementById('transaction_form');
//IPC RENDERER AND FORM LOADING
const ipcRenderer = require('electron').ipcRenderer;

let modes = document.getElementsByName('b_mode');

//save BUTTON
let save_btn = document.getElementById("trans_save_btn_css");

 ipcRenderer.send('pageloaded','I am loaded');
 var buyer = document.getElementById('buyer');
 var seller = document.getElementById('seller');
//LOADING PARTY NAME IN DROPDOWN
 ipcRenderer.on('party-name', (event, arg)=>{
     arg.forEach(optionss => {
         var option = document.createElement('option');
         option.value = optionss.party_id;
         option.innerHTML = optionss.name;
         //console.log(option);

         //seller.appendChild(option);
         buyer.appendChild(option);
     });
     arg.forEach(optionss => {
         var option = document.createElement('option');
         option.value = optionss.party_id;
         option.innerHTML = optionss.name;
         //console.log(option);

         seller.appendChild(option);
         //buyer.appendChild(option);
     });

 })


 last_record_fetch();


 //ADD FUNCTION TO ADD TRANSACTION
 function add_function(){
    write_also_mode()
    document.getElementById('transaction_form').reset();
    ipcRenderer.send('need_transaction_id',"Pass Transaction id");
    ipcRenderer.on('current_transaction_id',(event,arg)=>{
        let Transaction_id = document.getElementById('Transid')
        Transaction_id.innerHTML=`Trans Id - ${arg+1}`;
        //Enabling write permission

        save_flag_new=1
    })
 }

 //OPEN SEARCH WINDOW
 function search_function(){
    const search_window = new BrowserWindow({
width: 400,
height: 300,
webPreferences: {
  nodeIntegration: true
}
});
search_window.loadFile('search.html');


 }
//RESULT ON SEARCH
ipcRenderer.on('search_result', (event,arg)=>{
    if (arg !=null){
    trans_form.style.display='block';
    edit_btn.disabled=false;
    forward_btn.disabled=false;
    backward_btn.disabled=false;


    /// Setting the formmode

    current_trans_id = arg.trans_id
    document.getElementById('date').value = arg.trans_date;
    document.getElementById('Transid').innerHTML = arg.trans_id;
    document.getElementById('jeans').value = arg.jeans;
    document.getElementById('measure').value = arg.mesasure;
    document.getElementById('bags').value = arg.bags;
    document.getElementById('rate').value = arg.rate;
    document.getElementById('jeans').value = arg.jeans;
    document.getElementById('seller_comission').value = arg.sell_comission_rate;
    document.getElementById('buyer_comission').value = arg.buy_commsion_rate;
    document.getElementById('buyer').selectedIndex = arg.buyer;
    document.getElementById('seller').selectedIndex = arg.seller;
    if(arg.mode == 'w'){
      document.getElementById('weight').checked = true;
    }else if (arg.mode == 'u') {
      document.getElementById('unit').checked = true;
    }else{
      document.getElementById('percent').checked = true
    }

    ///Readonlymode
      read_only_mode();
    }

})

//EDIT FUNCTION
function edit_function(){
    //Write also mod
    save_flag_new = 0
    write_also_mode();


}
//SAVE TRANSACTION FORM

function save_transaction_form(event){
    event.preventDefault();
    let save_mode;
    for(i = 0; i < modes.length; i++) {
            if(modes[i].checked){
            save_mode = modes[i].value;
            break;
      }
    }

    let brokerage_seller;
    let brokerage_buyer;
    if (save_mode == 'w'){
      brokerage_seller = Math.floor((document.getElementById('seller_comission').value * document.getElementById('measure').value * document.getElementById('bags').value)/100)
      brokerage_buyer = Math.floor((document.getElementById('buyer_comission').value * document.getElementById('measure').value * document.getElementById('bags').value)/100)
    }else if (save_mode == 'u') {
      brokerage_seller = document.getElementById('bags').value * document.getElementById('seller_comission').value;
      brokerage_buyer = document.getElementById('bags').value * document.getElementById('buyer_comission').value;
    }else{
      brokerage_seller = Math.floor((document.getElementById('seller_comission').value * document.getElementById('measure').value * document.getElementById('bags').value * document.getElementById('rate').value)/100)
      brokerage_buyer = Math.floor((document.getElementById('buyer_comission').value * document.getElementById('measure').value * document.getElementById('bags').value * document.getElementById('rate').value)/100)
    }

      console.log(save_mode);
    let upda_array=[
    document.getElementById('buyer').selectedIndex,
    document.getElementById('seller').selectedIndex,
    document.getElementById('jeans').value,
    document.getElementById('measure').value,
    document.getElementById('bags').value,
    document.getElementById('rate').value,
    document.getElementById('seller_comission').value,
    document.getElementById('buyer_comission').value,
    document.getElementById('date').value,
    save_mode,
    brokerage_seller,
    brokerage_buyer
    ]


    if(save_flag_new==0){

    insert_query = `UPDATE TRANSACTIONs SET buyer = ${upda_array[0]}, seller = ${upda_array[1]}, jeans="${upda_array[2]}", mesasure=${upda_array[3]}, bags=${upda_array[4]}, rate=${upda_array[5]}, buy_commsion_rate=${upda_array[7]}, sell_comission_rate=${upda_array[6]}, trans_date="${upda_array[8]}", mode="${upda_array[9]}", brokerage_seller = ${upda_array[10]}, brokerage_buyer = ${upda_array[11]} WHERE trans_id=${current_trans_id}`;

    }
    else if (save_flag_new==1) {
    console.log(upda_array);
    insert_query = `INSERT INTO "TRANSACTIONs"(trans_date, buyer, seller, jeans, mesasure, bags, rate, buy_commsion_rate, sell_comission_rate, mode, brokerage_seller, brokerage_buyer) VALUES("${upda_array[8]}", ${upda_array[0]}, ${upda_array[1]}, "${upda_array[2]}", ${upda_array[3]}, ${upda_array[4]}, ${upda_array[5]}, ${upda_array[7]}, ${upda_array[6]}, "${upda_array[9]}", ${upda_array[10]}, ${upda_array[11]})`;
    }
    ipcRenderer.send('save_transaction_query',insert_query);
    ipcRenderer.on('success_transaction_query',(event, args)=>{


        save_flag_new=1;
        last_record_fetch();
    })
}

//Forward arrow function
function forward_arrow(){
    let forward_result = ipcRenderer.sendSync('forward_trans_query',current_trans_id);
    console.log(forward_result);
        if (forward_result !=null){

    /// Setting the formmode

    current_trans_id = forward_result.trans_id
    document.getElementById('date').value = forward_result.trans_date;
    document.getElementById('Transid').innerHTML = forward_result.trans_id;
    document.getElementById('jeans').value = forward_result.jeans;
    document.getElementById('measure').value = forward_result.mesasure;
    document.getElementById('bags').value = forward_result.bags;
    document.getElementById('rate').value = forward_result.rate;
    document.getElementById('jeans').value = forward_result.jeans;
    document.getElementById('seller_comission').value = forward_result.sell_comission_rate;
    document.getElementById('buyer_comission').value = forward_result.buy_commsion_rate;
    document.getElementById('buyer').selectedIndex = forward_result.buyer;
    document.getElementById('seller').selectedIndex = forward_result.seller;
    if(forward_result.mode == 'w'){
      document.getElementById('weight').checked = true;
    }else if (forward_result.mode == 'u') {
      document.getElementById('unit').checked = true;
    }else{
      document.getElementById('percent').checked = true
    }

    ///Readonlymode
    read_only_mode();

    } else{
        forward_btn.disabled = true;

    }
    if (backward_btn.disabled==true){
      backward_btn.disabled=false;

    }


}
//Backward Arrow function
function backward_arrow(){
let backward_result = ipcRenderer.sendSync('backward_trans_query',current_trans_id);
    console.log(backward_result);
        if (backward_result !=null){


    /// Setting the formmode

    current_trans_id = backward_result.trans_id
    document.getElementById('date').value = backward_result.trans_date;
    document.getElementById('Transid').innerHTML = backward_result.trans_id;
    document.getElementById('jeans').value = backward_result.jeans;
    document.getElementById('measure').value = backward_result.mesasure;
    document.getElementById('bags').value = backward_result.bags;
    document.getElementById('rate').value = backward_result.rate;
    document.getElementById('jeans').value = backward_result.jeans;
    document.getElementById('seller_comission').value = backward_result.sell_comission_rate;
    document.getElementById('buyer_comission').value = backward_result.buy_commsion_rate;
    document.getElementById('buyer').selectedIndex = backward_result.buyer;
    document.getElementById('seller').selectedIndex = backward_result.seller;

    if(backward_result.mode == 'w'){
      document.getElementById('weight').checked = true;
    }else if (backward_result.mode == 'u') {
      document.getElementById('unit').checked = true;
    }else{
      document.getElementById('percent').checked = true
    }

    ///Readonlymode
    read_only_mode();
    } else{
        backward_btn.disabled = true;

    }
    if (forward_btn.disabled==true){
      forward_btn.disabled=false;

    }


}

function cancel_function(){
last_record_fetch();
}

function last_record_fetch(){
let last_result = ipcRenderer.sendSync('last transaction entry',"");
console.log(last_result);
if(last_result !=null){
current_trans_id = last_result.trans_id;
document.getElementById('date').value = last_result.trans_date;
document.getElementById('Transid').innerHTML = last_result.trans_id;
document.getElementById('jeans').value = last_result.jeans;
document.getElementById('measure').value = last_result.mesasure;
document.getElementById('bags').value = last_result.bags;
document.getElementById('rate').value = last_result.rate;
document.getElementById('jeans').value = last_result.jeans;
document.getElementById('seller_comission').value = last_result.sell_comission_rate;
document.getElementById('buyer_comission').value = last_result.buy_commsion_rate;
document.getElementById('buyer').selectedIndex = last_result.buyer;
document.getElementById('seller').selectedIndex = last_result.seller;
if(last_result.mode == 'w'){
document.getElementById('weight').checked = true;
}else if (last_result.mode == 'u') {
document.getElementById('unit').checked = true;
}else{
document.getElementById('percent').checked = true
}

}
read_only_mode();

}

//Search Box for Seller and Buyer





//READ MODE FUNCTION
function read_only_mode(){
  cancel_btn.disabled = true;
   save_btn.disabled = true;
    edit_btn.disabled=false;
    search_btn.disabled = false;
    add_btn.disabled = false;
    forward_btn.disabled = false;
    backward_btn.disabled = false


    let f_elements = trans_form.elements;
    for (var i = 0, len = f_elements.length; i < len; ++i) {
        f_elements[i].readOnly = true;
}       var seller_childnodes = document.getElementById('seller').childNodes;
        for(var i=0;i<seller_childnodes.length;i++){
            seller_childnodes[i].disabled = true;
        }
    var buyer_childnodes = document.getElementById('buyer').childNodes;
        for(var i=0;i<seller_childnodes.length;i++){
            buyer_childnodes[i].disabled = true;
        }
}


//WRITE MODE FUNCTION
function write_also_mode(){
  cancel_btn.disabled = false;
  save_btn.disabled = false;
  edit_btn.disabled=true;
  search_btn.disabled = true;
  add_btn.disabled = true;
  forward_btn.disabled = true;
  backward_btn.disabled = true;

    let f_elements = trans_form.elements;
    for (var i = 0, len = f_elements.length; i < len; ++i) {
        f_elements[i].readOnly = false;
}       var seller_childnodes = document.getElementById('seller').childNodes;
        for(var i=0;i<seller_childnodes.length;i++){
            seller_childnodes[i].disabled = false;
        }
    var buyer_childnodes = document.getElementById('buyer').childNodes;
        for(var i=0;i<seller_childnodes.length;i++){
            buyer_childnodes[i].disabled = false;
        }
}
