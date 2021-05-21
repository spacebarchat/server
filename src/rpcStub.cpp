#include "rpcStub.hpp"

class fossCordInternalsImpl final : public fosscordMedia::fosscordInternals::Service{
	grpc::Status sendRequest(
		grpc::ServerContext* ctx,
		const fosscordMedia::rpcRequest* req,
		fosscordMedia::rpcResponse* resp
	) override{
		resp->set_b(333);
		return grpc::Status::OK;
	}

};

rpcStub::rpcStub(int port){
	grpc::ServerBuilder builder;

	fossCordInternalsImpl* service;
	builder.AddListeningPort("0.0.0.0:8057", grpc::InsecureServerCredentials() );
	builder.RegisterService(service);

	std::unique_ptr<grpc::Server> server(builder.BuildAndStart());
	std::cout << "Server listening on port 8057 " << std::endl;
}