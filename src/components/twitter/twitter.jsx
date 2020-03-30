import React, { Component } from "react";
import axios from 'axios';
import { format } from "date-fns";
import { apiUrl } from '../../../src/config.json';
import twitterImg from './img/twitter.svg';
import "./twitter.css";

class Twitter extends Component {
    state = {
        twitterDate: "",
        twitterText: "",
        error: false
        
    }
    async componentDidMount(){
        const { data: response } = await axios.get(apiUrl+'/twitter').catch(error => {
            this.setState({ error: true});
          });;
        var twitterText = response[0].text;
        var twitterDate = format(new Date(response[0].created_at), "H:mm MMM yy");
        this.setState({ twitterDate, twitterText });
    } 

  render() {
    const { twitterText, twitterDate, error } = this.state;
    var twitter = "twitter"
    if (error){twitter = "twitter hide"};
    var twitterTextLink = [];
    var id = 0;
    for (var work of twitterText.split(" ")){
        id += 1;
        if (work.includes("http")){
            twitterTextLink.push(<React.Fragment key={id}><a href={work}>here</a></React.Fragment>);
        } else {
            twitterTextLink.push(<React.Fragment key={id}>{work}</React.Fragment>);
        }
        id += 1;
        twitterTextLink.push(<React.Fragment key={id}> </React.Fragment>);
    }
    twitterTextLink = twitterTextLink.slice(0, -1);
    return (
          <div className={twitter}>
              <a href="https://twitter.com/Datalakes1"><img src={twitterImg} alt="Twitter" /></a>
              <div className="twitter-text">"{twitterTextLink}"</div>
              <div className="twitter-date">Tweeted {twitterDate}</div>
          </div>
    );
  }
}

export default Twitter;
