import React, { Component, Fragment } from 'react';
import { apiService } from "../../services/api.service";
import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import * as actions from "../../store/actions";
import ChatBox, { ChatFrame } from 'react-chat-plugin';
import { APP_URLS } from "../../config/api.config";
import {commonFunctions} from "../../shared/components/functional/commonfunctions";
class ChatModule extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpenStatus: false,
            senderId: 0,
            recipientId: 0,
            messageList: [],
            recipientType: 0,
            senderType: 0,
            recipientImage: '',
            privateSessionLogId: 0
        };
        this.handleNewUserMessage = this.handleNewUserMessage.bind(this);
        this._onMessageWasSent = this._onMessageWasSent.bind(this);
    }

    handleReceiveMessage = (senderId, recipientId, privateSessionLogId, status) => {
        let requestData = this.state;
        const { auth } = this.props;
        apiService.post('UNAUTHORIZEDDATA', {
            "data": {
                "senderId": senderId,
                "recipientId": recipientId,
                "privateSessionLogId": privateSessionLogId,
                "status": status
            }
            , "keyName": "GetMessages"
        })
            .then(response => {
                if (response.Data !== null && Object.keys(response.Data).length > 0 && response.Data.ResultDataList.length > 0) {
                    let responseData = response.Data.ResultDataList;
                    let messageData = [];
                    if (status === -1) {
                        responseData.map((item, key) => {
                            messageData[key] = {
                                author: {
                                    username: item.CreatedBy,
                                    id: item.SenderId,
                                    avatarUrl: senderId === item.SenderId ? `${APP_URLS.API_URL}${auth.user.UserImage}` : `${APP_URLS.API_URL}${this.state.recipientImage}`

                                },
                                text: item.Message,
                                type: 'text',
                                timestamp: commonFunctions.getUtcDatetime(item.CreatedDate),
                                isSeen: item.IsSeen
                            }
                        });
                        this.setState({ messageList: messageData },
                            () => this.updateMessageStatus());
                    }
                    else {
                        let { messageList } = this.state;
                        let itemCount = Object.keys(messageList).length;
                        responseData.map((item, key) => {
                            messageList[itemCount + (key)] = {
                                author: {
                                    username: item.CreatedBy,
                                    id: item.SenderId,
                                    avatarUrl: senderId === item.SenderId ? `${APP_URLS.API_URL}${auth.user.UserImage}` : `${APP_URLS.API_URL}${this.state.recipientImage}`

                                },
                                text: item.Message,
                                type: 'text',
                                timestamp:  commonFunctions.getUtcDatetime(item.CreatedDate),
                                isSeen: item.IsSeen
                            }
                        });
                        this.setState({ messageList },
                            () => this.updateMessageStatus());
                    }
                }
            },
                (error) =>
                    this.setState((prevState) => {
                        this.props.actions.showAlert({ message: "Message not sent.", variant: "error" });
                    })
            )
    }

    handleNewUserMessage = (newMessage) => {
        let requestData = this.state;
        const { auth } = this.props;
        apiService.post('COMMONSAVE', {
            "data": [{
                "messageId": 0,
                "senderId": requestData.senderId,
                "senderType": requestData.senderType,
                "recipientId": requestData.recipientId,
                "recipientType": requestData.recipientType,
                "isSeen": 'N',
                "privateSessionLogId": requestData.privateSessionLogId,
                "Message": newMessage
            }],
            "entityName": "Messages",
            "additionalFields": {
                "userName": auth.user.FirstName
            }
        })
            .then(response => {
            },
                (error) =>
                    this.setState((prevState) => {
                        this.props.actions.showAlert({ message: "Message not sent.", variant: "error" });
                    })
            )
    }

    updateMessageStatus = () => {
        let { messageList } = this.state;
        const { auth } = this.props;
        let tempData = messageList.filter(x => x.isSeen === 'N');
        let chatMessage = [];
        if (Object.keys(tempData).length === 0) {
            return false;
        }
        else {
            tempData.map((item, key) => {
                chatMessage[key] = {
                    MessageId: item.messageId,
                    IsSeen: 'Y'
                }
            })
        }

        apiService.post('UPDATECHATSTATUS', { ChatMessage: JSON.stringify(chatMessage) })
            .then(response => {
                // updaet message list with isseen= Y
            },
                (error) =>
                    this.setState((prevState) => {
                        console.log(`UpdateMessageStatus ${error}`);
                    })
            );
    }

    componentWillReceiveProps = (props) => {
        this.setState({
            isOpenStatus: props.isOpenStatus,
            senderId: props.senderId,
            recipientId: props.recipientId,
            senderType: props.recipientType,
            recipientType: props.senderType,
            recipientImage: props.recipientImage,
            privateSessionLogId: props.privateSessionLogId
        });
        if (props.isOpenStatus === true) {
            this.setState({ messageList: [] });
            this.handleReceiveMessage(props.senderId, props.recipientId, props.privateSessionLogId, -1);
            clearTimeout(this.timeout);
            this.timeout = window.setInterval(() => this.handleReceiveMessage(props.senderId, props.recipientId, props.privateSessionLogId, 1), 5000);
        }
        else {
            this.setState({ messageList: [] });
            clearTimeout(this.timeout);
        }
    }

    _onMessageWasSent(message) {
        
        const { auth } = this.props;
        if (message === "") {
            return false;
        }
        this.setState({
            messageList: this.state.messageList.concat({
                author: {
                    username: auth.user.FirstName,
                    id: this.state.senderId,
                    avatarUrl: `${APP_URLS.API_URL}${auth.user.UserImage}`
                },
                text: message,
                timestamp: +new Date(),
                type: 'text',
            }),
        });
        this.handleNewUserMessage(message);
    }

    _sendMessage(text) {
        if (text.length > 0) {
            this.setState({
                messageList: [...this.state.messageList, {
                    author: 'them',
                    type: 'text',
                    data: { text },
                }]
            })
        }
    }

    handleChatClose = () => {
        this.setState({ isOpenStatus: false, messageList: [] });
        this.props.onClose();
        clearTimeout(this.timeout);
    }

    render() {
        const { isOpenStatus, messageList, senderId, recipientId } = this.state;
        return (
            <div>
                <ChatFrame
                    chatbox={
                        <ChatBox
                            onSendMessage={this._onMessageWasSent}
                            userId={senderId}
                            messages={messageList}
                            width={'350px'}
                        />
                    }
                    clickIcon={this.handleChatClose}
                    showChatbox={isOpenStatus}
                    showIcon={false}
                    iconStyle={{ background: 'red', fill: 'white' }}
                >
                </ChatFrame>
            </div>
        )
    }
}
const mapStateToProps = state => {
    return {
        auth: state.auth
    };
};
const mapDispatchToProps = dispatch => {
    return {
        actions: {
            showAlert: bindActionCreators(actions.showAlert, dispatch),
            loginSuccess: bindActionCreators(actions.loginSuccess, dispatch)
        }
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(ChatModule);