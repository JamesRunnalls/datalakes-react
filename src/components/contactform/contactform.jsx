import React, { Component } from 'react';
import axios from 'axios';
import './contactform.css';

class ContactForm extends Component {
    handleSubmit = e => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        axios.post('http://localhost:4000/api/contactform', {
            name: name,   
            email: email,  
            message: message
          })
          .then((response)=>{
            if (response.data.msg === 'success'){
                alert("Message Sent."); 
                this.resetForm()
            }else if(response.data.msg === 'fail'){
                alert("Message failed to send.")
            }
        })
    }

    resetForm = () => {
        document.getElementById('contact-form').reset();
    }

    render() { 
        return ( 
            <form id="contact-form" onSubmit={this.handleSubmit} method="POST">
                Name
                <div className="form-group">
                    <input type="text" placeholder="John Doe" className="form-control" id="name" required/>
                </div>
                Email
                <div className="form-group">
                    <input type="email" placeholder="john.doe@email.com" className="form-control" id="email" required/>
                </div>
                Message
                <div className="form-group">
                    <textarea className="form-control" placeholder="My message here" rows="5" id="message" required></textarea>
                </div>
                <button type="submit" className="contact-button">Send Message</button>
                We will get back to you ASAP
            </form>
         );
    }
}
 
export default ContactForm;