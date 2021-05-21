#include "rpcStub.hpp"

class fossCordInternalsImpl final : public fosscordMedia::fosscordInternals::Service {
	std::shared_ptr<rtcPeerHandler> ph;
	fossCordInternalsImpl(std::shared_ptr<rtcPeerHandler> handler){
		this->ph= handler;
	}
    grpc::Status vRequest(grpc::ServerContext* ctx,
                             const fosscordMedia::voiceRequest* req,
                             fosscordMedia::voiceAnswer* resp) override {

        this->ph->initiateConnection(req->ip(), req->port());
        return grpc::Status::OK;
    }
};

rpcStub::rpcStub(std::shared_ptr<rtcPeerHandler> handler, int port) {
    if (not port) {
        port = 8057;
    }
    this->ph = handler;

    fossCordInternalsImpl* service;
    grpc::ServerBuilder builder;
    builder.AddListeningPort("0.0.0.0:" + std::to_string(port),
                             grpc::InsecureServerCredentials());
    builder.RegisterService(service);

    this->server = builder.BuildAndStart();

    std::cout << "RPC stub listening on port " << port << std::endl;
}