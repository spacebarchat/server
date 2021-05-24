#ifndef MONGOSTUB_HPP
#define MONGOSTUB_HPP

#include <boost/utility.hpp>
#include <cstdint>
#include <iostream>
#include <vector>
#include <mongocxx/client.hpp>
#include <mongocxx/instance.hpp>
#include <mongocxx/v_noabi/mongocxx/change_stream.hpp>
#include <bsoncxx/json.hpp>


class mongoStub : boost::noncopyable {
	public:
		mongoStub();
		std::vector<std::string> getNewMessages(mongocxx::change_stream* colCs);

		mongocxx::collection getCol() const { return col; }
		
	private:
		mongocxx::instance instance;
		mongocxx::client client{mongocxx::uri{}};
		mongocxx::database db;
		mongocxx::collection col;
		mongocxx::change_stream* colCs = nullptr;
};

#endif
