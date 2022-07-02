const   TYPE_CONNECT = 1;
const   TYPE_CLOSE = 2;
const   TYPE_DATA = 0;

const   decodeMessage = (message) => {
    let ch = message.readInt32BE(0);
    let type = message.readInt32BE(4);
    let body;
    if  ( ch == 0 ) {
        body = message.toString('utf-8',8);
    } else {
        if  ( message.length > 8 )  {
            body = message.subarray(8);
        } else {
            body = undefined;
        }
    }
    return  ({
        channel: ch,
        type: type,
        body: body
    });
}

const   encodeChannelPacket = (channel, type, buff) => {
    let ch = Buffer.alloc(8);
    ch.writeInt32BE(channel, 0);
    ch.writeInt32BE(type, 4);
    if  ( buff )    {
        return  (Buffer.concat([ch, buff]));
    } else {
        return  (ch);
    }
}

const   encodeText = (channel, _text) => {
    let text = Buffer.from(_text, 'utf-8');
    return  (encodeChannelPacket(channel, TYPE_DATA, text));
}


module.exports = {
    decodeMessage: decodeMessage,
    encodeText: encodeText,
    encodeChannelPacket: encodeChannelPacket,
    TYPE_CONNECT: TYPE_CONNECT,
    TYPE_CLOSE: TYPE_CLOSE,
    TYPE_DATA: TYPE_DATA
}