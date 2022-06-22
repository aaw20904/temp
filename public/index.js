if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
    .then((reg)=>{
        console.log('Registration succeded Scope is '+ reg.scope);
    })
    .catch(e=>{
        console.log('REgistration filed with' + e);
    })
}

window.onload=()=>{
    let tblMaker = new MyTable();
    let info = document.querySelector('.textstring');
   

let button = document.querySelector('.btn');
button.addEventListener('click',onclick);

  async function onclick(evt){
    let spinner = document.querySelector('.myspinner');
    let infoNod = document.querySelector('.textstring');
    let options = {
        headers:{
      "Content-Type":"application/json;charset=UTF-8"
        },
        body:JSON.stringify({time:new Date().toLocaleTimeString()}),
        method:"POST"
    }

    let response;
    try{
        spinner.classList.remove('hideElem');
    response = await fetch(`${window.location.href}api/random`,options)
    response = await response.json();
    spinner.classList.add('hideElem');
    }
    catch(e){
        spinner.classList.add('hideElem');
        return;
    }
    removeAllChildNodes(infoNod);
    infoNod.appendChild(tblMaker.createTableFromObject(response.current));
    infoNod.appendChild(tblMaker.createTableFromObject(response.location));


  }


}

class MyTable {
    constructor(){

    }

    createHead (param = ["name","value"]) {
        const thead = document.createElement('thead');
        const row = document.createElement('tr');
        //create columns and append to the row
        param.forEach((val)=>{
            let column = document.createElement('th');
            column.setAttribute('scope','col');
            column.innerText = val;
            row.appendChild(column);
        })
        //append a row to thead
        thead.appendChild(row);
        return thead;
    }

    createRow (param=["one","two"]) {
        let row = document.createElement("tr");
        param.forEach((val)=>{
            let col = document.createElement('td');
            col.innerText = val;
            row.appendChild(col);
        })
        return row;
    }

    createTableFromObject(myObj = {key1:"val1", key2:"val2", key3:"val3", key4:{x:'y'}}) {
        let tbody = document.createElement('tbody');
        let table = document.createElement('table');
        table.classList.add('table');
        table.classList.add('m-1');
        //create a thead
        let thead = this.createHead(['Params','Values']);
        //get iterable props
        let props = Object.keys(myObj);
        //iterate keys of myObj
        props.forEach((key)=>{
            let val = myObj[key];
            if (typeof(val) !== "object") {
                //create a new row and fill it
                let row = this.createRow([key, val ]);
                //append to a parent <tbody>
                tbody.appendChild(row);
            }
        })
        //append <thead> and <tbody>
        table.appendChild(thead);
        table.appendChild(tbody);
        return table;

    }

}

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}