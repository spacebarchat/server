#include "rtcPeerHandler.hpp"

rtcPeerHandler::rtcPeerHandler() {
    rtc::InitLogger(rtc::LogLevel::Verbose, NULL);
}

void rtcPeerHandler::initiateConnection(std::string peerIP, int peerPort) {
    // Socket connection between client and server
    SOCKET sock = socket(AF_INET, SOCK_DGRAM, 0);
    sockaddr_in addr;
    addr.sin_addr.s_addr = inet_addr(peerIP.c_str());
    addr.sin_port = htons(peerPort);
    addr.sin_family = AF_INET;

    rtc::Configuration conf;
    conf.enableIceTcp = false;
    conf.disableAutoNegotiation = false;

    auto pc = std::make_shared<rtc::PeerConnection>(conf);

    rtc::Description::Audio media("audio",
                                  rtc::Description::Direction::SendRecv);
    media.addOpusCodec(96);
    media.setBitrate(64);

    auto track = pc->addTrack(media);

    // auto session = std::make_shared<rtc::MediaHandler>();

    // track->setMediaHandler(session);

    rtc::Reliability rtcRel;
    rtcRel.unordered = true;
    rtcRel.type = rtc::Reliability::Type::Timed;
    rtcRel.rexmit = 500;

    rtc::DataChannelInit rtcConf;
    rtcConf.reliability = rtcRel;
    rtcConf.negotiated = false;

    pc->onStateChange([](rtc::PeerConnection::State state) {
        std::cout << "State: " << state << std::endl;
        if (state == rtc::PeerConnection::State::Disconnected ||
            state == rtc::PeerConnection::State::Failed ||
            state == rtc::PeerConnection::State::Closed) {
            // remove disconnected client
        }
    });

    pc->onGatheringStateChange([](rtc::PeerConnection::GatheringState state) {
        std::cout << "Gathering State: " << state << std::endl;
    });

    /*std::tuple<rtc::Track*, rtc::RtcpSrReporter*> addAudio(
		
        const std::shared_ptr<rtc::PeerConnection> pc,
        const uint8_t payloadType, const uint32_t ssrc, const std::string cname,
        const std::string msid, const std::function<void(void)> onOpen) {
        auto audio = Description::Audio(cname);
        audio.addOpusCodec(payloadType);
        audio.addSSRC(ssrc, cname, msid, cname);
        auto track = pc->addTrack(audio);
        // create RTP configuration
        auto rtpConfig = make_shared<RtpPacketizationConfig>(
            ssrc, cname, payloadType, OpusRtpPacketizer::defaultClockRate);
        // create packetizer
        auto packetizer = make_shared<OpusRtpPacketizer>(rtpConfig);
        // create opus handler
        auto opusHandler = make_shared<OpusPacketizationHandler>(packetizer);

        // add RTCP SR handler
        auto srReporter = make_shared<RtcpSrReporter>(rtpConfig);
        opusHandler->addToChain(srReporter);

        // set handler
        track->setMediaHandler(opusHandler);
        track->onOpen(onOpen);
        auto trackData = make_shared<ClientTrackData>(track, srReporter);
        return trackData;
    }*/

    pc->createDataChannel("Fosscord voice connection", rtcConf);
}
