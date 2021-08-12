#include "libdatachannel/rtc.hpp"
#include <iostream>
#include <memory>
#include "nlohmann/json.hpp"
#include <array>

#ifdef _WIN32
#include <winsock2.h>
#else
#include <arpa/inet.h>
typedef int SOCKET;
#endif

using json = nlohmann::json;

#ifndef RTCPEERHANDLER
#define RTCPEERHANDLER
class rtcPeerHandler{
public:
	rtcPeerHandler();
	void initiateConnection(std::string peerIP, int peerPort);

	struct client
	{
		std::shared_ptr<rtc::PeerConnection> pc;
		std::shared_ptr<rtc::DataChannel> dc;
	};

private:
	std::map<SOCKET, client> clients;
};
#endif