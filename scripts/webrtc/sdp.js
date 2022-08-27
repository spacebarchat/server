const { writeFileSync } = require("fs");
const SemanticSDP = require("semantic-sdp");
var data = `m=audio
a=extmap-allow-mixed
a=ice-ufrag:Ets9
a=ice-pwd:CKGC4jufinWBOiKgn9iUji0l
a=ice-options:trickle
a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level
a=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time
a=extmap:3 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01
a=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid
a=rtpmap:111 opus/48000/2
a=fingerprint:sha-256 2C:E3:F2:AE:F3:5B:69:32:A9:14:33:40:B3:A8:25:BE:67:A2:58:94:65:0C:9D:55:87:28:94:B6:DC:81:8F:63
a=extmap:14 urn:ietf:params:rtp-hdrext:toffset
a=extmap:13 urn:3gpp:video-orientation
a=extmap:5 http://www.webrtc.org/experiments/rtp-hdrext/playout-delay
a=extmap:6 http://www.webrtc.org/experiments/rtp-hdrext/video-content-type
a=extmap:7 http://www.webrtc.org/experiments/rtp-hdrext/video-timing
a=extmap:8 http://www.webrtc.org/experiments/rtp-hdrext/color-space
a=extmap:10 urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id
a=extmap:11 urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id
a=rtpmap:96 VP8/90000
a=rtpmap:97 rtx/90000
`;
const sdp = SemanticSDP.SDPInfo.parse(data);

writeFileSync("sdp.json", JSON.stringify(sdp.plain(), null, 2));

const x = require("./sdp.json");

const y = SemanticSDP.SDPInfo.expand(x);

console.log(y);
