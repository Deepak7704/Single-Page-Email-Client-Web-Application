document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  //submit handler
  document.querySelector('#compose-form').addEventListener('submit',send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#message-view').style.display='none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


function view_email(id){
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    console.log(email);

    //to hide both of the divs and display this message div
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#message-view').style.display='block';

    document.querySelector('#message-view').innerHTML=`
      <div><strong>From:</strong>${email.sender}</div>
      <div><strong>To:</strong> ${email.recipients}</li>
      <div><strong>Subject:</strong> ${email.subject}</li>
      <div><strong>Timestamp:</strong> ${email.timestamp}</li>
      <hr>
      <div>${email.body}</div>
      <hr>
    `;
    //Change Read mail status to true;
    if(!email.read){
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })
    }
    //Archive Status
    const element = document.createElement('button');
    element.innerHTML = email.archived ? "Unarchive" : "Archive";
    element.className = email.archived ? "btn btn-danger" : "btn btn-warning";
    element.addEventListener('click', function() {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: !email.archived
        })
      }).then(() => {
        load_mailbox('archive')
      })
    });
    document.querySelector('#message-view').append(element);


    //reply view
        const reply = document.createElement('button');
        reply.innerHTML = "Reply"
        reply.className = "btn btn-outline-primary";
        reply.style.float = "right";
        reply.addEventListener('click', function() {
            compose_email();
            document.querySelector('#compose-recipients').value = email.sender;
            //check if the current subject conatins Re in it.if already contains no,need to add Re : else add Re
            let subject=email.subject;
            if(subject.split(' ',1)[0] != "Re:"){
              subject="Re:" + email.subject;
            }
            document.querySelector('#compose-subject').value = subject;
            document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
        });
        document.querySelector('#message-view').append(reply);
  });
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#message-view').style.display='none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
    //Get the mails for that user and mailbox
    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      //Loop through emails and create div for each email
      emails.forEach( eachMail =>{
        const newMail = document.createElement('div');
        newMail.className = "list-group-item";
        newMail.innerHTML = `
            <div class="email-item items">
                <div class="email-sender">${eachMail.sender}</div>
                <div class="email-subject">${eachMail.subject}</div>
                <div class="email-timestamp">${eachMail.timestamp}</div>
            </div>
        `;
        newMail.className = eachMail.read ? "read" : "unread";
        newMail.addEventListener('click',function(){
          view_email(eachMail.id);
        });
        document.querySelector('#emails-view').append(newMail);
      } )

      // ... do something else with emails ...
    });
}
function send_email(event){
  event.preventDefault();
  //store fields into variable and then send the data to backend using API
  const recipient=document.querySelector('#compose-recipients').value
  const subject=document.querySelector('#compose-subject').value
  const body=document.querySelector('#compose-body').value
  fetch('/emails',{
    method:"POST",
    body:JSON.stringify({
      recipients:recipient,
      subject:subject,
      body:body
    })
  })
  .then( response => response.json() )
  .then( result => {
      console.log(result);
      load_mailbox('sent');
  } )
  
}
