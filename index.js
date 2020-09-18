const { app, BrowserWindow, ipcMain} = require('electron')
var userDB;

const {download} = require('electron-dl');
var backup_link = "";

function createWindow () {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1000,
    height: 667,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  win.loadFile('index1.html');
  //Instantiate 2nd window


}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
//Db selection
ipcMain.on('db selection',(event,arg)=>{
  const sqlite3 = require('sqlite3').verbose();
   userDB = new sqlite3.Database(arg[0],
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      (err) => {
          if (err) {
              console.error(err.message);
            }
            console.log('Connected to the brokers database.');});
  backup_link = arg[0];
  userDB.run('CREATE TABLE IF NOT EXISTS PARTY(party_id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, city TEXT NOT NULL, gst TEXT);');
  userDB.run('CREATE TABLE IF NOT EXISTS TRANSACTIONs(trans_id INTEGER PRIMARY KEY AUTOINCREMENT,trans_date TEXT NOT NULL, buyer INTEGER NOT NULL, seller INTEGER NOT NULL, jeans TEXT NOT NULL, mesasure INTEGER NOT NULL, bags INTEGER NOT NULL, rate  INTEGER, buy_commsion_rate INTEGER NOT NULL, sell_comission_rate INTEGER NOT NULL, FOREIGN KEY(buyer) REFERENCES PARTY(id), FOREIGN KEY(seller) REFERENCES PARTY(id) );');
  userDB.run('CREATE TABLE IF NOT EXISTS HEADER(name TEXT NOT NULL, add_1 TEXT NOT NULL, add_2 TEXT NOT NULL, phone TEXT NOT NULL);');
  event.returnValue = `Connected to selected db - ${arg[0]}`;

})
//Db creation
ipcMain.on('db creation',(event,arg)=>{
  const sqlite3 = require('sqlite3').verbose();
   userDB = new sqlite3.Database(arg,
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      (err) => {
          if (err) {
              console.error(err.message);
            }
            console.log('Connected to the brokers database.');});
  backup_link = arg;
  userDB.run('CREATE TABLE IF NOT EXISTS PARTY(party_id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, city TEXT NOT NULL, gst TEXT);');
  userDB.run('CREATE TABLE IF NOT EXISTS TRANSACTIONs(trans_id INTEGER PRIMARY KEY AUTOINCREMENT,trans_date TEXT NOT NULL, buyer INTEGER NOT NULL, seller INTEGER NOT NULL, jeans TEXT NOT NULL, mesasure INTEGER NOT NULL, bags INTEGER NOT NULL, rate  INTEGER, buy_commsion_rate INTEGER NOT NULL, sell_comission_rate INTEGER NOT NULL, FOREIGN KEY(buyer) REFERENCES PARTY(id), FOREIGN KEY(seller) REFERENCES PARTY(id) );');
  userDB.run('CREATE TABLE IF NOT EXISTS HEADER(name TEXT NOT NULL, add_1 TEXT NOT NULL, add_2 TEXT NOT NULL, phone TEXT NOT NULL);');
  event.returnValue = `Connected to selected db - ${arg[0]}`;
})


//Add party form to db
ipcMain.on('partyform-submission', (event,arg)=> {
  console.log(arg[0]);
  //userDB.run("INSERT INTO PARTY(name, city, gst) VALUES('soham', 'atna', 'fasdfasdfadfa');");
  userDB.run("INSERT INTO PARTY(name, city, gst) VALUES( '" + arg[0] + "' , '" + arg[1] +"' , '" + arg[2] +"');");
})
//Load parties name to transaction html file
ipcMain.on('pageloaded',(event,arg)=>{
  console.log(arg);

  userDB.all('SELECT party_id,name FROM PARTY',[], (err, rows)=>{
    if(err){
      throw err;
    }
    console.log(rows);
    event.reply('party-name',rows);
  });
//Add button required transaction id
})
ipcMain.on('need_transaction_id', (event,arg)=>{
  let trans_id = 5;
  userDB.get('SELECT COUNT(*) FROM TRANSACTIONs',[],(err, row)=>{
    if(err){
      throw err;
    }
    trans_id = row['COUNT(*)'];
    event.reply('current_transaction_id',trans_id);
  })
});
//Search Transaction id
let search_window_id

ipcMain.on('search_transaction', (event,arg)=>{
  userDB.all('SELECT * FROM TRANSACTIONs WHERE trans_id = ?',[arg],(err, row)=>{
    if(err){
      throw err;
    }console.log(row);
    event.returnValue = row;

    })
})
// ipcMain.on('search_window_id',(event,args)=>{
//   search_window_id = args;
//   console.log(args);
// })
ipcMain.on('save_transaction_query', (event,args)=>{
  userDB.run(args,[], function(err){
    if (err){
      return console.error(err.message)
    }
    event.reply("success_transaction_query", 'Updated')
  })
})

ipcMain.on('load_party_name',(event,args)=>{
  userDB.all('SELECT party_id,name FROM PARTY',[], (err, rows)=>{
    if(err){
      throw err;
    }
    console.log(rows);
    event.reply('loaded-party-name',rows);

})
})
ipcMain.on('setting page loaded', (event, args)=>{

    userDB.all('SELECT * FROM HEADER',[], (err,rows)=>{
    if(err){
      throw err;
    }

    console.log(rows);
    event.reply('setting data loaded', rows);
  })
})

ipcMain.on('setting update',(event, args)=>{
  userDB.run(args,[],function(err){
    if(err){
      return console.error(err.message);
    }

  })
})

ipcMain.on('load bill', (event,args)=>{
  userDB.all('SELECT * FROM HEADER',[],(err,rows)=>{
    if(err){
      throw err;
    }
    //console.log(rows)
    event.reply('load bill completed',rows[0]);
  })
})
// Store rows
let broker_row = 0
ipcMain.on('send detail',(event, arg)=>{
  console.log(arg)
  userDB.all('SELECT trans_date,jeans,mesasure,rate,bags,buyer,seller,sell_comission_rate,buy_commsion_rate,ps.name as seller_name,pb.name as buyer_name FROM TRANSACTIONs t JOIN PARTY ps on t.seller = ps.party_id JOIN PARTY pb on t.buyer = pb.party_id WHERE seller = ? or buyer = ?',[arg,arg],(err, rows)=>{
    if(err){
      throw err;

    }
    console.log(rows);
    broker_row = [arg,rows]
    event.returnValue=rows
  })

})
ipcMain.on('load bill rows',(event,arg)=>{
  event.reply('load bill rows completed',broker_row);
})
ipcMain.on('forward_trans_query',(event,arg)=>{
  userDB.all('SELECT * FROM TRANSACTIONs WHERE trans_id = ?',[arg+1],(err, row)=>{
    if(err){
      throw err;
    }console.log(row);
    event.returnValue = row[0];

})
})
ipcMain.on('backward_trans_query',(event,arg)=>{
  userDB.all('SELECT * FROM TRANSACTIONs WHERE trans_id = ?',[arg-1],(err, row)=>{
    if(err){
      throw err;
    }console.log(row);
    event.returnValue = row[0];

})
})
ipcMain.on('download_button',async (event,{url})=>{
  console.log(url)
  url = 'file://'+backup_link;

  const win = BrowserWindow.getFocusedWindow();
  console.log(await download(win, url,{
      saveAs:true
  }));
})
