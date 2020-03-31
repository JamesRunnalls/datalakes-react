import React, { Component } from "react";
import axios from "axios";
import { format } from "date-fns";
import { apiUrl } from "../../../src/config.json";
import twitterImg from "./img/twitter.svg";
import "./twitter.css";

class Twitter extends Component {
  state = {
    link: "",
    tweet: "",
    date: "",
    error: false
  };
  async componentDidMount() {
    const { data: response } = await axios
      .get(apiUrl + "/twitter")
      .catch(error => {
        this.setState({ error: true });
      });

    const text = response[0].text.split(" ");
    const link = text.pop();
    const tweet = text.join(" ");
    const date = format(new Date(response[0].created_at), "H:mm MMM yy");
    this.setState({ link, tweet, date });
  }

  render() {
    const { link, tweet, date, error } = this.state;
    return !error ? (
      <div className="twitter" title="View tweet on twitter">
        <a href="https://twitter.com/Datalakes1">
          <img src={twitterImg} alt="Twitter" />
        </a>
        <a href={link}>
          <div className="twitter-text">"{tweet}"</div>
          <div className="twitter-date">Tweeted {date}</div>
        </a>
      </div>
    ) : (
      <div></div>
    );
  }
}

export default Twitter;
