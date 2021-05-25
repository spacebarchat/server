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

//Too slow for my liking
std::vector<mongoStub::mongoMessage> mongoStub::getNewMessages(mongocxx::change_stream* colCs) {
	std::vector<mongoStub::mongoMessage> retVec;
	
    for (auto&& event : *colCs) {
		mongoStub::mongoMessage returnValue;

		/*if(event["fullDocument"]["data"]){
				returnValue.data.push_back(event["fullDocument"]["data"].get_utf8().value.to_string());
			}*/


		
		std::cout << bsoncxx::to_json(event) << std::endl;

		//Oly listen to insert events (to avoid "precondition failed: data" exception)
		if(event["operationType"].get_utf8().value.to_string()!="insert"){
			continue;
		}
		returnValue.eventName = event["fullDocument"]["event"].get_utf8().value.to_string();
		retVec.push_back(returnValue);
    }

	return retVec;
}
