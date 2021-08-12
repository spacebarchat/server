#ifndef MONGOSTUB_HPP
#define MONGOSTUB_HPP

#include <boost/utility.hpp>
#include <cstdint>
#include <iostream>
#include <vector>
#include <mongocxx/client.hpp>
#include <mongocxx/instance.hpp>
#include <mongocxx/change_stream.hpp>
#include <bsoncxx/json.hpp>
#include <bsoncxx/document/element.hpp>


class mongoStub{
	public:
		mongoStub();

		struct mongoMessage{
			std::string eventName;
			std::vector<std::string> data;
		};

		std::vector<mongoMessage> getNewMessages(mongocxx::change_stream* colCs);

		mongocxx::collection getCol() const { return col; }

		
		
	private:
		mongocxx::instance instance;
		mongocxx::client client{mongocxx::uri{}};
		mongocxx::database db;
		mongocxx::collection col;
		mongocxx::change_stream* colCs = nullptr;

		void handleUdpRequest(std::string address, int port, std::string mode);
		void handleVoiceRequest();
};

#endif
