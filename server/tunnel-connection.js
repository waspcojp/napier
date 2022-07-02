//const {decodeMessage, encodeText, encodeChannelPacket, TYPE_CONNECT, TYPE_CLOSE, TYPE_DATA} = require('../libs/message');
const Message = require('../libs/message');

module.exports = class  {
    constructor(socket) {
        this.socket = socket;
    }
    sendCommand(channel, type)  {
        this.socket.send(Message.encodeChannelPacket(channel, type));
    }
    sendData(channel, buff) {
        this.socket.send(Message.encodeChannelPacket(channel, Message.TYPE_DATA, buff));
    }
    sendControl(arg)    {
        this.socket.send(Message.encodeText(0, JSON.stringify(arg)));
    }
    static  decodeMessage(message)  {
        return  (Message.decodeMessage(message));
    }
    connect(channel)    {
        this.sendCommand(channel, Message.TYPE_CONNECT);
    }
    close(channel)  {
        this.sendCommand(channel, Message.TYPE_CLOSE);
    }
}
