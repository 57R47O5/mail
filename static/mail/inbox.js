document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  // Recibimos el form cuando se envia 
  document.querySelector('#compose-form').onsubmit = () => {
    const destinatarios = document.querySelector('#compose-recipients').value;  
    const titulo = document.querySelector('#compose-subject').value;
    const cuerpo = document.querySelector('#compose-body').value;
    //Hasta aca todo bien

    fetch('/emails',{
      method: 'POST',
      body: JSON.stringify({
        recipients: destinatarios,
        subject: titulo,
        body: cuerpo
      })
    })
    .then(response => response.json())
    .then(result=>{
      console.log(result);
    }).then(load_mailbox('sent'));
    
    
    return false;    
  }

  
});

// Cuando damos click a algun elemento de la bandeja, carga el div "mail-view"
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById("bandeja").addEventListener("click", function(e){      
    if(e.target && e.target.matches("div.div-mailbox")){
      let texto = e.target.id; 
      numero = texto.slice(4);  
      bandeja =  document.querySelector('#titulo').innerText;
      console.log(bandeja);
      load_mail(numero, bandeja);
    };     
  })
});

// La funcion que nos envia al form para crear emails
function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#mail-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

// Similar a la anterior, pero sirve para responder
function compose_response(recipients, subject, timestamp, sender, body) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#mail-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = sender;
  document.querySelector('#compose-subject').value = 'Re: ' + subject;
  document.querySelector('#compose-body').value = 'En ' + timestamp + ' ' + sender + ' escribio: ' + body ;

   console.log(recipients)
   console.log(subject)
}

//La funcion que carga  la bandeja
function load_mailbox(mailbox) {  

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#mail-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name  
  document.querySelector('#titulo').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Vemos los mails en nuestra bandeja de entrada
  
    fetch('/emails/' + mailbox)
    .then(response => response.json())
    .then (emails => {
      document.querySelector("#emails-view").insertAdjacentHTML("afterend", `<div id="bandeja"></div>`);
      document.getElementById("bandeja").innerHTML = "";
      //Imprimimos los emails            
      for (let i = 0; i < emails.length; i++){      
        let color = "white";
        if (emails[i].read){ color = "gray"}
          document.querySelector("#bandeja").insertAdjacentHTML("afterbegin", `<div class="div-mailbox" id="div-${emails[i].id}" style="background-color: ${color}"><b>${emails[i].sender}</b><br>${emails[i].subject}<br>${emails[i].timestamp}</div><br>`);
      }  
    });   
      
     
    return false          
    
}


// Cargamos un correo
function load_mail(mail, bandeja){

  //Cargamos el mail-view y ocultamos las demas
  document.querySelector('#mail-view').style.display = 'block';  
  document.querySelector('#emails-view').style.display = 'none';  
  document.querySelector('#compose-view').style.display = 'none';
  
  document.getElementById('vista').style.display = 'block';
  document.getElementById('botones').style.display = 'block';

  fetch('/emails/' + mail)
  .then(response => response.json())
  .then(email=>{                  
    document.getElementById("vista").innerHTML = `Mensaje de:  <b>${email.sender}</b><br>Asunto:  ${email.subject}<br><br>${email.body}<br><div id="id">${email.id}</div>${email.timestamp}`;         
    document.getElementById("id").style.visibility = "hidden";
    document.getElementById("botones").innerHTML ="";
    document.getElementById("botones").append(responder);
    if (email.archived && bandeja !== 'Sent'){            
      document.getElementById("botones").append(desarchivar);
    }
    else if (!email.archived && bandeja !== 'Sent'){  
      document.getElementById("botones").append(archivar);
    }   
       
  })        
    .then(fetch('/emails/' + mail, {
      method: 'PUT',
      body: JSON.stringify({
      read: true
      })
    }))      

    return false
}

// Otra forma es crear el elemento afuera
const archivar = document.createElement('button');
archivar.innerHTML = 'Archivar';
archivar.addEventListener('click', function(){
    fetch('/emails/' + document.getElementById("id").innerHTML, {
    method: 'PUT',
    body: JSON.stringify({
    archived: true
    })
  });
  load_mailbox('inbox');    
  return load_mailbox('inbox'); 
});


const desarchivar = document.createElement('button');
desarchivar.innerHTML = 'Desarchivar';
desarchivar.addEventListener('click', function(){  
  fetch('/emails/' + document.getElementById("id").innerHTML, {
    method: 'PUT',
    body: JSON.stringify({
    archived: false
    })
  }); 
  load_mailbox('inbox');   
  return load_mailbox('inbox');
});

const responder = document.createElement('button');
responder.innerHTML = 'Responder';
responder.addEventListener('click', function(){
  console.log('probando responder');
  console.log(document.getElementById("id").innerHTML);
  fetch('/emails/' + document.getElementById("id").innerHTML)
  .then(response => response.json())
  .then(email=>{    
    compose_response(email.recipients, email.subject, email.timestamp, email.sender, email.body);
  });
  return   
});


