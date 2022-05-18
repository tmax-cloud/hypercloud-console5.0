import * as React from 'react';
import { NoticeExpirationModal_ } from './modals/notice-expiration-modal';
import { getLogoutTime } from '../../hypercloud/auth';

let timerID = 0;
let expTime = 0;

export class ExpTimer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expText: null,
      tokenExpTime: null,
    };
  }
  componentDidMount() {
    this.resetTimer();
  }

  componentDidUpdate(prevProps) {
    if (this.props.tokenExpTime !== prevProps.tokenExpTime) {
      clearInterval(timerID);
      this.resetTimer();
    }
  }

  resetTimer() {
    expTime = getLogoutTime();
    timerID = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    // 타이머 등록 해제
    window.clearInterval(timerID);
  }

  expFormat() {
    let temp = Math.floor(expTime);
    const sec = temp % 60;
    temp = Math.floor(temp / 60);
    const min = temp % 60;
    temp = Math.floor(temp / 60);
    const hour = temp % 24;
    temp = Math.floor(temp / 24);
    const day = temp;
    const expText = (!!day ? day + 'day(s) ' : '') + (!!hour ? (hour < 10 ? '0' + hour : hour) + ':' : '') + (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec);
    this.setState({ expText: expText });
  }
  tick() {
    if (expTime > 0) {
      expTime -= 1;
    }
    if (Math.floor(expTime) === 60) {
      NoticeExpirationModal_({ logout: this.props.logout, tokenRefresh: this.props.tokenRefresh, time: expTime });
    }
    this.expFormat();
  }
  render() {
    const { expText } = this.state;
    return (
      <div className="exp-timer">
        <span className="co-masthead__timer__span">
          <span>{expText}</span>
        </span>
      </div>
    );
  }
}
