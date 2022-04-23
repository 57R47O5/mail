document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  // Enviamos el form cuando se pulsa el buton ¨submit¨
  //document.querySelector('#submit-compose').addEventListener('click', ()=>enviar());
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
    })


    return false;
  }

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}