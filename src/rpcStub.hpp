#include <grpc++/grpc++.h>
#include "protodefs/include/protos.grpc.pb.h"

class rpcStub{
	public:
		rpcStub(int port);
		std::unique_ptr<grpc::Server> server;
	private:
		

};