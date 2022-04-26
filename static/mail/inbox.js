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
  
    document.getElementById("bandeja").addEventListener("click", function(e){
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#mail-view').style.display = 'block';
      document.querySelector('#compose-view').style.display = 'none';

      if(e.target && e.target.matches("div.div-mailbox")){
        let texto = e.target.id
        console.log(texto.slice(4));
        fetch('/emails/' + texto.slice(4))
        .then(response => response.json())
        .then(email=>{
          console.log(email)          
          document.getElementById("mail-view").innerHTML = `Mensaje de:  <b>${email.sender}</b><br>Asunto:  ${email.subject}<br><br>${email.body}<br><br>${email.timestamp}`
        })
        .then(fetch('/emails/' + texto.slice(4), {
          method: 'PUT',
          body: JSON.stringify({
              read: true
          })
        }))       
      };
    })    
    

}