#include "rtcPeerHandler.hpp"
rtcPeerHandler::rtcPeerHandler()
{
	rtc::InitLogger(rtc::LogLevel::Verbose, NULL);
}

void rtcPeerHandler::initiateConnection(std::string peerIP, int peerPort)
{
	//Socket connection between client and server
	SOCKET sock = socket(AF_INET, SOCK_DGRAM, 0);
	sockaddr_in addr;
	addr.sin_addr.s_addr = inet_addr(peerIP.c_str());
	addr.sin_port = htons(peerPort);
	addr.sin_family = AF_INET;

	rtc::Configuration conf;
	conf.enableIceTcp = false;
	conf.disableAutoNegotiation = false;

	auto pc = std::make_shared<rtc::PeerConnection>(conf);

	rtc::Description::Audio media("audio", rtc::Description::Direction::SendRecv);
	media.addOpusCodec(96);
	media.setBitrate(64); 


	auto track = pc->addTrack(media);

	//auto session = std::make_shared<rtc::MediaHandler>();

	//track->setMediaHandler(session);

	rtc::Reliability rtcRel;
	rtcRel.unordered = true;
	rtcRel.type = rtc::Reliability::Type::Timed;
	rtcRel.rexmit =  500;

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

	pc->onGatheringStateChange(
		[](rtc::PeerConnection::GatheringState state) { std::cout << "Gathering State: " << state << std::endl; });


	pc->createDataChannel("Fosscord voice connection", rtcConf);
}
   