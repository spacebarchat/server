#include <grpc++/grpc++.h>
#include "protodefs/include/protos.grpc.pb.h"
#include "rtcPeerHandler.hpp"

#ifndef RPCSTUB
#define RPCSTUB
class rpcStub{
	public:
		rpcStub(std::shared_ptr<rtcPeerHandler> peerHandler, int port);
		std::unique_ptr<grpc::Server> server;
		
	private:
		std::shared_ptr<rtcPeerHandler> ph;
};
#endif