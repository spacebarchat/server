#include "mongoStub.hpp"

mongoStub::mongoStub() {
    if (this->client) {
        this->db = client["fosscord"];

        if (this->db) {
            this->col = db["events"];
	
        } else {
            std::cout << "db not found";
            exit(-1);
        }
    } else {
        std::cout << "Client couldn't be initialized";
        exit(-1);
    }
}

std::vector<std::string>mongoStub::getNewMessages(mongocxx::change_stream* colCs) {
	std::vector<std::string> retVec;
    for (const auto& event : *colCs) {
        retVec.push_back(bsoncxx::to_json(event));
    }
	return retVec;
}
