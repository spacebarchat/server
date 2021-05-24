//   $$$$$$\                                                                   $$\                           
//  $$  __$$\                                                                  $$ |
//  $$ /  \__|$$$$$$\   $$$$$$$\  $$$$$$$\  $$$$$$$\  $$$$$$\   $$$$$$\   $$$$$$$ |
//  $$$$\    $$  __$$\ $$  _____|$$  _____|$$  _____|$$  __$$\ $$  __$$\ $$  __$$ |
//  $$  _|   $$ /  $$ |\$$$$$$\  \$$$$$$\  $$ /      $$ /  $$ |$$ |  \__|$$ /  $$ |
//  $$ |     $$ |  $$ | \____$$\  \____$$\ $$ |      $$ |  $$ |$$ |      $$ |  $$ |
//  $$ |     \$$$$$$  |$$$$$$$  |$$$$$$$  |\$$$$$$$\ \$$$$$$  |$$ |      \$$$$$$$ |
//  \__|      \______/ \_______/ \_______/  \_______| \______/ \__|       \_______|
//
//
//
//                       $$\                      $$$$$$\                                                    
//                       \__|                    $$  __$$\                                                   
//  $$\    $$\  $$$$$$\  $$\  $$$$$$$\  $$$$$$\  $$ /  \__| $$$$$$\   $$$$$$\ $$\    $$\  $$$$$$\   $$$$$$\  
//  \$$\  $$  |$$  __$$\ $$ |$$  _____|$$  __$$\ \$$$$$$\  $$  __$$\ $$  __$$\\$$\  $$  |$$  __$$\ $$  __$$\ 
//   \$$\$$  / $$ /  $$ |$$ |$$ /      $$$$$$$$ | \____$$\ $$$$$$$$ |$$ |  \__|\$$\$$  / $$$$$$$$ |$$ |  \__|
//    \$$$  /  $$ |  $$ |$$ |$$ |      $$   ____|$$\   $$ |$$   ____|$$ |       \$$$  /  $$   ____|$$ |
//     \$  /   \$$$$$$  |$$ |\$$$$$$$\ \$$$$$$$\ \$$$$$$  |\$$$$$$$\ $$ |        \$  /   \$$$$$$$\ $$ |
//      \_/     \______/ \__| \_______| \_______| \______/  \_______|\__|         \_/     \_______|\__|
//
//
//

#include "rtcPeerHandler.hpp" //Handle peer connection requests
#include "mongoStub.hpp"	//Handle communication with the MongoDB server

int main(int argc, char **argv){

	auto commsHandler = std::make_shared<rtcPeerHandler>();
	auto mongoHandler = std::make_unique<mongoStub>();

	mongocxx::options::change_stream options;
    mongocxx::change_stream colCs = mongoHandler->getCol().watch(options);

	//Check for new messages in the collection
	for (;;){
		std::vector<std::string> t = mongoHandler->getNewMessages(&colCs);
		for(auto &i : t){
			std::cout << i << std::endl;
		}
	}
	std::cout << "Server created" << std::endl;

	return 0;
}